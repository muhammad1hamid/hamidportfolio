import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright-core";

const origin = "https://itshamid.com";
const base = process.env.QA_BASE_URL || "http://127.0.0.1:3000";
const live = process.env.QA_GA_LIVE === "true";
const container = "GTM-KF5WH37L";
const stream = "G-BXP2WE495G";
const preference = "hamid-analytics-preferences";
const browser = await chromium.launch({
  executablePath:
    process.env.BROWSER_PATH ||
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
});

async function session() {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const requests = { container: 0, clarity: 0, hits: [] };
  await context.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === origin) {
      if (live) return route.continue();
      const response = await fetch(`${base}${url.pathname}${url.search}`);
      if (request.frame().page().isClosed()) return;
      return route.fulfill({
        status: response.status,
        contentType: response.headers.get("content-type") || undefined,
        body: Buffer.from(await response.arrayBuffer()),
      });
    }
    if (url.hostname === "www.googletagmanager.com") {
      if (url.pathname === "/gtm.js") {
        assert.equal(url.searchParams.get("id"), container);
        requests.container++;
      }
      return route.continue();
    }
    if (url.hostname === "www.clarity.ms") requests.clarity++;
    if (url.pathname === "/g/collect") {
      const lines = request.postData()?.split("\n") || [""];
      for (const line of lines) {
        const data = new URLSearchParams(line);
        const location = new URL(
          data.get("dl") || url.searchParams.get("dl") || origin,
        );
        const event = data.get("en") || url.searchParams.get("en");
        requests.hits.push({
          stream: url.searchParams.get("tid"),
          event,
          path: location.pathname,
          ...(location.pathname === "/for-agencies/"
            ? { campaignQuery: location.search }
            : {}),
          consent: url.searchParams.get("gcs"),
          ...(event === "ai_referral_landing"
            ? {
                aiSource:
                  data.get("ep.ai_source") ||
                  url.searchParams.get("ep.ai_source"),
                aiSignal:
                  data.get("ep.ai_signal") ||
                  url.searchParams.get("ep.ai_signal"),
                hasQuery: Boolean(location.search),
                hasReferrer: Boolean(
                  data.get("dr") || url.searchParams.get("dr"),
                ),
              }
            : {}),
        });
      }
      // Verify the request without recording test traffic in the property.
      return route.fulfill({ status: 204 });
    }
    return route.abort();
  });
  return { context, requests, page: await context.newPage() };
}

async function waitForView(requests, path, minimum = 1) {
  const matches = () =>
    requests.hits.filter(
      (hit) =>
        hit.event === "page_view" && hit.stream === stream && hit.path === path,
    );
  const stop = Date.now() + 15000;
  while (matches().length < minimum && Date.now() < stop) await delay(100);
  assert.ok(matches().length >= minimum, `Missing GA4 page view for ${path}`);
  return matches();
}

async function waitForAiLanding(requests) {
  const match = () =>
    requests.hits.filter(
      (hit) => hit.event === "ai_referral_landing" && hit.stream === stream,
    );
  const stop = Date.now() + 15000;
  while (!match().length && Date.now() < stop) await delay(100);
  assert.equal(match().length, 1, "Expected one consented AI landing event");
  return match()[0];
}

