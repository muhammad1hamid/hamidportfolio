import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import {
  enquiryEndpoint,
  enquiryHref,
  enquiryLimits,
  enquirySource,
  maxEnquiryBytes,
  serviceForPath,
  validateEnquiry,
} from "../data/project-enquiry.mjs";
import { loadEnquiryConfig } from "../server/enquiry/config.mjs";
import {
  createFixture,
  fixtureConfig,
  validFields,
} from "./enquiry-test-fixture.mjs";

const origin = fixtureConfig.ENQUIRY_ORIGIN;
const payload = (overrides = {}) => ({
  submissionId: randomUUID(),
  fields: validFields,
  token: "qa-verified-token",
  companyFax: "",
  source: "services",
  ...overrides,
});

function request(body = payload(), headers = {}, method = "POST") {
  return new Request(origin + enquiryEndpoint, {
    method,
    headers: { Origin: origin, "Content-Type": "application/json", ...headers },
    body: method === "POST" ? JSON.stringify(body) : undefined,
  });
}

test("shared validation normalizes input and restricts enum, URL and field sizes", () => {
  const normalized = validateEnquiry({
    ...validFields,
    name: "  María Hamid  ",
    message: "First line\r\nFinal line",
  });
  assert.ok(normalized.ok);
  assert.equal(normalized.fields.name, "María Hamid");
  assert.equal(normalized.fields.message, "First line\nFinal line");
  assert.equal(normalized.fields.website, "https://www.visitor.test/");
  assert.ok(
    validateEnquiry({
      ...validFields,
      message: "a".repeat(enquiryLimits.message),
    }).ok,
  );
  const invalid = validateEnquiry({
    email: "abc..def@visitor.test",
    service: "constructor",
    message: "a".repeat(enquiryLimits.message + 1),
    website: "javascript:alert(0)",
    budget: "$10",
    timeline: "tomorrow",
  });
  assert.deepEqual(Object.keys(invalid.errors).sort(), [
    "budget",
    "email",
    "message",
    "name",
    "service",
    "timeline",
    "website",
  ]);
  for (const email of [
    "a@visitor.test\r\nBCC: x@visitor.test",
    ".lead@visitor.test",
    "a@-visitor.test",
  ]) {
    assert.ok(validateEnquiry({ ...validFields, email }).errors.email);
  }
  for (const website of [
    "https://member:password@visitor.test",
    "data:text/html,start",
    "https://intranet",
    "my site.test",
  ]) {
    assert.ok(validateEnquiry({ ...validFields, website }).errors.website);
  }
  assert.ok(
    validateEnquiry({
      ...validFields,
      service: "agency",
      agency: "x".repeat(401),
    }).errors.agency,
  );
  assert.equal(
    validateEnquiry({ ...validFields, agency: "irrelevant" }).fields.agency,
    "",
  );
  assert.equal(serviceForPath("/growth/"), "growth-engine");
  assert.equal(serviceForPath("/website-chatbot/"), "ai-assistant");
  assert.equal(serviceForPath("/business-dashboards/"), "");
  assert.equal(
    enquiryHref(serviceForPath("/landing-page-development/"), "services"),
    "/contact/?service=landing-page&source=services",
  );
  assert.equal(enquirySource("replies@visitor.test"), "contact");
});

test("missing or incomplete provider configuration keeps all submissions unavailable", async () => {
  assert.equal(
    loadEnquiryConfig({ ...fixtureConfig, ENQUIRY_ENABLED: "false" }),
    undefined,
  );
  assert.equal(
    loadEnquiryConfig({
      ...fixtureConfig,
      ENQUIRY_ORIGIN: "http://itshamid.com",
    }),
    undefined,
  );
  assert.equal(
    loadEnquiryConfig({
      ...fixtureConfig,
      VERCEL_ENV: "production",
      TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
    }),
    undefined,
  );
  const f = createFixture(origin, { RESEND_API_KEY: "" });
  const response = await f.handle(request());
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "unavailable" });
  assert.equal(f.calls.length, 0);
});

