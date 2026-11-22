import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright-core";

const base = new URL(process.env.QA_BASE_URL || "http://127.0.0.1:3000");
const output = process.env.QA_TIMELINE_OUTPUT || "qa-output/process-timeline";
const section = 'section[aria-labelledby="process-title"]';
const stages = ["Discover", "Define", "Build", "Check", "Launch & improve"];
const viewports = [
  [320, 568],
  [360, 780],
  [375, 812],
  [390, 844],
  [430, 932],
  [768, 1024],
  [820, 1180],
  [1024, 768],
  [1280, 800],
  [1440, 900],
];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.BROWSER_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const results = { layouts: [], checks: [], errors: [], profile: null };

async function open(width, height, options = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    isMobile: width < 768,
    hasTouch: width < 1024,
    ...options,
  });
  await context.route(
    (url) => url.origin !== base.origin,
    (route) => route.abort(),
  );
  await context.addInitScript((origin) => {
    if (location.origin === origin && window === window.top)
      sessionStorage.setItem("hamid-origin-v1", "seen");
  }, base.origin);
  const page = await context.newPage();
  page.on("pageerror", (error) => results.errors.push(error.message));
  await page.goto(base.href, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  return { page, context };
}

const state = (page) =>
  page.locator(".scroll-timeline").evaluate((root) => {
    const center = (node) => {
      const box = node.getBoundingClientRect();
      return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    };
    const steps = [...root.querySelectorAll(".timeline-step")];
    const nodes = steps.map((step) =>
      center(step.querySelector(".timeline-node")),
    );
    const cards = steps.map((step) =>
      step.querySelector(".timeline-card").getBoundingClientRect().toJSON(),
    );
    const fill = root.querySelector(".timeline-fill").getBoundingClientRect();
    const viewport = visualViewport;
    const heading = root.closest("section").querySelector("h2");
    const lines = [
      heading.firstChild,
      heading.querySelector("em").firstChild,
    ].map((text) => {
      const range = document.createRange();
      range.selectNodeContents(text);
      return range.getClientRects().length;
    });
    return {
      nodes,
      cards,
      lines,
      fill: { x: fill.x + fill.width / 2, y: fill.top, height: fill.height },
      segments: steps
        .slice(0, -1)
        .map((step) => parseFloat(getComputedStyle(step, "::before").height)),
      stage: steps.map((step) => step.dataset.stage),
      pending: steps.some((step) => step.hasAttribute("data-entering")),
      sightline:
        (viewport?.offsetTop ?? 0) + (viewport?.height ?? innerHeight) / 2,
      viewportWidth: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      sectionHeight: Math.round(
        root.closest("section").getBoundingClientRect().height,
      ),
    };
  });

async function ready(page) {
  await page.waitForFunction(
    () => {
      const root = document.querySelector(".scroll-timeline");
      const nodes = [...root.querySelectorAll(".timeline-node")].map(
        (element) =>
          element.getBoundingClientRect().top +
          element.getBoundingClientRect().height / 2,
      );
      const line = root.querySelector(".timeline-fill").getBoundingClientRect();
      const y =
        (visualViewport?.offsetTop ?? 0) +
        (visualViewport?.height ?? innerHeight) / 2;
      const height = Math.max(0, Math.min(y, nodes.at(-1)) - nodes[0]);
      return (
        root.style.getPropertyValue("--timeline-progress") &&
        Math.abs(line.top - nodes[0]) < 1 &&
        Math.abs(line.height - height) < 1.5
      );
    },
    null,
    { timeout: 4500 },
  );
}

async function goToProgress(page, fraction) {
  await page.locator(".scroll-timeline").evaluate((root, t) => {
    const nodes = [...root.querySelectorAll(".timeline-node")].map((node) => {
      const box = node.getBoundingClientRect();
      return box.top + box.height / 2;
    });
    const y =
      (visualViewport?.offsetTop ?? 0) +
      (visualViewport?.height ?? innerHeight) / 2;
    window.scrollTo({
      top: scrollY + nodes[0] + (nodes.at(-1) - nodes[0]) * t - y,
      behavior: "instant",
    });
  }, fraction);
  await ready(page);
  const data = await state(page);
  const length = data.nodes.at(-1).y - data.nodes[0].y;
  assert.ok(
    Math.abs(data.fill.height / length - Math.max(0, Math.min(1, fraction))) <
      0.018,
  );
  return data;
}

