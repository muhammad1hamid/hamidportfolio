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
import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";
import {
  configuredWeb3FormsKey,
  conversationPayload,
  validateConversation,
} from "../data/conversation.mjs";
import { validateEnquiry } from "../data/project-enquiry.mjs";
import {
  createFixture,
  fixtureConfig,
  validFields,
} from "./enquiry-test-fixture.mjs";

const output = path.resolve("qa-output/first-conversation");
const base = process.env.QA_BASE_URL || "http://127.0.0.1:3000";
const widths = [320, 360, 375, 390, 414, 430, 480, 768, 1024, 1280, 1440, 1920];
const report = {
  checks: [],
  layouts: [],
  errors: [],
  note: "Provider success/failure and CAPTCHA interactions below are controlled fixtures, not real inbox delivery.",
};
await mkdir(output, { recursive: true });
let browser, preview;
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
const overflow = async (page) =>
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    "Horizontal overflow",
  );
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
const send = (page) =>
  page.getByRole("button", { name: "Send your enquiry", exact: true });
const name = (page) => page.getByLabel("Your name", { exact: false });
const email = (page) => page.getByLabel("Your email", { exact: false });
const message = (page) =>
  page.getByLabel("Here’s what I have in mind…", { exact: false });
const choose = (page, text) =>
  page.locator(".topic-choice").filter({ hasText: text }).click();
const fill = async (page) => {
  await name(page).fill(validFields.name);
  await email(page).fill(validFields.email);
  await choose(page, "Website / landing page");
  await message(page).fill(validFields.message);
};
const focus = async (page, field) =>
  page.waitForFunction(
    (id) => document.activeElement?.id === id,
    await field.getAttribute("id"),
  );
const events = async (page, name) =>
  (await page.evaluate(() => window.enquiryEvents)).filter(
    (event) => !name || event.name === name,
  );
const verify = async (page) => {
  await page.getByRole("button", { name: "Verify human (test only)" }).click();
  await page.getByText("Security check complete.", { exact: true }).waitFor();
};
const testKey = "a0a0a0a0-1111-4111-8111-b0b0b0b0b0b0";
const hcaptcha = `window.hcaptcha={render(host,options){const b=document.createElement('button');b.type='button';b.textContent='Verify human (test only)';b.onclick=()=>options.callback('fixture-human-token');host.append(b);window.expireContactCaptcha=options['expired-callback'];return 'fixture-widget';},remove(){document.querySelectorAll('.conversation-captcha button').forEach(b=>b.remove());}};window.hamidContactCaptchaReady?.();`;
const turnstile = `window.turnstile={render(host,options){const b=document.createElement('button');b.type='button';b.textContent='Verify legacy form (test only)';b.onclick=()=>options.callback('qa-verified-token');host.append(b);return 'fixture-widget';},remove(){document.querySelectorAll('.enquiry-widget button').forEach(b=>b.remove());}};`;

async function fixtureExport() {
  const directory = await mkdtemp(path.join(output, "export-"));
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
  ])
    await cp(entry, path.join(directory, entry), { recursive: true });
  const routeDir = path.join(directory, "app/qa-contact-unavailable");
  await mkdir(routeDir);
  await writeFile(
    path.join(routeDir, "page.tsx"),
    `import { ConversationComposer } from '@/components/contact/ConversationComposer';import '../contact.css';import '../first-conversation.css';export const metadata={robots:{index:false,follow:false}};export default function Test(){return <main id="main" className="content-page wrap first-conversation"><h1>Unavailable composer fixture</h1><section className="conversation-sheet"><ConversationComposer accessKey={null} initialService="" source="contact" /></section></main>;}`,
  );
  const build = spawn(
    process.execPath,
    ["scripts/next.mjs", "build", "--webpack"],
    {
      cwd: directory,
      env: {
        ...process.env,
        ...fixtureConfig,
        NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY: testKey,
        SEO_NOINDEX: "false",
      },
      stdio: "inherit",
    },
  );
  await new Promise((resolve, reject) => {
    build.once("error", reject);
    build.once("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`Fixture build failed: ${code}`)),
    );
  });
  preview = spawn(process.execPath, ["scripts/serve.mjs"], {
    cwd: directory,
    env: { ...process.env, ENQUIRY_ENABLED: "false", PORT: "0" },
    stdio: ["ignore", "pipe", "inherit"],
  });
  const url = await new Promise((resolve, reject) => {
    preview.once("error", reject);
    preview.stdout.on("data", (chunk) => {
      const found = /http:\/\/127\.0\.0\.1:\d+/.exec(String(chunk));
      if (found) resolve(found[0]);
    });
  });
  return { directory, url };
}

