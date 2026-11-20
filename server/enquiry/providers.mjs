import {
  agencyEnquiryOptions,
  enquiryAction,
  enquiryServices,
} from "../../data/project-enquiry.mjs";

const receiptTTL = 86400;

// Keep the increment and expiration atomic across serverless instances.
const rateScript = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return { count, redis.call('TTL', KEYS[1]) }
`;

const claimScript = `
local existing = redis.call('GET', KEYS[1])
local now = tonumber(ARGV[2])
local record = existing and cjson.decode(existing) or {digest = ARGV[1], firstSeen = now}
if record.digest ~= ARGV[1] then return {'conflict'} end
if record.accepted then return {'accepted'} end
if record.leaseUntil and record.leaseUntil > now then return {'pending'} end
record.lease = ARGV[3]
record.leaseUntil = now + 45
local remaining = math.max(1, record.firstSeen + tonumber(ARGV[4]) - now)
redis.call('SET', KEYS[1], cjson.encode(record), 'EX', remaining)
return {'send', record.firstSeen}
`;

const settleScript = `
local existing = redis.call('GET', KEYS[1])
if not existing then return 0 end
local record = cjson.decode(existing)
if record.lease ~= ARGV[1] then return 0 end
record.lease = nil
record.leaseUntil = nil
if ARGV[2] == 'accepted' then record.accepted = true end
redis.call('SET', KEYS[1], cjson.encode(record), 'KEEPTTL')
return 1
`;

export function createEnquiryProviders(config, fetcher = fetch) {
  async function redis(...command) {
    const response = await fetcher(config.redisUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.redisToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
      redirect: "error",
      signal: AbortSignal.timeout(3500),
    });
    if (!response.ok) throw new Error("redis");
    const result = await response.json();
    if (result.error || !Object.hasOwn(result, "result"))
      throw new Error("redis");
    return result.result;
  }

  return {
    async rateLimit(key, limit, seconds) {
      const result = await redis("EVAL", rateScript, 1, key, seconds);
      if (
        !Array.isArray(result) ||
        !Number.isInteger(result[0]) ||
        !Number.isInteger(result[1])
      )
        throw new Error("rate");
      return result[0] > limit ? Math.max(1, result[1]) : 0;
    },
    async receipt(key) {
      const result = await redis("GET", key);
      return result === null ? null : JSON.parse(result);
    },
    async claim(key, digest, lease, now) {
      const result = await redis(
        "EVAL",
        claimScript,
        1,
        key,
        digest,
        now,
        lease,
        receiptTTL,
      );
      if (!Array.isArray(result)) throw new Error("receipt");
      return result;
    },
    async settle(key, lease, accepted) {
      return (
        (await redis(
          "EVAL",
          settleScript,
          1,
          key,
          lease,
          accepted ? "accepted" : "released",
        )) === 1
      );
    },
    async verify(token) {
      const response = await fetcher(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            secret: config.turnstileSecret,
            response: token,
          }),
          redirect: "error",
          signal: AbortSignal.timeout(4500),
        },
      );
      if (!response.ok) throw new Error("turnstile");
      const result = await response.json();
      if (
        result["error-codes"]?.some((code) =>
          [
            "invalid-input-secret",
            "missing-input-secret",
            "internal-error",
          ].includes(code),
        )
      )
        throw new Error("turnstile");
      return (
        result.success === true &&
        result.hostname === config.hostname &&
        result.action === enquiryAction
      );
    },
    async send(id, fields, source, firstSeen) {
      const service = enquiryServices[fields.service];
      const isAgency = fields.audience === "agency";
      const text = [
        isAgency
          ? "New agency partnership enquiry from itshamid.com"
          : "New project enquiry from itshamid.com",
        "",
        `Name: ${fields.name}`,
        `Reply email: ${fields.email}`,
        `Service: ${service}`,
        `Received: ${new Date(firstSeen * 1000).toISOString()}`,
        `Entry: ${source}`,
        `Reference: ${id}`,
        ...[
          [isAgency ? "Agency or company" : "Business", fields.company],
          ["Website", fields.website],
          ["Budget", fields.budget],
          ["Timeline", fields.timeline],
          ["Partnership details", fields.agency],
          ...Object.entries(agencyEnquiryOptions).map(
            ([field, { label, options }]) => [label, options[fields[field]]],
          ),
        ]
          .filter(([, value]) => value)
          .map(([label, value]) => `${label}: ${value}`),
        "",
        "Project details",
        fields.message,
      ].join("\n");
      const response = await fetcher("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.mailKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `hamid-project-enquiry/${id}`,
        },
        body: JSON.stringify({
          from: `Hamid Portfolio <${config.from}>`,
          to: [config.to],
          reply_to: fields.email,
          subject: isAgency
            ? `Agency enquiry · ${fields.company}`
            : `Project enquiry · ${service} · ${fields.name}`,
          text,
        }),
        redirect: "error",
        signal: AbortSignal.timeout(6500),
      });
      if (!response.ok) throw new Error("resend");
      const result = await response.json();
      if (typeof result.id !== "string" || !result.id.trim())
        throw new Error("resend");
    },
  };
}
