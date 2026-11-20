const sources = {
  "chatgpt.com": "chatgpt",
  "chat.openai.com": "chatgpt",
  "perplexity.ai": "perplexity",
  "copilot.microsoft.com": "copilot",
  "gemini.google.com": "gemini",
  "claude.ai": "claude",
} as const;

type AiSource = (typeof sources)[keyof typeof sources];

function referralSource(referrer: string): AiSource | undefined {
  try {
    const { hostname, protocol } = new URL(referrer);
    if (protocol !== "https:") return;
    for (const [domain, label] of Object.entries(sources))
      if (hostname === domain || hostname.endsWith(`.${domain}`)) return label;
  } catch {
    /* No usable referrer. */
  }
}

export function identifyReferral(referrer: string) {
  return referralSource(referrer) ?? "unattributed";
}

export function aiLandingSignal(referrer: string, search: string) {
  const source = referralSource(referrer);
  if (source) return { ai_source: source, ai_signal: "referrer" } as const;

  // ChatGPT Search adds this exact tag to outgoing source links.
  const tags = new URLSearchParams(search).getAll("utm_source");
  if (tags.length === 1 && tags[0] === "chatgpt.com")
    return { ai_source: "chatgpt", ai_signal: "tag" } as const;
}

export function browserAiLanding() {
  const navigation = performance.getEntriesByType("navigation")[0];
  const landing = new URL(navigation?.name || window.location.href);
  const signal = aiLandingSignal(document.referrer, landing.search);
  if (signal) return { signal, path: landing.pathname, origin: landing.origin };
}
