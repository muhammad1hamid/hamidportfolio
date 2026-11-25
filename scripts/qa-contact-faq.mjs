import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";
import sharp from "sharp";

const base = process.env.QA_BASE_URL || "http://127.0.0.1:3000";
const output = path.resolve(
  process.env.QA_FAQ_OUTPUT || "qa-output/faq-editorial",
);
const widths = [
  320, 360, 375, 390, 414, 430, 768, 1024, 1280, 1440, 1462, 1920,
];
const report = { checks: [], layouts: [], preservation: [], errors: [] };
const root = "[data-contact-faq]";
const questions = [
  "Do I need a finished project brief?",
  "Can you improve an existing website?",
  "Can we work together internationally?",
  "What happens after I send an enquiry?",
];
const chrome =
  process.env.CHROME_PATH ||
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
const screenshotOptions = {
  animations: "disabled",
  style: ".navigation,.skip-link{visibility:hidden!important}",
};
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: chrome });
const check = async (name, run) => {
  try {
    await run();
    report.checks.push({ name, passed: true });
    console.log("PASS", name);
  } catch (error) {
    report.checks.push({ name, passed: false, error: error.message });
    console.error("FAIL", name, error.message);
  }
};
const triggers = (page) => page.locator(`${root} button`);
const expanded = (page) => page.locator(`${root} button[aria-expanded="true"]`);
const settled = async (page) => {
  await page.locator(root).evaluate(async (section) => {
    await Promise.all(
      section
        .getAnimations({ subtree: true })
        .map((animation) => animation.finished.catch(() => {})),
    );
  });
};
async function visit(options = {}) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
    ...options,
  });
  await context.addInitScript(() =>
    sessionStorage.setItem("hamid-origin-v1", "seen"),
  );
  await context.route(
    (url) => url.origin !== new URL(base).origin,
    (route) => route.abort(),
  );
  const page = await context.newPage();
  page.on("pageerror", (error) => report.errors.push(error.message));
  await page.goto(`${base}/contact/`);
  await page.evaluate(() => document.fonts.ready);
  const decline = page.getByRole("button", { name: "Decline", exact: true });
  if (await decline.isVisible()) await decline.click();
  if (options.javaScriptEnabled !== false) {
    await triggers(page).first().isEnabled();
    await page.waitForFunction(
      (selector) =>
        document.querySelector(selector)?.getAttribute("aria-expanded") ===
        "true",
      `${root} button`,
    );
  }
  return { context, page };
}
async function geometry(page) {
  return page.locator(root).evaluate((section) => {
    const rect = (element) => {
      const box = element.getBoundingClientRect();
      return {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        right: box.right,
        bottom: box.bottom,
      };
    };
    return {
      width: innerWidth,
      section: rect(section),
      intro: rect(section.querySelector("header")),
      heading: rect(section.querySelector("h2")),
      scrollWidth: document.documentElement.scrollWidth,
      rows: [...section.querySelectorAll("button")].map((button) => {
        const panel = document.getElementById(
          button.getAttribute("aria-controls"),
        );
        return {
          trigger: rect(button),
          badge: rect(button.children[0]),
          text: rect(button.children[2]),
          icon: rect(button.querySelector("svg")),
          panel: rect(panel),
          answer: rect(panel.querySelector("p")),
          open: button.getAttribute("aria-expanded") === "true",
        };
      }),
    };
  });
}
function verifyGeometry(layout) {
  assert.ok(layout.scrollWidth <= layout.width + 1, "Page horizontal overflow");
  assert.ok(layout.section.x >= -1, "FAQ left edge outside viewport");
  assert.ok(
    layout.section.right <= layout.width + 1,
    "FAQ right edge outside viewport",
  );
  for (const row of layout.rows) {
    assert.ok(row.trigger.height >= 44, "Small touch target");
    assert.ok(row.text.x >= row.badge.right + 8, "Number overlaps question");
    assert.ok(row.text.right <= row.icon.x - 8, "Question overlaps control");
    assert.ok(
      row.icon.right <= layout.section.right - 12,
      "Control outside panel",
    );
    if (row.open) {
      assert.ok(row.panel.height > 20, "Expanded answer has no height");
      assert.ok(
        row.answer.bottom <= row.panel.bottom + 1,
        "Answer clipped vertically",
      );
      assert.ok(
        row.answer.right <= layout.section.right - 12,
        "Answer outside panel",
      );
      assert.ok(
        Math.abs(row.answer.x - row.text.x) <= 1,
        "Answer indent differs from question",
      );
    } else
      assert.ok(
        row.panel.height <= 1,
        "Collapsed answer occupies layout height",
      );
    if (layout.width > 1000)
      assert.ok(
        row.trigger.x >= layout.section.x + layout.section.width * 0.4,
        "Accordion intersects diagonal dark area",
      );
  }
  if (layout.width <= 1000) {
    assert.ok(
      layout.rows[0].trigger.y >= layout.intro.bottom,
      "Panels overlap",
    );
    assert.ok(layout.intro.height < 440, "Mobile intro is too tall");
    assert.ok(
      Math.abs(
        layout.heading.x + layout.heading.width / 2 - layout.width / 2,
      ) <= 1,
      "Mobile heading is not centered",
    );
  }
}
const baseline = await readFile(path.join(output, "before.json"), "utf8")
  .then(JSON.parse)
  .catch(() => []);
