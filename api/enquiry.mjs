import { createHmac, randomUUID } from "node:crypto";
import { isIP } from "node:net";
import {
  enquirySource,
  maxEnquiryBytes,
  validateEnquiry,
} from "../data/project-enquiry.mjs";
import { loadEnquiryConfig } from "../server/enquiry/config.mjs";
import { createEnquiryProviders } from "../server/enquiry/providers.mjs";

const receiptId =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const prefix = "hamid:enquiry:v1";

function response(status, body, headers = {}) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex",
      ...headers,
    },
  });
}

async function boundedJson(request) {
  const length = request.headers.get("content-length");
  if (length !== null && Number(length) > maxEnquiryBytes)
    return { tooLarge: true };
  const reader = request.body?.getReader();
  if (!reader) return {};
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxEnquiryBytes) {
        void reader.cancel().catch(() => {});
        return { tooLarge: true };
      }
      chunks.push(value);
    }
    const json = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(
        Buffer.concat(chunks, size),
      ),
    );
    return json && typeof json === "object" && !Array.isArray(json)
      ? { json }
      : {};
  } catch {
    return {};
  } finally {
    reader.releaseLock();
  }
}

// A runtime on Vercel uses the platform's header. The local preview passes
// the socket address directly and ignores client-supplied forwarded headers.
export function createEnquiryEndpoint({
  env = process.env,
  fetcher = fetch,
  now = Date.now,
  logger = console,
} = {}) {
  return async function handle(request, localAddress = "") {
    if (request.method !== "POST")
      return response(405, { error: "method" }, { Allow: "POST" });
    const config = loadEnquiryConfig(env);
    if (!config) return response(503, { error: "unavailable" });
    const fetchSite = request.headers.get("sec-fetch-site");
    if (
      request.headers.get("origin") !== config.origin ||
      (fetchSite && fetchSite !== "same-origin")
    )
      return response(403, { error: "origin" });
    const contentType = request.headers
      .get("content-type")
      ?.split(";")[0]
      .trim()
      .toLowerCase();
    const encoding = request.headers.get("content-encoding");
    if (
      contentType !== "application/json" ||
      (encoding && encoding !== "identity")
    )
      return response(415, { error: "content_type" });

    const { tooLarge, json } = await boundedJson(request);
    if (tooLarge) return response(413, { error: "too_large" });
    if (
      !json ||
      typeof json.submissionId !== "string" ||
      !receiptId.test(json.submissionId)
    )
      return response(400, { error: "request" });
    if (json.companyFax !== "") return response(422, { error: "spam" });
    const validation = validateEnquiry(json.fields);
    if (!validation.ok)
      return response(422, { error: "validation", fields: validation.errors });

    const id = json.submissionId.toLowerCase();
    const source = enquirySource(json.source);
    const hash = (content) =>
      createHmac("sha256", Buffer.from(config.hmacKey, "hex"))
        .update(content)
        .digest("hex");
    const digest = hash(JSON.stringify({ fields: validation.fields, source }));
    const key = `${prefix}:receipt:${id}`;
    const forwarded =
      request.headers.get("x-vercel-forwarded-for")?.trim() ?? "";
    const address = env.VERCEL === "1" ? forwarded : localAddress;
    const client = isIP(address) ? address : "unknown";
    const clock = Math.floor(now() / 1000);
    const providers = createEnquiryProviders(config, fetcher);
    const lease = randomUUID();
    let owned = false;
    let step = "receipt";
    const accepted = (replayed) =>
      response(replayed ? 200 : 201, {
        status: "accepted",
        receipt: id,
        replayed,
      });
    const pending = () =>
      response(409, { error: "pending" }, { "Retry-After": "5" });
    const limited = (delay) =>
      response(429, { error: "rate_limit" }, { "Retry-After": String(delay) });
    try {
      const prior = await providers.receipt(key);
      if (prior && prior.digest !== digest)
        return response(409, { error: "conflict" });
      if (prior?.accepted === true) return accepted(true);
      if (prior?.leaseUntil > clock) return pending();

      step = "rate";
      const wait = await providers.rateLimit(
        `${prefix}:attempt:${hash(client)}`,
        12,
        900,
      );
      if (wait) return limited(wait);
      step = "turnstile";
      if (
        typeof json.token !== "string" ||
        json.token.length < 1 ||
        json.token.length > 2048 ||
        !(await providers.verify(json.token))
      )
        return response(422, { error: "spam" });

      step = "claim";
      const [state, firstSeen] = await providers.claim(
        key,
        digest,
        lease,
        clock,
      );
      if (state === "accepted") return accepted(true);
      if (state === "conflict") return response(409, { error: "conflict" });
      if (state === "pending") return pending();
      if (state !== "send" || !Number.isFinite(firstSeen))
        throw new Error("claim");
      owned = true;

      step = "capacity";
      const capacityWait = await providers.rateLimit(
        `${prefix}:delivery-cap`,
        60,
        3600,
      );
      if (capacityWait) return limited(capacityWait);

      step = "delivery";
      await providers.send(id, validation.fields, source, firstSeen);
      step = "confirm";
      if (!(await providers.settle(key, lease, true)))
        throw new Error("receipt");
      owned = false;
      return accepted(false);
    } catch {
      logger.warn("project_enquiry_failed", step);
      return response(503, { error: "unconfirmed" });
    } finally {
      if (owned) {
        try {
          await providers.settle(key, lease, false);
        } catch {
          logger.warn("project_enquiry_failed", "release");
        }
      }
    }
  };
}

const handle = createEnquiryEndpoint();
export default { fetch: (request) => handle(request) };
export { handle as handleEnquiry };
