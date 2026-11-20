import { validEnquiryEmail } from "../../data/project-enquiry.mjs";

function cleanOrigin(value, production) {
  try {
    const url = new URL(value);
    const loopback = ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname);
    if (
      url.origin === value &&
      ((url.protocol === "https:" && !loopback) ||
        (url.protocol === "http:" && loopback && !production))
    )
      return url;
  } catch {
    // Invalid or missing configuration leaves the form unavailable.
  }
}

function redisEndpoint(value) {
  try {
    const url = new URL(value);
    if (
      url.protocol === "https:" &&
      url.hostname.endsWith(".upstash.io") &&
      !url.username &&
      !url.password &&
      !url.port &&
      !url.search &&
      !url.hash &&
      url.pathname === "/"
    )
      return url.origin;
  } catch {
    // Treat malformed origins as unavailable.
  }
}

export function loadEnquiryConfig(env = process.env) {
  if (env.ENQUIRY_ENABLED !== "true") return;
  const production = env.VERCEL_ENV === "production";
  const origin = cleanOrigin(env.ENQUIRY_ORIGIN?.trim(), production);
  const siteKey = env.TURNSTILE_SITE_KEY?.trim();
  const turnstileSecret = env.TURNSTILE_SECRET_KEY?.trim();
  const redisUrl = redisEndpoint(env.UPSTASH_REDIS_REST_URL?.trim());
  const redisToken = env.UPSTASH_REDIS_REST_TOKEN?.trim();
  const hmacKey = env.ENQUIRY_HMAC_SECRET?.trim();
  const mailKey = env.RESEND_API_KEY?.trim();
  const from = env.ENQUIRY_FROM_EMAIL?.trim();
  const to = env.ENQUIRY_TO_EMAIL?.trim();
  if (
    !origin ||
    !siteKey ||
    !turnstileSecret ||
    !redisUrl ||
    !redisToken ||
    !hmacKey ||
    !/^[a-f0-9]{64}$/i.test(hmacKey) ||
    !mailKey ||
    !from ||
    !to ||
    !validEnquiryEmail(from) ||
    !validEnquiryEmail(to) ||
    [siteKey, turnstileSecret, redisToken, mailKey].some((value) =>
      /\s/.test(value),
    ) ||
    (production &&
      (/^[1-3]x0{8,}/.test(siteKey) || /^[1-3]x0{8,}/.test(turnstileSecret)))
  )
    return;
  return {
    origin: origin.origin,
    hostname: origin.hostname,
    siteKey,
    turnstileSecret,
    redisUrl,
    redisToken,
    hmacKey,
    mailKey,
    from,
    to,
  };
}

// Only the public Turnstile site key crosses the server-to-browser boundary.
export function enquirySiteKey() {
  return loadEnquiryConfig()?.siteKey ?? null;
}
