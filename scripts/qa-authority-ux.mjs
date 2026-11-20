import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright-core";

const base = new URL(process.env.QA_BASE_URL || "http://127.0.0.1:3000");
const article = "/insights/hamid-intro-motion/";
const routes = [
  "/",
  "/growth/",
  "/contact/",
  "/work/",
  "/work/bridal-house/",
  "/insights/",
  "/insights/measure-whatsapp-enquiries/",
  "/blog/",
  "/for-agencies/",
  article,
];
const viewports = [
  [320, 568],
  [360, 800],
  [375, 812],
  [390, 844],
  [430, 932],
  [768, 1024],
  [1024, 768],
  [1440, 960],
  [844, 390], // Phone landscape
  [720, 480], // CSS viewport at 200% zoom on 1440 × 960
];
const output = "qa-output/authority-ux";
const browser = await chromium.launch({
  executablePath:
    process.env.BROWSER_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});

const report = {
  checkedAt: new Date().toISOString(),
  layouts: [],
  axe: [],
  failures: [],
};
await mkdir(output, { recursive: true });

try {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  await context.route(
    (url) => url.origin !== base.origin,
    (route) => route.abort(),
  );
  const page = await context.newPage();
  page.on("pageerror", (error) => report.failures.push(error.message));

  for (const route of routes) {
    for (const [width, height] of viewports) {
      await page.setViewportSize({ width, height });
      const response = await page.goto(new URL(route, base).href);
      assert.equal(response.status(), 200, route);
      assert.equal(await page.locator("main h1").count(), 1, route);
      await page.evaluate(() => document.fonts.ready);
      const layout = await page.evaluate(() => {
        const title = document.querySelector("main h1");
        const bounds = title.getBoundingClientRect();
        return {
          scrollWidth: document.documentElement.scrollWidth,
          titleClipped:
            bounds.left < -1 ||
            bounds.right > innerWidth + 1 ||
            title.scrollWidth > title.clientWidth + 1,
        };
      });
      const pass = layout.scrollWidth <= width + 1 && !layout.titleClipped;
      report.layouts.push({ route, width, height, ...layout, pass });
      if (!pass)
        report.failures.push(
          `${route} overflow or clipped title at ${width}×${height}`,
        );

      if (
        route === "/" ||
        route === article ||
        (route === "/insights/" && (width === 390 || width === 1440))
      ) {
        const slug = route.split("/").filter(Boolean).at(-1) || "home";
        await page.screenshot({ path: `${output}/${slug}-${width}.png` });
      }
      if (width === 390 || width === 1440) {
        const { violations } = await new AxeBuilder({ page })
          .include("main")
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        const issues = violations.map(({ id, nodes }) => ({
          id,
          targets: nodes.map(({ target }) => target),
        }));
        report.axe.push({ route, width, issues });
        if (issues.length)
          report.failures.push(
            `${route} axe at ${width}px: ${JSON.stringify(issues)}`,
          );
      }
    }
    console.log(`Checked ${route} at ${viewports.length} viewport sizes`);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(new URL(article, base).href);
  const anchor = page
    .getByRole("navigation", { name: "On this page" })
    .getByRole("link", {
      name: "Test the interruption as carefully as the reveal",
    });
  await anchor.focus();
  assert.equal(
    await anchor.evaluate((link) => link.matches(":focus-visible")),
    true,
  );
  assert.notEqual(
    await anchor.evaluate((link) => getComputedStyle(link).outlineStyle),
    "none",
  );
  await page.keyboard.press("Enter");
  await page.waitForURL("**/#test-the-failure-path");
  assert.equal(
    await page.locator("#test-the-failure-path h2").isVisible(),
    true,
  );
  await page.goBack();
  assert.equal(new URL(page.url()).hash, "");
  assert.equal(await page.locator("#hamid-origin").isVisible(), false);
  report.articleKeyboard =
    "Visible focus, TOC keyboard navigation and history return verified";

  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const plainPage = await noJs.newPage();
  await plainPage.goto(new URL(article, base).href);
  assert.equal((await plainPage.locator("main article h2").count()) >= 5, true);
  assert.equal(
    await plainPage
      .locator("figure figcaption")
      .getByText("one-second hold", { exact: false })
      .count(),
    1,
  );
  assert.equal(
    await plainPage.locator("main a[href='/web-development/']").count(),
    1,
  );
  assert.equal(
    await plainPage.locator("main a[href^='https://wa.me/']").count(),
    1,
  );
  report.noJavaScript =
    "Article, sourceable figure caption and contact links rendered";
  await noJs.close();
  await context.close();
  assert.deepEqual(report.failures, []);
} finally {
  await browser.close();
  await writeFile(`${output}/results.json`, JSON.stringify(report, null, 2));
}
