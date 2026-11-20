import { createEnquiryEndpoint } from "../api/enquiry.mjs";

export const fixtureConfig = {
  ENQUIRY_ENABLED: "true",
  ENQUIRY_ORIGIN: "https://itshamid.com",
  TURNSTILE_SITE_KEY: "qa-public-key",
  TURNSTILE_SECRET_KEY: "qa-turnstile-secret-only",
  UPSTASH_REDIS_REST_URL: "https://example-fixture.upstash.io",
  UPSTASH_REDIS_REST_TOKEN: "qa-redis-token-only",
  ENQUIRY_HMAC_SECRET: "ab".repeat(32),
  RESEND_API_KEY: "qa-mail-secret-only",
  ENQUIRY_FROM_EMAIL: "portfolio@fixture.test",
  ENQUIRY_TO_EMAIL: "owner@fixture.test",
};

export const validFields = {
  name: "QA Visitor",
  email: "replies@visitor.test",
  service: "website",
  message: "I want to update a small business site.",
  website: "www.visitor.test",
};

export function createFixture(origin = fixtureConfig.ENQUIRY_ORIGIN, env = {}) {
  const records = new Map();
  const attempts = new Map();
  const accepted = new Map();
  const deliveries = [];
  const calls = [];
  const warnings = [];
  let tick = Date.parse("2026-11-20T09:00:00Z");
  let mail = () => {};
  let verification = {};
  let failConfirmation = false;
  const fetcher = async (url, options) => {
    calls.push(url);
    const payload = JSON.parse(options.body);
    if (url === fixtureConfig.UPSTASH_REDIS_REST_URL) {
      if (payload[0] === "GET") {
        const previous = records.get(payload[1]);
        return Response.json({
          result: previous ? JSON.stringify(previous) : null,
        });
      }
      if (payload[0] !== "EVAL" || payload[2] !== 1)
        throw new Error("unexpected redis command");
      const [, script, , key, ...args] = payload;
      if (script.includes("'INCR'")) {
        const [ttl] = args;
        const count = (attempts.get(key) ?? 0) + 1;
        attempts.set(key, count);
        return Response.json({ result: [count, ttl] });
      }
      if (script.includes("local remaining")) {
        const [digest, now, lease, ttl] = args;
        if (ttl !== 86400) throw new Error("unexpected receipt lifetime");
        const record = records.get(key) ?? { digest, firstSeen: now };
        if (record.digest !== digest)
          return Response.json({ result: ["conflict"] });
        if (record.accepted) return Response.json({ result: ["accepted"] });
        if (record.leaseUntil > now)
          return Response.json({ result: ["pending"] });
        Object.assign(record, { lease, leaseUntil: now + 45 });
        records.set(key, record);
        return Response.json({ result: ["send", record.firstSeen] });
      }
      if (script.includes("'KEEPTTL'")) {
        const [lease, state] = args;
        if (state === "accepted" && failConfirmation)
          return new Response(null, { status: 503 });
        const record = records.get(key);
        if (record?.lease !== lease) return Response.json({ result: 0 });
        delete record.lease;
        delete record.leaseUntil;
        if (state === "accepted") record.accepted = true;
        return Response.json({ result: 1 });
      }
      throw new Error("unexpected Redis script");
    }
    if (url === "https://challenges.cloudflare.com/turnstile/v0/siteverify") {
      return Response.json({
        success: payload.response === "qa-verified-token",
        hostname: new URL(origin).hostname,
        action: "project_enquiry",
        ...verification,
      });
    }
    if (url === "https://api.resend.com/emails") {
      const key = options.headers["Idempotency-Key"];
      deliveries.push({ key, payload });
      const override = await mail();
      if (override) return override;
      const body = JSON.stringify(payload);
      if (accepted.has(key) && accepted.get(key) !== body)
        return new Response(null, { status: 409 });
      accepted.set(key, body);
      return Response.json({ id: "qa-only-mail-acceptance" });
    }
    throw new Error("Fixture has no outbound network access");
  };
  return {
    handle: createEnquiryEndpoint({
      env: { ...fixtureConfig, ENQUIRY_ORIGIN: origin, ...env },
      fetcher,
      now: () => tick,
      logger: { warn: (...args) => warnings.push(args) },
    }),
    accepted,
    deliveries,
    calls,
    records,
    attempts,
    warnings,
    advance: (seconds) => {
      tick += seconds * 1000;
    },
    setMail: (value) => {
      mail = value;
    },
    setVerification: (value) => {
      verification = value;
    },
    failConfirmation: (value) => {
      failConfirmation = value;
    },
  };
}