const checks = [];
const analytics = await session();
try {
  const { page, requests } = analytics;
  await page.goto(origin);
  await page.getByRole("heading", { name: "Optional analytics" }).waitFor();
  assert.equal(requests.container, 0);
  assert.equal(requests.hits.length, 0);
  const defaults = await page.evaluate(
    () =>
      [...window.dataLayer].find(
        (entry) => entry[0] === "consent" && entry[1] === "default",
      )[2],
  );
  assert.deepEqual(defaults, {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  checks.push("Google Tag Manager and collection wait for a visitor choice");

  await page.getByRole("button", { name: "Customize", exact: true }).click();
  await page.getByRole("checkbox", { name: "Google Analytics" }).check();
  await page.getByRole("button", { name: "Save choices" }).click();
  const initial = await waitForView(requests, "/");
  assert.equal(initial.length, 1);
  assert.equal(initial[0].consent, "G101");
  assert.equal(requests.container, 1);
  assert.equal(requests.clarity, 0);
  const updates = await page.evaluate(() =>
    [...window.dataLayer].filter(
      (entry) => entry[0] === "consent" && entry[1] === "update",
    ),
  );
  assert.deepEqual(
    updates.map((entry) => entry[2]),
    [{ ...defaults, analytics_storage: "granted" }],
  );
  checks.push(
    "Google-only opt-in sends a consented GA4 page view to the published stream",
  );

  await page
    .locator(".hero-actions")
    .getByRole("link", { name: "Discuss your project" })
    .click();
  await page.waitForURL("**/contact/?source=home");
  await page.getByRole("link", { name: "Message Hamid on WhatsApp" }).waitFor();
  await page.waitForFunction(() =>
    window.dataLayer.some(
      (entry) =>
        entry.event === "hero_primary_cta_click" && entry.page_path === "/",
    ),
  );
  await waitForView(requests, "/contact/");
  await delay(3500);
  const clientPageViews = requests.hits.filter(
    (hit) => hit.event === "page_view",
  );
  assert.deepEqual(
    clientPageViews.map(({ path, consent }) => [path, consent]),
    [
      ["/", "G101"],
      ["/contact/", "G101"],
    ],
  );
  assert.equal(requests.container, 1);
  checks.push(
    "Client navigation sends one new page view through the existing tag",
  );

  const homeViews = requests.hits.filter(
    (hit) => hit.event === "page_view" && hit.path === "/",
  ).length;
  await page.goto(origin);
  await waitForView(requests, "/", homeViews + 1);
  assert.equal(requests.container, 2);
  assert.equal(requests.clarity, 0);
  assert.equal(await page.locator("#analytics-choice").isVisible(), false);
  checks.push("The choice survives navigation and later visits");

  await page
    .getByRole("button", { name: "Analytics settings", exact: true })
    .click();
  await page.getByRole("checkbox", { name: "Google Analytics" }).uncheck();
  await page.getByRole("button", { name: "Save choices" }).click();
  assert.equal(
    await page.evaluate(() => window["ga-disable-G-BXP2WE495G"]),
    true,
  );
  assert.equal(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)).google,
      preference,
    ),
    false,
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Analytics settings", exact: true })
    .waitFor();
  assert.equal(requests.container, 2);
  checks.push(
    "Withdrawing consent disables GA4 and keeps it unloaded on reload",
  );

  const declined = await session();
  await declined.page.goto(origin);
  await declined.page
    .getByRole("button", { name: "Decline", exact: true })
    .click();
  await declined.page.reload();
  await declined.page
    .getByRole("button", { name: "Analytics settings", exact: true })
    .waitFor();
  assert.equal(
    await declined.page.locator("#analytics-choice").isVisible(),
    false,
  );
  assert.deepEqual(declined.requests, { container: 0, clarity: 0, hits: [] });
  checks.push("Decline loads neither optional analytics tool");
  await declined.context.close();

  const legacy = await session();
  await legacy.context.addInitScript(() => {
    localStorage.setItem("hamid-clarity-consent", "allowed");
  });
  await legacy.page.goto(origin);
  await legacy.page
    .getByRole("button", { name: "Customize", exact: true })
    .click();
  assert.equal(
    await legacy.page
      .getByRole("checkbox", { name: "Google Analytics" })
      .isChecked(),
    false,
  );
  assert.equal(
    await legacy.page
      .getByRole("checkbox", { name: "Microsoft Clarity" })
      .isChecked(),
    true,
  );
  assert.equal(legacy.requests.container, 0);
  checks.push(
    "Existing Clarity permission carries forward as a separate choice",
  );
  await legacy.context.close();

  let agencyHits;
  const aiLandings = [];
  if (!live) {
    const agency = await session();
    try {
      await agency.context.addInitScript((key) => {
        localStorage.setItem(
          key,
          JSON.stringify({ google: true, clarity: false }),
        );
      }, preference);
      await agency.page.goto(
        origin +
          "/for-agencies/?utm_source=linkedin&utm_medium=social&utm_campaign=agency-partnerships&utm_term=private%40fixture.test",
      );
      await waitForView(agency.requests, "/for-agencies/");
      agencyHits = agency.requests.hits.filter(
        ({ event, path }) => event === "page_view" && path === "/for-agencies/",
      );
      assert.equal(agencyHits.length, 1);
      assert.deepEqual(
        [...new URLSearchParams(agencyHits[0].campaignQuery)],
        [
          ["utm_source", "linkedin"],
          ["utm_medium", "social"],
          ["utm_campaign", "agency-partnerships"],
        ],
      );
      checks.push(
        "Agency page view passes allowlisted campaign tags and excludes untrusted query values",
      );
    } finally {
      await agency.context.close();
    }

    const referrer = await session();
    try {
      await referrer.page.goto(
        origin + "/growth/?utm_term=fixture%40example.test",
        {
          referer: "https://www.perplexity.ai/search/example",
        },
      );
      await referrer.page
        .getByRole("heading", { name: "Optional analytics" })
        .waitFor();
      assert.equal(referrer.requests.hits.length, 0);
      await referrer.page
        .getByRole("button", { name: "Customize", exact: true })
        .click();
      await referrer.page
        .getByRole("checkbox", { name: "Google Analytics" })
        .check();
      await referrer.page.getByRole("button", { name: "Save choices" }).click();
      const hit = await waitForAiLanding(referrer.requests);
      assert.deepEqual(hit, {
        stream,
        event: "ai_referral_landing",
        path: "/growth/",
        consent: "G101",
        aiSource: "perplexity",
        aiSignal: "referrer",
        hasQuery: false,
        hasReferrer: false,
      });
      aiLandings.push(hit);
      await referrer.page
        .locator("main a[href='/contact/#growth-enquiry']")
        .first()
        .click();
      await referrer.page.waitForURL("**/contact/#growth-enquiry");
      await waitForView(referrer.requests, "/contact/");
      assert.equal(
        referrer.requests.hits.filter(
          (record) => record.event === "ai_referral_landing",
        ).length,
        1,
      );
      checks.push(
        "A recognized referrer emits one clean landing event after opt-in across client navigation",
      );
    } finally {
      await referrer.context.close();
    }

    const tagged = await session();
    try {
      await tagged.context.addInitScript((key) => {
        localStorage.setItem(
          key,
          JSON.stringify({ google: true, clarity: false }),
        );
      }, preference);
      await tagged.page.goto(
        origin + "/insights/?utm_source=chatgpt.com&note=fixture",
      );
      const hit = await waitForAiLanding(tagged.requests);
      assert.deepEqual(
        [hit.aiSource, hit.aiSignal, hit.path, hit.hasQuery],
        ["chatgpt", "tag", "/insights/", false],
      );
      aiLandings.push(hit);
      const newPage = await tagged.context.newPage();
      await newPage.goto(
        origin + "/blog/?utm_source=chatgpt.com.example.test",
        {
          referer: "https://chatgpt.com.example.test/",
        },
      );
      await waitForView(tagged.requests, "/blog/");
      await delay(400);
      assert.equal(
        tagged.requests.hits.filter(
          (record) => record.event === "ai_referral_landing",
        ).length,
        1,
      );
      await newPage.goto(origin + "/work/", {
        referer: "https://www.google.com/",
      });
      await waitForView(tagged.requests, "/work/");
      assert.equal(
        tagged.requests.hits.filter(
          (record) => record.event === "ai_referral_landing",
        ).length,
        1,
      );
      checks.push(
        "The documented ChatGPT tag works on later visits, with lookalike and ordinary Google referrals excluded",
      );
    } finally {
      await tagged.context.close();
    }
  }

  const report = {
    live,
    checks,
    clientPageViews,
    hits: requests.hits,
    agencyHits,
    aiLandings,
  };
  await mkdir("qa-output", { recursive: true });
  await writeFile(
    `qa-output/ga4-${live ? "live" : "local"}.json`,
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report));
} catch (error) {
  console.error(JSON.stringify({ checks, requests: analytics.requests }));
  throw error;
} finally {
  await browser.close();
}