function verifyLayout(data, width) {
  assert.ok(data.documentWidth <= width + 1, `${width}px overflow`);
  assert.equal(data.cards.length, 5);
  assert.deepEqual(data.lines, [1, 1], "timeline heading fits on two lines");
  data.nodes.forEach(({ x, y }, i) => {
    assert.ok(Math.abs(x - data.nodes[0].x) < 1, "nodes share a spine");
    assert.ok(Math.abs(x - data.fill.x) < 1, "fill centered on nodes");
    if (i < data.segments.length) {
      assert.ok(
        Math.abs(data.nodes[i + 1].y - y - data.segments[i]) < 1,
        "muted track meets the next node",
      );
    }
    const card = data.cards[i];
    assert.ok(card.left >= 0 && card.right <= width + 1);
    assert.ok(card.top <= y + 16 && card.bottom > y);
    assert.ok(width >= 1024 && i % 2 === 0 ? card.right < x : card.left > x);
    if (width < 1024 && i) assert.ok(card.top > data.cards[i - 1].bottom - 15);
    if (width >= 1024 && i > 1)
      assert.ok(card.top > data.cards[i - 2].bottom - 15);
  });
}

async function screenshot(page, label) {
  await page.waitForTimeout(450);
  await page.screenshot({ path: `${output}/${label}.png`, scale: "css" });
}

