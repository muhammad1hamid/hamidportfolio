import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";
import sharp from "sharp";

const base = process.env.QA_BASE_URL || "http://127.0.0.1:3000";
const output = process.env.QA_CAP_OUTPUT || "qa-output/capabilities/verified";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const report = { layouts: [], checks: [], errors: [], requests: [] };
const names = [
  "Web Experiences",
  "Growth Engine",
  "Smart Systems",
  "AI Conversations",
];
const ids = [
  "web-experiences",
  "growth-engine",
  "smart-systems",
  "ai-conversations",
];
const widths = process.env.QA_CAP_WIDTHS
  ? process.env.QA_CAP_WIDTHS.split(",").map(Number)
  : [320, 360, 375, 390, 414, 430, 480, 768, 1024, 1280, 1440];
const baseline = JSON.parse(
  await readFile("qa-output/capabilities/before/results.json", "utf8"),
);
const screenshotStyle =
  ".navigation,.mobile-contact,.skip-link{visibility:hidden!important}";

async function open(width, options = {}) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    isMobile: width < 768,
    hasTouch: width < 768,
    reducedMotion: "reduce",
    ...options,
  });
  await context.addInitScript(() => {
    try {
      sessionStorage.setItem("hamid-origin-v1", "seen");
    } catch {}
  });
  await context.route(
    (url) => url.origin !== new URL(base).origin,
    (route) => route.abort(),
  );
  const page = await context.newPage();
  page.on("pageerror", (error) => report.errors.push(error.message));
  page.on("request", (request) => {
    if (/\.(mp4|webm|mov)(?:\?|$)/i.test(request.url()))
      report.requests.push(request.url());
  });
  const response = await page.goto(base + "/");
  assert.equal(response.status(), 200);
  await page.evaluate(() => document.fonts.ready);
  return { context, page };
}

async function state(page, index) {
  await page
    .waitForFunction((i) => {
      const track = document.getElementById("capability-showcase");
      if (!track) return false;
      const slides = track.querySelectorAll("[data-capability-slide]");
      return (
        Number(track.dataset.active) === i &&
        Math.abs(
          track.scrollLeft - (slides[i].offsetLeft - slides[0].offsetLeft),
        ) < 2
      );
    }, index)
    .catch(async (error) => {
      console.error(
        "Capability state failure",
        JSON.stringify({
          url: page.url(),
          index,
          details: await page.evaluate(() => ({
            scrollY,
            track: document.getElementById("capability-showcase")?.dataset,
          })),
        }),
      );
      throw error;
    });
}

async function swipeCapability(page, direction) {
  const track = page.locator("#capability-showcase");
  await track.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const box = await track.boundingBox();
  const y = Math.max(140, Math.min(650, box.y + 120));
  const left = box.x + box.width * 0.2;
  const right = box.x + box.width * 0.8;
  await swipe(
    page,
    direction > 0 ? right : left,
    y,
    direction > 0 ? left : right,
    y,
  );
}

async function swipe(page, x1, y1, x2, y2) {
  const session = await page.context().newCDPSession(page);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: x1, y: y1 }],
  });
  for (let i = 1; i <= 12; i++) {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { x: x1 + ((x2 - x1) * i) / 12, y: y1 + ((y2 - y1) * i) / 12 },
      ],
    });
    await page.waitForTimeout(20);
  }
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await session.detach();
}

