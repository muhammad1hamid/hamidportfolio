# Hamid portfolio: AEO/GEO roadmap

Prepared 5 October 2026. See `AEO-GEO-IMPLEMENTATION.md` for implementation status and `DISCOVERY-OPERATIONS.md` for launch dependencies. Hamid chose `itshamid.com` on 19 November 2026 and previously confirmed that the three candidate projects are self-directed demos. ElevateX is a founder affiliation.

## Recommendation

The highest-value content addition is a collection of **verified project case studies connected to client video transcripts and useful service answers**. Start by improving existing pages. Give prospective clients evidence of what Hamid actually contributed and give search systems clear, attributable source material.

This priority is an editorial recommendation based on the current project, not a measured ranking prediction. Google emphasizes useful first-hand material in its [generative AI optimization guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide). No implementation guarantees that an AI system will cite or recommend the site.

AEO means making the site useful when someone needs a direct answer. GEO concerns discovery and citation in generated answers. Both depend on accessible, reliable content and overlap with ordinary SEO.

## Starting point

The repository and the 1 October implementation report show:

| Already present | Next opportunity |
| --- | --- |
| 26 prerendered canonical pages; ten service pages | Deepen the services Hamid can substantiate before adding more categories |
| 18 portfolio entries and six project detail pages | Existing details describe visible features and journeys; verify contribution, decisions and outcomes |
| Three practical articles | Extend with original examples and evidence where available |
| Two portrait Drive testimonials | Add reviewed transcripts, captions and individual watch pages |
| Person/Organization/Service/article metadata, sitemap and crawler rules | Validate these on the final public host and extend only where appropriate |
| Prepared analytics, verification and IndexNow | Connect actual owner accounts after public launch |
| Experimental llms.txt | Low maintenance priority; not a Google visibility lever |

Localhost is only a local preview. The upgraded build needs a publicly accessible HTTPS destination to be discovered externally. A final domain, ownership verification and live indexing were not established by this review.

The previous slow-mobile test recorded median LCP of 6.56 seconds. That historical local lab result is an unresolved performance signal, not a fresh measurement or a field Core Web Vitals assessment. See `SEO-REPORT.md` for conditions and limitations.

## Phases and dependencies

Suggested delivery cadence: approximately four to six working weeks for the initial content, technical work and tool, followed by reviews at 30, 60 and 90 days after public launch. These are planning estimates assuming content/access are available, not indexing deadlines or ranking promises. Templates can be prepared while evidence is collected.

### Phase 0 — Choose the audience and establish a baseline

**Priority:** first. **Indicative effort:** 1–2 working days.

- Start with business websites and landing pages for businesses/agencies, where the portfolio already supplies examples.
- Develop the WhatsApp/AI automation cluster with clearly identified demonstrations until actual delivery evidence is available. Do not imply the existing website projects prove deployed automation work.
- Map approximately 20 genuine buyer questions to existing services, articles and project pages. This is a research set, not an instruction to produce 20 new URLs.
- Capture current indexed pages, available search data, enquiries and 15 representative AI/search prompts. If there is no public property/data, record “unavailable” rather than zero.
- Collect facts for three candidate projects: brief, Hamid's exact role, delivery date, scope, decisions, limitations and available outcome evidence.

**Deliverable:** one audience/question map, baseline sheet and evidence checklist. **Done when:** every proposed page has a distinct buyer need and an identified factual source.

### Phase 1 — Public discovery and fast mobile delivery

**Priority:** required for external visibility. **Indicative effort:** 2–4 working days, plus owner/domain dependencies.

