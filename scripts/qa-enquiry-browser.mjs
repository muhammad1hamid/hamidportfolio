import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright-core";
import {
  createFixture,
  fixtureConfig,
  validFields,
} from "./enquiry-test-fixture.mjs";

const base = process.env.QA_BASE_URL || "http://127.0.0.1:3000";
const output = path.resolve("qa-output");
const sizes = [360, 390, 768, 1024, 1440];
const checks = [];
const errors = [];
let browser;
let preview;
await mkdir(output, { recursive: true });

const check = async (name, run) => {
  try {
    await run();
    checks.push({ name, passed: true });
    console.log("PASS", name);
  } catch (error) {
    checks.push({ name, passed: false, error: error.message });
    console.error("FAIL", name, error.message);
  }
};

const axe = async (page) => {
  const { violations } = await new AxeBuilder({ page })
    .include("#main")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  assert.deepEqual(
    violations.map(({ id, nodes }) => ({
      id,
      elements: nodes.map(({ target }) => target),
    })),
    [],
  );
};

const noOverflow = async (page) =>
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    "Contact view must fit the viewport",
  );

async function buildFixture() {
  const directory = await mkdtemp(path.join(output, "enquiry-export-"));
  for (const entry of [
    "app",
    "api",
    "components",
    "data",
    "public",
    "scripts",
    "server",
    "next.config.ts",
    "postcss.config.mjs",
    "tsconfig.json",
    "package.json",
  ]) {
    await cp(entry, path.join(directory, entry), { recursive: true });
  }
  const builder = spawn(
    process.execPath,
    ["scripts/next.mjs", "build", "--webpack"],
    {
      cwd: directory,
      env: {
        ...process.env,
        ...fixtureConfig,
        ENQUIRY_ORIGIN: "http://127.0.0.1:3000",
        SEO_NOINDEX: "false",
      },
      stdio: "inherit",
    },
  );
  await new Promise((resolve, reject) => {
    builder.once("error", reject);
    builder.once("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`Fixture build failed (${code})`)),
    );
  });
  return directory;
}

async function startFixture(directory) {
  preview = spawn(process.execPath, ["scripts/serve.mjs"], {
    cwd: directory,
    env: { ...process.env, ENQUIRY_ENABLED: "false", PORT: "0" },
    stdio: ["ignore", "pipe", "inherit"],
  });
  return new Promise((resolve, reject) => {
    preview.once("error", reject);
    preview.once("exit", (code) =>
      reject(new Error(`Fixture preview exited (${code})`)),
    );
    preview.stdout.on("data", (chunk) => {
      const url = /http:\/\/127\.0\.0\.1:\d+/.exec(String(chunk));
      if (url) resolve(url[0]);
    });
  });
}

const checkScript = `
  let counter = 0;
  const widgets = new Map();
  window.turnstile = {
    render(host, options) {
      const id = String(++counter);
      const check = document.createElement("button");
      check.type = "button";
      check.textContent = "Complete verification (test)";
      check.onclick = () => options.callback("qa-verified-token");
      host.append(check);
      widgets.set(id, check);
      if (options.action !== "project_enquiry") throw new Error("Unexpected action");
      return id;
    },
    remove(id) {
      widgets.get(id)?.remove();
      widgets.delete(id);
    },
  };
`;
const resetEvents = async (page) =>
  page.evaluate(() => (window.enquiryEvents.length = 0));
const events = async (page, name) =>
  (await page.evaluate(() => window.enquiryEvents)).filter(
    (event) => !name || event.name === name,
  );
const button = (page) => page.getByRole("button", { name: "Send my enquiry" });
const nameField = (page) => page.getByLabel("Name", { exact: true });
const emailField = (page) => page.getByLabel("Email address", { exact: true });
const serviceField = (page) =>
  page.getByLabel("What can I help with?", { exact: true });
const messageField = (page) =>
  page.getByLabel("Tell me a little about it", { exact: true });
const verification = (page) =>
  page.getByRole("button", { name: "Complete verification (test)" });