try {
  for (const width of widths) {
    await check(
      `Layout, all answers and semantic associations at ${width}px`,
      async () => {
        const { context, page } = await visit({
          viewport: { width, height: 1000 },
        });
        try {
          if ([320, 390, 768, 1024, 1440].includes(width)) {
            for (const [selector, name] of [
              [".first-conversation-grid", "hero"],
              [".conversation-contact-links", "links"],
              [".conversation-next", "process"],
            ]) {
              const filename = path.join(output, `after-${name}-${width}.png`);
              await page
                .locator(selector)
                .screenshot({ path: filename, ...screenshotOptions });
              const before = path.join(output, `before-${name}-${width}.png`);
              const original = await sharp(before)
                .ensureAlpha()
                .raw()
                .toBuffer({ resolveWithObject: true })
                .catch(() => null);
              if (original) {
                const updated = await sharp(filename)
                  .ensureAlpha()
                  .raw()
                  .toBuffer({ resolveWithObject: true });
                assert.equal(
                  updated.info.width,
                  original.info.width,
                  `${name} screenshot width changed`,
                );
                assert.equal(
                  updated.info.height,
                  original.info.height,
                  `${name} screenshot height changed`,
                );
                let changed = 0;
                for (let offset = 0; offset < original.data.length; offset += 4)
                  if (
                    [0, 1, 2].some(
                      (channel) =>
                        Math.abs(
                          original.data[offset + channel] -
                            updated.data[offset + channel],
                        ) > 2,
                    )
                  )
                    changed++;
                const difference =
                  changed / (original.info.width * original.info.height);
                report.preservation.push({
                  width,
                  section: name,
                  changedPixelRatio: difference,
                });
                assert.ok(
                  difference < 0.001,
                  `${name} changed visually (${(difference * 100).toFixed(3)}%)`,
                );
              }
            }
          }
          assert.deepEqual(
            await triggers(page)
              .allTextContents()
              .then((items) =>
                items.map((text) => text.replace(/^0[1-4]/, "").trim()),
              ),
            questions,
          );
          assert.equal(await expanded(page).count(), 1);
          assert.equal(
            await triggers(page).first().getAttribute("aria-expanded"),
            "true",
          );
          assert.equal(await page.locator("main h1").count(), 1);
          const ids = await triggers(page).evaluateAll((buttons) =>
            buttons.map((button) => button.getAttribute("aria-controls")),
          );
          assert.equal(new Set(ids).size, 4);
          for (let index = 0; index < 4; index++) {
            const panel = page.locator(`[id="${ids[index]}"]`);
            assert.equal(await panel.getAttribute("role"), "region");
            assert.equal(
              await panel.getAttribute("aria-labelledby"),
              await triggers(page).nth(index).getAttribute("id"),
            );
            if (index > 0) await triggers(page).nth(index).click();
            await settled(page);
            assert.equal(await expanded(page).count(), 1);
            assert.equal(await panel.getAttribute("aria-hidden"), "false");
            verifyGeometry(await geometry(page));
          }
          await triggers(page).first().click();
          const layout = await geometry(page);
          report.layouts.push(layout);
          const previous = baseline.find((item) => item.width === width);
          if (previous) {
            const current = await page.evaluate(
              (selectors) =>
                Object.fromEntries(
                  selectors.map((selector) => {
                    const element = document.querySelector(selector);
                    const box = element.getBoundingClientRect();
                    const style = getComputedStyle(element);
                    return [
                      selector,
                      {
                        x: box.x,
                        y: box.y + scrollY,
                        width: box.width,
                        height: box.height,
                        font: style.fontFamily,
                        color: style.color,
                        padding: style.padding,
                      },
                    ];
                  }),
                ),
              Object.keys(previous.boxes),
            );
            for (const [selector, box] of Object.entries(previous.boxes)) {
              for (const property of ["x", "y", "width", "height"])
                assert.ok(
                  Math.abs(box[property] - current[selector][property]) < 0.1,
                  `${selector} ${property} changed: ${box[property]} → ${current[selector][property]}`,
                );
              for (const property of ["font", "color", "padding"])
                assert.equal(
                  current[selector][property],
                  box[property],
                  `${selector} ${property} changed`,
                );
            }
            report.preservation.push({ width, geometry: "unchanged" });
          }
          if ([320, 390, 768, 1024, 1440, 1462, 1920].includes(width))
            await page.locator(root).screenshot({
              path: path.join(output, `faq-${width}.png`),
              ...screenshotOptions,
            });
          if ([320, 390, 768, 1024, 1440].includes(width)) {
            const { violations } = await new AxeBuilder({ page })
              .include(root)
              .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
              .analyze();
            assert.deepEqual(
              violations.map(({ id, nodes }) => ({
                id,
                targets: nodes.map(({ target }) => target),
              })),
              [],
            );
          }
        } finally {
          await context.close();
        }
      },
    );
  }
  await check(
    "Keyboard: Enter, Space, arrows, Home/End, focus and collapsed link exclusion",
    async () => {
      const { context, page } = await visit();
      try {
        const buttons = triggers(page);
        await buttons.first().focus();
        assert.equal(
          await buttons
            .first()
            .evaluate((el) => getComputedStyle(el).outlineStyle),
          "solid",
        );
        await page.keyboard.press("Enter");
        assert.equal(await expanded(page).count(), 0);
        await page.keyboard.press("Space");
        assert.equal(
          await buttons.first().getAttribute("aria-expanded"),
          "true",
        );
        await page.keyboard.press("ArrowDown");
        assert.equal(
          await buttons.nth(1).evaluate((el) => el === document.activeElement),
          true,
        );
        await page.keyboard.press("End");
        await page.keyboard.press("Enter");
        assert.equal(
          await buttons.nth(3).getAttribute("aria-expanded"),
          "true",
        );
        await page.keyboard.press("Tab");
        assert.equal(
          await page
            .locator(root)
            .getByRole("link", { name: "email me directly" })
            .evaluate((el) => el === document.activeElement),
          true,
        );
        await buttons.nth(3).focus();
        await page.keyboard.press("Space");
        assert.equal(
          await page
            .locator(root)
            .getByRole("link", { name: "email me directly" })
            .count(),
          0,
        );
        await page.keyboard.press("Home");
        assert.equal(
          await buttons.first().evaluate((el) => el === document.activeElement),
          true,
        );
        await page.keyboard.press("ArrowUp");
        assert.equal(
          await buttons.nth(3).evaluate((el) => el === document.activeElement),
          true,
        );
      } finally {
        await context.close();
      }
    },
  );
  await check(
    "Interruptible 380ms motion, rapid activation, hover and stable resize state",
    async () => {
      const { context, page } = await visit({ reducedMotion: "no-preference" });
      try {
        await triggers(page).nth(1).hover();
        assert.equal(
          await triggers(page).nth(1).getAttribute("aria-expanded"),
          "false",
        );
        const duration = await page
          .locator(root)
          .getByRole("region")
          .first()
          .evaluate((el) => getComputedStyle(el).transitionDuration);
        assert.ok(
          duration
            .split(",")
            .every((value) => Math.abs(parseFloat(value) - 0.38) < 0.001),
        );
        await triggers(page).nth(1).click();
        assert.ok(
          await page
            .locator(root)
            .evaluate((el) => el.getAnimations({ subtree: true }).length > 0),
          "No motion was created",
        );
        await page.locator(root).evaluate(async (section) => {
          const buttons = section.querySelectorAll("button");
          for (const index of [3, 0, 2, 1, 3, 2, 0, 3]) {
            buttons[index].click();
            await new Promise((resolve) => setTimeout(resolve, 25));
          }
        });
        await settled(page);
        assert.equal(await expanded(page).count(), 1);
        assert.equal(
          await triggers(page).nth(3).getAttribute("aria-expanded"),
          "true",
        );
        verifyGeometry(await geometry(page));
        await page.setViewportSize({ width: 390, height: 844 });
        await settled(page);
        assert.equal(
          await triggers(page).nth(3).getAttribute("aria-expanded"),
          "true",
        );
        verifyGeometry(await geometry(page));
        await page.setViewportSize({ width: 1440, height: 900 });
        assert.equal(
          await triggers(page).nth(3).getAttribute("aria-expanded"),
          "true",
        );
      } finally {
        await context.close();
      }
    },
  );
  await check(
    "Reduced motion, 200% reflow, text resizing and long answers remain readable",
    async () => {
      const { context, page } = await visit({
        viewport: { width: 1280, height: 900 },
      });
      try {
        assert.equal(
          await page
            .locator(root)
            .getByRole("region")
            .first()
            .evaluate((el) => getComputedStyle(el).transitionDuration),
          "0s",
        );
        await page.addStyleTag({ content: "html{zoom:2}" });
        await triggers(page).nth(2).click();
        verifyGeometry(await geometry(page));
        await page.addStyleTag({ content: "html{zoom:1}" });
        await page.setViewportSize({ width: 320, height: 700 });
        await triggers(page).first().click();
        await page
          .locator(root)
          .getByRole("region")
          .first()
          .locator("p")
          .evaluate((el) => {
            el.textContent = (el.textContent + " ").repeat(12);
            el.style.fontSize = "30px";
          });
        const long = await geometry(page);
        assert.ok(
          long.rows[0].panel.height > 1000,
          "Long answer did not grow naturally",
        );
        verifyGeometry(long);
        await triggers(page).nth(1).click();
        verifyGeometry(await geometry(page));
      } finally {
        await context.close();
      }
    },
  );
  await check(
    "Server HTML and no-JavaScript fallback expose all factual answers without duplicate schema",
    async () => {
      const html = await fetch(`${base}/contact/`).then((response) =>
        response.text(),
      );
      for (const question of questions) assert.ok(html.includes(question));
      assert.equal(html.includes('"@type":"FAQPage"'), false);
      const { context, page } = await visit({
        javaScriptEnabled: false,
        viewport: { width: 390, height: 844 },
      });
      try {
        for (const panel of await page
          .locator(`${root} [role="region"]`)
          .all()) {
          assert.ok((await panel.boundingBox()).height > 20);
          assert.equal(await panel.getAttribute("aria-hidden"), null);
          assert.equal(await panel.getAttribute("inert"), null);
        }
        assert.equal(
          await page
            .locator(root)
            .getByRole("link", { name: "email me directly" })
            .count(),
          1,
        );
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        );
        await page.locator(root).screenshot({
          path: path.join(output, "faq-no-js.png"),
          ...screenshotOptions,
        });
      } finally {
        await context.close();
      }
    },
  );
  await check(
    "Touch activation, ordinary scrolling and solid lightweight surfaces",
    async () => {
      const { context, page } = await visit({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
      });
      try {
        await triggers(page).nth(2).tap();
        assert.equal(await expanded(page).count(), 1);
        assert.equal(
          await triggers(page).nth(2).getAttribute("aria-expanded"),
          "true",
        );
        await triggers(page).nth(2).tap();
        assert.equal(await expanded(page).count(), 0);
        assert.notEqual(
          await page.evaluate(() => getComputedStyle(document.body).overflow),
          "hidden",
        );
        const surfaces = await page.locator(root).evaluate((section) => ({
          background: getComputedStyle(section).backgroundColor,
          decorated: [...section.querySelectorAll("*")].some((element) => {
            const style = getComputedStyle(element);
            return (
              style.backdropFilter !== "none" ||
              style.backgroundImage !== "none"
            );
          }),
          heavy: section.querySelectorAll("img,canvas,video,iframe").length,
        }));
        assert.equal(surfaces.background, "rgb(250, 245, 236)");
        assert.equal(surfaces.decorated, false);
        assert.equal(surfaces.heavy, 0);
      } finally {
        await context.close();
      }
    },
  );
  await check("No browser runtime errors", async () =>
    assert.deepEqual(report.errors, []),
  );
} finally {
  await browser.close();
  await writeFile(
    path.join(output, "report.json"),
    JSON.stringify(report, null, 2),
  );
}
console.log(
  `${report.checks.filter((check) => check.passed).length}/${report.checks.length} FAQ checks passed`,
);
if (report.checks.some((check) => !check.passed)) process.exitCode = 1;