try {
  for (const width of widths) {
    const { page, context } = await open(width);
    try {
      const section = page.locator("#services");
      await section.scrollIntoViewIfNeeded();
      assert.equal(await page.locator("main h1").count(), 1);
      assert.equal(await section.locator("video,iframe").count(), 0);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      if (width < 768) {
        await page
          .locator('[data-capability-studio][data-enhanced="true"]')
          .waitFor();
        const selectors = page
          .getByRole("group", { name: "Choose a capability", exact: true })
          .getByRole("button");
        assert.deepEqual(
          await selectors
            .allTextContents()
            .then((items) => items.map((item) => item.trim())),
          names,
        );
        const positions = await selectors.evaluateAll((elements) =>
          elements.map((el) => {
            const r = el.getBoundingClientRect();
            return { x: r.x, y: r.y, width: r.width, height: r.height };
          }),
        );
        assert.ok(
          Math.abs(positions[0].y - positions[1].y) < 1 &&
            positions[2].y > positions[0].y &&
            Math.abs(positions[2].y - positions[3].y) < 1,
        );
        assert.ok(
          positions.every(
            (position) =>
              position.height >= 72 &&
              Math.abs(position.width - positions[0].width) < 1,
          ),
        );
        assert.match(
          await section.locator("h2").innerText(),
          /Different disciplines\.\s*One way of thinking\./,
        );
        const heights = [];
        for (let i = 0; i < 4; i++) {
          await selectors.nth(i).click();
          await state(page, i);
          assert.equal(
            await selectors.nth(i).getAttribute("aria-pressed"),
            "true",
          );
          assert.equal(
            await page
              .getByRole("group", { name: "Choose a capability", exact: true })
              .locator('button[aria-pressed="true"]')
              .count(),
            1,
          );
          assert.equal(
            await section
              .locator("[data-capability-slide]:not([inert])")
              .count(),
            1,
          );
          const slide = section.locator(`[data-capability-slide="${ids[i]}"]`);
          await slide.locator("img").evaluateAll(async (images) => {
            await Promise.all(images.map((image) => image.decode()));
            if (
              images.some(
                (image) => !image.complete || image.naturalWidth === 0,
              )
            )
              throw new Error("Capability artwork did not decode");
          });
          for (const link of await slide.getByRole("link").all()) {
            assert.ok(await link.getAttribute("href"));
            const box = await link.boundingBox();
            assert.ok(
              box.height >= 44 && box.x >= 0 && box.x + box.width <= width + 1,
            );
          }
          heights.push(await section.evaluate((el) => el.offsetHeight));
          if ([320, 390, 430].includes(width))
            await section.screenshot({
              path: `${output}/section-${width}-${i}.png`,
              animations: "disabled",
              style: screenshotStyle,
            });
        }
        assert.ok(
          Math.max(...heights) - Math.min(...heights) <= 1,
          "The section must not jump in height",
        );
        if ([320, 390].includes(width)) {
          const violations = (
            await new AxeBuilder({ page })
              .include("#services")
              .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
              .analyze()
          ).violations;
          assert.deepEqual(
            violations.map((v) => ({
              id: v.id,
              nodes: v.nodes.map((n) => n.target),
            })),
            [],
          );
        }
        const previous = baseline.find((record) => record.width === width);
        if (previous)
          assert.ok(
            heights[0] < previous.height,
            `${width}px should be more compact: ${heights[0]} vs ${previous.height}`,
          );
        report.layouts.push({
          width,
          sectionHeight: heights[0],
          previousHeight: previous?.height,
        });
      } else {
        assert.equal(
          await section.locator("[data-capability-studio]").isVisible(),
          false,
        );
        assert.equal(
          await section.locator(".pillar-card > a:visible").count(),
          4,
        );
        const before = baseline.find((record) => record.width === width);
        const boxes = await section.evaluate((el) => ({
          height: el.offsetHeight,
          boxes: [...el.querySelectorAll(".pillar-card > a")].map((a) => {
            const r = a.getBoundingClientRect(),
              s = getComputedStyle(a);
            return {
              x: r.x,
              y: r.y - el.getBoundingClientRect().y,
              width: r.width,
              height: r.height,
              padding: s.padding,
              font: s.fontFamily,
            };
          }),
        }));
        assert.deepEqual(boxes, { height: before.height, boxes: before.boxes });
        const shot = await section.screenshot({
          path: `${output}/section-${width}.png`,
          animations: "disabled",
          style: screenshotStyle,
        });
        const [oldImage, newImage] = await Promise.all(
          [
            sharp(`qa-output/capabilities/before/services-${width}.png`),
            sharp(shot),
          ].map((p) =>
            p.removeAlpha().raw().toBuffer({ resolveWithObject: true }),
          ),
        );
        assert.deepEqual(oldImage.info, newImage.info);
        let changed = 0;
        for (let i = 0; i < oldImage.data.length; i += 3)
          if (
            [0, 1, 2].some(
              (c) => Math.abs(oldImage.data[i + c] - newImage.data[i + c]) > 24,
            )
          )
            changed++;
        assert.equal(changed, 0, `${width}px desktop/tablet pixels changed`);
        report.layouts.push({ width, desktopPixelChanges: changed });
      }
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.mouse.move(0, 0);
      await page.waitForTimeout(200);
      if (baseline.some((record) => record.width === width)) {
        const shot = await page.locator(".signature-hero").screenshot({
          path: `${output}/hero-${width}.png`,
          animations: "disabled",
        });
        const [oldImage, newImage] = await Promise.all(
          [
            sharp(`qa-output/capabilities/before/hero-${width}.png`),
            sharp(shot),
          ].map((p) =>
            p.removeAlpha().raw().toBuffer({ resolveWithObject: true }),
          ),
        );
        assert.deepEqual(oldImage.info, newImage.info);
        let changed = 0;
        for (let i = 0; i < oldImage.data.length; i += 3)
          if (
            [0, 1, 2].some(
              (c) => Math.abs(oldImage.data[i + c] - newImage.data[i + c]) > 24,
            )
          )
            changed++;
        assert.ok(
          changed / (oldImage.info.width * oldImage.info.height) < 0.001,
          `${width}px unrelated hero changed`,
        );
      }
      console.log("PASS layout " + width);
    } finally {
      await context.close();
    }
  }
  report.checks.push(
    "All four mobile states, compact 2×2 selectors, stable height, working HTML links, no overflow or videos; desktop pixels and unrelated hero compared with baseline",
  );
  const { page, context } = await open(390, { reducedMotion: "no-preference" });
  try {
    await page.locator("#capability-showcase").scrollIntoViewIfNeeded();
    const selectors = page
      .getByRole("group", { name: "Choose a capability", exact: true })
      .getByRole("button");
    await selectors.first().click();
    await state(page, 0);
    await page.locator("#capability-showcase").scrollIntoViewIfNeeded();
    await swipeCapability(page, 1);
    await state(page, 1);
    await swipeCapability(page, -1);
    await state(page, 0);
    await swipeCapability(page, -1);
    await state(page, 0);
    await selectors.last().click();
    await state(page, 3);
    await page.locator("#capability-showcase").scrollIntoViewIfNeeded();
    await swipeCapability(page, 1);
    await state(page, 3);
    const before = await page.evaluate(() => scrollY);
    await swipe(page, 195, 650, 195, 350);
    await page.waitForTimeout(250);
    assert.ok(
      await page.evaluate((y) => scrollY > y + 60, before),
      "Vertical page scrolling must work through the carousel",
    );
    await selectors.first().focus();
    await page.keyboard.press("ArrowRight");
    await state(page, 1);
    assert.equal(
      await selectors.nth(1).evaluate((el) => el === document.activeElement),
      true,
    );
    await page.keyboard.press("End");
    await state(page, 3);
    await page.keyboard.press("Home");
    await state(page, 0);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await selectors.nth(2).click();
    await state(page, 2);
    await page.setViewportSize({ width: 430, height: 932 });
    await state(page, 2);
    await page.setViewportSize({ width: 1024, height: 768 });
    assert.equal(
      await page.locator("[data-capability-studio]").isVisible(),
      false,
    );
    await page.setViewportSize({ width: 360, height: 800 });
    await state(page, 2);
    for (const link of await page
      .locator("#services [data-capability-slide] a")
      .all()) {
      const href = await link.getAttribute("href");
      assert.equal((await page.request.get(base + href)).status(), 200, href);
    }
  } finally {
    await context.close();
  }
  report.checks.push(
    "Real touch swipe both directions and at boundaries; normal vertical scrolling; keyboard arrows/Home/End; runtime reduced motion and mobile/tablet resizing; all CTA destinations return 200",
  );
  const noJs = await open(390, { javaScriptEnabled: false });
  try {
    assert.equal(
      await noJs.page.locator("#services [data-capability-slide] a").count(),
      5,
    );
    assert.equal(await noJs.page.locator("#services [inert]").count(), 0);
    assert.equal(await noJs.page.locator("#services video").count(), 0);
  } finally {
    await noJs.context.close();
  }
  report.checks.push(
    "All four descriptions and real destinations remain server-rendered without JavaScript; no video requests",
  );
  assert.deepEqual(report.requests, []);
  assert.deepEqual(report.errors, []);
} finally {
  await browser.close();
  await writeFile(`${output}/results.json`, JSON.stringify(report, null, 2));
}
console.log(JSON.stringify(report, null, 2));