test("HTTP method, exact origin, MIME, size, malformed JSON and fields are checked before provider access", async () => {
  const f = createFixture();
  const cases = [
    [request(null, {}, "GET"), 405],
    [request(null, {}, "OPTIONS"), 405],
    [request(payload(), { Origin: "https://elsewhere.test" }), 403],
    [request(payload(), { Origin: "", "Sec-Fetch-Site": "cross-site" }), 403],
    [request(payload(), { "Sec-Fetch-Site": "same-site" }), 403],
    [request(payload(), { "Content-Type": "text/plain" }), 415],
    [request(payload(), { "Content-Encoding": "gzip" }), 415],
    [
      request(payload(), { "Content-Length": String(maxEnquiryBytes + 1) }),
      413,
    ],
    [request(payload({ extra: "x".repeat(maxEnquiryBytes) })), 413],
    [request(payload({ submissionId: "non-uuid" })), 400],
    [request(payload({ companyFax: "filled" })), 422],
    [request(payload({ fields: {} })), 422],
    [
      new Request(origin + enquiryEndpoint, {
        method: "POST",
        headers: { Origin: origin, "Content-Type": "application/json" },
        body: "{",
      }),
      400,
    ],
  ];
  for (const [input, expected] of cases) {
    const reply = await f.handle(input);
    assert.equal(reply.status, expected);
    assert.equal(reply.headers.get("access-control-allow-origin"), null);
    assert.equal(reply.headers.get("cache-control"), "no-store");
    if (expected === 405) assert.equal(reply.headers.get("allow"), "POST");
  }
  assert.equal(f.calls.length, 0);
});

test("Turnstile must confirm the token, expected hostname and action", async () => {
  const f = createFixture();
  for (const verification of [
    { success: false },
    { hostname: "spoofed.test" },
    { action: "unrelated_action" },
  ]) {
    f.setVerification(verification);
    assert.deepEqual(await (await f.handle(request())).json(), {
      error: "spam",
    });
  }
  f.setVerification({
    success: false,
    "error-codes": ["invalid-input-secret"],
  });
  assert.equal((await f.handle(request())).status, 503);
  assert.equal(f.deliveries.length, 0);
});

test("verified provider acceptance creates a durable receipt and a plain-text notification", async () => {
  const f = createFixture();
  const body = payload({
    fields: {
      ...validFields,
      message: "<b>Header</b> <img src=x onerror=example>",
    },
  });
  const response = await f.handle(request(body), "127.0.0.1");
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), {
    status: "accepted",
    receipt: body.submissionId,
    replayed: false,
  });
  assert.equal(f.deliveries.length, 1);
  const [delivery] = f.deliveries;
  assert.equal(delivery.key, "hamid-project-enquiry/" + body.submissionId);
  assert.equal(
    delivery.payload.from,
    "Hamid Portfolio <portfolio@fixture.test>",
  );
  assert.deepEqual(delivery.payload.to, ["owner@fixture.test"]);
  assert.equal(delivery.payload.reply_to, validFields.email);
  assert.equal("html" in delivery.payload, false);
  assert.match(delivery.payload.text, /<img src=x onerror=example>/);
  assert.match(delivery.payload.text, /Entry: services/);
  assert.match(delivery.payload.text, /Received: 2026-11-20T09:00:00.000Z/);
  assert.equal(f.records.size, 1);
  const record = [...f.records.values()][0];
  assert.deepEqual(Object.keys(record).sort(), [
    "accepted",
    "digest",
    "firstSeen",
  ]);
  assert.match(record.digest, /^[a-f0-9]{64}$/);
  assert.doesNotMatch(JSON.stringify([...f.attempts.keys()]), /127\.0\.0\.1/);
});

test("replays and conflicting content never send again", async () => {
  const f = createFixture();
  const body = payload();
  assert.equal((await f.handle(request(body))).status, 201);
  const replay = await f.handle(request({ ...body, token: "expired" }));
  assert.deepEqual(await replay.json(), {
    status: "accepted",
    receipt: body.submissionId,
    replayed: true,
  });
  assert.equal(replay.status, 200);
  const conflict = await f.handle(
    request({ ...body, fields: { ...validFields, name: "New name" } }),
  );
  assert.equal(conflict.status, 409);
  assert.deepEqual(await conflict.json(), { error: "conflict" });
  assert.equal(f.deliveries.length, 1);
});

test("a simultaneous identical request returns pending while one email is in flight", async () => {
  const f = createFixture();
  let begin;
  let release;
  const started = new Promise((resolve) => {
    begin = resolve;
  });
  const waiting = new Promise((resolve) => {
    release = resolve;
  });
  f.setMail(async () => {
    begin();
    await waiting;
  });
  const body = payload();
  const sending = f.handle(request(body));
  await started;
  const duplicate = await f.handle(request(body));
  assert.equal(duplicate.status, 409);
  assert.deepEqual(await duplicate.json(), { error: "pending" });
  assert.equal(duplicate.headers.get("retry-after"), "5");
  release();
  assert.equal((await sending).status, 201);
  assert.equal(f.deliveries.length, 1);
});

