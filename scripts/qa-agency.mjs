import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright-core";

const base = new URL(process.env.QA_BASE_URL || "http://127.0.0.1:3000").origin;
const agency = "/for-agencies/";
const title = "White-Label Web Development for Agencies | Hamid";
const widths = [360, 375, 390, 430, 768, 1024, 1440, 1920];
const checks = [];
const runtimeErrors = [];
await mkdir("qa-output", { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.BROWSER_PATH ||
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
});

function context(options = {}) {
  return browser
    .newContext({ reducedMotion: "reduce", ...options })
    .then(async (ctx) => {
      await ctx.route("**/*", (route) =>
        new URL(route.request().url()).origin === base
          ? route.continue()
          : route.abort(),
      );
      return ctx;
    });
}

async function check(name, run) {
  try {
    await run();
    checks.push({ name, passed: true });
    console.log("PASS", name);
  } catch (error) {
    checks.push({ name, passed: false, error: error.message });
    console.error("FAIL", name, error.message);
  }
}

try {
  const main = await context();
  const page = await main.newPage();
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  const visit = async (pathname = agency) => {
    const response = await page.goto(base + pathname, {
      waitUntil: "domcontentloaded",
    });
    assert.equal(response.status(), 200, pathname);
  };
  await check(
    "Canonical page and share image, no agency alias, schema and crawler access",
    async () => {
      await visit(agency + "?utm_medium=referral");
      assert.equal(await page.title(), title);
      assert.equal(await page.locator("h1").count(), 1);
      assert.match(
        await page.locator("h1").innerText(),
        /Your client\.\s*Your vision\.\s*My build\./,
      );
      assert.equal(
        await page.getAttribute('link[rel="canonical"]', "href"),
        "https://itshamid.com" + agency,
      );
      assert.match(
        await page.getAttribute('meta[name="description"]', "content"),
        /White-label web development and landing pages/,
      );
      assert.doesNotMatch(
        await page.getAttribute('meta[name="robots"]', "content"),
        /noindex/,
      );
      for (const property of [
        'meta[property="og:image"]',
        'meta[name="twitter:image"]',
      ]) {
        assert.equal(
          await page.getAttribute(property, "content"),
          "https://itshamid.com/images/social/hamid-for-agencies-v2.jpg",
        );
      }
      const cover = await fetch(
        base + "/images/social/hamid-for-agencies-v2.jpg",
      );
      assert.equal(cover.status, 200);
      assert.match(cover.headers.get("content-type"), /image\/jpeg/);
      const schemas = await page
        .locator('script[type="application/ld+json"]')
        .evaluateAll((nodes) =>
          nodes.map((node) => JSON.parse(node.textContent)),
        );
      const service = schemas.find((schema) => schema["@type"] === "Service");
      assert.equal(service.provider["@id"], "https://itshamid.com/#person");
      assert.ok(schemas.some((schema) => schema["@type"] === "BreadcrumbList"));
      assert.ok(
        !Object.hasOwn(service, "aggregateRating") &&
          !Object.hasOwn(service, "review"),
      );
      const map = await (await fetch(base + "/sitemap.xml")).text();
      assert.equal(
        map.split("<loc>https://itshamid.com/for-agencies/</loc>").length,
        2,
      );
      const robots = await (await fetch(base + "/robots.txt")).text();
      assert.doesNotMatch(robots, /Disallow: \/for-agencies/i);
      assert.match(
        await (await fetch(base + "/llms.txt")).text(),
        /https:\/\/itshamid\.com\/for-agencies\//,
      );
      for (const path of ["/agency/", "/partners/", "/white-label/"])
        assert.equal((await fetch(base + path)).status, 404);
    },
  );

  await check(
    "Responsive hero, initial action and no horizontal overflow at eight widths",
    async () => {
      for (const width of widths) {
        const height = width < 800 ? 844 : 960;
        await page.setViewportSize({ width, height });
        await visit();
        await page.evaluate(() => document.fonts.ready);
        await page.waitForFunction(
          () => document.querySelector(".agency-flow img")?.naturalWidth > 0,
        );
        const geometry = await page.evaluate(() => {
          const intro = document
            .querySelector(".agency-intro h1")
            .getBoundingClientRect();
          return {
            scrollWidth: document.documentElement.scrollWidth,
            left: intro.left,
            right: intro.right,
          };
        });
        assert.ok(
          geometry.scrollWidth <= width + 1 &&
            geometry.left >= 0 &&
            geometry.right <= width,
          `Width ${width}`,
        );
        const cta = await page
          .getByRole("link", { name: "Discuss an agency project", exact: true })
          .boundingBox();
        assert.ok(
          cta && cta.height >= 44 && cta.y + cta.height < height,
          `Visible primary action at ${width}`,
        );
        await page.screenshot({ path: `qa-output/agency-hero-${width}.png` });
        if ([390, 1440].includes(width)) {
          for (const image of await page
            .locator('.agency-page img[loading="lazy"]')
            .all()) {
            await image.scrollIntoViewIfNeeded();
            await image.evaluate((img) => img.decode());
          }
          await page.evaluate(() => scrollTo(0, 0));
          await page.screenshot({
            path: `qa-output/agency-page-${width}.png`,
            fullPage: true,
          });
        }
      }
    },
  );

  await check(
    "Proof uses real captures, current demo labels and working local project stories",
    async () => {
      await visit();
      const work = page.locator("#agency-work");
      assert.deepEqual(await work.locator(".project-type").allTextContents(), [
        "Self-directed demo",
        "Self-directed demo",
      ]);
      const images = await work.locator(".capture-screen img").all();
      assert.equal(images.length, 2);
      for (const image of images) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((img) => img.decode());
        assert.ok(
          (await image.getAttribute("alt")).startsWith("Desktop screenshot"),
        );
        assert.equal(await image.getAttribute("loading"), "lazy");
        assert.ok(
          await image.evaluate(
            (img) =>
              Math.abs(
                img.closest(".project-capture").clientWidth - img.clientWidth,
              ) <= 1,
          ),
          "The capture should fill its frame",
        );
      }
      for (const [name, path] of [
        ["Bridal House", "bridal-house"],
        ["Editing Julian", "editing-julian"],
      ]) {
        const link = work.getByRole("link", {
          name: `Explore demo story for ${name}`,
        });
        assert.equal(await link.getAttribute("href"), `/work/${path}/`);
        assert.equal(
          (await fetch(base + (await link.getAttribute("href")))).status,
          200,
        );
      }
      assert.equal(
        await work
          .getByRole("link", { name: "Client video testimonials" })
          .getAttribute("href"),
        "/testimonials/",
      );
    },
  );

  await check(
    "Internal pathways, contextual case-study invitation and route refresh",
    async () => {
      const paths = [
        ["/", "#about", /For agencies/i],
        ["/services/", "main", /Explore Agency Partnerships/i],
        [
          "/work/bridal-house/",
          "main",
          /Need a build partner for your agency/i,
        ],
        [
          "/work/editing-julian/",
          "main",
          /Need a build partner for your agency/i,
        ],
        ["/about/", "footer", /^For Agencies$/i],
      ];
      for (const [path, scope, name] of paths) {
        await visit(path);
        const link = page.locator(scope).getByRole("link", { name });
        assert.equal(await link.getAttribute("href"), agency, path);
      }
      await visit("/services/");
      await page
        .getByRole("link", { name: "Explore Agency Partnerships" })
        .click();
      await page.waitForURL("**/for-agencies/");
      assert.equal(
        (await page.reload({ waitUntil: "domcontentloaded" })).status(),
        200,
      );
      const urls = await page
        .locator('main a[href^="/"]')
        .evaluateAll((links) =>
          Array.from(new Set(links.map((link) => link.pathname))),
        );
      for (const url of urls)
        assert.equal((await fetch(base + url)).status, 200, url);
    },
  );

  await check(
    "Hero anchors, keyboard FAQ and WhatsApp fallback work on a phone",
    async () => {
      const phone = await context({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      });
      try {
        const mobile = await phone.newPage();
        const navigated = await mobile.goto(base + agency);
        assert.equal(navigated.status(), 200);
        await mobile.getByRole("link", { name: "See relevant work" }).tap();
        await mobile.waitForURL("**/#agency-work");
        await mobile.waitForFunction(() => {
          const top = document
            .querySelector("#agency-work")
            .getBoundingClientRect().top;
          return top >= 80 && top < innerHeight;
        });
        const faq = mobile.locator('[data-editorial-faq="agencies"]');
        assert.equal(await faq.locator("button").count(), 10);
        await faq.locator("button").first().focus();
        assert.equal(
          await faq.locator('button[aria-expanded="true"]').count(),
          1,
        );
        await mobile.keyboard.press("Enter");
        assert.equal(
          await faq.locator('button[aria-expanded="true"]').count(),
          0,
        );
        await mobile.keyboard.press("Enter");
        assert.equal(
          await faq.locator('button[aria-expanded="true"]').count(),
          1,
        );
        assert.match(
          await faq.getByRole("region").first().locator("p").innerText(),
          /commercial relationship/,
        );
        await mobile
          .getByRole("link", { name: "Discuss a similar build" })
          .tap();
        await mobile.waitForURL("**/#agency-enquiry");
        const send = mobile.getByRole("link", {
          name: "Message about an agency project",
        });
        const target = new URL(await send.getAttribute("href"));
        assert.equal(
          target.origin + target.pathname,
          "https://wa.me/923356709222",
        );
        assert.match(
          target.searchParams.get("text"),
          /white-label agency project/,
        );
        assert.equal(
          await mobile.getByRole("form", { name: "Agency enquiry" }).count(),
          0,
        );
        assert.equal(await mobile.locator("iframe").count(), 0);
        assert.equal(
          await mobile
            .getByRole("link", { name: "Contact options" })
            .getAttribute("href"),
          "/contact/?service=agency&source=agency",
        );
        assert.equal(
          (await fetch(base + "/api/enquiry/", { method: "POST" })).status,
          503,
        );
      } finally {
        await phone.close();
      }
    },
  );

  await check(
    "Key content, FAQ and real contact stay readable without JavaScript",
    async () => {
      const disabled = await context({ javaScriptEnabled: false });
      try {
        const staticPage = await disabled.newPage();
        await staticPage.goto(base + agency);
        assert.equal(await staticPage.locator("h1").isVisible(), true);
        assert.equal(await staticPage.locator(".agency-capability").count(), 6);
        assert.equal(
          await staticPage.locator(".agency-timeline h3").count(),
          5,
        );
        assert.equal(
          await staticPage
            .locator('[data-editorial-faq="agencies"] [role="region"] p')
            .first()
            .isVisible(),
          true,
        );
        assert.equal(
          await staticPage
            .getByRole("link", { name: "Message about an agency project" })
            .isVisible(),
          true,
        );
      } finally {
        await disabled.close();
      }
    },
  );

  await check("Axe WCAG A/AA checks pass on mobile and desktop", async () => {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 960 });
      await visit();
      const { violations } = await new AxeBuilder({ page })
        .include("#main")
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
  });

  await check(
    "Internal navigation, anchors and reduced motion respect the existing intro",
    async () => {
      const motion = await context({
        reducedMotion: "no-preference",
        viewport: { width: 1440, height: 960 },
      });
      try {
        const moving = await motion.newPage();
        await moving.goto(base + "/services/");
        await moving.waitForFunction(
          () => !document.documentElement.hasAttribute("data-origin-intro"),
        );
        await moving
          .getByRole("link", { name: "Explore Agency Partnerships" })
          .click();
        await moving.waitForURL("**/for-agencies/");
        await moving
          .getByRole("link", { name: "Discuss an agency project" })
          .click();
        await moving.waitForURL("**/#agency-enquiry");
        assert.equal(
          await moving.locator("html").getAttribute("data-origin-intro"),
          null,
        );
        assert.equal(
          await page
            .locator(".agency-flow-build")
            .evaluate((item) => getComputedStyle(item).animationName),
          "none",
        );
      } finally {
        await motion.close();
      }
    },
  );
  await check("No uncaught agency page script errors", async () =>
    assert.deepEqual(runtimeErrors, []),
  );
} finally {
  await browser.close();
  await writeFile(
    "qa-output/agency-audit.json",
    JSON.stringify({ checks, runtimeErrors }, null, 2),
  );
}
const passed = checks.filter((check) => check.passed).length;
console.log(`${passed}/${checks.length} agency page checks passed`);
process.exitCode = passed === checks.length ? 0 : 1;
