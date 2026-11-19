import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const origin = process.env.QA_BASE_URL || "http://127.0.0.1:3000";
await mkdir("qa-output", { recursive: true });
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
const checks = [];
const check = async (name, fn) => {
  try {
    await fn();
    checks.push({ name, passed: true });
  } catch (error) {
    checks.push({ name, passed: false, error: error.message });
  }
};
await page.goto(origin, { waitUntil: "domcontentloaded" });
await page.locator("#testimonials").waitFor();
await check("Both client names and company selectors are present", async () => {
  assert.equal(await page.locator(".testimonial-selectors button").count(), 2);
  assert.match(
    await page.locator(".testimonial-selectors").innerText(),
    /Abdullah Abbasii[\s\S]*Nexus Growth[\s\S]*Usman[\s\S]*Prestige Media/,
  );
  assert.equal(
    await page
      .locator(".desktop-nav")
      .getByRole("link", { name: "Reviews" })
      .getAttribute("href"),
    "/#testimonials",
  );
});
for (const width of [320, 390, 430, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 1000 });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
  await check(`Portrait player and page fit ${width}px`, async () => {
    const bounds = await page.locator(".testimonial-portrait").boundingBox();
    assert.ok(bounds && Math.abs(bounds.width / bounds.height - 9 / 16) < 0.01);
    assert.ok(bounds.x >= 19 && bounds.x + bounds.width <= width - 19);
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    for (const button of await page
      .locator(".testimonial-controls > button")
      .all()) {
      const box = await button.boundingBox();
      assert.ok(box.width >= 44 && box.height >= 44);
    }
  });
}
await page.setViewportSize({ width: 1440, height: 1000 });
await page.locator("#testimonials").scrollIntoViewIfNeeded();
await page.waitForTimeout(8000);
await page.screenshot({ path: "qa-output/testimonials-desktop.png" });
await check(
  "Carousel controls, keyboard arrows and frame replacement work",
  async () => {
    const before = await page
      .locator(".testimonial-portrait iframe")
      .elementHandle();
    await page
      .getByRole("button", { name: "Next video testimonial", exact: true })
      .click();
    assert.match(
      await page.locator(".testimonial-portrait iframe").getAttribute("src"),
      /1Fne2xejDttvQHV87rt_e4DlNAnPWArcP/,
    );
    assert.equal(await before.evaluate((el) => el.isConnected), false);
    assert.equal(await page.locator("#testimonials iframe").count(), 1);
    assert.equal(
      await page.locator("#testimonial-current strong").innerText(),
      "Usman",
    );
    await page.keyboard.press("ArrowRight");
    assert.equal(
      await page.locator("#testimonial-current strong").innerText(),
      "Abdullah Abbasii",
    );
    await page
      .getByRole("button", { name: "Previous video testimonial", exact: true })
      .click();
    assert.equal(
      await page.locator("#testimonial-current strong").innerText(),
      "Usman",
    );
    await page
      .getByRole("button", {
        name: "Show Abdullah Abbasii video testimonial",
        exact: true,
      })
      .click();
  },
);
await check("Testimonial controls and labels are accessible", async () => {
  // Google's cross-origin playback controls are maintained by Google.
  // Check our region, frame title, navigation and fallback link separately.
  const result = await new AxeBuilder({ page })
    .include("#testimonials")
    .exclude("#testimonials iframe")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  await writeFile(
    "qa-output/axe-testimonials.json",
    JSON.stringify(result.violations, null, 2),
  );
  assert.equal(
    result.violations.length,
    0,
    result.violations.map((v) => v.id).join(", "),
  );
  assert.match(
    await page.locator("#testimonials iframe").getAttribute("title"),
    /Abdullah Abbasii, Nexus Growth/,
  );
  assert.equal(
    await page.locator("#testimonials iframe").getAttribute("loading"),
    "lazy",
  );
  assert.equal(
    await page.locator(".testimonial-player-footer a").getAttribute("href"),
    "https://drive.google.com/file/d/1X04fjJPFVjgm4caTk6GWmub0B0lAlx9m/view",
  );
});
for (const [name, width] of [
  ["Abdullah Abbasii", 1440],
  ["Usman", 390],
]) {
  await check(`${name}'s embedded video plays at ${width}px`, async () => {
    await page.setViewportSize({ width, height: 1000 });
    await page
      .getByRole("button", {
        name: `Show ${name} video testimonial`,
        exact: true,
      })
      .click();
    const iframe = page.locator(".testimonial-portrait iframe");
    await iframe.scrollIntoViewIfNeeded();
    await page.waitForTimeout(8000);
    const bounds = await iframe.boundingBox();
    await page.mouse.click(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2,
    );
    let metadata;
    for (let i = 0; i < 40 && !metadata; i++) {
      for (const frame of page.frames()) {
        const video = frame.locator("video").first();
        if (await video.count()) {
          const state = await video.evaluate((v) => ({
            width: v.videoWidth,
            height: v.videoHeight,
            time: v.currentTime,
            paused: v.paused,
            duration: v.duration,
          }));
          if (state.time > 0.5 && !state.paused) {
            metadata = state;
            break;
          }
        }
      }
      if (!metadata) await page.waitForTimeout(500);
    }
    assert.ok(metadata, "Video should advance after pressing Play");
    assert.equal(metadata.width / metadata.height, 9 / 16);
    console.log(JSON.stringify({ name, playback: metadata }));
    await page.mouse.move(0, 0);
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: `qa-output/testimonial-${width}-playing.png`,
    });
    const oldFrame = await (await iframe.elementHandle()).contentFrame();
    await page
      .getByRole("button", { name: "Next video testimonial", exact: true })
      .click();
    for (let attempt = 0; attempt < 50 && !oldFrame.isDetached(); attempt++)
      await page.waitForTimeout(100);
    assert.ok(
      oldFrame.isDetached(),
      "Switching should remove the playing video",
    );
  });
}
await page.setViewportSize({ width: 390, height: 844 });
await page
  .getByRole("button", {
    name: "Show Abdullah Abbasii video testimonial",
    exact: true,
  })
  .click();
await check(
  "Touch swipe switches videos without affecting vertical scrolling",
  async () => {
    const controls = page.locator(".testimonial-position");
    await controls.scrollIntoViewIfNeeded();
    const touch = await context.newCDPSession(page);
    await touch.send("Emulation.setTouchEmulationEnabled", {
      enabled: true,
      maxTouchPoints: 1,
    });
    const swipe = async (dx, dy) => {
      const box = await controls.boundingBox();
      const x = box.x + box.width * 0.85,
        y = box.y + box.height / 2;
      await touch.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x, y }],
      });
      for (let step = 1; step <= 5; step++) {
        await touch.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: x + (dx * step) / 5, y: y + (dy * step) / 5 }],
        });
      }
      await touch.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
    };
    await swipe(-95, 4);
    assert.equal(
      await page.locator("#testimonial-current strong").innerText(),
      "Usman",
    );
    await swipe(-10, -100);
    assert.equal(
      await page.locator("#testimonial-current strong").innerText(),
      "Usman",
    );
    await touch.detach();
  },
);
await page.locator(".testimonial-portrait").scrollIntoViewIfNeeded();
await page.waitForTimeout(6000);
await page.screenshot({ path: "qa-output/testimonials-mobile.png" });
const report = {
  passed: checks.filter((c) => c.passed).length,
  failed: checks.filter((c) => !c.passed).length,
  checks,
};
await writeFile(
  "qa-output/testimonials-report.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
await browser.close();
process.exitCode = report.failed ? 1 : 0;
