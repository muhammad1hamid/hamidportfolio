import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";
const base = process.env.QA_BASE_URL || "http://127.0.0.1:3000";
const output = process.env.QA_CURVE_OUTPUT || "qa-output/curve-3";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const checks = [],
  errors = [];
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  await context.addInitScript(() =>
    sessionStorage.setItem("hamid-origin-v1", "seen"),
  );
  await context.route(
    (url) => url.origin !== base,
    (route) => route.abort(),
  );
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base + "/work/?curve=1");
  const state = (value) => page.locator(`[data-mode="${value}"]`).waitFor();
  const nav = () => page.locator("html").getAttribute("data-curve-nav");
  const p = async () =>
    Number(await page.locator(".curve-canvas").getAttribute("data-progress"));
  await state("WALK");
  await page.waitForTimeout(500);
  assert.equal(await nav(), "shown");
  await page.mouse.move(720, 820);
  for (const delta of [2, -2, 2, -2]) await page.mouse.wheel(0, delta);
  assert.equal(await nav(), "shown");
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(550);
  assert.equal(await nav(), "hidden");
  await page.locator(".navigation a").first().focus();
  await page.waitForTimeout(450);
  assert.equal(await nav(), "shown");
  await page.mouse.wheel(0, 100);
  await page.locator(".curve-stage").click({ position: { x: 720, y: 820 } });
  await page.mouse.wheel(0, 100);
  await page.waitForTimeout(450);
  assert.ok(
    await page
      .locator(".navigation")
      .evaluate((el) => el.getBoundingClientRect().bottom <= 1),
  );
  await page.mouse.wheel(0, -2);
  assert.equal(await nav(), "hidden");
  await page.mouse.wheel(0, -180);
  await page.waitForTimeout(450);
  assert.equal(await nav(), "shown");
  checks.push(
    "Purposeful forward/reverse wheel movement controls navigation; tiny jitter does not flash it",
  );
  await page.keyboard.press("End");
  await page.waitForFunction(
    () =>
      Number(document.querySelector(".curve-canvas").dataset.progress) === 1,
  );
  const end = await p();
  await page.mouse.wheel(0, 2500);
  await page.waitForTimeout(250);
  assert.equal(await p(), end);
  assert.equal(await page.locator("footer.footer").count(), 0);
  assert.equal(await page.locator(".curve-nearby").count(), 0);
  assert.ok(
    await page.evaluate(
      () =>
        scrollY === 0 &&
        document.documentElement.scrollHeight <= innerHeight + 1,
    ),
  );
  await page.screenshot({ path: `${output}/finale.png` });
  await page.getByRole("button", { name: "Navigation", exact: true }).click();
  assert.equal(await nav(), "shown");
  await page
    .getByRole("button", { name: "Explore again", exact: true })
    .click();
  await page.waitForTimeout(700);
  assert.ok((await p()) < 1 && (await p()) > 0);
  await page.mouse.move(720, 820);
  await page.mouse.wheel(0, -200);
  const interrupted = Number(
    await page.locator(".curve-canvas").getAttribute("data-target"),
  );
  await page.waitForTimeout(700);
  assert.ok(Math.abs((await p()) - interrupted) < 0.002);
  await page.keyboard.press("End");
  await page.waitForFunction(
    () =>
      Number(document.querySelector(".curve-canvas").dataset.progress) === 1,
  );
  await page.mouse.wheel(0, -700);
  await page.waitForTimeout(650);
  assert.ok((await p()) < 0.96);
  checks.push(
    "Endpoint clamps without a footer; reverse input returns to the gallery; replay is smooth and interruptible",
  );
  await page.getByRole("button", { name: "List view", exact: true }).click();
  await state("FALLBACK");
  assert.equal(await page.locator("html[data-curve-immersive]").count(), 0);
  assert.equal(await page.locator(".project-entry").count(), 18);
  assert.equal(await page.locator("footer.footer").count(), 0);
  const urls = await page
    .locator(".project-entry .project-overview-link")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  assert.equal(new Set(urls).size, 6);
  for (const url of new Set(urls))
    assert.equal((await page.request.get(base + url)).status(), 200, url);
  await page.evaluate(() => scrollTo({ top: 500, behavior: "instant" }));
  assert.ok(await page.evaluate(() => scrollY > 100));
  await page.getByRole("link", { name: "Hamid home", exact: true }).click();
  await page.waitForURL(base + "/");
  assert.equal(
    await page
      .locator("html[data-curve-immersive],html[data-curve-nav]")
      .count(),
    0,
  );
  assert.equal(await page.locator("footer.footer").count(), 1);
  await page.evaluate(() => scrollTo({ top: 500, behavior: "instant" }));
  assert.ok(await page.evaluate(() => scrollY > 100));
  checks.push(
    "List view preserves 18 HTML projects and six real detail destinations; route cleanup restores homepage footer and document scrolling",
  );
  assert.deepEqual(errors, []);
  await context.close();
} finally {
  await browser.close();
  await writeFile(
    `${output}/navigation-results.json`,
    JSON.stringify({ checks, errors }, null, 2),
  );
}
console.log(JSON.stringify({ checks, errors }, null, 2));
