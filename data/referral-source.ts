export function identifyReferral(referrer: string): string {
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    const sources: Record<string, string> = {
      "chatgpt.com": "chatgpt",
      "chat.openai.com": "chatgpt",
      "perplexity.ai": "perplexity",
      "copilot.microsoft.com": "copilot",
      "gemini.google.com": "gemini",
      "claude.ai": "claude",
    };
    for (const [domain, label] of Object.entries(sources))
      if (host === domain || host.endsWith(`.${domain}`)) return label;
  } catch {
    /* No usable referrer. */
  }
  return "unattributed";
}
