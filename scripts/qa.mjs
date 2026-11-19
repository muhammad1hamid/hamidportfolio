import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.QA_BASE_URL || "http://127.0.0.1:3000";
const projectURLs = [
  "https://bridal-house-canvas-main.vercel.app/",
  "https://safa-s-beauty-unveiled.vercel.app/",
  "https://infinity-salon-swart.vercel.app/",
  "https://ink-grail-canvas.vercel.app/",
  "https://qadeerjewellers.vercel.app/",
  "https://fortress-vision.vercel.app/",
  "https://photography-studio-green.vercel.app/",
  "https://carpe-diem-digital.vercel.app/",
  "https://defence-marquee.vercel.app/",
  "https://islamabad-tailors-main.vercel.app/",
  "https://bloom-boutique-smoky.vercel.app/",
  "https://iron-lodge-ascend.vercel.app/",
  "https://apex-detailing-studio-phi.vercel.app/",
  "https://friendly-haupia-a1f91e.netlify.app/",
  "https://editingjulian.com/",
  "https://service-site-project1.netlify.app/",
  "https://watch-project4.netlify.app/",
  "https://www.elevatexlab.com/",
];
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
const checkProjectImages = async (selector, expected) => {
  const images = page.locator(`${selector} .site-preview-screen img`);
  assert.equal(await images.count(), expected);
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(
      (element) =>
        new Promise((resolve, reject) => {
          const timeout = setTimeout(
            () => reject(new Error(`Preview timed out: ${element.src}`)),
            15000,
          );
          const validate = () => {
            clearTimeout(timeout);
            if (element.naturalWidth > 0) resolve();
            else reject(new Error(`Preview failed to load: ${element.src}`));
          };
          if (element.complete) validate();
          else {
            element.addEventListener("load", validate, { once: true });
            element.addEventListener(
              "error",
              () => {
                clearTimeout(timeout);
                reject(new Error(`Preview failed to load: ${element.src}`));
              },
              { once: true },
            );
          }
        }),
    );
  }
};
await page.goto(baseURL, { waitUntil: "networkidle" });
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
    const containers = await page.locator(".wrap").evaluateAll((elements) =>
      elements.map((el) => {
        const r = el.getBoundingClientRect();
        return { left: r.left, right: innerWidth - r.right };
      }),
    );
    for (const container of containers) {
      assert.ok(
        container.left >= 19 && Math.abs(container.left - container.right) < 2,
        JSON.stringify(container),
      );
    }
    const statements = await page
      .locator("#hero-title > *")
      .evaluateAll((elements) =>
        elements.map((element) => {
          const range = document.createRange();
          range.selectNodeContents(element);
          return range.getClientRects().length;
        }),
      );
    assert.deepEqual(
      statements,
      [1, 1, 1],
      "Each hero statement fits on one line",
    );
  });
}
await page.setViewportSize({ width: 1440, height: 1000 });
await check(
  "The homepage states the offer and shows two working CTA destinations",
  async () => {
    const headings = page.locator("main h1");
    assert.equal(await headings.count(), 1);
    assert.deepEqual(await headings.locator("> *").allTextContents(), [
      "Stand out online.",
      "Get found.",
      "Work smarter.",
    ]);
    for (const [width, height] of [
      [320, 568],
      [390, 844],
      [768, 800],
      [1440, 768],
    ]) {
      await page.setViewportSize({ width, height });
      for (const [label, path] of [
        ["Discuss your project", "/contact/"],
        ["Explore selected work", "/work/"],
      ]) {
        const link = page
          .locator(".hero-actions")
          .getByRole("link", { name: label });
        assert.equal(await link.getAttribute("href"), path);
        const bounds = await link.boundingBox();
        assert.ok(
          bounds &&
            bounds.x >= 0 &&
            bounds.y >= 0 &&
            bounds.y + bounds.height <= height,
          `${label} should be above the fold at ${width}×${height}`,
        );
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
  },
);
await check(
  "Home has four selected projects with loaded previews and live links",
  async () => {
    assert.equal(await page.locator(".featured-grid .project").count(), 4);
    assert.equal(
      await page.locator(".featured-grid .project-live-link").count(),
      4,
    );
    assert.doesNotMatch(
      await page.locator(".featured-grid").innerText(),
      /Presentation preview/,
    );
    await checkProjectImages(".featured-grid", 4);
  },
);
await page.evaluate(() => window.scrollTo(0, 0));
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
  // Google's player owns its internal markup. Its known ARIA issue is
  // recorded in VIDEO-TESTIMONIALS.md; check the portfolio UI here.
  const result = await new AxeBuilder({ page })
    .exclude("#testimonials iframe")
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
await check("Six FAQ accordions work", async () => {
  const buttons = page.locator(".faq-item button");
  assert.equal(await buttons.count(), 6);
  await buttons.nth(0).click();
  assert.equal(await buttons.nth(0).getAttribute("aria-expanded"), "true");
  await buttons.nth(1).click();
  assert.equal(await buttons.nth(0).getAttribute("aria-expanded"), "false");
  assert.equal(await buttons.nth(1).getAttribute("aria-expanded"), "true");
});
await check(
  "The four homepage pillars lead to the service groups and Growth Engine",
  async () => {
    const links = page.locator(".pillar-grid li a");
    assert.deepEqual(await links.locator("h3").allTextContents(), [
      "Web Experiences",
      "Growth Engine",
      "Smart Systems",
      "AI Conversations",
    ]);
    assert.deepEqual(
      await links.evaluateAll((items) =>
        items.map((item) => item.getAttribute("href")),
      ),
      [
        "/services/#web-experiences",
        "/growth/",
        "/services/#smart-systems",
        "/services/#ai-conversations",
      ],
    );
    await links.first().focus();
    await page.keyboard.press("Enter");
    await page.waitForURL("**/services/#web-experiences");
    const groups = page.locator(".service-group");
    await groups.first().waitFor({ state: "visible" });
    assert.equal(await groups.count(), 4);
    const destinations = await groups
      .locator(".service-group-links a")
      .evaluateAll((items) => items.map((item) => item.getAttribute("href")));
    assert.deepEqual(
      destinations.sort(),
      [
        "/ai-agents/",
        "/ai-automation/",
        "/ai-receptionist/",
        "/business-dashboards/",
        "/growth/",
        "/landing-page-development/",
        "/restaurant-whatsapp-automation/",
        "/web-development/",
        "/website-chatbot/",
        "/whatsapp-ai-chatbot/",
        "/workflow-automation/",
      ].sort(),
    );
  },
);
await page.goto(baseURL, { waitUntil: "domcontentloaded" });
await check(
  "Project details show the selected project and restore focus",
  async () => {
    const button = page.locator(".project-trigger").first();
    await button.click();
    assert.ok(await page.locator(".project-dialog").isVisible());
    assert.equal(
      await page.locator("#project-dialog-title").innerText(),
      "Bridal House",
    );
    const liveLink = page.locator(".project-dialog a.button");
    assert.equal(
      await liveLink.getAttribute("href"),
      "https://bridal-house-canvas-main.vercel.app/",
    );
    assert.equal(await liveLink.getAttribute("target"), "_blank");
    assert.match(await liveLink.getAttribute("rel"), /noopener/);
    assert.equal(await page.locator(".placeholder-explanation").count(), 0);
    assert.equal(
      await page.locator(".project-story h3").first().innerText(),
      "Inside the experience",
    );
    await page
      .locator(".preview-controls")
      .getByRole("button", { name: "Mobile", exact: true })
      .click();
    assert.match(
      await page.locator(".project-dialog .project-image").getAttribute("src"),
      /-mobile.webp$/,
    );
    await page
      .locator(".preview-controls")
      .getByRole("button", { name: "Desktop", exact: true })
      .click();
    assert.match(
      await page.locator(".project-dialog .project-image").getAttribute("src"),
      /bridal-house.webp$/,
    );
    await page.keyboard.press("Escape");
    assert.ok(!(await page.locator(".project-dialog").isVisible()));
    assert.ok(await button.evaluate((el) => el === document.activeElement));
  },
);
await check("Verified contact links and contact page CTA", async () => {
  assert.equal(
    await page.locator(".contact-actions .button").getAttribute("href"),
    "/contact/",
  );
  for (const [label, url] of [
    ["WhatsApp", "https://wa.me/923356709222"],
    ["LinkedIn", "https://www.linkedin.com/in/muhammad-hamid-2072b6401/"],
    ["Instagram", "https://www.instagram.com/m.hamid_2006/?hl=en"],
  ]) {
    for (const scope of [".contact-links", ".footer-bottom"]) {
      const link = page
        .locator(scope)
        .getByRole("link", { name: new RegExp(label) });
      assert.equal(await link.getAttribute("href"), url);
      assert.equal(await link.getAttribute("target"), "_blank");
      assert.match(await link.getAttribute("rel"), /noopener/);
    }
  }
  const nodes = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) =>
      scripts.flatMap((script) => {
        const data = JSON.parse(script.textContent);
        return data["@graph"] || [data];
      }),
    );
  const person = nodes.find((node) => node["@type"] === "Person");
  assert.ok(person, "Person entity exists in the linked graph");
  assert.equal(person.sameAs.length, 2);
});
await check("Contact brief downloads and never claims submission", async () => {
  await page.getByRole("button", { name: "Prepare a project brief" }).click();
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
  assert.equal(
    await page
      .getByRole("link", { name: "Open WhatsApp" })
      .getAttribute("href"),
    "https://wa.me/923356709222",
  );
  const result = await new AxeBuilder({ page })
    .exclude("#testimonials iframe")
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
await check(
  "Selected work is close to the hero on mobile and desktop",
  async () => {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const top = await page
        .locator(".featured-grid .project")
        .first()
        .evaluate((el) => el.getBoundingClientRect().top + scrollY);
      assert.ok(
        top < 1350,
        `First project at ${top}px for ${width}px viewport`,
      );
    }
    await page.setViewportSize({ width: 390, height: 844 });
  },
);
await check(
  "Mobile previews, project dialog and contextual contact work",
  async () => {
    const first = page.locator(".featured-grid .project-trigger").first();
    await first.scrollIntoViewIfNeeded();
    await page.waitForFunction(() =>
      document
        .querySelector(".featured-grid .project-image")
        .currentSrc.includes("-mobile.webp"),
    );
    await page.locator(".mobile-contact").waitFor({ state: "visible" });
    assert.equal(
      await page.locator(".mobile-contact").getAttribute("href"),
      "https://wa.me/923356709222",
    );
    await first.click();
    assert.ok(!(await page.locator(".mobile-contact").isVisible()));
    assert.equal(
      await page
        .locator(".preview-controls")
        .getByRole("button", { name: "Mobile", exact: true })
        .getAttribute("aria-pressed"),
      "true",
    );
    await page.screenshot({
      path: path.join(output, "mobile-project-detail.png"),
    });
    const result = await new AxeBuilder({ page })
      .exclude("#testimonials iframe")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    assert.equal(
      result.violations.length,
      0,
      result.violations.map((v) => v.id).join(", "),
    );
    await page.locator(".project-dialog").evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    const closeBounds = await page
      .getByRole("button", { name: "Close project details" })
      .boundingBox();
    assert.ok(
      closeBounds &&
        closeBounds.y >= 0 &&
        closeBounds.y + closeBounds.height <= 844,
      "Close button remains on screen after scrolling details",
    );
    await page.getByRole("button", { name: "Close project details" }).click();
    assert.ok(await first.evaluate((el) => el === document.activeElement));
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await page.locator(".mobile-contact").waitFor({ state: "hidden" });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator(".mobile-contact").waitFor({ state: "hidden" });
  },
);
await check(
  "Workflow illustration changes steps without sending data",
  async () => {
    const requests = [];
    const listener = (req) => {
      // The illustration runs in our page; Drive's separate player may send
      // its own telemetry while the unrelated video iframe remains mounted.
      if (
        ["fetch", "xhr"].includes(req.resourceType()) &&
        req.frame() === page.mainFrame()
      )
        requests.push(req.url());
    };
    page.on("request", listener);
    for (const [name, content] of [
      ["Capture", "An enquiry comes in"],
      ["Organise", "right details"],
      ["Respond", "ready to review"],
    ]) {
      const button = page
        .locator(".workflow-steps")
        .getByRole("button", { name: new RegExp(name) });
      await button.click();
      assert.equal(await button.getAttribute("aria-pressed"), "true");
      assert.match(
        await page.locator("#workflow-example").innerText(),
        new RegExp(content),
      );
    }
    page.off("request", listener);
    assert.deepEqual(requests, []);
    assert.match(
      await page.locator(".workflow-disclaimer").innerText(),
      /illustration/,
    );
  },
);
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
  await page.waitForURL("**/about/", { timeout: 10000 });
  assert.equal(
    await page.locator("main h1").innerText(),
    "The person behind the work.",
  );
});
await page.goto(new URL("/work/", baseURL).href, { waitUntil: "networkidle" });
await check("Archive has all eighteen supplied live websites", async () => {
  const links = page.locator(".archive-list .project-live-link");
  const actual = await links.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute("href")),
  );
  assert.deepEqual(actual.sort(), [...projectURLs].sort());
  for (const link of await links.all()) {
    assert.equal(await link.getAttribute("target"), "_blank");
    assert.match(await link.getAttribute("rel"), /noopener/);
    assert.match(await link.getAttribute("rel"), /noreferrer/);
  }
  assert.doesNotMatch(
    await page.locator(".archive-list").innerText(),
    /Presentation preview/,
  );
});
await check("All archive screenshots load", async () => {
  await checkProjectImages(".archive-list", 18);
});
await check("Archive filters match project categories", async () => {
  for (const [category, count] of [
    ["All", 18],
    ["Web", 18],
  ]) {
    const filter = page.getByRole("button", {
      name: new RegExp(`^${category}`),
    });
    await filter.click();
    assert.equal(await filter.getAttribute("aria-pressed"), "true");
    assert.equal(
      await page.locator(".archive-list .project").count(),
      count,
      category,
    );
    assert.equal(
      await page.locator(".empty-work").count(),
      count === 0 ? 1 : 0,
    );
    if (count === 0)
      assert.match(
        await page.locator(".empty-work").innerText(),
        /being prepared/,
      );
  }
  await page.getByRole("button", { name: /^All/ }).click();
  for (const category of ["AI Systems", "Automation", "Chatbots"]) {
    assert.equal(
      await page
        .locator(".filter-bar")
        .getByRole("button", { name: new RegExp(category) })
        .count(),
      0,
    );
  }
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
await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({
  path: path.join(output, "mobile-archive.png"),
  fullPage: true,
});
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
  assert.match(await page.title(), /Website Portfolio.*Hamid/);
  assert.match(
    await page.locator("link[rel=canonical]").getAttribute("href"),
    /\/work\/$/,
  );
  assert.match(
    await page.locator('meta[property="og:image"]').getAttribute("content"),
    /\/images\/share\/work.png$/,
  );
  assert.equal(
    await page.locator('meta[name="twitter:card"]').getAttribute("content"),
    "summary_large_image",
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
    await motionPage.goto(baseURL, {
      waitUntil: "networkidle",
    });
    await motionPage
      .locator(".signature-intro")
      .waitFor({ state: "hidden", timeout: 7000 });
    await motionPage.reload({ waitUntil: "networkidle" });
    assert.equal(await motionPage.locator(".signature-intro").count(), 0);
    await motionPage.locator("#services").scrollIntoViewIfNeeded();
    assert.equal(await motionPage.locator(".chrome-mark").count(), 1);
    await motionPage.screenshot({
      path: path.join(output, "desktop-services-motion.png"),
    });
  },
);
await check("Brief dialog scrolls with motion enabled", async () => {
  await motionPage.setViewportSize({ width: 1440, height: 650 });
  await motionPage.locator("#contact").scrollIntoViewIfNeeded();
  await motionPage
    .getByRole("button", { name: "Prepare a project brief" })
    .click();
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