try {
  await check(
    "Shared validation keeps the legacy agency rule while the contact composer requires only four fields",
    async () => {
      assert.equal(configuredWeb3FormsKey(""), null);
      assert.equal(configuredWeb3FormsKey("not-a-form-key"), null);
      assert.equal(configuredWeb3FormsKey(testKey), testKey);
      const input = { ...validFields, topic: "agency", service: "agency" };
      assert.equal(validateEnquiry(input).ok, false);
      const result = validateConversation(input);
      assert.equal(result.ok, true);
      const payload = conversationPayload(
        result.fields,
        result.topic,
        testKey,
        "fixture-token",
        "contact",
        "fixture-reference",
      );
      assert.equal(payload.project_type, "Agency partnership");
      assert.equal(payload.email, validFields.email);
      assert.equal(Object.hasOwn(payload, "to"), false);
      for (const change of [
        { email: "bad@" },
        { name: "X\r\nBcc: unwanted@example.test" },
        { message: "x" },
        { website: "javascript:alert(1)" },
        { website: "https://user:pass@example.test" },
        { topic: "fabricated" },
      ])
        assert.equal(validateConversation({ ...input, ...change }).ok, false);
    },
  );

  browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  });
  const context = await browser.newContext({ reducedMotion: "reduce" });
  await context.addInitScript(() => {
    sessionStorage.setItem("hamid-origin-v1", "seen");
  });
  await context.route(
    (url) => url.origin !== new URL(base).origin,
    (route) => route.abort(),
  );
  const publicPage = await context.newPage();
  publicPage.on("pageerror", (error) => report.errors.push(error.message));
  await check(
    "Production export layout at all twelve widths, meaningful HTML, canonical and direct contact links",
    async () => {
      for (const width of widths) {
        await publicPage.setViewportSize({ width, height: 1000 });
        assert.equal((await publicPage.goto(base + "/contact/")).status(), 200);
        await publicPage.evaluate(() => document.fonts.ready);
        const decline = publicPage.getByRole("button", {
          name: "Decline",
          exact: true,
        });
        if (await decline.isVisible()) await decline.click();
        await overflow(publicPage);
        assert.equal(await publicPage.locator("main h1").count(), 1);
        assert.equal(await publicPage.getByRole("radio").count(), 7);
        assert.equal(
          await publicPage
            .locator("#main iframe,#main canvas,#main video")
            .count(),
          0,
        );
        assert.equal(
          await publicPage
            .locator('link[rel="canonical"]')
            .getAttribute("href"),
          "https://itshamid.com/contact/",
        );
        assert.equal(
          await publicPage
            .getByRole("link", { name: "Build a quick project brief" })
            .getAttribute("href"),
          "/plan/",
        );
        assert.equal(
          await publicPage
            .getByRole("link", { name: /hamidwork360@gmail.com/ })
            .getAttribute("href"),
          "mailto:hamidwork360@gmail.com",
        );
        assert.match(
          await publicPage
            .locator('a[data-contact-context="discovery_call"]')
            .getAttribute("href"),
          /^https:\/\/wa\.me\/923356709222\?text=/,
        );
        assert.equal(
          await publicPage.locator(".conversation-faq details").count(),
          4,
        );
        const sizes = await publicPage
          .locator(".first-conversation-grid")
          .evaluate((el) => ({
            width: el.offsetWidth,
            height: el.offsetHeight,
          }));
        report.layouts.push({
          viewport: width,
          gridWidth: sizes.width,
          gridHeight: sizes.height,
        });
        if ([320, 360, 390, 430, 768, 1024, 1440].includes(width)) {
          await publicPage.screenshot({
            path: path.join(output, `contact-${width}.png`),
            fullPage: true,
            animations: "disabled",
          });
          await publicPage.screenshot({
            path: path.join(output, `viewport-${width}.png`),
            animations: "disabled",
          });
        }
        if ([320, 390, 768, 1440].includes(width)) await axe(publicPage);
      }
    },
  );
  await check(
    "FAQ keyboard controls, reduced motion, 200% reflow and short mobile viewport",
    async () => {
      await publicPage.setViewportSize({ width: 390, height: 430 });
      await publicPage.goto(base + "/contact/");
      await name(publicPage).fill("Long form visitor name");
      await name(publicPage).focus();
      await overflow(publicPage);
      assert.notEqual(
        await publicPage.evaluate(
          () => getComputedStyle(document.body).overflow,
        ),
        "hidden",
      );
      const question = publicPage.locator(".conversation-faq summary").first();
      await question.focus();
      await publicPage.keyboard.press("Enter");
      assert.equal(await question.locator("..").getAttribute("open"), "");
      assert.equal(
        await publicPage
          .locator(".signal-stroke")
          .evaluate((el) => getComputedStyle(el).animationName),
        "none",
      );
      await publicPage.setViewportSize({ width: 1280, height: 900 });
      await publicPage.addStyleTag({ content: "html{zoom:2}" });
      await overflow(publicPage);
      assert.ok(
        (await publicPage.locator(".conversation-sheet").boundingBox()).width <=
          1280,
      );
    },
  );
  await context.close();

  const { directory, url } = await fixtureExport();
  const legacy = createFixture(url);
  let providerResult = {
    status: 200,
    body: { success: true, message: "Controlled provider acceptance" },
  };
  let waitForProvider,
    blockCaptcha = false,
    abortProvider = false,
    challengeLoads = 0;
  const posted = [],
    legacyPosted = [];
  const active = await browser.newContext({
    viewport: { width: 390, height: 900 },
    reducedMotion: "reduce",
  });
  await active.addInitScript(() => {
    sessionStorage.setItem("hamid-origin-v1", "seen");
    window.enquiryEvents = [];
    window.hamidGoogleAnalyticsAllowed = true;
    window.gtag = (command, name, data) => {
      if (command === "event") window.enquiryEvents.push({ name, ...data });
    };
  });
  await active.route("**/*", async (route) => {
    const request = route.request(),
      location = new URL(request.url());
    if (location.hostname === "js.hcaptcha.com") {
      challengeLoads++;
      return blockCaptcha
        ? route.abort()
        : route.fulfill({ contentType: "text/javascript", body: hcaptcha });
    }
    if (location.hostname === "challenges.cloudflare.com")
      return route.fulfill({ contentType: "text/javascript", body: turnstile });
    if (location.origin === "https://api.web3forms.com") {
      posted.push(request.postDataJSON());
      if (waitForProvider) await waitForProvider;
      if (abortProvider) return route.abort();
      return route.fulfill({
        status: providerResult.status,
        contentType: "application/json",
        body:
          typeof providerResult.body === "string"
            ? providerResult.body
            : JSON.stringify(providerResult.body),
      });
    }
    if (location.origin !== url) return route.abort();
    if (location.pathname !== "/api/enquiry/") return route.continue();
    legacyPosted.push(request.postDataJSON());
    const response = await legacy.handle(
      new Request(location, {
        method: "POST",
        headers: await request.allHeaders(),
        body: request.postData(),
      }),
      "127.0.0.1",
    );
    return route.fulfill({
      status: response.status,
      headers: Object.fromEntries(response.headers),
      body: await response.text(),
    });
  });
  const page = await active.newPage();
  page.on("pageerror", (error) => report.errors.push(error.message));
  const visit = (route = "/contact/") => page.goto(url + route);

  await check(
    "Only public identifiers cross the export boundary; CAPTCHA loads on interaction",
    async () => {
      for (const file of await readdir(path.join(directory, "out"), {
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
          "ENQUIRY_HMAC_SECRET",
        ])
          assert.ok(!content.includes(fixtureConfig[key]), `${key} leaked`);
      }
      await visit();
      await send(page).waitFor();
      assert.equal(challengeLoads, 0);
      assert.equal(await page.locator(".conversation-captcha").count(), 0);
    },
  );
  await check(
    "Required fields, error focus, native radio keyboard selection and optional URL validation",
    async () => {
      await send(page).click();
      await focus(page, name(page));
      assert.equal(await name(page).getAttribute("aria-invalid"), "true");
      assert.equal(posted.length, 0);
      await page.keyboard.press("Tab");
      await focus(page, email(page));
      await page.getByRole("radio").first().focus();
      await page.keyboard.press("ArrowRight");
      assert.equal(
        await page
          .getByRole("radio", { name: "Improve an existing site" })
          .isChecked(),
        true,
      );
      await fill(page);
      await page.locator(".conversation-extra summary").click();
      const website = page.getByLabel("Existing website", { exact: true });
      await website.fill("https://user:pass@example.test");
      await page.locator(".conversation-extra summary").click();
      await send(page).click();
      await focus(page, website);
      assert.equal(
        await page.locator(".conversation-extra").getAttribute("open"),
        "",
      );
      await website.fill("www.visitor.test");
      await verify(page);
      await axe(page);
      await page.screenshot({
        path: path.join(output, "focused-mobile.png"),
        fullPage: false,
      });
    },
  );
  await check(
    "Changing topic updates its prompt without clearing written values; incoming context remains safe",
    async () => {
      await visit("/contact/?service=growth-engine&source=growth");
      await page.getByRole("radio", { name: "Growth / SEO / AEO" }).waitFor();
      await page.waitForFunction(
        () =>
          document.querySelector('input[name="topic"][value="growth"]')
            ?.checked,
      );
      await message(page).fill("Keep this useful project context.");
      await choose(page, "AI automation");
      await page
        .getByText("Which repetitive task would you like to simplify?", {
          exact: true,
        })
        .waitFor();
      assert.equal(
        await message(page).inputValue(),
        "Keep this useful project context.",
      );
      await page.evaluate(() => {
        location.hash = "project-enquiry";
      });
      assert.equal(
        await page
          .getByRole("radio", { name: "AI automation", exact: true })
          .isChecked(),
        true,
      );
      await visit("/contact/#growth-enquiry");
      await page.waitForFunction(
        () => document.querySelector('input[value="growth"]')?.checked,
      );
      await visit("/contact/?service=unknown&source=private%40visitor.test");
      assert.equal(
        await page.locator('input[name="topic"]:checked').count(),
        0,
      );
    },
  );
  await check(
    "Pending submission prevents duplicates; success and one safe GA4 lead require provider acceptance",
    async () => {
      await visit(
        "/contact/?service=website&source=services&note=private%40visitor.test",
      );
      await fill(page);
      await verify(page);
      let release;
      waitForProvider = new Promise((resolve) => {
        release = resolve;
      });
      const before = posted.length;
      await send(page).click();
      const pending = page.getByRole("button", {
        name: "Sending your enquiry…",
      });
      await pending.waitFor();
      assert.equal(await pending.isDisabled(), true);
      await page
        .locator(".conversation-form")
        .evaluate((form) => form.requestSubmit());
      assert.equal((await events(page, "generate_lead")).length, 0);
      release();
      waitForProvider = undefined;
      const success = page.getByRole("heading", {
        name: "The conversation starts here.",
      });
      await success.waitFor();
      await focus(page, success);
      assert.equal(posted.length, before + 1);
      assert.equal(posted.at(-1).access_key, testKey);
      assert.equal(posted.at(-1)["h-captcha-response"], "fixture-human-token");
      assert.equal(posted.at(-1).replyto, validFields.email);
      assert.equal(posted.at(-1).entry_point, "services");
      assert.equal((await events(page, "generate_lead")).length, 1);
      assert.equal((await events(page, "lead_form_start")).length, 1);
      assert.doesNotMatch(
        JSON.stringify(await events(page)),
        /QA Visitor|visitor\.test|small business site|note=/,
      );
      await axe(page);
      await page.screenshot({
        path: path.join(output, "success-fixture-390.png"),
        fullPage: false,
      });
    },
  );
  await check(
    "False success, malformed responses, errors and rate limiting preserve the draft and never count a lead",
    async () => {
      for (const result of [
        { status: 200, body: { success: false } },
        { status: 200, body: "not-json" },
        { status: 503, body: { success: true } },
        { status: 429, body: { success: false } },
      ]) {
        providerResult = result;
        await visit();
        await fill(page);
        await verify(page);
        await send(page).click();
        await page.locator(".conversation-errors:not([hidden])").waitFor();
        assert.equal(await email(page).inputValue(), validFields.email);
        assert.equal(await message(page).inputValue(), validFields.message);
        assert.equal((await events(page, "generate_lead")).length, 0);
        assert.equal(await page.locator("[data-delivery-accepted]").count(), 0);
      }
      await page.screenshot({
        path: path.join(output, "error-fixture-390.png"),
        fullPage: false,
      });
      providerResult = { status: 200, body: { success: true } };
    },
  );
  await check(
    "Lost response warns of uncertainty without automatic retries or clearing text",
    async () => {
      await visit();
      await fill(page);
      await verify(page);
      abortProvider = true;
      const before = posted.length;
      await send(page).click();
      await page
        .getByText("I couldn’t confirm whether your enquiry was accepted.", {
          exact: false,
        })
        .waitFor();
      assert.equal(posted.length, before + 1);
      assert.equal((await events(page, "generate_lead")).length, 0);
      assert.equal(await message(page).inputValue(), validFields.message);
      abortProvider = false;
    },
  );
  await check(
    "Expired or blocked CAPTCHA and a filled honeypot prevent provider requests; retry recovers",
    async () => {
      await visit();
      await fill(page);
      await verify(page);
      const before = posted.length;
      await page.evaluate(() => window.expireContactCaptcha());
      await send(page).click();
      assert.equal(posted.length, before);
      await page.getByRole("button", { name: "Retry security check" }).click();
      await verify(page);
      await page.locator('[name="companyFax"]').evaluate((input) => {
        input.value = "bot";
      });
      await send(page).click();
      assert.equal(posted.length, before);
      blockCaptcha = true;
      await visit();
      await fill(page);
      await page
        .getByRole("button", { name: "Retry security check" })
        .waitFor();
      await send(page).click();
      assert.equal(posted.length, before);
      blockCaptcha = false;
      await page.getByRole("button", { name: "Retry security check" }).click();
      await verify(page);
    },
  );
  await check(
    "Unconfigured composer offers an explicit review-to-WhatsApp flow and sends no email",
    async () => {
      const before = posted.length;
      await visit("/qa-contact-unavailable/");
      assert.equal(await send(page).count(), 0);
      await fill(page);
      await page.getByRole("button", { name: "Review for WhatsApp" }).click();
      await page.locator(".conversation-review").waitFor();
      const link = page.getByRole("link", {
        name: "Open WhatsApp",
        exact: true,
      });
      const href = new URL(await link.getAttribute("href"));
      assert.equal(href.hostname, "wa.me");
      assert.match(href.searchParams.get("text"), /QA Visitor/);
      assert.equal(posted.length, before);
      assert.equal((await events(page, "generate_lead")).length, 0);
      await page.getByRole("button", { name: "Keep editing" }).click();
      await focus(page, message(page));
      assert.equal(await message(page).inputValue(), validFields.message);
      assert.equal(await page.locator(".conversation-review").count(), 0);
    },
  );
  await check(
    "Long values, optional agency company and mobile touch targets remain usable",
    async () => {
      await visit("/contact/?service=agency&source=agency");
      await name(page).fill("A".repeat(100));
      await email(page).fill("a".repeat(60) + "@" + "b".repeat(60) + ".test");
      await message(page).fill(
        "Detailed project notes.\n".repeat(110).slice(0, 2400),
      );
      await page.locator(".conversation-extra summary").click();
      assert.equal(
        await page.getByLabel("Company or brand").getAttribute("required"),
        null,
      );
      await page.getByLabel("Preferred timeline").selectOption("Flexible");
      for (const width of [320, 390, 430, 768, 1024]) {
        await page.setViewportSize({ width, height: 900 });
        await overflow(page);
        for (const label of await page.locator(".topic-choice > span").all())
          assert.ok(
            (await label.boundingBox()).height >= (width < 600 ? 44 : 40),
          );
        if (width === 320) {
          await name(page).focus();
          await page.screenshot({
            path: path.join(output, "long-values-320.png"),
            fullPage: false,
          });
        }
      }
      await page.setViewportSize({ width: 390, height: 900 });
      await verify(page);
      await send(page).click();
      await page.locator("[data-delivery-accepted]").waitFor();
      assert.equal(posted.at(-1).project_type, "Agency partnership");
    },
  );
  await check(
    "Planner review and legacy server delivery remain explicit and keep revised notes",
    async () => {
      await visit("/plan/");
      const before = legacyPosted.length;
      await page
        .getByLabel("Anything else?")
        .fill("Private mock planner notes.");
      assert.equal(
        await page.getByRole("form", { name: "Project enquiry" }).count(),
        0,
      );
      await page
        .getByRole("button", { name: "Review and send this outline" })
        .click();
      const form = page.getByRole("form", { name: "Project enquiry" });
      await form.getByLabel("Name", { exact: true }).fill(validFields.name);
      await form
        .getByLabel("Email address", { exact: true })
        .fill(validFields.email);
      await form
        .getByLabel("What can I help with?", { exact: true })
        .selectOption("website");
      await form
        .getByLabel("Tell me a little about it", { exact: true })
        .fill("Only this revised mock planner outline is sent.");
      assert.equal(legacyPosted.length, before);
      await page
        .getByRole("button", { name: "Verify legacy form (test only)" })
        .click();
      await form.getByRole("button", { name: "Send my enquiry" }).click();
      await page
        .getByRole("heading", {
          name: "Thank you for sharing your project.",
          exact: true,
        })
        .waitFor();
      assert.equal(legacyPosted.length, before + 1);
      assert.equal(legacyPosted.at(-1).source, "planner");
      assert.equal(
        legacyPosted.at(-1).fields.message,
        "Only this revised mock planner outline is sent.",
      );
    },
  );
  await check(
    "Existing agency form still requires the company and uses the protected legacy endpoint",
    async () => {
      await visit("/for-agencies/#agency-enquiry");
      const form = page.getByRole("form", { name: "Agency enquiry" });
      await form
        .getByLabel("Contact name", { exact: true })
        .fill(validFields.name);
      await form
        .getByLabel("Business email", { exact: true })
        .fill(validFields.email);
      await form.getByLabel("Short project brief").fill(validFields.message);
      await form.getByRole("button", { name: "Send agency brief" }).click();
      const company = form.getByLabel("Agency or company name");
      await focus(page, company);
      await company.fill("QA Partner Studio");
      await page
        .getByRole("button", { name: "Verify legacy form (test only)" })
        .click();
      await form.getByRole("button", { name: "Send agency brief" }).click();
      await page
        .getByRole("heading", {
          name: "Thank you for sharing your agency brief.",
          exact: true,
        })
        .waitFor();
      assert.equal(legacyPosted.at(-1).fields.company, "QA Partner Studio");
      assert.equal(legacyPosted.at(-1).source, "agency");
    },
  );
  await active.close();
  await check(
    "No JavaScript keeps direct contact available and prevents a broken submission",
    async () => {
      const noJs = await browser.newContext({ javaScriptEnabled: false });
      await noJs.route(
        (location) => location.origin !== new URL(base).origin,
        (route) => route.abort(),
      );
      const staticPage = await noJs.newPage();
      await staticPage.goto(base + "/contact/");
      assert.equal(await send(staticPage).isDisabled(), true);
      assert.equal(
        await staticPage.locator("noscript .conversation-small").isVisible(),
        true,
      );
      assert.equal(
        await staticPage
          .getByRole("link", { name: "WhatsApp Hamid", exact: true })
          .isVisible(),
        true,
      );
      await noJs.close();
    },
  );
  assert.deepEqual(report.errors, []);
} finally {
  preview?.kill();
  await browser?.close();
  await writeFile(
    path.join(output, "results.json"),
    JSON.stringify(report, null, 2),
  );
}
console.log(JSON.stringify(report, null, 2));
if (report.checks.some((check) => !check.passed)) process.exitCode = 1;
