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
  const images = page.locator(`${selector} .capture-screen img`);
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
for (const width of [
  320, 360, 375, 390, 430, 600, 768, 1024, 1280, 1440, 1920,
]) {
  await page.setViewportSize({ width, height: 1000 });
  // Measure after loading at this width so offscreen sections have reflowed.
  await page.goto(baseURL, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
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
        return {
          left: r.left,
          right: innerWidth - r.right,
          // The layered mobile artwork has its own balanced 16px frame.
          minimumGutter:
            innerWidth < 768 && el.matches(".hero-composition") ? 16 : 19,
        };
      }),
    );
    for (const container of containers) {
      assert.ok(
        container.left >= container.minimumGutter - 0.1 &&
          Math.abs(container.left - container.right) < 2,
        JSON.stringify(container),
      );
    }
    const statements = await page
      .locator("#hero-title .hero-title-line:visible")
      .evaluateAll((elements) =>
        elements.map((element) => {
          const range = document.createRange();
          range.selectNodeContents(element);
          return range.getClientRects().length;
        }),
      );
    assert.deepEqual(
      statements,
      [1, 1],
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
    for (const [width, height] of [
      [320, 568],
      [390, 844],
      [768, 800],
      [1440, 768],
    ]) {
      await page.setViewportSize({ width, height });
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      assert.deepEqual(
        await headings.locator(".hero-title-line:visible").allTextContents(),
        ["Build. Grow.", "Automate."],
      );
      for (const [label, path] of [
        ["Discuss a project", "/contact/?source=home"],
        ["Explore work", "/work/"],
      ]) {
        const link = page
          .locator(".hero-actions")
          .getByRole("link", { name: label });
        assert.equal(await link.getAttribute("href"), path);
        if (width < 768) {
          const stage = await page.locator(".hero-composition").boundingBox();
          const intro = await page.locator(".hero-description").boundingBox();
          assert.ok(intro.y >= stage.y + stage.height);
          // The approved phone layout places its CTAs after the portrait/cards.
          await link.scrollIntoViewIfNeeded();
        }
        const bounds = await link.boundingBox();
        assert.ok(
          bounds &&
            bounds.x >= 0 &&
            bounds.x + bounds.width <= width &&
            bounds.y >= 0 &&
            bounds.height >= 44 &&
            bounds.y + bounds.height <= height,
          `${label} should be reachable at ${width}×${height}`,
        );
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  },
);
await check(
  "Home has four selected projects with loaded previews and live links",
  async () => {
    assert.equal(
      await page.locator(".selected-project-grid .project").count(),
      4,
    );
    assert.equal(
      await page.locator(".selected-project-grid .project-live-link").count(),
      4,
    );
    assert.doesNotMatch(
      await page.locator(".selected-project-grid").innerText(),
      /Presentation preview/,
    );
    await checkProjectImages(".selected-project-grid", 4);
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
  const buttons = page.locator('[data-editorial-faq="home"] button');
  assert.equal(await buttons.count(), 6);
  assert.equal(await buttons.nth(0).getAttribute("aria-expanded"), "true");
  await buttons.nth(0).click();
  assert.equal(await buttons.nth(0).getAttribute("aria-expanded"), "false");
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
    "/contact/?source=home",
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
  "Selected Work follows the hero in the page flow on mobile and desktop",
  async () => {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const gap = await page
        .locator(".signature-hero + #work")
        .evaluate(
          (section) =>
            section.getBoundingClientRect().top -
            section.previousElementSibling.getBoundingClientRect().bottom,
        );
      assert.ok(
        gap >= -1 && gap <= 96,
        `Hero-to-work gap is ${gap}px for ${width}px viewport`,
      );
    }
    await page.setViewportSize({ width: 390, height: 844 });
  },
);
await check(
  "Mobile previews, project dialog and contextual contact work",
  async () => {
    const first = page
      .locator(".selected-project-grid .project-trigger")
      .first();
    await first.evaluate((element) =>
      element.scrollIntoView({ block: "start", behavior: "instant" }),
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
    assert.match(
      await page.locator(".project-dialog .project-image").getAttribute("src"),
      /bridal-house-mobile\.webp$/,
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
  "Before We Build switches labelled previews with pointer and keyboard",
  async () => {
    const section = page.locator(".explore-further");
    const tabs = section.getByRole("tablist");
    const work = tabs.getByRole("tab", { name: "Explore the work" });
    const brief = tabs.getByRole("tab", { name: "Shape your brief" });
    const enquiry = tabs.getByRole("tab", { name: "Try an enquiry flow" });
    const current = () => section.getByRole("tabpanel");
    const focused = (locator) =>
      locator.evaluate((element) => element === document.activeElement);

    assert.equal(await enquiry.getAttribute("aria-selected"), "true");
    assert.match(await current().innerText(), /clear handover/);
    await enquiry.focus();
    await page.keyboard.press("Home");
    assert.ok(await focused(work));
    assert.equal(await work.getAttribute("aria-selected"), "true");
    assert.match(
      await current().getByRole("img").getAttribute("src"),
      /bridal-house\.webp$/,
    );
    assert.equal(
      await current()
        .getByRole("link", { name: "See the walkthrough" })
        .getAttribute("href"),
      "/work/bridal-house/",
    );
    await page.keyboard.press("ArrowDown");
    assert.ok(await focused(brief));
    assert.equal(await brief.getAttribute("aria-selected"), "true");
    assert.equal(
      await current()
        .getByRole("link", { name: "Build your brief" })
        .getAttribute("href"),
      "/plan/",
    );
    await page.keyboard.press("Tab");
    assert.ok(await focused(current()));
    await page.keyboard.press("Shift+Tab");
    assert.ok(await focused(brief));
    await page.keyboard.press("End");
    assert.ok(await focused(enquiry));
    await page.keyboard.press("ArrowDown");
    assert.ok(await focused(work));
    await work.press("ArrowUp");
    assert.ok(await focused(enquiry));

    await brief.click();
    assert.equal(await brief.getAttribute("aria-selected"), "true");
    await enquiry.click();
    assert.equal(await tabs.locator('[aria-selected="true"]').count(), 1);
    assert.equal(
      await current()
        .getByRole("link", { name: "Try the demonstration" })
        .getAttribute("href"),
      "/demos/enquiry-assistant/",
    );
  },
);
await check(
  "Workflow illustration changes steps without sending data",
  async () => {
    const requests = [];
    const listener = (req) => {
      // The illustration runs in our page; Drive's separate player may send
      // its own telemetry while the unrelated video iframe remains mounted.
      const url = new URL(req.url());
      const routePrefetch =
        req.method() === "GET" &&
        url.origin === new URL(baseURL).origin &&
        url.searchParams.has("_rsc");
      if (
        ["fetch", "xhr"].includes(req.resourceType()) &&
        req.frame() === page.mainFrame() &&
        !routePrefetch
      )
        requests.push(req.url());
    };
    page.on("request", listener);
    const section = page.locator(".explore-further");
    try {
      for (const [name, content] of [
        ["Capture", /We need a new website for our studio/],
        ["Organise", /Next step: discovery call/],
        ["Respond", /Draft reply → human approval/],
      ]) {
        const button = section.getByRole("button", { name, exact: true });
        await button.click();
        assert.equal(await button.getAttribute("aria-pressed"), "true");
        assert.match(
          await page.locator("#workflow-example").innerText(),
          content,
        );
      }
    } finally {
      page.off("request", listener);
    }
    assert.deepEqual(requests, []);
    assert.ok(
      await section
        .getByText("Interactive illustration · No data sent")
        .isVisible(),
    );
    await section.getByRole("tab", { name: "Shape your brief" }).click();
    await section.getByRole("tab", { name: "Try an enquiry flow" }).click();
    assert.equal(
      await section
        .getByRole("button", { name: "Respond", exact: true })
        .getAttribute("aria-pressed"),
      "true",
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
await check(
  "Archive keeps all eighteen supplied URLs and identifies the saved preview",
  async () => {
    const links = page.locator(".project-archive-grid .project-live-link");
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
      await page.locator(".project-archive-grid").innerText(),
      /Presentation preview/,
    );
    const elevate = page.locator('[data-project="elevate-x"]');
    assert.match(await elevate.innerText(), /Live website unavailable/);
    assert.match(
      await elevate.locator(".project-live-link").innerText(),
      /Original URL/,
    );
  },
);
await check("All archive screenshots load", async () => {
  await checkProjectImages(".project-archive-grid", 18);
});
await check(
  "Archive filters match the actual project classifications",
  async () => {
    for (const [category, count] of [
      ["All work", 18],
      ["With stories", 6],
      ["Self-directed demos", 3],
      ["Portfolio previews", 12],
    ]) {
      const filter = page.getByRole("button", {
        name: new RegExp(`^${category}`),
      });
      await filter.click();
      assert.equal(await filter.getAttribute("aria-pressed"), "true");
      assert.equal(
        await page.locator(".project-archive-grid .project").count(),
        count,
        category,
      );
      assert.equal(
        await page.locator(".archive-filter-row [role=status]").innerText(),
        `${count} projects`,
      );
    }
    await page.getByRole("button", { name: /^All/ }).click();
    assert.equal(await page.locator(".project-filters button").count(), 4);
  },
);
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
    /\/images\/social\/hamid-work-v2\.jpg$/,
  );
  assert.equal(
    await page.locator('meta[name="twitter:card"]').getAttribute("content"),
    "summary_large_image",
  );
});

await check(
  "Six project stories explain visible decisions and preserve evidence labels",
  async () => {
    const demoSlugs = ["bridal-house", "editing-julian", "qadeer-jewellers"];
    const notesSlugs = ["ink-grail", "dylan-seedin", "elevate-x"];
    await page.goto(new URL("/case-studies/", baseURL).href);
    assert.equal(await page.locator(".story-index-item").count(), 6);
    assert.equal(
      await page
        .locator('.story-index-item [data-proof="self-directed-demo"]')
        .count(),
      3,
    );
    assert.equal(
      await page
        .locator('.story-index-item [data-proof="experience-notes"]')
        .count(),
      3,
    );
    for (const slug of [...demoSlugs, ...notesSlugs]) {
      const path = `/work/${slug}/`;
      const response = await page.goto(new URL(path, baseURL).href, {
        waitUntil: "domcontentloaded",
      });
      const demo = demoSlugs.includes(slug);
      assert.equal(response.status(), 200);
      assert.match(
        await page.locator(".content-hero .eyebrow").innerText(),
        demo ? /Self-directed demo/i : /Experience notes/i,
      );
      assert.equal(
        await page
          .locator(".story-facts")
          .getByText("Website development by Hamid")
          .count(),
        demo ? 1 : 0,
      );
      assert.equal(await page.locator(".story-decisions article").count(), 2);
      assert.equal(await page.locator(".story-journey li").count(), 3);
      assert.equal(
        await page.locator('link[rel="canonical"]').getAttribute("href"),
        `https://itshamid.com${path}`,
      );
      await checkProjectImages(".story-screens", 2);
      const contact = page.getByRole("link", {
        name: "Discuss a similar project",
      });
      assert.equal(
        await contact.getAttribute("href"),
        "/contact/?service=website&source=work",
      );
      assert.equal(await page.locator(".story-next-link").count(), 1);
      assert.match(
        await page.locator("#evidence").innerText(),
        demo ? /What the demo demonstrates/ : /What you can inspect/,
      );
    }
  },
);

await check(
  "Project actions add approved event fields only with analytics consent",
  async () => {
    const tracking = await browser.newContext({ reducedMotion: "reduce" });
    try {
      await tracking.route(
        (url) => url.origin !== new URL(baseURL).origin,
        (route) => route.abort(),
      );
      const probe = await tracking.newPage();
      await probe.addInitScript(() => {
        window.projectEvents = [];
        window.gtag = (command, name, parameters) => {
          if (command === "event")
            window.projectEvents.push({ name, ...parameters });
        };
      });
      await probe.goto(baseURL, { waitUntil: "networkidle" });
      const project = probe.locator(
        '.selected-project-grid [data-project="bridal-house"]',
      );
      const screens = project.locator(".project-trigger");
      await screens.click();
      await probe.getByRole("dialog").waitFor();
      assert.deepEqual(await probe.evaluate(() => window.projectEvents), []);
      await probe.keyboard.press("Escape");
      await probe.evaluate(() => {
        window.hamidGoogleAnalyticsAllowed = true;
      });
      await screens.click();
      await probe.getByRole("dialog").waitFor();
      await probe.keyboard.press("Escape");
      await probe.getByRole("dialog").waitFor({ state: "hidden" });
      const newTab = tracking.waitForEvent("page");
      await project.locator(".project-live-link").click();
      await (await newTab).close();
      assert.deepEqual(await probe.evaluate(() => window.projectEvents), [
        {
          name: "project_open",
          project_slug: "bridal-house",
          entry_section: "home_selected",
          destination: "screens",
          page_path: "/",
        },
        {
          name: "open_live_preview",
          project_slug: "bridal-house",
          entry_section: "home_selected",
          destination: "live",
          page_path: "/",
        },
      ]);
    } finally {
      await tracking.close();
    }
  },
);

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
    assert.equal(
      await motionPage.locator(".signature-intro").isVisible(),
      false,
    );
    assert.equal(
      await motionPage.locator("html").getAttribute("data-origin-intro"),
      null,
    );
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
