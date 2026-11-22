import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";
const base = process.env.QA_BASE_URL || "http://127.0.0.1:3000";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const checks = [];
const errors = [];
const state = (page, value) => page.waitForSelector(`[data-mode="${value}"]`);
async function setup(options = {}) {
  const context = await browser.newContext({
    viewport: { width: 320, height: 568 },
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
  page.on("pageerror", (e) => errors.push(e.message));
  return { page, context };
}
try {
  const { page, context } = await setup();
  await page.goto(base + "/work/");
  await state(page, "WALK");
  await page.screenshot({ path: "qa-output/curve/short-phone-corridor.png" });
  await page.locator(".curve-nearby button").first().focus();
  await page.keyboard.press("Enter");
  await state(page, "PREVIEW");
  await page.screenshot({ path: "qa-output/curve/short-phone-preview.png" });
  await page.keyboard.press("Enter");
  await state(page, "DETAIL");
  assert.ok(
    await page
      .getByRole("button", { name: "Close project", exact: true })
      .evaluate((el) => el === document.activeElement),
  );
  await page.screenshot({ path: "qa-output/curve/short-phone-detail.png" });
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(500);
  assert.ok(
    (await page.locator(".curve-story-track").evaluate((el) => el.scrollLeft)) >
      300,
  );
  await page.keyboard.press("Escape");
  await state(page, "WALK");
  assert.ok(
    await page
      .locator(".curve-nearby button")
      .first()
      .evaluate((el) => el === document.activeElement),
  );
  await page.locator(".curve-nearby button").first().click();
  await state(page, "PREVIEW");
  await page.getByRole("button", { name: "View project", exact: true }).click();
  await state(page, "DETAIL");
  await page.locator(".curve-story-close").evaluate((button) => {
    button.click();
    button.click();
  });
  await state(page, "WALK");
  assert.equal(new URL(page.url()).pathname, "/work/");
  await page.locator(".curve-nearby button").first().click();
  await state(page, "PREVIEW");
  await page.getByRole("button", { name: "View project", exact: true }).click();
  await page.waitForTimeout(80);
  await page.keyboard.press("Escape");
  await state(page, "WALK");
  await page.locator(".curve-nearby button").first().click();
  await state(page, "PREVIEW");
  await page.locator(".curve-preview-list").click();
  await state(page, "FALLBACK");
  assert.ok(await page.locator(".project-entry").first().isVisible());
  await page.reload();
  await state(page, "FALLBACK");
  await page
    .getByRole("button", { name: "Enter the 3D corridor", exact: true })
    .click();
  await state(page, "WALK");
  await page.locator(".curve-nearby button").first().click();
  await state(page, "PREVIEW");
  await page.getByRole("button", { name: "View project", exact: true }).click();
  await state(page, "DETAIL");
  await page.locator(".curve-story-list").click();
  await state(page, "FALLBACK");
  assert.equal(await page.locator("dialog[open]").count(), 0);
  await page
    .getByRole("button", { name: "Enter the 3D corridor", exact: true })
    .click();
  await state(page, "WALK");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await state(page, "FALLBACK");
  await context.close();
  checks.push(
    "320 × 568, keyboard preview/detail/arrows/Escape/focus return, repeated Close and interrupted expansion, list switch from preview and detail, stored view choice, runtime reduced motion",
  );

  const blocked = await setup();
  await blocked.page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      if (String(kind).includes("webgl")) return null;
      return original.call(this, kind, ...args);
    };
  });
  await blocked.page.goto(base + "/work/");
  await blocked.page.waitForFunction(() =>
    document
      .querySelector(".curve-gallery [role=status]")
      ?.textContent.includes("could not start"),
  );
  assert.equal(await blocked.page.locator(".project-entry").count(), 18);
  await blocked.context.close();
  checks.push("Unavailable WebGL falls back to the actual 18-project gallery");

  const slow = await setup({ viewport: { width: 1440, height: 900 } });
  let releaseHigh;
  const highResolutionGate = new Promise((resolve) => {
    releaseHigh = resolve;
  });
  await slow.context.route("**/images/curve/*-960.webp", async (route) => {
    await highResolutionGate;
    await route.continue().catch(() => {});
  });
  await slow.page.goto(base + "/work/", { waitUntil: "domcontentloaded" });
  await state(slow.page, "WALK");
  await slow.page.waitForTimeout(500);
  await slow.page.locator(".curve-nearby button").first().click();
  await state(slow.page, "PREVIEW");
  await slow.page
    .getByRole("button", { name: "View project", exact: true })
    .click();
  await state(slow.page, "DETAIL");
  const cover = slow.page.locator(".curve-shared-cover");
  await cover.evaluate((el) => el.decode());
  assert.match(await cover.getAttribute("src"), /-160\.webp$/);
  releaseHigh();
  await slow.page
    .getByRole("button", { name: "Close project", exact: true })
    .click();
  await state(slow.page, "WALK");
  await slow.context.close();
  checks.push(
    "Delayed high-resolution textures retain the same decoded low-resolution image through fullscreen and return",
  );

  const deep = await setup({ viewport: { width: 1440, height: 900 } });
  await deep.page.goto(base + "/work/#project=elevate-x");
  await state(deep.page, "DETAIL");
  assert.match(
    await deep.page.locator(".curve-story-header").innerText(),
    /Elevate X/,
  );
  assert.match(
    await deep.page.locator(".curve-story").innerText(),
    /currently unavailable/,
  );
  await deep.page
    .getByRole("button", { name: "Close project", exact: true })
    .click();
  await state(deep.page, "WALK");
  assert.equal(new URL(deep.page.url()).hash, "");
  await deep.page
    .getByRole("link", { name: "Hamid home", exact: true })
    .click();
  await deep.page.waitForURL(base + "/");
  assert.equal(await deep.page.locator(".curve-canvas").count(), 0);
  assert.equal(await deep.page.locator("dialog[open]").count(), 0);
  await deep.page
    .locator(".desktop-nav")
    .getByRole("link", { name: "Work", exact: true })
    .click();
  await deep.page.waitForURL(base + "/work/");
  await state(deep.page, "WALK");
  assert.equal(await deep.page.locator("html[data-origin-intro]").count(), 0);
  await deep.context.close();
  checks.push(
    "Direct project hash, honest unavailable destination, route unmount and homepage return to Work without intro replay",
  );
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
  await writeFile(
    "qa-output/curve/recovery-results.json",
    JSON.stringify({ checks, errors }, null, 2),
  );
}
console.log(JSON.stringify({ checks, errors }, null, 2));
