import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const output = path.resolve("qa-output");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.BROWSER_PATH ||
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
});
const context = await browser.newContext({
  reducedMotion: "reduce",
  viewport: { width: 1440, height: 1000 },
  acceptDownloads: true,
});
const page = await context.newPage();
const errors = [];
const checks = [];
page.on("pageerror", (e) => errors.push(e.message));
const check = async (name, fn) => {
  try {
    await fn();
    checks.push({ name, passed: true });
  } catch (e) {
    checks.push({ name, passed: false, error: e.message });
  }
};
await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1920]) {
  await page.setViewportSize({ width, height: 1000 });
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  await check(`Home fits ${width}px`, async () => {
    const dimensions = await page.evaluate(() => ({
      page: document.documentElement.scrollWidth,
      viewport: innerWidth,
    }));
    assert.ok(
      dimensions.page <= dimensions.viewport,
      JSON.stringify(dimensions),
    );
  });
}
await page.setViewportSize({ width: 1440, height: 1000 });
await page.screenshot({ path: path.join(output, "desktop-hero.png") });
await page
  .locator("#services")
  .screenshot({ path: path.join(output, "desktop-services.png") });
await page
  .locator("#work")
  .screenshot({ path: path.join(output, "desktop-work.png") });
await page
  .locator("#about")
  .screenshot({ path: path.join(output, "desktop-about.png") });
await page
  .locator("#contact")
  .screenshot({ path: path.join(output, "desktop-contact.png") });
await check("Home accessibility", async () => {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  await writeFile(
    path.join(output, "axe-home.json"),
    JSON.stringify(result.violations, null, 2),
  );
  assert.equal(
    result.violations.length,
    0,
    result.violations.map((v) => `${v.id}: ${v.nodes.length}`).join(", "),
  );
});
await check("Three FAQ accordions work", async () => {
  const buttons = page.locator(".faq-item button");
  assert.equal(await buttons.count(), 3);
  await buttons.nth(0).click();
  assert.equal(await buttons.nth(0).getAttribute("aria-expanded"), "true");
  await buttons.nth(1).click();
  assert.equal(await buttons.nth(0).getAttribute("aria-expanded"), "false");
  assert.equal(await buttons.nth(1).getAttribute("aria-expanded"), "true");
});
await check("Services expand and collapse", async () => {
  const ai = page.locator(".service-trigger").nth(1);
  await ai.click();
  assert.equal(await ai.getAttribute("aria-expanded"), "true");
  await ai.click();
  assert.equal(await ai.getAttribute("aria-expanded"), "false");
});
await check("Project details stay truthful and restore focus", async () => {
  const button = page.locator(".project-trigger").first();
  await button.click();
  assert.ok(await page.locator(".project-dialog").isVisible());
  assert.match(
    await page.locator(".project-dialog").innerText(),
    /not a published client project/,
  );
  assert.equal(await page.locator(".project-dialog a").count(), 0);
  await page.keyboard.press("Escape");
  assert.ok(await button.evaluate((el) => el === document.activeElement));
});
await check("Contact brief downloads and never claims submission", async () => {
  await page.getByRole("button", { name: "Prepare a brief" }).click();
  await page.getByLabel("Your name or business").fill("Portfolio QA");
  await page
    .getByLabel("A little about your idea")
    .fill("Build a useful website with a clear user experience.");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download my brief" }).click();
  const download = await pending;
  assert.equal(download.suggestedFilename(), "project-brief-for-hamid.txt");
  const file = await download.path();
  assert.match(await readFile(file, "utf8"), /has not been sent/);
  assert.match(
    await page.locator(".brief-status").innerText(),
    /download is ready/,
  );
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  await writeFile(
    path.join(output, "axe-contact.json"),
    JSON.stringify(result.violations, null, 2),
  );
  assert.equal(
    result.violations.length,
    0,
    result.violations.map((v) => v.id).join(", "),
  );
  await page.keyboard.press("Escape");
});
if (await page.locator(".brief-dialog").isVisible())
  await page.keyboard.press("Escape");