test("failure or timeout yields no receipt and a retry sends the same idempotent payload", async () => {
  const f = createFixture();
  const body = payload();
  for (const fail of [
    () => new Response(null, { status: 503 }),
    () => Response.json({}),
    () => {
      throw new DOMException("provider timeout", "TimeoutError");
    },
  ]) {
    f.setMail(fail);
    const response = await f.handle(request(body));
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: "unconfirmed" });
  }
  f.advance(30);
  f.setMail(() => {});
  assert.equal((await f.handle(request(body))).status, 201);
  assert.equal(
    new Set(
      f.deliveries.map(({ key, payload }) => JSON.stringify({ key, payload })),
    ).size,
    1,
  );
  assert.deepEqual(
    f.warnings,
    Array.from({ length: 3 }, () => ["project_enquiry_failed", "delivery"]),
  );
});

test("a retry after lost receipt settlement does not cause a second provider acceptance", async () => {
  const f = createFixture();
  const body = payload();
  f.failConfirmation(true);
  const missing = await f.handle(request(body));
  assert.equal(missing.status, 503);
  assert.deepEqual(await missing.json(), { error: "unconfirmed" });
  f.advance(10);
  f.failConfirmation(false);
  assert.equal((await f.handle(request(body))).status, 201);
  assert.equal(f.deliveries.length, 2);
  assert.equal(f.accepted.size, 1);
  assert.deepEqual(f.deliveries[0], f.deliveries[1]);
});

test("limits by trusted address and global capacity before delivery", async () => {
  const f = createFixture();
  for (let attempt = 0; attempt < 12; attempt++) {
    const input = request(payload({ token: "bad" }), {
      "x-vercel-forwarded-for": "192.0.2." + attempt,
    });
    assert.equal((await f.handle(input, "127.0.0.1")).status, 422);
  }
  const blocked = await f.handle(request(), "127.0.0.1");
  assert.equal(blocked.status, 429);
  assert.equal(blocked.headers.get("retry-after"), "900");
  assert.equal(f.deliveries.length, 0);
  for (let attempt = 1; attempt <= 60; attempt++) {
    assert.equal((await f.handle(request(), "192.0.2." + attempt)).status, 201);
  }
  const capped = await f.handle(request(), "192.0.2.61");
  assert.equal(capped.status, 429);
  assert.equal(capped.headers.get("retry-after"), "3600");
  assert.equal(f.deliveries.length, 60);
});

test("agency company is required and agency-only choices are allowlisted", async () => {
  const fixture = createFixture();
  const missing = await fixture.handle(
    request(
      payload({
        fields: { ...validFields, service: "agency", company: "  " },
        source: "agency",
      }),
    ),
  );
  assert.equal(missing.status, 422);
  assert.match((await missing.json()).fields.company, /agency or company name/);
  const invalid = await fixture.handle(
    request(
      payload({
        fields: {
          ...validFields,
          service: "agency",
          company: "QA Studio",
          capability: "unexpected@visitor.test",
          stage: "constructor",
          collaboration: "unlimited",
          channel: "123456",
        },
        source: "agency",
      }),
    ),
  );
  assert.equal(invalid.status, 422);
  assert.deepEqual(Object.keys((await invalid.json()).fields).sort(), [
    "capability",
    "channel",
    "collaboration",
    "stage",
  ]);
  assert.equal(fixture.calls.length, 0);
  const general = validateEnquiry({
    ...validFields,
    audience: "agency",
    capability: "other",
  });
  assert.ok(general.ok);
  assert.equal(general.fields.audience, undefined);
  assert.equal(general.fields.capability, undefined);
});

test("agency acceptance produces a labeled plain-text notification on the existing delivery path", async () => {
  const fixture = createFixture();
  const body = payload({
    source: "agency",
    fields: {
      ...validFields,
      service: "agency",
      company: "  QA Studio  ",
      capability: "landing-page",
      stage: "design-approved",
      collaboration: "pilot",
      channel: "email",
      website: "qa-studio.test",
      message: "Build a responsive campaign page from the approved layout.",
    },
  });
  const response = await fixture.handle(request(body));
  assert.equal(response.status, 201);
  const [{ payload: mail }] = fixture.deliveries;
  assert.deepEqual(mail.to, [fixtureConfig.ENQUIRY_TO_EMAIL]);
  assert.equal(mail.subject, "Agency enquiry · QA Studio");
  assert.equal(mail.reply_to, body.fields.email);
  assert.equal(mail.html, undefined);
  for (const line of [
    "Entry: agency",
    "Agency or company: QA Studio",
    "Capability needed: Campaign landing page",
    "Project stage: Approved designs ready",
    "Preferred collaboration: Small paid pilot",
    "Preferred contact channel: Email",
    "Website: https://qa-studio.test/",
  ])
    assert.ok(mail.text.includes(line), line);
  const replay = await fixture.handle(request(body));
  assert.equal(replay.status, 200);
  assert.equal(fixture.deliveries.length, 1);
});
