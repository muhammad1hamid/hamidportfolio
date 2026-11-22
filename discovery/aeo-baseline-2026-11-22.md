# AEO release and measurement baseline

22 November 2026 · itshamid.com · English query sample

## Applied changes

- The release includes the verified person, service and article entity fixes from the [SAGE audit](../docs/audit/sage-2026-11-21.md). It also includes the visually tested [How We Work timeline](../docs/audit/process-timeline.md).
- The new [search-readiness article](https://itshamid.com/insights/portfolio-search-readiness/) explains the 21 November audit and includes actual desktop and mobile homepage captures from 22 November. Growth Engine links to the article. The article links to the crawl evidence and uses the existing audit-specific WhatsApp enquiry path.
- The AI agent and workflow automation pages answer the buyer's routing decision. The [workflow guide](https://itshamid.com/insights/first-workflow-to-automate/#lead-routing-test) shows the observed duplicate and timeout states from the test delivery provider. The WhatsApp chatbot page points to the tested booking-request handover in the rules-based demo.
- The [Answers library](https://itshamid.com/answers/) includes three new search and AI visibility questions, with a direct answer and a relevant destination for each.

## Ten-query review panel

I ran the exact wording from [the prompt inventory](authority-prompts.csv) in Codex public web search before the release. The region was unknown. Ten queries returned source links. **No itshamid.com URL appeared among those returned links.** This is an observation about the selected tool, queries and result sets. Record actual consumer AI answer citations and search-engine indexing separately.

| Prompt ID | Buyer decision | Page to review | Source links returned |
| --- | --- | --- | ---: |
| B01 | Verify Hamid’s identity | `/about/` | 18 |
| B06 | Understand the Growth Engine scope | `/growth/` | 14 |
| D04 | Choose a landing page or full site | `/blog/landing-page-or-full-website/` | 21 |
| G01 | Choose the first search-readiness checks | `/insights/portfolio-search-readiness/` | 32 |
| G02 | Write a clearer service-page answer | `/growth/` | 30 |
| G03 | Check whether AI search tools cite a site | `/insights/portfolio-search-readiness/` | 19 |
| G05 | Measure WhatsApp enquiries accurately | `/insights/measure-whatsapp-enquiries/` | 21 |
| W01 | Choose a first workflow to automate | `/insights/first-workflow-to-automate/` | 26 |
| W03 | Plan WhatsApp human handover | `/whatsapp-ai-chatbot/` | 19 |
| W04 | Decide between an agent and a fixed workflow | `/ai-agents/` and `/workflow-automation/` | 20 |

The local [query evidence](../qa-output/aeo-release/search-sample.json) contains the exact queries and returned URLs. Use the existing [observation log](authority-observations.csv) for valid runs in consumer search modes and the [metrics log](metrics.csv) for verified property data.

## First review and monthly measurement

1. Inspect `/growth/`, `/web-development/`, `/whatsapp-ai-chatbot/` and the audit article in the verified Search Console property. Record the indexed status and Google-selected canonical. The live URL test helps verify access after changes. [URL Inspection](https://support.google.com/webmasters/answer/9012289)
2. In the first complete monthly window, export Google generative Search impressions by page if the report is available. Review cited URLs in Bing AI Performance. Record the window, page, country and device where applicable. Google AI impressions are part of Web search totals. [Search Console Generative AI report](https://support.google.com/webmasters/answer/16984139) · [Bing AI Performance](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/)
3. Repeat the ten prompts in consistent product and search modes. Record dated cited URLs and identity accuracy using the [measurement protocol](authority-methodology.md). Compare consented referral visits and contact actions with qualified enquiries confirmed by the owner. WhatsApp clicks measure the contact action. Received and qualified enquiries use inbox or CRM evidence.

The current baseline contains the public query sample, dated crawl evidence and controlled delivery and handover checks. Indexed status, property impressions, confirmed AI answer citations and qualified enquiries await the relevant owner reports or observed consumer runs.

## Release checks

The production build and TypeScript passed. The SEO suite verified 47 canonical pages and 83 image assets. The browser suite passed 42 checks, the discovery suite passed 7 groups and 20 demo cases, and the enquiry endpoint passed 12 controlled tests.