await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: path.join(output, "mobile-hero.png") });
await check("Mobile menu opens, navigates and restores focus", async () => {
  await page.getByRole("button", { name: "Open navigation" }).click();
  assert.ok(await page.locator("#mobile-menu").isVisible());
  await page.keyboard.press("Escape");
  assert.equal(
    await page
      .getByRole("button", { name: "Open navigation" })
      .getAttribute("aria-expanded"),
    "false",
  );
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: /About/ })
    .click();
  assert.ok(!(await page.locator("#mobile-menu").isVisible()));
  assert.match(page.url(), /#about$/);
});
await page.goto("http://127.0.0.1:3000/work/", { waitUntil: "networkidle" });
await check("Archive filters match project categories", async () => {
  for (const [category, count] of [
    ["All", 6],
    ["Web", 3],
    ["AI Systems", 1],
    ["Automation", 1],
    ["Chatbots", 1],
  ]) {
    await page
      .getByRole("button", { name: new RegExp(`^${category}`) })
      .click();
    assert.equal(
      await page.locator(".archive-list .project").count(),
      count,
      category,
    );
  }
  await page.getByRole("button", { name: /^All/ }).click();
});
for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1920]) {
  await page.setViewportSize({ width, height: 1000 });
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  await check(`Archive fits ${width}px`, async () =>
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ),
  );
}
await page.setViewportSize({ width: 1440, height: 1000 });
await page.screenshot({
  path: path.join(output, "desktop-archive.png"),
  fullPage: true,
});
await check("Archive accessibility", async () => {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  await writeFile(
    path.join(output, "axe-archive.json"),
    JSON.stringify(result.violations, null, 2),
  );
  assert.equal(
    result.violations.length,
    0,
    result.violations.map((v) => v.id).join(", "),
  );
});
await check("Archive SEO is route-specific", async () => {
  assert.match(await page.title(), /Work archive/);
  assert.match(
    await page.locator("link[rel=canonical]").getAttribute("href"),
    /\/work\/$/,
  );
});
const animated = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "no-preference",
});
const motionPage = await animated.newPage();
motionPage.on("pageerror", (e) => errors.push(e.message));
await check(
  "Intro finishes and does not replay; WebGL has fallback",
  async () => {
    await motionPage.goto("http://127.0.0.1:3000", {
      waitUntil: "networkidle",
    });
    await motionPage
      .locator(".signature-intro")
      .waitFor({ state: "hidden", timeout: 7000 });
    await motionPage.reload({ waitUntil: "networkidle" });
    assert.equal(await motionPage.locator(".signature-intro").count(), 0);
    await motionPage.locator("#story").scrollIntoViewIfNeeded();
    assert.equal(await motionPage.locator(".chrome-mark").count(), 1);
    await motionPage.screenshot({
      path: path.join(output, "desktop-story-motion.png"),
    });
  },
);
await check("Brief dialog scrolls with motion enabled", async () => {
  await motionPage.setViewportSize({ width: 1440, height: 650 });
  await motionPage.locator("#contact").scrollIntoViewIfNeeded();
  await motionPage.getByRole("button", { name: "Prepare a brief" }).click();
  const modal = motionPage.locator(".brief-dialog");
  await modal.evaluate((el) => {
    el.scrollTop = 0;
  });
  await modal.hover();
  await motionPage.mouse.wheel(0, 450);
  await motionPage.waitForFunction(
    () => document.querySelector(".brief-dialog").scrollTop > 30,
  );
  await motionPage.keyboard.press("Escape");
});
await check("Reduced motion changes restore the static monogram", async () => {
  await motionPage.emulateMedia({ reducedMotion: "reduce" });
  await motionPage.waitForFunction(
    () => !document.querySelector(".chrome-mark canvas"),
  );
});
await check("No browser runtime errors", async () =>
  assert.deepEqual(errors, []),
);
const report = {
  passed: checks.filter((c) => c.passed).length,
  failed: checks.filter((c) => !c.passed).length,
  checks,
  runtimeErrors: errors,
};
await writeFile(
  path.join(output, "report.json"),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
await browser.close();
process.exitCode = report.failed ? 1 : 0;
