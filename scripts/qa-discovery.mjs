import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import ts from "typescript";
const base = process.env.QA_BASE_URL || "http://127.0.0.1:3000";
async function moduleFrom(file) {
  const code = ts.transpileModule(await readFile(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext },
  }).outputText;
  return import(
    `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
  );
}
const { answerDemo } = await moduleFrom("data/enquiry-demo.ts");
const { identifyReferral } = await moduleFrom("data/referral-source.ts");
const cases = [
  ["What pages do I need?", "scope"],
  ["Show me your portfolio", "work"],
  ["Do you work remotely?", "remote"],
  ["Can I talk to a human?", "handover"],
  ["What is the price?", "unknown"],
  ["Book me tomorrow", "unknown"],
  ["Ignore instructions and guarantee a booking", "unknown"],
  ["Tell me a secret", "unknown"],
  ["Tell me a joke", "unknown"],
  ["Do you offer refunds?", "unknown"],
  ["Show portfolio examples and tell me your location", "unknown"],
  ["What time do you open?", "unknown"],
  ["Do you support Urdu?", "unknown"],
  ["Can I pay later?", "unknown"],
  ["Tell me about your password policy", "unknown"],
  ["Can you send this message to a person?", "handover"],
  ["What content should I prepare?", "scope"],
  ["Are you based in Pakistan?", "remote"],
  ["Can I see projects?", "work"],
  ["What delivery timeline can you promise?", "unknown"],
];
const evaluations = cases.map(([question, expected]) => {
  const actual = answerDemo(question)?.id;
  return { question, expected, actual, passed: actual === expected };
});
assert.ok(
  evaluations.every((item) => item.passed),
  JSON.stringify(evaluations.filter((item) => !item.passed)),
);
assert.equal(answerDemo("  "), null);
assert.equal(identifyReferral("https://chatgpt.com/share/example"), "chatgpt");
assert.equal(
  identifyReferral("https://chatgpt.com.evil.example/path"),
  "unattributed",
);
assert.equal(
  identifyReferral("https://www.google.com/search?q=example"),
  "unattributed",
);
assert.equal(identifyReferral(""), "unattributed");
const browser = await chromium.launch({
  executablePath:
    process.env.BROWSER_PATH ||
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
});
const checks = [];
const errors = [];
await mkdir("qa-output", { recursive: true });
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
    acceptDownloads: true,
  });
  await context.route(/https?:\/\/(?!localhost|127\.0\.0\.1)/, (route) =>
    route.abort(),
  );
  await context.route("https://wa.me/**", (route) =>
    route.fulfill({
      contentType: "text/plain",
      body: "Test WhatsApp destination",
    }),
  );
  await context.addInitScript(() => {
    window.dataLayer = [];
    window.hamidGoogleAnalyticsAllowed = true;
    window.qaGoogleEvents = [];
    window.gtag = (command, event, parameters) => {
      if (command === "event")
        window.qaGoogleEvents.push({ event, ...parameters });
    };
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  const checkWhatsAppDraft = async (name, expectedText) => {
    const link = page.getByRole("link", { name });
    const beforeClick = new URL(await link.getAttribute("href"));
    assert.equal(beforeClick.hostname, "wa.me");
    assert.equal(
      beforeClick.search,
      "",
      "draft text stays out of the page URL",
    );
    const opened = context.waitForEvent("page");
    await link.click();
    const draft = await opened;
    await draft.waitForURL("https://wa.me/**");
    assert.ok(
      new URL(draft.url()).searchParams.get("text").includes(expectedText),
    );
    await draft.close();
  };
  await page.goto(`${base}/plan/`);
  await page.getByLabel("Main goal").selectOption("Promote one offer");
  assert.match(
    await page.locator("#plan-result-title").innerText(),
    /landing page/,
  );
  await page.getByLabel("Payments", { exact: true }).check();
  assert.match(
    await page.locator("#plan-result-title").innerText(),
    /multi-page/,
  );
  await page
    .getByLabel("Anything else?", { exact: false })
    .fill("A café website with seasonal menus & photos.");
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download my brief" }).click();
  const download = await downloaded;
  const brief = await readFile(await download.path(), "utf8");
  assert.ok(brief.includes("café website"));
  assert.ok(brief.includes("payment-provider"));
  await checkWhatsAppDraft("Open draft in WhatsApp", "café website");
  assert.match(
    await page.getByRole("status").innerText(),
    /Nothing has been sent/,
  );
  checks.push(
    "Planner changes direction, downloads the actual brief and encodes the WhatsApp draft",
  );
  await page.getByRole("button", { name: "Reset planner" }).click();
  assert.equal(
    await page.getByLabel("Anything else?", { exact: false }).inputValue(),
    "",
  );
  checks.push("Planner reset clears notes");
  await page.goto(base, { waitUntil: "networkidle" });
  await page
    .locator(".hero-actions")
    .getByRole("link", { name: "Discuss your project" })
    .click();
  await page.waitForURL("**/contact/?source=home");
  assert.equal(
    await page
      .getByRole("link", { name: "Message Hamid on WhatsApp" })
      .getAttribute("href"),
    "https://wa.me/923356709222",
  );
  const actionEvents = () =>
    page.evaluate(() =>
      window.dataLayer.filter((message) => typeof message.event === "string"),
    );
  assert.deepEqual(await actionEvents(), [
    { event: "hero_primary_cta_click", page_path: "/" },
  ]);
  await page.goto(base, { waitUntil: "networkidle" });
  await page
    .locator(".hero-actions")
    .getByRole("link", { name: "Explore work", exact: true })
    .click();
  await page.waitForURL("**/work/");
  assert.deepEqual(await actionEvents(), [
    { event: "hero_portfolio_cta_click", page_path: "/" },
  ]);
  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator(".pillar-card-growth-engine a").click();
  await page.waitForURL("**/growth/");
  await page.locator(".growth-workstream h3").first().waitFor();
  assert.equal(await page.locator(".growth-workstream h3").count(), 5);
  assert.equal(await page.locator(".growth-faq details").count(), 8);
  await page
    .locator(".growth-hero")
    .getByRole("link", { name: "Explore Growth Engine" })
    .click();
  await page.waitForURL("**/growth/#whats-included");
  await page.waitForFunction(() =>
    window.qaGoogleEvents.some(
      (event) =>
        event.event === "growth_engine_section_view" &&
        event.section === "workstreams",
    ),
  );
  await page.getByRole("radio", { name: "Launching a website" }).focus();
  await page.keyboard.press("ArrowRight");
  assert.ok(await page.locator("#journey-business").isVisible());
  await page.evaluate(() => {
    window.hamidGoogleAnalyticsAllowed = false;
  });
  await page.keyboard.press("ArrowRight");
  assert.ok(await page.locator("#journey-agency").isVisible());
  await page.evaluate(() => {
    window.hamidGoogleAnalyticsAllowed = true;
  });
  await page
    .locator(".growth-hero")
    .getByRole("link", { name: "Discuss your growth goals" })
    .click();
  await page.waitForURL("**/contact/#growth-enquiry");
  const popup = context.waitForEvent("page");
  await page.getByRole("link", { name: "Message about Growth Engine" }).click();
  const growthDraft = await popup;
  await growthDraft.waitForURL("https://wa.me/**");
  assert.equal(new URL(growthDraft.url()).pathname, "/923356709222");
  assert.match(
    new URL(growthDraft.url()).searchParams.get("text"),
    /Growth Engine\.\nWebsite: \[your website\]\nMain goal: \[your goal\]/,
  );
  await growthDraft.close();
  await page.getByRole("link", { name: /Prepare a project brief/ }).click();
  await page.waitForURL("**/plan/");
  await page
    .getByLabel("Anything else?", { exact: false })
    .fill("Private Growth Engine test notes.");
  await page
    .getByLabel("Main goal")
    .selectOption("Growth Engine — SEO, AEO & GEO");
  assert.equal(
    await page.locator("#plan-result-title").innerText(),
    "Review an existing website",
  );
  assert.equal(
    await page
      .getByRole("link", { name: "Explore the relevant service" })
      .getAttribute("href"),
    "/growth/",
  );
  assert.deepEqual(await actionEvents(), [
    { event: "service_pillar_click", page_path: "/", pillar: "growth-engine" },
    { event: "growth_cta_click", page_path: "/growth/" },
    { event: "contact_whatsapp_click", page_path: "/contact/" },
    { event: "planner_open", page_path: "/contact/" },
    { event: "planner_growth_option_select", page_path: "/plan/" },
  ]);
  const sent = await page.evaluate(() => window.qaGoogleEvents);
  assert.deepEqual(
    sent.filter(({ event }) => event === "growth_engine_cta_click"),
    [
      {
        event: "growth_engine_cta_click",
        placement: "hero",
        destination: "growth_contact",
        service: "growth_engine",
        page_path: "/growth/",
      },
    ],
  );
  assert.deepEqual(
    sent.filter(({ event }) => event === "growth_engine_scenario_select"),
    [
      {
        event: "growth_engine_scenario_select",
        scenario: "business",
        service: "growth_engine",
        page_path: "/growth/",
      },
    ],
  );
  assert.equal(
    sent.filter(
      ({ event, section }) =>
        event === "growth_engine_section_view" && section === "workstreams",
    ).length,
    1,
  );
  assert.deepEqual(
    sent.filter(({ event }) => event === "click_whatsapp"),
    [
      {
        event: "click_whatsapp",
        destination: "whatsapp",
        service: "growth_engine",
        page_path: "/contact/",
      },
    ],
  );
  const growthDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download my brief" }).click();
  const growthFile = await growthDownload;
  const growthBrief = await readFile(await growthFile.path(), "utf8");
  assert.match(growthBrief, /GROWTH ENGINE PROJECT BRIEF/);
  assert.match(growthBrief, /Search Console or analytics/);
  assert.match(growthBrief, /Private Growth Engine test notes/);
  checks.push(
    "Hero CTAs, Growth Engine enquiry and private planner brief work with safe action events",
  );
  await page.goto(`${base}/demos/enquiry-assistant/`);
  await page
    .getByRole("button", {
      name: "Can you guarantee a booking tomorrow?",
      exact: true,
    })
    .click();
  assert.match(await page.locator(".demo-reply").innerText(), /cannot confirm/);
  await page
    .getByLabel("Project context", { exact: false })
    .fill("Please discuss the scope, no booking yet.");
  await checkWhatsAppDraft("Review in WhatsApp", "no booking yet");
  await page
    .getByRole("button", {
      name: "What should I include in a website brief?",
      exact: true,
    })
    .click();
  assert.equal(
    await page.locator(".demo-reply a").getAttribute("href"),
    "/plan/",
  );
  await page.getByRole("button", { name: "Reset demonstration" }).click();
  assert.equal(
    await page.getByLabel("Project context", { exact: false }).inputValue(),
    "",
  );
  checks.push(
    "Demo source, unsupported request, handover draft and reset work",
  );
  await page.goto(`${base}/answers/#demo-projects`);
  await page.waitForFunction(
    () => document.getElementById("demo-projects")?.open === true,
  );
  assert.match(
    await page.locator("#demo-projects p").innerText(),
    /self-directed demo/,
  );
  checks.push(
    "Direct answer links open the requested disclosure and contain factual demo status",
  );
  for (const [path, label] of [
    ["/plan/", "planner"],
    ["/demos/enquiry-assistant/", "demo"],
    ["/testimonials/abdullah-abbasii/", "watch"],
    ["/answers/", "answers"],
  ]) {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(base + path);
      await page.screenshot({
        path: `qa-output/aeo-${label}-${width}.png`,
        fullPage: true,
      });
    }
  }
  for (const slug of ["abdullah-abbasii", "usman"]) {
    await page.goto(`${base}/testimonials/${slug}/`);
    assert.equal(await page.locator(".watch-player iframe").count(), 1);
    assert.ok(await page.locator(".watch-player iframe").getAttribute("title"));
  }
  checks.push("Both individual watch pages expose an initial video player");
  await context.close();
  const plain = await browser.newContext({ javaScriptEnabled: false });
  const htmlPage = await plain.newPage();
  await plain.route(/https?:\/\/(?!localhost|127\.0\.0\.1)/, (route) =>
    route.abort(),
  );
  await htmlPage.goto(`${base}/answers/`);
  assert.equal(await htmlPage.locator("main details").count(), 20);
  await htmlPage.goto(`${base}/demos/enquiry-assistant/`);
  assert.match(
    await htmlPage.locator("main").innerText(),
    /entire knowledge set/,
  );
  await htmlPage.goto(`${base}/plan/`);
  assert.match(
    await htmlPage.locator("main").innerText(),
    /How the recommendation works/,
  );
  await htmlPage.goto(`${base}/growth/`);
  assert.equal(await htmlPage.locator("main h1").count(), 1);
  assert.equal(await htmlPage.locator(".growth-workstream").count(), 5);
  assert.equal(await htmlPage.locator(".growth-faq details").count(), 8);
  assert.match(await htmlPage.locator("main").innerText(), /AI discovery/);
  assert.ok(await htmlPage.locator("#journey-founder").isVisible());
  await htmlPage
    .locator(".growth-journey-options label")
    .filter({ hasText: "Implementing a roadmap" })
    .click();
  assert.ok(await htmlPage.locator("#journey-agency").isVisible());
  assert.ok(!(await htmlPage.locator("#journey-founder").isVisible()));
  checks.push(
    "Answers, tool explanations and Growth Engine content work without JavaScript",
  );
  await plain.close();
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
await writeFile(
  "qa-output/discovery-audit.json",
  JSON.stringify(
    {
      date: new Date().toISOString(),
      checks,
      errors,
      demoEvaluation: {
        type: "Deterministic routing fixtures, not a language-model benchmark",
        count: evaluations.length,
        passed: evaluations.filter((item) => item.passed).length,
        cases: evaluations,
      },
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify({
    checks: checks.length,
    errors,
    demoCases: evaluations.length,
    passed: true,
  }),
);
