import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";

const base = process.env.QA_BASE_URL || "http://127.0.0.1:3001";
const output = "qa-output/curve";
const cycles = Number(process.env.QA_CURVE_CYCLES || 32);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const results = {
  layouts: [],
  journeys: [],
  errors: [],
  metrics: [],
  cycles: 0,
};
const work = `${base}/work/?curve=1`;
async function open(width, height = 900, options = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    isMobile: width < 768,
    hasTouch: width < 768,
    ...options,
  });
  await context.addInitScript(() =>
    sessionStorage.setItem("hamid-origin-v1", "seen"),
  );
  await context.route(
    (url) => url.origin !== base,
    (route) => route.abort(),
  );
  const page = await context.newPage();
  page.on("pageerror", (error) => results.errors.push(error.message));
  await page.goto(work);
  return { page, context };
}
async function state(page, mode) {
  await page.waitForSelector(`[data-mode="${mode}"]`, { timeout: 30000 });
}
async function walk(page, progress) {
  await page.evaluate((p) => {
    const el = document.querySelector(".curve-walk");
    scrollTo({
      top: el.offsetTop + p * (el.offsetHeight - innerHeight),
      behavior: "instant",
    });
  }, progress);
  await page.waitForFunction(
    (p) =>
      Math.abs(
        Number(document.querySelector(".curve-canvas").dataset.progress) - p,
      ) < 0.001,
    progress,
  );
  await page.waitForTimeout(200);
}
async function inspect(page) {
  return page.evaluate(() => window.curveDebug?.inspect());
}
async function preview(page, index = 0) {
  await page.locator(".curve-nearby button").nth(index).click();
  await state(page, "PREVIEW");
}
async function detail(page) {
  await page.getByRole("button", { name: "View project", exact: true }).click();
  await state(page, "DETAIL");
}
async function close(page) {
  await page
    .getByRole("button", { name: "Close project", exact: true })
    .click();
  await state(page, "WALK");
  await page.waitForTimeout(40);
}
async function swipe(page, x1, y1, x2, y2) {
  const session = await page.context().newCDPSession(page);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: x1, y: y1 }],
  });
  for (let step = 1; step <= 12; step++) {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { x: x1 + ((x2 - x1) * step) / 12, y: y1 + ((y2 - y1) * step) / 12 },
      ],
    });
    await page.waitForTimeout(16);
  }
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await session.detach();
}
try {
  for (const width of [320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
    const { page, context } = await open(width, width < 768 ? 844 : 900);
    try {
      await state(page, "WALK");
      await page.waitForTimeout(500);
      assert.equal(await page.locator(".curve-canvas canvas").count(), 1);
      assert.equal(await page.locator(".project-entry").count(), 18);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      const snapshot = await inspect(page);
      if (snapshot) {
        assert.equal(snapshot.frames.length, 18);
        assert.equal(
          snapshot.frames.filter((f) => f.side === "left").length,
          9,
        );
      }
      if ([320, 390, 1440].includes(width)) {
        await page.screenshot({ path: `${output}/corridor-${width}.png` });
        const violations = (
          await new AxeBuilder({ page })
            .include("#main")
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations;
        assert.deepEqual(
          violations.map((v) => ({
            id: v.id,
            targets: v.nodes.map((n) => n.target),
          })),
          [],
        );
      }
      await preview(page);
      if ([320, 390, 1440].includes(width))
        await page.screenshot({ path: `${output}/preview-${width}.png` });
      await detail(page);
      if ([320, 390, 1440].includes(width))
        await page.screenshot({ path: `${output}/cover-${width}.png` });
      await page
        .getByRole("button", { name: "Next chapter", exact: true })
        .click();
      await page.waitForTimeout(500);
      assert.ok(
        (await page
          .locator(".curve-story-track")
          .evaluate((el) => el.scrollLeft)) >
          width * 0.8,
      );
      await close(page);
      if ([320, 390, 1440].includes(width)) {
        await walk(page, 0.48);
        await page.screenshot({ path: `${output}/curve-bend-${width}.png` });
        await preview(page, 1);
        await detail(page);
        await page
          .getByRole("button", { name: "Next chapter", exact: true })
          .click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${output}/curve-story-${width}.png` });
        const violations = (
          await new AxeBuilder({ page })
            .include(".curve-dialog")
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations;
        assert.deepEqual(
          violations.map((v) => ({
            id: v.id,
            targets: v.nodes.map((n) => n.target),
          })),
          [],
        );
        await close(page);
      }
      results.layouts.push(width);
    } finally {
      await context.close();
    }
  }
  results.journeys.push(
    "Ten viewports, 18 entries, both walls near the bend, chapter controls, six scoped accessibility scans",
  );

  const { page, context } = await open(1440);
  try {
    await state(page, "WALK");
    await page.waitForTimeout(500);
    await page.mouse.move(720, 700);
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(700);
    assert.ok(
      Number(
        await page.locator(".curve-canvas").getAttribute("data-progress"),
      ) > 0.01,
    );
    await page.mouse.wheel(0, -500);
    await page.waitForTimeout(700);
    await walk(page, 0);
    const baseline = await inspect(page);
    const p = baseline?.frames[0].center;
    // The production coordinate was verified against the captured 1440px view.
    await page.mouse.move(
      p ? (p[0] + 1) * 720 : 428,
      p ? (1 - p[1]) * 450 : 428,
    );
    await state(page, "PREVIEW");
    await page.keyboard.press("Escape");
    await state(page, "WALK");
    await page.mouse.move(720, 750);
    for (let cycle = 0; cycle < cycles; cycle++) {
      await preview(page, cycle % 2);
      await detail(page);
      if (cycle % 3) {
        await page.locator(".curve-story-track").evaluate(
          (el, end) =>
            el.scrollTo({
              left: end ? el.scrollWidth : el.clientWidth * 2,
              behavior: "instant",
            }),
          cycle % 3 === 2,
        );
        await page.waitForTimeout(40);
      }
      const y = await page.evaluate(() => scrollY);
      await page.mouse.move(700, 500);
      await page.mouse.wheel(0, 130);
      await page.waitForTimeout(30);
      assert.equal(await page.evaluate(() => scrollY), y);
      if (cycle % 5 === 0) {
        await page.keyboard.press("Escape");
        await state(page, "WALK");
        await page.waitForTimeout(40);
      } else await close(page);
      const restored = await inspect(page);
      if (restored && baseline) {
        assert.deepEqual(restored.camera, baseline.camera);
        for (let index = 0; index < 18; index++)
          assert.deepEqual(
            restored.frames[index].world,
            baseline.frames[index].world,
          );
        assert.ok(restored.textures <= 24);
      }
      assert.equal(await page.locator("dialog[open]").count(), 0);
      assert.equal(
        await page.evaluate(
          () => getComputedStyle(document.documentElement).overflowY,
        ),
        "visible",
      );
      results.cycles++;
    }
    await page.goForward();
    await state(page, "DETAIL");
    await page.goBack();
    await state(page, "WALK");
    await walk(page, 0.48);
    await preview(page, 1);
    await detail(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    await close(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(300);
    await walk(page, 1);
    assert.ok(
      await page
        .getByRole("link", { name: "Discuss a project", exact: true })
        .last()
        .isVisible(),
    );
    await page
      .getByRole("button", { name: "Walk back to the start", exact: true })
      .click();
    await page.waitForTimeout(1200);
    await walk(page, 0.5);
    await page.waitForTimeout(700);
    const before = await inspect(page);
    await page.waitForTimeout(600);
    const after = await inspect(page);
    if (after && before) {
      assert.equal(after.renderCount, before.renderCount);
      results.metrics.push(after);
    }
    await page
      .locator(".curve-canvas canvas")
      .evaluate((el) =>
        el.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
      );
    await state(page, "FALLBACK");
    assert.ok(await page.locator(".project-entry").first().isVisible());
  } finally {
    await context.close();
  }
  results.journeys.push(
    `${cycles} full open/chapter/close cycles, matrix checks when development instrumentation is available, wheel isolation, hover, Back/Forward, orientation, end controls, idle render pause, context loss`,
  );

  const phone = await open(390, 844);
  try {
    await state(phone.page, "WALK");
    await swipe(phone.page, 190, 620, 190, 310);
    await phone.page.waitForTimeout(700);
    assert.ok(
      Number(
        await phone.page.locator(".curve-canvas").getAttribute("data-progress"),
      ) > 0,
    );
    await walk(phone.page, 0);
    const data = await inspect(phone.page);
    if (data) {
      const p = data.frames[0].center;
      await phone.page.touchscreen.tap((p[0] + 1) * 195, (1 - p[1]) * 422);
    } else {
      // Actual first-frame surface in the production 390 × 844 screenshot.
      await phone.page.touchscreen.tap(70, 408);
    }
    await state(phone.page, "PREVIEW");
    await detail(phone.page);
    await swipe(phone.page, 330, 300, 50, 300);
    await phone.page.waitForTimeout(700);
    assert.ok(
      (await phone.page
        .locator(".curve-story-track")
        .evaluate((el) => el.scrollLeft)) > 300,
    );
    await close(phone.page);
  } finally {
    await phone.context.close();
  }
  results.journeys.push(
    "Emulated touch swipe to walk, direct frame tap, explicit opening, horizontal native chapter swipe and reverse",
  );

  for (const settings of [
    { reducedMotion: "reduce" },
    { javaScriptEnabled: false },
  ]) {
    const { page, context } = await open(320, 844, settings);
    try {
      assert.equal(await page.locator(".project-entry").count(), 18);
      assert.ok(await page.locator(".project-entry").first().isVisible());
      assert.equal(await page.locator(".curve-canvas canvas").count(), 0);
      await page.screenshot({
        path: `${output}/fallback-${settings.javaScriptEnabled === false ? "no-js" : "reduced"}.png`,
      });
    } finally {
      await context.close();
    }
  }
  results.journeys.push(
    "Reduced motion and JavaScript disabled preserve all 18 entries and real links",
  );
  assert.deepEqual(results.errors, []);
} finally {
  await browser.close();
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
}
console.log(
  JSON.stringify(
    {
      ...results,
      metrics: results.metrics.map((m) => ({
        drawCalls: m.drawCalls,
        triangles: m.triangles,
        textures: m.textures,
        estimatedTextureBytes: m.estimatedTextureBytes,
        meanMovingFrameMs: m.meanMovingFrameMs,
        dpr: m.dpr,
      })),
    },
    null,
    2,
  ),
);