try {
  for (const [width, height] of viewports) {
    const { page, context } = await open(width, height);
    try {
      const timeline = page.locator(section);
      assert.deepEqual(
        await timeline.getByRole("heading", { level: 3 }).allTextContents(),
        stages,
      );
      assert.equal(
        await timeline.getByRole("heading", { level: 2 }).count(),
        1,
      );
      assert.equal(await timeline.getByRole("listitem").count(), 5);
      assert.equal(await timeline.locator("a, button, [tabindex]").count(), 0);
      const neighbors = await timeline.evaluate((el) => [
        el.previousElementSibling.matches(".testimonials"),
        el.nextElementSibling.matches(".explore-further"),
      ]);
      assert.deepEqual(neighbors, [true, true]);
      const before = await goToProgress(page, -0.22);
      assert.ok(before.stage.every((stage) => stage === "upcoming"));
      const middle = await goToProgress(page, 0.47);
      verifyLayout(middle, width);
      assert.equal(
        middle.stage.filter((stage) => stage === "active").length,
        1,
      );
      const final = await goToProgress(page, 1.23);
      assert.ok(final.stage.every((stage) => stage === "complete"));
      assert.equal(final.pending, false);
      const reverse = await goToProgress(page, 0.18);
      assert.ok(reverse.fill.height < middle.fill.height);
      assert.equal(reverse.pending, false, "reveals do not replay");
      if ([320, 390, 768, 1440].includes(width)) {
        const { violations } = await new AxeBuilder({ page })
          .include(section)
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        assert.deepEqual(
          violations.map(({ id, nodes }) => [id, nodes.map((n) => n.target)]),
          [],
        );
      }
      if ([1440, 768, 390].includes(width)) {
        await timeline.screenshot({
          path: `${output}/after-${width}.png`,
          style:
            ".navigation, .mobile-contact, .cursor { visibility: hidden !important; }",
          scale: "css",
        });
      }
      if (width === 390) {
        await timeline.evaluate((el) =>
          scrollTo({
            top: el.getBoundingClientRect().top + scrollY - 86,
            behavior: "instant",
          }),
        );
        await screenshot(page, "mobile-first");
        await goToProgress(page, 0.53);
        await screenshot(page, "mobile-middle");
        await goToProgress(page, 1.25);
        await screenshot(page, "mobile-last");
      }
      if (width === 1440) {
        await goToProgress(page, 0.54);
        await screenshot(page, "desktop-progress");
      }
      results.layouts.push({
        width,
        height,
        sectionHeight: middle.sectionHeight,
        railLength: Math.round(final.fill.height),
      });
    } finally {
      await context.close();
    }
  }
  results.checks.push(
    "Ten widths, measured rail segments and nodes, desktop alternation, mobile order, and forward/reverse progress",
  );
  results.checks.push(
    "Four scoped WCAG scans and semantic ordered list with no artificial tab stops",
  );

  for (const options of [
    { javaScriptEnabled: false },
    { reducedMotion: "reduce" },
  ]) {
    const { page, context } = await open(390, 844, options);
    try {
      const timeline = page.locator(section);
      assert.deepEqual(
        await timeline.getByRole("heading", { level: 3 }).allTextContents(),
        stages,
      );
      const data = await state(page);
      verifyLayout(data, 390);
      assert.equal(data.fill.height, 0);
      assert.equal(data.pending, false);
      for (const card of await timeline.locator(".timeline-card").all()) {
        assert.equal(
          await card.evaluate((element) => getComputedStyle(element).opacity),
          "1",
        );
      }
    } finally {
      await context.close();
    }
  }
  results.checks.push(
    "JavaScript-off and reduced-motion layouts preserve the static rail and every milestone",
  );

  const restored = await open(390, 844);
  try {
    const { page } = restored;
    await goToProgress(page, 0.54);
    const y = await page.evaluate(() => scrollY);
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(
      (position) => Math.abs(scrollY - position) < 5,
      y,
      { timeout: 6000 },
    );
    await ready(page);
    assert.equal(
      (await state(page)).stage.filter((stage) => stage === "active").length,
      1,
    );
    await page.setViewportSize({ width: 844, height: 390 });
    await ready(page);
    verifyLayout(await state(page), 844);
    await page.setViewportSize({ width: 320, height: 568 });
    await ready(page);
    verifyLayout(await state(page), 320);
    await page
      .locator(".timeline-copy p")
      .nth(1)
      .evaluate((paragraph) => {
        paragraph.textContent = paragraph.textContent.repeat(3);
      });
    const reflowed = await goToProgress(page, 0.65);
    verifyLayout(reflowed, 320);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForFunction(
      () =>
        matchMedia("(prefers-reduced-motion: reduce)").matches &&
        !document.querySelector(
          "[data-entering], .timeline-step[data-stage]",
        ) &&
        document.querySelector(".timeline-fill").getBoundingClientRect()
          .height === 0,
    );
    assert.equal((await state(page)).fill.height, 0);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await ready(page);
    const brief = page.getByRole("link", {
      name: "Build your brief",
      exact: true,
    });
    await page.keyboard.press("Tab");
    await brief.focus();
    assert.equal(
      await brief.evaluate((link) => link.matches(":focus-visible")),
      true,
    );
  } finally {
    await restored.context.close();
  }
  results.checks.push(
    "Restored scroll position, rotation and resizing, text reflow, runtime motion preference, and downstream keyboard focus",
  );

  const reflow = await open(640, 450, {
    deviceScaleFactor: 2,
    isMobile: false,
  });
  try {
    // CSS viewport equivalent of a 1280px-wide window at 200% zoom.
    verifyLayout(await goToProgress(reflow.page, 0.58), 640);
  } finally {
    await reflow.context.close();
  }
  results.checks.push("640 CSS px layout at 2× scale for 200% reflow coverage");

  const handset = await open(390, 844, { deviceScaleFactor: 2 });
  try {
    const session = await handset.context.newCDPSession(handset.page);
    await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await goToProgress(handset.page, -0.12);
    results.profile = await handset.page
      .locator(".scroll-timeline")
      .evaluate(async (root) => {
        const shifts = [];
        const longTasks = [];
        const observe = (type, callback) => {
          const observer = new PerformanceObserver((list) =>
            list.getEntries().forEach(callback),
          );
          observer.observe({ type });
          return observer;
        };
        const shiftsObserver = observe("layout-shift", (entry) => {
          if (entry.sources.some(({ node }) => node && root.contains(node)))
            shifts.push(entry.value);
        });
        const tasksObserver = observe("longtask", (entry) =>
          longTasks.push(entry.duration),
        );
        const intervals = [];
        const start = scrollY;
        const distance = root.offsetHeight + 120;
        let previous;
        await new Promise((resolve) => {
          let frame = 0;
          const tick = (now) => {
            if (previous !== undefined) intervals.push(now - previous);
            previous = now;
            scrollTo({
              top: start + (distance * frame) / 72,
              behavior: "instant",
            });
            if (++frame <= 72) requestAnimationFrame(tick);
            else requestAnimationFrame(resolve);
          };
          requestAnimationFrame(tick);
        });
        shiftsObserver.disconnect();
        tasksObserver.disconnect();
        intervals.sort((a, b) => a - b);
        return {
          intervals: intervals.length,
          p95IntervalMs: intervals[Math.floor(intervals.length * 0.95)],
          longTasks: longTasks.length,
          timelineLayoutShift: shifts.reduce((a, b) => a + b, 0),
        };
      });
    assert.equal(results.profile.timelineLayoutShift, 0);
    await session.detach();
  } finally {
    await handset.context.close();
  }
  assert.deepEqual(results.errors, []);
} finally {
  await browser.close();
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
}
console.log(
  JSON.stringify({ ...results, layouts: results.layouts.length }, null, 2),
);
