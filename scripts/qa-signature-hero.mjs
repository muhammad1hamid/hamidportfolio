import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright-core";
import sharp from "sharp";

const base = new URL(process.env.QA_BASE_URL || "http://127.0.0.1:3000");
const output = process.env.QA_HERO_OUTPUT || "qa-output/signature-hero";
const viewports = [
  [320, 568],
  [360, 780],
  [375, 812],
  [390, 844],
  [430, 932],
  [600, 900],
  [719, 900],
  [720, 900],
  [768, 1024],
  [1024, 768],
  [1280, 800],
  [1440, 900],
  [1920, 1080],
];
const browser = await chromium.launch({
  executablePath:
    process.env.BROWSER_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const report = {
  checkedAt: new Date().toISOString(),
  layouts: [],
  checks: [],
  errors: [],
};
await mkdir(output, { recursive: true });

async function open(viewport, options = {}, skipIntro = true) {
  const context = await browser.newContext({ viewport, ...options });
  await context.route(
    (url) => url.origin !== base.origin,
    (route) => route.abort(),
  );
  if (skipIntro)
    await context.addInitScript(() =>
      sessionStorage.setItem("hamid-origin-v1", "seen"),
    );
  const page = await context.newPage();
  page.on("pageerror", (error) => report.errors.push(error.message));
  await page.goto(base.href, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  return { context, page };
}

const beam = (page) => page.locator(".nav-contact-beam");
const primary = (page) =>
  page
    .locator(".signature-hero")
    .getByRole("link", { name: "Discuss your project", exact: true });
const header = (page) =>
  page.getByRole("link", { name: "Discuss a project", exact: true });
const fit = (box, height) =>
  box && box.y >= 0 && box.y + box.height <= height + 1;

async function audit(page, width) {
  const { violations } = await new AxeBuilder({ page })
    .include(".navigation")
    .include(".signature-hero")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  assert.deepEqual(
    violations.map(({ id, nodes }) => [id, nodes.map((n) => n.target)]),
    [],
    `${width}px axe scan`,
  );
}

async function warmPerimeter(page, time, name) {
  await beam(page).evaluate((ring, currentTime) => {
    const animation = ring
      .getAnimations({ subtree: true })
      .find((effect) => effect.animationName === "nav-contact-beam-turn");
    animation.pause();
    animation.currentTime = currentTime;
  }, time);
  const buffer = await header(page).screenshot({
    path: `${output}/beam-${name}.png`,
  });
  const { data, info } = await sharp(buffer)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let warm = 0;
  let xTotal = 0;
  let yTotal = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels;
      const [r, g, b] = data.subarray(i, i + 3);
      if (r < 140 || r - g < 38 || g - b < 12) continue;
      assert.ok(
        x < 25 || x > info.width - 26 || y < 4 || y > info.height - 5,
        "The beam must stay in the pill perimeter",
      );
      warm++;
      xTotal += x;
      yTotal += y;
    }
  }
  assert.ok(
    warm >= 5 && warm < 100,
    `Expected a short warm segment, got ${warm} warm pixels`,
  );
  return {
    warmPixels: warm,
    center: [xTotal / warm, yTotal / warm].map(Math.round),
  };
}

async function tracePaint(page, running) {
  await page.evaluate((play) => {
    for (const animation of document.getAnimations()) animation.pause();
    const ring = document.querySelector(".nav-contact-beam");
    const effect = ring
      .getAnimations({ subtree: true })
      .find((animation) => animation.animationName === "nav-contact-beam-turn");
    if (play) effect.play();
  }, running);
  await page.waitForTimeout(150);
  const session = await page.context().newCDPSession(page);
  const stats = { paintEvents: 0, paintMs: 0, layoutEvents: 0 };
  session.on("Tracing.dataCollected", ({ value }) => {
    for (const event of value) {
      if (event.name === "Paint") {
        stats.paintEvents++;
        stats.paintMs += (event.dur || 0) / 1000;
      }
      if (event.name === "Layout") stats.layoutEvents++;
    }
  });
  await session.send("Tracing.start", { categories: "devtools.timeline" });
  await page.waitForTimeout(1200);
  const complete = new Promise((resolve) =>
    session.once("Tracing.tracingComplete", resolve),
  );
  await session.send("Tracing.end");
  await complete;
  await session.detach();
  stats.paintMs = Number(stats.paintMs.toFixed(2));
  return stats;
}

try {
  for (const [width, height] of viewports) {
    const { context, page } = await open(
      { width, height },
      { isMobile: width <= 768, hasTouch: width <= 768 },
    );
    try {
      const mobile = width < 720;
      assert.equal(await page.locator("main h1").count(), 1);
      assert.equal(
        await page
          .locator('.hero-backdrop[aria-hidden="true"] .hero-watermark')
          .textContent(),
        "HAMID",
      );
      assert.equal(
        (await page.locator("#hero-title").innerText())
          .replace(/\s+/g, " ")
          .trim(),
        mobile
          ? "Build. Grow. Automate."
          : "Stand out online. Get found. Work smarter.",
      );
      assert.equal(
        (await page.locator(".hero-description").innerText()).trim(),
        mobile
          ? "Distinctive websites, stronger search visibility, and practical AI automation for growing businesses."
          : "I’m Hamid. I build distinctive websites, improve how businesses get discovered across search and AI, and create practical automations that make everyday work easier.",
      );
      const layout = await page.evaluate(() => {
        const rect = (selector) =>
          document.querySelector(selector).getBoundingClientRect();
        const titleLines = Array.from(
          document.querySelectorAll("#hero-title .hero-title-line"),
        )
          .filter((line) => line.getClientRects().length)
          .map((line) => {
            const range = document.createRange();
            range.selectNodeContents(line);
            return range.getClientRects().length;
          });
        const portrait = rect(".hero-portrait");
        const copy = rect(".hero-copy");
        const watermark = rect(".hero-watermark");
        const image = document.querySelector(".hero-portrait img");
        return {
          titleLines,
          scrollWidth: document.documentElement.scrollWidth,
          portraitHeight: Math.round(portrait.height),
          portraitBeforeCopy: portrait.bottom <= copy.top + 1,
          portraitRightOfCopy: portrait.left + portrait.width / 2 > copy.right,
          copyCentered: [
            "#hero-title",
            ".hero-description",
            ".hero-eyebrow",
          ].every((selector) => {
            const node = document.querySelector(selector);
            const box = node.getBoundingClientRect();
            return (
              getComputedStyle(node).textAlign === "center" &&
              Math.abs(box.left + box.width / 2 - innerWidth / 2) < 1
            );
          }),
          watermarkBelowFace:
            watermark.top >= portrait.top + portrait.height * 0.6,
          photoWidth: Math.round(image.getBoundingClientRect().width),
          image: image.currentSrc,
          imageWidth: image.naturalWidth,
          originalImage: image.getAttribute("src"),
        };
      });
      assert.deepEqual(
        layout.titleLines,
        mobile ? [1, 1] : [1, 1, 1],
        `${width}px heading lines`,
      );
      assert.ok(layout.scrollWidth <= width + 1, `${width}px page overflow`);
      assert.equal(layout.originalImage, "/images/hamid-hero-warm.webp");
      assert.ok(layout.imageWidth > 0, `${width}px photo loaded`);
      assert.equal(await page.locator(".hero-orbit").isVisible(), !mobile);
      if (mobile) {
        assert.ok(layout.portraitBeforeCopy && layout.copyCentered);
        assert.ok(layout.portraitHeight >= 206 && layout.portraitHeight <= 276);
        assert.ok(layout.photoWidth >= Math.min(width * 0.85, 360));
        assert.ok(layout.watermarkBelowFace);
        assert.equal(await page.locator(".nav-contact").isVisible(), false);
      } else {
        assert.ok(layout.portraitRightOfCopy);
        assert.equal(
          await page.locator(".hero-portrait-cross:visible").count(),
          2,
        );
      }
      const button = await primary(page).boundingBox();
      assert.ok(
        button.height >= 48 && fit(button, height),
        `${width}px primary CTA above the fold`,
      );
      if ([320, 390, 768, 1440].includes(width)) await audit(page, width);
      await page.screenshot({ path: `${output}/hero-${width}.png` });
      report.layouts.push({
        width,
        height,
        ...layout,
        primaryBottom: Math.round(button.y + button.height),
      });
    } finally {
      await context.close();
    }
  }
  report.checks.push(
    `${viewports.length} widths with the original desktop headline and orbit, centered mobile copy under the portrait, and a visible primary CTA`,
  );
  report.checks.push(
    "Four WCAG A and AA axe scans at desktop, tablet and phone sizes",
  );

  const desktop = await open({ width: 1440, height: 900 });
  try {
    const { page } = desktop;
    const nav = header(page);
    assert.match(
      await nav.evaluate((link) => getComputedStyle(link).boxShadow),
      /inset/,
    );
    await page.waitForFunction(() =>
      document
        .querySelector(".hero-portrait")
        ?.hasAttribute("data-portrait-motion"),
    );
    await nav.hover();
    await page.waitForFunction(() =>
      document
        .querySelector(".nav-contact-beam")
        .getAnimations({ subtree: true })
        .some(
          (effect) =>
            effect.animationName === "nav-contact-beam-turn" &&
            effect.playbackRate > 1.15,
        ),
    );
    await page.mouse.move(30, 90);
    const first = await warmPerimeter(page, 250, "top");
    const second = await warmPerimeter(page, 3680, "bottom");
    assert.ok(
      Math.hypot(
        second.center[0] - first.center[0],
        second.center[1] - first.center[1],
      ) > 15,
    );
    report.beam = [first, second];
    report.paintTrace = {
      durationMs: 1200,
      paused: await tracePaint(page, false),
      rotating: await tracePaint(page, true),
    };
    report.checks.push(
      "Header border has a steady inner glow and the moving beam speeds up on hover",
    );

    const stage = page.locator(".hero-portrait");
    const position = await stage.boundingBox();
    await page.mouse.move(
      position.x + position.width * 0.96,
      position.y + position.height * 0.8,
    );
    await page.waitForFunction(
      () =>
        parseFloat(
          document
            .querySelector(".hero-portrait")
            .style.getPropertyValue("--portrait-x"),
        ) > 4,
    );
    const offset = await stage.evaluate((el) =>
      ["--portrait-x", "--portrait-y"].map((key) =>
        parseFloat(el.style.getPropertyValue(key)),
      ),
    );
    assert.ok(offset[0] <= 6 && offset[1] > 0 && offset[1] <= 4);
    await page.mouse.move(30, 890);
    await page.waitForFunction(
      () =>
        !document
          .querySelector(".hero-portrait")
          .style.getPropertyValue("--portrait-x"),
    );
    report.checks.push(
      "Desktop portrait movement is bounded and resets when the pointer leaves the hero",
    );

    await primary(page).hover();
    await page.waitForFunction(() => {
      const arrow = document.querySelector(".hero-primary-icon svg");
      const matrix = new DOMMatrixReadOnly(getComputedStyle(arrow).transform);
      return matrix.m41 > 2 && matrix.m42 < -2;
    });
    await page.keyboard.press("Tab");
    await primary(page).focus();
    assert.ok(
      await primary(page).evaluate(
        (link) =>
          link.matches(":focus-visible") &&
          getComputedStyle(link).outlineWidth === "2px",
      ),
    );
    await page.keyboard.press("Enter");
    await page.waitForURL("**/contact/?source=home");
    await page.goBack();
    assert.equal(await page.locator("#hamid-origin").isVisible(), false);
    for (const key of ["Enter", "Space"]) {
      await header(page).focus();
      await page.keyboard.press(key);
      await page.waitForURL("**/contact/?source=navigation");
      await page.goBack();
    }
    await page
      .locator(".signature-hero")
      .getByRole("link", { name: "Explore selected work", exact: true })
      .click();
    await page.waitForURL("**/work/");
    await page.goBack();
    await page.locator(".hero-work-cue").click();
    await page.waitForURL("**/#work");
    await page.locator("#work").waitFor({ state: "visible" });
    report.checks.push(
      "Primary hover and keyboard focus, header Enter and Space, both work destinations and no replay on return",
    );
  } finally {
    await desktop.context.close();
  }

  const touch = await open(
    { width: 390, height: 844 },
    { isMobile: true, hasTouch: true },
  );
  try {
    const { page } = touch;
    const menu = page.getByRole("button", { name: "Open navigation" });
    await menu.tap();
    await page.getByRole("dialog", { name: "Navigation" }).waitFor();
    assert.equal(await menu.getAttribute("aria-expanded"), "true");
    await page.keyboard.press("Escape");
    await page
      .getByRole("dialog", { name: "Navigation" })
      .waitFor({ state: "hidden" });
    assert.equal(await menu.getAttribute("aria-expanded"), "false");
    assert.equal(
      await menu.evaluate((button) => document.activeElement === button),
      true,
    );
    assert.equal(
      await page.locator(".hero-portrait").getAttribute("data-portrait-motion"),
      null,
    );
    assert.equal(
      await page.locator(".signature-hero").getAttribute("style"),
      null,
    );
    await primary(page).tap();
    await page.waitForURL("**/contact/?source=home");
    report.checks.push(
      "Touch menu opens and returns focus on Escape, portrait is static and orange CTA routes to Contact",
    );
  } finally {
    await touch.context.close();
  }

  for (const options of [
    { reducedMotion: "reduce" },
    { forcedColors: "active" },
    { javaScriptEnabled: false },
  ]) {
    const { context, page } = await open(
      { width: 1440, height: 900 },
      options,
      false,
    );
    try {
      assert.equal(await page.locator("#hamid-origin").isVisible(), false);
      assert.equal(await page.locator("#hero-title").isVisible(), true);
      assert.equal(
        await primary(page).getAttribute("href"),
        "/contact/?source=home",
      );
      if (options.javaScriptEnabled !== false) {
        const beamAnimations = await beam(page).evaluate(
          (ring) => ring.getAnimations({ subtree: true }).length,
        );
        assert.equal(beamAnimations, 0);
        assert.equal(
          await page
            .locator(".hero-portrait")
            .getAttribute("data-portrait-motion"),
          null,
        );
      }
    } finally {
      await context.close();
    }
  }
  report.checks.push(
    "Reduced motion, forced colors and JavaScript-disabled HTML keep the page and real enquiry link accessible",
  );
  assert.deepEqual(report.errors, []);
} finally {
  await browser.close();
  await writeFile(`${output}/results.json`, JSON.stringify(report, null, 2));
}

console.log(
  JSON.stringify({
    layouts: report.layouts.length,
    checks: report.checks,
    paintTrace: report.paintTrace,
  }),
);
