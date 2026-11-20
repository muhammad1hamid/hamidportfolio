# AI discovery measurement for itshamid.com

Baseline prepared 20 November 2026. The prompt dataset contains 30 buyer questions. The [observation log](authority-observations.csv) has a header and awaits real runs in the consumer tools. Site indexing, property metrics and collaboration outcomes require their own evidence.

| Measure | Evidence | Baseline status |
| --- | --- | --- |
| Google generative AI exposure | Search Console Generative AI Search report and its page impression export | Owner property access required |
| AI referrals | GA4 Traffic acquisition plus the consented landing event as a separate diagnostic | Published tag transport testable locally. Property traffic awaiting measurement |
| Observed mentions | Identifiable Hamid/itshamid.com mention in a valid prompt response | No authorized consumer samples collected |
| Observed citations | A clicked or inspected result source pointing to the canonical site | No authorized consumer samples collected |
| Form acceptance | Fresh `generate_lead` event after accepted delivery response | Local fixture tests. Production provider and property verification required |
| Qualified referrals | Owner knows the enquiry outcome and has consented attribution or an independent self-report | Owner record required |

## Run and record

1. Choose a small weekly panel and use the exact [prompt wording](authority-prompts.csv). The market column is the intended audience. Record the actual region if the tool exposes it or set it to `unknown`. Use English and fresh independent sessions with comparable search and privacy settings. Record the product, model or search mode, date and time in UTC, authentication/personalization state, retrieval mode and repeat number. Start with at least three independent runs per chosen prompt and platform over the review period where feasible.
2. Record one observation per run. If an answer has several owned citations, repeat the run identifier and list one URL per row. Use the combination of prompt, platform, timestamp and repeat number to count that run once. A brand mention must resolve to this Hamid. Record a recommendation, identity accuracy and citation separately. Copy the exact destination, ignore tracking parameters when creating distribution groups, and record source order only when the interface explicitly orders the sources. Keep a short paraphrase or excerpt and a private redacted evidence path. Omit personal details and account screenshots from version control.
3. Count an eligible completed answer with no match as `not observed` for the tested field. Use `unknown` when a detail cannot be resolved. Use `not testable` where mode, terms or access prevent a usable run. Use `not measured` in a report that has no collection window. Enter `0 observed` only with a positive valid denominator. Keep evidence for conflicting answers and failed tests. Repeat checks with the same settings and annotate platform changes.

Use ChatGPT Search, Perplexity and Gemini when the operator can access the actual consumer mode and evidence. For Google, use the owner report for exposure and optional lawful manual observations of AI Overviews or AI Mode. A missing generated answer is a mode availability observation and is excluded from the valid-answer denominator. Bing's aggregate AI citations are another provider report. [Google Generative AI reports](https://support.google.com/webmasters/answer/16984139) · [Bing AI Performance](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/)

## Calculate

- **Mention rate** = valid distinct runs with verified brand mention ÷ valid distinct runs. **Site citation rate** uses valid runs with at least one verified owned-site source over the same denominator. Report date, platform, market and denominators separately.
- **Cited URL distribution** = counts for each normalized owned URL ÷ all verified owned-URL citations. Deduplicate repeated identical links within one answer. **Co-mention rate** = valid runs with both Hamid and a pre-registered peer ÷ valid runs in that peer panel. A repeated test panel is descriptive. Keep branded and discovery rates separate.
- **Referral sessions** = GA4 sessions whose source/medium matches an explicit recognized provider label. Report sessions with unrecognized/missing source as unknown where relevant. An event count and a session count can differ.
- **Accepted form events with AI signal** = `generate_lead` events with an observed source carried in the current document. Quote qualification only from owner records, with a defined acceptance rule and an approved aggregation or self-reported source. The analytics payload carries no form ID or customer identifier for inbox matching.

## Owner setup and review

1. Verify the canonical domain in [Search Console](https://search.google.com/search-console). Open Generative AI performance for Search and select a review window. Export impressions and landing pages, plus country and device breakdowns if useful. Keep Discover separate and avoid adding these impressions a second time to overall Search totals. Check representative routes with URL Inspection. The owner can review the generative AI inclusion setting and CDN/firewall logs for Googlebot and OAI-SearchBot. GPTBot and ChatGPT-User have different purposes. [Google Generative AI policy controls](https://support.google.com/webmasters/answer/16908024) · [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots)
2. With permission on GA4 stream `G-BXP2WE495G`, open Admin → Data display → Custom definitions and register event dimensions for `ai_source` and `ai_signal`. Use the standard Landing page dimension for journeys and Page path for the landing event. Its path comes from the sanitized page location. Verify with the existing GTM container using Tag Assistant, then inspect DebugView or Realtime on the canonical site after opt-in. The report is prospective from the registered collection window. [GA4 event dimensions](https://support.google.com/analytics/answer/14239696) · [GA4 DebugView](https://support.google.com/analytics/answer/7201382)
3. In Traffic acquisition filter Session source/medium for ChatGPT, Perplexity, Gemini, Copilot and Claude host labels actually observed in the property. Check exact referral domains and the ChatGPT `utm_source=chatgpt.com` value. Keep ordinary Google/Bing as their reported channel. Save a separate Exploration with Event name = `ai_referral_landing` and the two source dimensions. Use the existing Google tag to transport these events. [OpenAI publisher guidance](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq) · [GA4 Traffic acquisition](https://support.google.com/analytics/answer/12923437)
4. Mark `generate_lead` as a key event if it is absent and acceptance is the agreed conversion. Keep WhatsApp as an intent metric using `contact_click` filtered to `method=whatsapp`. Growth and agency emit a placement-specific `click_whatsapp` as well. Use one definition per report. Compare delivery and qualification in the owner’s inbox or CRM. Booking metrics wait for a configured provider and a genuine confirmation. [GA4 key event configuration](https://support.google.com/analytics/answer/13128484)

The code labels a known HTTPS referrer host or recognized subdomain and falls back to the one documented exact ChatGPT source tag. The referrer takes precedence. A tagged URL can be forwarded, so a tag provides an observed signal on arrival. Analytics consent is required. Query text and raw referring URLs are omitted from the custom landing event. The source is derived from the first document navigation and can carry through client navigation in that document. Referrer stripping, closed in-app views, new documents, consent and ad blockers limit coverage. Native GA4 attribution has separate collection rules. Check native automatic measurement and GA4 data redaction in the property. Keep prompt text and inbox details outside analytics. [GA4 data redaction](https://support.google.com/analytics/answer/13544947)

## Monthly report template

Use [metrics.csv](metrics.csv) for verified owner exports. Record the reporting window, comparable prior window, canonical property and any changes in consent, deployment or test setup.

| Measure | Source or platform | Window and scope | Observed count or numerator | Valid denominator | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Google generative Search impressions | GSC Search generative AI | Enter date, page, market and device if used | — | — | Not measured | Owner export |
| AI referral sessions | GA4 Traffic acquisition | Enter session source/medium filter and landing path | — | — | Not measured | Owner export |
| AI landing and accepted form events | GA4 Exploration | Enter source, signal and event name | — | — | Not measured | Owner export |
| Observed mention or citation rate | Prompt observations | Enter actual product, mode, market and panel | — | — | Awaiting runs | Redacted evidence |
| Qualified enquiries with AI evidence | Owner lead log | Enter qualification rule and attribution method | — | — | Not measured | Restricted report |

Add evidence for a change in cited URLs, a content correction or a performance issue. Record one follow-up, its evidence, owner and review date. Run a weekly prompt spot-check, a monthly export and decision review, and a quarterly review of these definitions.