- Use one owner-selected HTTPS origin; check canonical links, redirects, sitemap, real 404 responses and access from a signed-out browser.
- Verify Search Console and Bing Webmaster Tools with real credentials/verification values. Submit the sitemap after deployment; use the prepared IndexNow workflow only after confirming the deployed build.
- Check Google Search Console's Search generative AI setting is eligible for inclusion. Google's current documentation describes inclusion as the default, subject to property inheritance; inspect the actual property. [Google's control documentation](https://support.google.com/webmasters/answer/16908024).
- Verify search crawlers can reach the host through its firewall/CDN. OAI-SearchBot controls OpenAI search crawling; GPTBot is a separate training preference, not a requirement to enable search. Existing robots access alone does not validate live host access. [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots).
- Trace the current hero paint/startup delay on the final deployment. Prioritize rendering the portrait and main text, reduce unnecessary startup work and preserve the existing visual identity.
- Recheck narrow mobile screens, keyboard use and reduced motion alongside desktop.

**Deliverable:** a public, crawlable release and repeatable performance baseline. **Done when:** critical pages return correctly and can be inspected by search tools; mobile fixes have comparative evidence. Engineering targets are LCP ≤2.5 s, INP ≤200 ms and CLS ≤0.1 at the 75th percentile of real visits, when enough field data exists. Lab checks guide development but do not establish that field pass. [Web Vitals thresholds](https://web.dev/articles/vitals).

### Phase 2 — Publish evidence of the work

**Priority:** strongest content opportunity. **Indicative effort:** 4–7 working days once evidence is supplied.

- Upgrade three existing `/work/` pages first. Bridal House, Editing Julian and Qadeer Jewellers are candidates; choose based on available evidence, not assumptions about client relationships.
- Each study explains the actual brief, Hamid's contribution, key decisions, real mobile/desktop screenshots, result and lessons.
- Use numerical results only with their source, dates, baseline and measurement method. A verified functional outcome is useful when sales/conversion data does not exist.
- Add two individual video watch pages, proposed at `/testimonials/abdullah-abbasii/` and `/testimonials/usman/`.
- Review the actual recordings; publish accurate transcripts and captions. Label any English translation separately from the original speech. Do not infer quotes from names or roles.
- Preserve the portrait player and homepage carousel. A watch page puts its own video prominently on initial load, so discovery does not depend on switching carousel slides.
- Verify durable player/media URLs, thumbnails, actual duration and publication information before adding appropriate VideoObject data and a video sitemap. Test whether the current Drive setup is sufficient; choose a more controllable player/host only if it is not.

Google recommends dedicated watch pages for video features and describes thumbnail and accessibility requirements; a successful embed alone does not establish video indexing. [Video discovery guidance](https://developers.google.com/search/docs/appearance/video).

**Deliverable:** three upgraded case studies, two video pages and lightweight homepage links to them. **Done when:** every quote/result is traceable, text exists in rendered HTML, media works on mobile and the pages link to relevant services. Client identities supplied by the owner remain owner-supplied until independently corroborated.

### Phase 3 — Answer the questions that lead to projects

**Priority:** high. **Indicative effort:** 3–5 working days.

- Improve `/web-development/`, `/landing-page-development/` and `/whatsapp-ai-chatbot/` first.
- Put a concise, useful answer near the beginning, then explain fit, scope, choices, constraints and supporting examples. Answer length follows the question; there is no magic word count for AI citations.
- Cover costs through real scope factors and third-party charges. Publish Hamid's prices or delivery ranges only after he supplies them.
- Link each answer to the relevant evidence, detailed guide and next action. Use comparison tables where they help people decide.
- Expand the existing agent/chatbot/workflow article instead of making a competing article for the same intent.
- Add a small number of distinct guides after confirming demand. Initial candidates: landing page versus full website; what affects a website quote; planning WhatsApp FAQ and human handover.
- Add a short editorial/source note, author identity and real update date. Refresh dates only after meaningful review or change.

Suggested buyer questions:

| Question | Best initial home |
| --- | --- |
| Do I need a landing page or a full website? | Landing-page service plus a detailed comparison guide |
| What affects the cost of my website? | Web-development service and scope guide |
| Who owns the domain, hosting and finished website? | Service/process answer using Hamid's actual terms |
| What do I need to provide before work starts? | Existing website-brief article |
| Can an agency hire Hamid for part of a project? | Service/About content, after confirming actual working terms |
| Can a WhatsApp chatbot hand over to a person? | Existing WhatsApp service with a demonstration |
| What happens when an AI answer is uncertain? | Demo documentation and relevant service |

**Deliverable:** three stronger service pages, improved existing guidance and up to three distinct new guides if justified. **Done when:** a visitor can make the relevant decision without encountering vague claims or duplicated pages.

Visible FAQs remain useful for readers. They should not be sold as a Google FAQ rich-result tactic: Google documents that feature's retirement starting 7 May 2026. [Search documentation update](https://developers.google.com/search/updates#may-2026).

### Phase 4 — Build one memorable, useful interactive feature

**Priority:** after evidence and core answers. **Indicative effort:** 3–5 working days.

Recommended feature: **“Plan my website”**, extending the portfolio's existing brief/download flow.

- Ask about the business goal, audience, required pages, integrations and available content.
- Produce a plain-language scope checklist, useful questions to resolve and links to relevant examples/services.
- Let the visitor download the brief or explicitly choose to open WhatsApp with the summary.
- Keep the tool keyboard accessible and comfortable on a phone. Put its method and an example result in public HTML so the useful explanation is accessible without completing the tool.
- Do not fabricate a quote or guaranteed timeline. If prices are introduced later, expose the real assumptions and exclusions.

**Deliverable:** one practical tool with explanatory content. **Done when:** it produces useful, accurate outputs for representative briefs and never implies a message was sent when it was only downloaded/prepared.

An optional later addition is a bounded “Ask Hamid's work” assistant that answers from published pages and links its sources. Its purpose would be visitor assistance; adding a chatbot by itself does not establish external AI visibility. It should follow, not precede, the content it would rely on.

### Phase 5 — Demonstrate AI services honestly

**Priority:** conditional on making AI services a business focus. **Indicative effort:** 3–5 working days for a narrowly scoped first demo.

- Create one inspectable demonstration: approved business FAQs, enquiry capture and human handover.
- Label it as a demonstration rather than client work. Include examples of unsupported requests and how it responds.
- Publish a short walkthrough, architecture explanation at an appropriate reader level and a reproducible evaluation note.
- Test a representative set of questions; report the actual count, method, failures and date. Do not imply a small demo predicts production accuracy.
- Use sample data. Keep API secrets on a server if a live model is used; the current static site would need a separate backend or hosted service for this feature.

**Deliverable:** one credible demo page linked from the relevant AI service. **Done when:** visitors can understand both its useful behavior and its limits.

### Phase 6 — Consistent identity and legitimate external references

**Priority:** begin during content delivery; continue monthly.

- Keep Hamid/Muhammad Hamid, role, portfolio URL and contact details consistent across the site and supplied social profiles.
- Strengthen About with factual working approach and experience; connect authored guides and project pages back to it.
- Prepare two LinkedIn project breakdowns from the verified studies, linking to the complete explanations.
- Seek genuine client references, project credits or interviews where appropriate. Hamid would approve and send any outreach; no messaging or profile changes are performed by this plan.
- Add reusable technical examples or a public repository only where there is actual original material and permission to publish it.

**Deliverable:** consistent profile copy and publishable project material. **Done when:** outside references accurately describe Hamid's role. Exact ranking/citation effects of any individual reference are not predictable.

## Measurement from launch onward

Set the baseline before launch where possible; review weekly for operational problems and compare 30-, 60- and 90-day periods for trends. Start with free owner tools; buy a specialist tracking subscription only if it solves a demonstrated need.

| Layer | Measure | Interpretation |
| --- | --- | --- |
| Discovery | Important indexed URLs, crawl failures, selected canonicals | Index eligibility is a prerequisite, not evidence of recommendation |
| Google AI visibility | Generative AI report impressions by page, country and device | Separate from claims about clicks or qualified leads |
| Microsoft AI visibility | Citations, cited pages and sampled grounding queries | Coverage is Microsoft's supported surfaces, not every AI engine |
| Visits | Identifiable AI referral sessions and landing pages | Referrer loss/in-app behavior makes this an incomplete count |
| Enquiry intent | WhatsApp/contact clicks with source page | A click is an attempt, not a confirmed lead |
| Business outcome | Owner-confirmed qualified enquiries and projects | Main commercial success measure |

Google's current [Generative AI performance report](https://support.google.com/webmasters/answer/16984139) documents AI Overviews/AI Mode impressions; properties with insufficient data may not show a report. Bing's [AI Performance documentation](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/) describes citations across Copilot, Bing summaries and selected integrations. Neither is a universal AI ranking score.

For a small manual observation set, record 15 consistent prompts across selected search-enabled AI tools. Save date, tool/mode, country/language, prompt, cited URLs and whether Hamid's actual role is represented correctly. Separate branded questions from non-branded discovery questions. Keep prompt checks supplemental: personalized and variable responses do not establish population-level share of visibility.

At each monthly review, improve the pages that show useful impressions or buyer engagement, investigate accessible-but-unindexed priority pages, correct inaccurate claims and choose the next topic from actual questions. If visibility exists without enquiries, improve fit, proof and the contact journey before adding more pages.

## Design direction

Keep the existing charcoal/orange palette, rounded controls and portrait identity. On the homepage, add compact entry points to a verified project, a client video and the planning tool. Put longer explanations on their own pages. On mobile, use a readable single column, usable transcripts, uncluttered media controls and a contact button that does not cover content. Desktop can pair evidence with screenshots without shrinking the text.

## Inputs needed for implementation

1. Final public domain/hosting decision and owner access for verification.
2. Exact role, brief, dates and any measured outcomes for three projects.
3. Accurate transcript review and verified video publication details.
4. Actual service terms, price ranges and timelines if they are to be published.
5. The priority buyer group: agency partners, local businesses or another chosen audience.

These are factual dependencies, not a reason to delay templates, local layout work or technical diagnostics.

## Low-value additions to deprioritize

- Mass-produced city pages, repeated answers and large volumes of generic articles.
- More animation before the existing mobile startup problem is understood.
- Hidden keyword blocks, invented client metrics, manufactured mentions or ratings.
- A paid “AI score” treated as evidence of enquiries or revenue.
- Rebuilding llms.txt or adding special markup as the central strategy. Google explicitly says it does not use llms.txt for visibility/rankings. [Google's myth guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide#mythbusting-generative-ai-search-what-you-dont-need-to-do).

The first implementation batch should therefore be: **public discovery/performance work, three verified case studies, two transcript/watch pages and three improved service pages**. Add the planning tool and an AI demonstration after that base is useful and measurable.