const verify = async (page) => {
  await verification(page).click();
  await page.getByText("Security check complete.").waitFor();
};
const fill = async (page) => {
  await nameField(page).fill(validFields.name);
  await emailField(page).fill(validFields.email);
  await serviceField(page).selectOption(validFields.service);
  await messageField(page).fill(validFields.message);
};

try {
  browser = await chromium.launch({
    executablePath:
      process.env.BROWSER_PATH ||
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });
  const inactive = await browser.newContext({ reducedMotion: "reduce" });
  await inactive.route("**/*", (route) =>
    new URL(route.request().url()).origin === new URL(base).origin
      ? route.continue()
      : route.abort(),
  );
  const publicPage = await inactive.newPage();
  publicPage.on("pageerror", (error) => errors.push(error.message));
  await check(
    "Unconfigured HTTP route fails closed, with no send button or scheduler",
    async () => {
      const response = await fetch(`${base}/api/enquiry/`, { method: "POST" });
      assert.equal(response.status, 503);
      assert.deepEqual(await response.json(), { error: "unavailable" });
      assert.equal((await fetch(`${base}/api/enquiry/`)).status, 405);
      await publicPage.goto(`${base}/contact/`);
      assert.equal(await button(publicPage).count(), 0);
      assert.equal(await publicPage.locator("iframe").count(), 0);
      assert.equal(
        new URL(
          await publicPage
            .getByRole("link", { name: "Message Hamid on WhatsApp" })
            .getAttribute("href"),
        ).host,
        "wa.me",
      );
      assert.equal(
        await publicPage
          .getByRole("link", { name: "Prepare a project brief" })
          .getAttribute("href"),
        "/plan/",
      );
      assert.match(
        await publicPage
          .getByRole("link", { name: "Arrange a call on WhatsApp" })
          .getAttribute("href"),
        /^https:\/\/wa\.me\//,
      );
      await publicPage.goto(`${base}/plan/`);
      assert.equal(
        await publicPage
          .getByRole("button", { name: "Review and send this outline" })
          .count(),
        0,
      );
    },
  );
  await check(
    "Disabled contact screenshot, layout and contrast checks at five screen widths",
    async () => {
      for (const width of sizes) {
        await publicPage.setViewportSize({
          width,
          height: width < 600 ? 844 : 1000,
        });
        await publicPage.goto(`${base}/contact/`);
        await publicPage.evaluate(() => document.fonts.ready);
        await noOverflow(publicPage);
        assert.equal(await publicPage.locator("h1").count(), 1);
        await publicPage.screenshot({
          path: path.join(output, `enquiry-after-contact-${width}.png`),
          fullPage: true,
        });
      }
      await axe(publicPage);
      assert.equal(
        await publicPage.locator('link[rel="canonical"]').getAttribute("href"),
        "https://itshamid.com/contact/",
      );
      await publicPage
        .getByRole("link", { name: "Privacy", exact: true })
        .click();
      await publicPage.waitForURL("**/privacy/");
      assert.equal(
        await publicPage.locator('link[rel="canonical"]').getAttribute("href"),
        "https://itshamid.com/privacy/",
      );
    },
  );
  await inactive.close();

  const directory = await buildFixture();
  const activeBase = await startFixture(directory);
  const fixture = createFixture(activeBase);
  const posted = [];
  let challengeLoads = 0;
  let blockChallenge = false;
  let loseReceipt = false;
  const active = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await active.addInitScript(() => {
    window.enquiryEvents = [];
    window.hamidGoogleAnalyticsAllowed = true;
    window.gtag = (command, name, data) => {
      if (command === "event") window.enquiryEvents.push({ name, ...data });
    };
  });
  await active.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (
      url.href ===
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
    ) {
      challengeLoads++;
      return blockChallenge
        ? route.abort()
        : route.fulfill({ contentType: "text/javascript", body: checkScript });
    }
    if (url.origin !== activeBase) return route.abort();
    if (url.pathname !== "/api/enquiry/") return route.continue();
    const data = request.postDataJSON();
    posted.push(data);
    const response = await fixture.handle(
      new Request(url, {
        method: request.method(),
        body: request.postData(),
        headers: await request.allHeaders(),
      }),
      "127.0.0.1",
    );
    if (loseReceipt && response.status === 201) {
      loseReceipt = false;
      return route.abort();
    }
    return route.fulfill({
      status: response.status,
      headers: Object.fromEntries(response.headers),
      body: await response.text(),
    });
  });
  const page = await active.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  const visit = async (route = "/contact/") => page.goto(activeBase + route);
  const focused = async (locator) => {
    await page.waitForFunction(
      (id) => document.activeElement?.id === id,
      await locator.getAttribute("id"),
    );
  };

  await check(
    "Configured export exposes only the widget site key, with no scheduler or eager challenge",
    async () => {
      const exportDir = path.join(directory, "out");
      for (const file of await readdir(exportDir, {
        recursive: true,
        withFileTypes: true,
      })) {
        if (!file.isFile() || !/\.(html|js|txt|rsc)$/.test(file.name)) continue;
        const content = await readFile(
          path.join(file.parentPath, file.name),
          "utf8",
        );
        for (const key of [
          "TURNSTILE_SECRET_KEY",
          "UPSTASH_REDIS_REST_TOKEN",
          "RESEND_API_KEY",
          "ENQUIRY_FROM_EMAIL",
          "ENQUIRY_TO_EMAIL",
          "ENQUIRY_HMAC_SECRET",
        ]) {
          assert.ok(
            !content.includes(fixtureConfig[key]),
            `${key} must stay private`,
          );
        }
      }
      for (const width of sizes) {
        await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
        await visit();
        await button(page).waitFor();
        await page.evaluate(() => document.fonts.ready);
        await noOverflow(page);
        assert.equal(await page.locator("iframe").count(), 0);
        assert.ok(
          await nameField(page).evaluate(
            (element) => getComputedStyle(element).fontSize === "16px",
          ),
        );
        await page.screenshot({
          path: path.join(output, `enquiry-fixture-contact-${width}.png`),
          fullPage: true,
        });
      }
      assert.equal(challengeLoads, 0);
      await axe(page);
      await page.setViewportSize({ width: 390, height: 844 });
      await visit();
      await axe(page);
    },
  );
  await check(
    "Mobile keyboard, early validation, optional fields and retryable spam check",
    async () => {
      await visit();
      await button(page).click();
      await focused(nameField(page));
      assert.equal(await nameField(page).getAttribute("aria-invalid"), "true");
      await page.keyboard.press("Tab");
      await focused(emailField(page));
      assert.equal(posted.length, 0);
      await fill(page);
      await page.getByText("Add project details", { exact: false }).click();
      const website = page.getByLabel("Current website");
      await website.fill("https://user:pwd@visitor.test");
      await button(page).click();
      await focused(website);
      assert.equal(await website.getAttribute("aria-invalid"), "true");
      await website.fill("www.visitor.test");
      await visibilityCheck();
      await axe(page);
    },
  );

  async function visibilityCheck() {
    await verification(page).waitFor();
    await noOverflow(page);
    assert.equal(await page.getByText("Security check complete.").count(), 0);
  }

  await check(
    "Sending prevents duplicate clicks, confirms provider acceptance and logs one safe GA4 lead",
    async () => {
      await visit(
        "/contact/?service=website&source=services&utm_source=chatgpt.com&note=fixture%40example.test",
      );
      let finishMail;
      const mailReady = new Promise((resolve) => {
        finishMail = resolve;
      });
      fixture.setMail(() => mailReady);
      await fill(page);
      await verify(page);
      await button(page).click();
      await page
        .getByRole("button", { name: "Sending your enquiry…" })
        .waitFor();
      assert.equal(
        await page
          .getByRole("button", { name: "Sending your enquiry…" })
          .isDisabled(),
        true,
      );
      assert.equal((await events(page, "generate_lead")).length, 0);
      finishMail();
      fixture.setMail(() => {});
      const success = page.getByRole("heading", {
        name: "Thank you for sharing your project.",
      });
      await success.waitFor();
      await page.waitForFunction(
        () =>
          document.activeElement?.textContent ===
          "Thank you for sharing your project.",
      );
      assert.equal(posted.length, 1);
      assert.deepEqual(await events(page, "generate_lead"), [
        {
          name: "generate_lead",
          source_page: "services",
          service_category: "website",
          intent: "project_enquiry",
          page_location: activeBase + "/contact/",
          page_referrer: "",
          ai_source: "chatgpt",
          ai_signal: "tag",
          page_path: "/contact/",
        },
      ]);
      assert.equal((await events(page, "lead_form_start")).length, 1);
      assert.doesNotMatch(
        JSON.stringify(await events(page)),
        /QA Visitor|visitor\.test|small business site/,
      );
    },
  );
  await check(
    "Delivery error keeps the draft, and retry reuses the same reference",
    async () => {
      await visit();
      await fill(page);
      await verify(page);
      fixture.setMail(() => new Response(null, { status: 503 }));
      await button(page).click();
      await page
        .getByText("Delivery couldn’t be confirmed.", { exact: false })
        .waitFor();
      assert.equal(await emailField(page).inputValue(), validFields.email);
      assert.equal(await messageField(page).inputValue(), validFields.message);
      assert.equal((await events(page, "generate_lead")).length, 0);
      assert.equal(
        (await events(page, "form_error")).at(-1)?.reason,
        "unconfirmed",
      );
      fixture.setMail(() => {});
      await verify(page);
      await button(page).click();
      await page
        .getByRole("heading", { name: "Thank you for sharing your project." })
        .waitFor();
      assert.equal(posted.at(-1).submissionId, posted.at(-2).submissionId);
      assert.equal((await events(page, "generate_lead")).length, 1);
    },
  );
  await check(
    "A lost response can be retried without duplicate acceptance or conversion events",
    async () => {
      await visit();
      await fill(page);
      await verify(page);
      const acceptedBefore = fixture.accepted.size;
      loseReceipt = true;
      await button(page).click();
      await page.getByText("The connection ended", { exact: false }).waitFor();
      assert.equal(await messageField(page).inputValue(), validFields.message);
      await verify(page);
      await button(page).click();
      await page
        .getByRole("heading", { name: "Thank you for sharing your project." })
        .waitFor();
      assert.equal(posted.at(-1).submissionId, posted.at(-2).submissionId);
      assert.equal(fixture.accepted.size, acceptedBefore + 1);
      assert.equal((await events(page, "generate_lead")).length, 0);
    },
  );
  await check(
    "A blocked challenge can recover and sends no request before verification",
    async () => {
      blockChallenge = true;
      await visit();
      const count = posted.length;
      await fill(page);
      const retry = page.getByRole("button", { name: "Retry security check" });
      await retry.waitFor();
      await button(page).click();
      assert.equal(posted.length, count);
      blockChallenge = false;
      await retry.click();
      await verify(page);
    },
  );
  await check(
    "Service and Growth paths preselect safely, and a contact anchor keeps the selected context",
    async () => {
      await visit("/landing-page-development/");
      await resetEvents(page);
      await page.getByRole("link", { name: "Discuss this service" }).click();
      await page.waitForURL("**/contact/?service=landing-page&source=services");
      await page.waitForFunction(
        () =>
          document.querySelector('select[name="service"]')?.value ===
          "landing-page",
      );
      assert.deepEqual((await events(page, "contact_cta_click")).at(-1), {
        name: "contact_cta_click",
        source_page: "services",
        service_category: "landing-page",
        intent: "project_enquiry",
        page_path: "/landing-page-development/",
      });
      await visit("/contact/#growth-enquiry");
      await page.waitForFunction(
        () =>
          document.querySelector('select[name="service"]')?.value ===
          "growth-engine",
      );
      await page.getByRole("link", { name: "Share a brief" }).click();
      assert.equal(await serviceField(page).inputValue(), "growth-engine");
      await visit("/contact/?service=unknown&source=user%40example.test");
      assert.equal(await serviceField(page).inputValue(), "");
    },
  );
  await check(
    "Planner sends nothing until an editable outline is reviewed and explicitly submitted",
    async () => {
      await visit("/plan/");
      const baseline = posted.length;
      await page
        .getByLabel("Anything else?")
        .fill("Private planner notes used in an isolated browser test.");
      assert.equal(
        await page.getByRole("form", { name: "Project enquiry" }).count(),
        0,
      );
      const review = page.getByRole("button", {
        name: "Review and send this outline",
      });
      await review.click();
      await focused(
        page.getByRole("heading", { name: "Review your outline." }),
      );
      assert.match(
        await messageField(page).inputValue(),
        /Private planner notes/,
      );
      assert.equal(posted.length, baseline);
      await messageField(page).fill(
        "Only this revised mock outline should be sent.",
      );
      await nameField(page).fill(validFields.name);
      await emailField(page).fill(validFields.email);
      await serviceField(page).selectOption("website");
      await page.evaluate(() => {
        window.hamidGoogleAnalyticsAllowed = false;
      });
      await verify(page);
      await button(page).click();
      await page
        .getByRole("heading", { name: "Thank you for sharing your project." })
        .waitFor();
      assert.equal(posted.length, baseline + 1);
      assert.equal(posted.at(-1).source, "planner");
      assert.equal(
        posted.at(-1).fields.message,
        "Only this revised mock outline should be sent.",
      );
      assert.equal((await events(page, "generate_lead")).length, 0);
      assert.doesNotMatch(page.url(), /Private|revised|visitor/);
    },
  );
  await check(
    "Agency enquiries require a company, send through the same endpoint and count only accepted leads",
    async () => {
      await visit(
        "/for-agencies/?utm_source=linkedin&utm_medium=social&utm_campaign=agency-partnerships&utm_content=secret%40visitor.test",
      );
      const baseline = posted.length;
      await page
        .getByRole("link", { name: "Discuss an agency project", exact: true })
        .click();
      await page.waitForURL(
        (url) =>
          url.pathname === "/for-agencies/" && url.hash === "#agency-enquiry",
      );
      const form = page.getByRole("form", { name: "Agency enquiry" });
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: width < 600 ? 1100 : 960 });
        const panel = page.locator(".agency-enquiry-panel");
        await panel.evaluate((element) =>
          element.scrollIntoView({ block: "center", behavior: "instant" }),
        );
        await panel.screenshot({
          path: path.join(output, `agency-form-fixture-${width}.png`),
        });
      }
      await page.setViewportSize({ width: 390, height: 844 });
      const send = form.getByRole("button", { name: "Send agency brief" });
      assert.equal(
        await form
          .getByRole("link", { name: "Read the privacy notice" })
          .getAttribute("href"),
        "/privacy/",
      );
      await form
        .getByLabel("Contact name", { exact: true })
        .fill("QA Studio Contact");
      await form.getByLabel("Business email").fill(validFields.email);
      await form
        .getByLabel("Short project brief")
        .fill("Build a landing page from our approved layout.");
      await send.click();
      const company = form.getByLabel("Agency or company name");
      await focused(company);
      assert.equal(await company.getAttribute("aria-invalid"), "true");
      assert.equal(posted.length, baseline);
      assert.equal((await events(page, "generate_lead")).length, 0);
      await company.fill("QA Partner Studio");
      await form.locator("summary").click();
      await form.getByLabel("Capability needed").selectOption("landing-page");
      await form.getByLabel("Project stage").selectOption("design-approved");
      await form.getByLabel("Preferred collaboration").selectOption("pilot");
      await form
        .getByLabel("Preferred contact channel")
        .selectOption("agency-tool");
      await form.getByLabel("Agency website").fill("qa-partner.test");
      await noOverflow(page);
      await verify(page);
      fixture.setMail(() => new Response(null, { status: 503 }));
      await send.click();
      try {
        await page
          .getByText("Delivery couldn’t be confirmed.", { exact: false })
          .waitFor();
        assert.equal(await company.inputValue(), "QA Partner Studio");
        assert.equal((await events(page, "generate_lead")).length, 0);
      } finally {
        fixture.setMail(() => {});
      }
      await verify(page);
      await send.click();
      await page
        .getByRole("heading", {
          name: "Thank you for sharing your agency brief.",
        })
        .waitFor();
      const captured = posted.at(-1);
      assert.equal(captured.submissionId, posted.at(-2).submissionId);
      assert.equal(captured.fields.audience, "agency");
      assert.equal(captured.fields.service, "agency");
      assert.equal(captured.source, "agency");
      assert.equal(captured.fields.capability, "landing-page");
      assert.equal(captured.fields.stage, "design-approved");
      assert.equal(captured.fields.website, "https://qa-partner.test/");
      assert.doesNotMatch(JSON.stringify(captured), /utm_|secret%40/);
      const measured = await events(page);
      const [conversion] = await events(page, "generate_lead");
      assert.equal((await events(page, "generate_lead")).length, 1);
      assert.equal((await events(page, "start_agency_enquiry")).length, 1);
      assert.equal(conversion.lead_type, "agency");
      assert.equal(conversion.service_interest, "landing-page");
      assert.equal(conversion.page_path, "/for-agencies/");
      const measuredUrl = new URL(conversion.page_location);
      assert.equal(
        measuredUrl.searchParams.get("utm_campaign"),
        "agency-partnerships",
      );
      assert.equal(measuredUrl.searchParams.get("utm_content"), null);
      assert.doesNotMatch(
        JSON.stringify(measured),
        /QA Partner Studio|QA Studio Contact|visitor\.test|approved layout|qa-partner/,
      );
      assert.ok(
        measured.some(
          (event) =>
            event.name === "click_agency_cta" &&
            event.cta_location === "hero" &&
            event.destination === "enquiry",
        ),
      );
      await page.screenshot({
        path: path.join(output, "agency-fixture-receipt-390.png"),
        fullPage: false,
      });
    },
  );
  await check(
    "The contact fallback link preselects agency and preserves the business enquiry option",
    async () => {
      await visit("/contact/?service=agency&source=agency");
      await page.getByLabel("Agency or company name").waitFor();
      assert.equal(await serviceField(page).inputValue(), "agency");
      await page.getByLabel("Agency or company name").fill("QA Studio");
      await serviceField(page).selectOption("website");
      await page.locator(".enquiry-extra summary").click();
      assert.equal(
        await page.getByLabel("Business name").inputValue(),
        "QA Studio",
      );
      assert.equal(
        await page.getByRole("button", { name: "Send my enquiry" }).isVisible(),
        true,
      );
    },
  );
  await check(
    "No-JavaScript visitors retain direct contact and cannot submit a broken form",
    async () => {
      const noJs = await browser.newContext({
        javaScriptEnabled: false,
        reducedMotion: "reduce",
      });
      try {
        await noJs.route("**/*", (route) =>
          new URL(route.request().url()).origin === activeBase
            ? route.continue()
            : route.abort(),
        );
        const staticPage = await noJs.newPage();
        await staticPage.goto(`${activeBase}/contact/`);
        assert.equal(await button(staticPage).isDisabled(), true);
        assert.equal(
          await staticPage
            .getByRole("link", { name: "Arrange a call on WhatsApp" })
            .isVisible(),
          true,
        );
        const message = staticPage.locator("noscript .enquiry-fine-print");
        assert.equal(await message.isVisible(), true);
        assert.match(
          await message.textContent(),
          /The enquiry form needs JavaScript/,
        );
      } finally {
        await noJs.close();
      }
    },
  );
  await check("No unhandled page script errors", async () =>
    assert.deepEqual(errors, []),
  );
} catch (error) {
  checks.push({
    name: "Enquiry test harness",
    passed: false,
    error: error.message,
  });
  console.error(error);
} finally {
  await browser?.close();
  preview?.kill();
  await writeFile(
    path.join(output, "enquiry-browser-audit.json"),
    JSON.stringify({ checks, errors }, null, 2),
  );
}
const passed = checks.filter((result) => result.passed).length;
console.log(`${passed}/${checks.length} enquiry browser checks passed`);
if (passed !== checks.length) process.exitCode = 1;
