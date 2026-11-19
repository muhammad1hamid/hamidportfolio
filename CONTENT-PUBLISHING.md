# Content maintenance

## Sources of truth

- `data/experience-pages.json`: metadata/share-card/sitemap registration for the answer library, tools, watch pages and content standards.
- `data/answers.json`: the 20 visible buyer questions and contextual destinations. Avoid publishing separate URLs for near-identical questions.
- `data/guides.json`: additional decision guides with optional comparison tables and internal references; merged with existing articles by `data/articles.ts`.
- `data/demo-projects.json`: owner-confirmed self-directed demo status, development role and visible interface commentary. Do not relabel demos as client results.
- `data/testimonial-pages.ts`: watch-page slugs and optional verified transcripts/video metadata. VideoObject and video-sitemap output wait for actual thumbnail/publication data.
- `data/planner.ts` and `data/enquiry-demo.ts`: transparent planning and demo rules. Changes to these rules require meaningful interaction/edge-case checks.

- `data/services.json`: ten substantial service scopes. A new entry must include its own problem, audience, features, process, example, integration considerations, FAQ answers and related service slugs.
- `data/articles.json`: articles with stable slugs, actual publication/update dates, category, introduction, sections and source links. Categories are maintained in `data/articles.ts`; empty categories do not produce indexable pages.
- `data/projects.ts`: supplied website names, links, descriptions and captures. `data/project-details.ts` adds a publishable experience overview. Current detail pages are the six entries with actual notes.
- `data/site.ts`: factual identity, contact links, canonical origin and staging setting.
- `data/seo.ts`: shared metadata, entity graph and the sitemap's canonical route registry. New service/article/detail entries feed this registry automatically.

After an edit, run `npm run build`. This regenerates the static pages, metadata, sitemap, page share images, responsive images, llms overview and host rules. There is no runtime CMS or dynamic server to update an already-deployed export. Publish a fresh build when appropriate. `npm run dev` is for editing; production search files and host rules should be checked against `npm start` after a build.

## Search intent map

| Route | Primary visitor need | Related topics |
| --- | --- | --- |
| `/` | Identify Hamid and assess the work | Independent developer, Pakistan, remote collaboration |
| `/web-development/` | Commission a business website | Responsive design, website brief, enquiries |
| `/landing-page-development/` | Launch a focused offer/campaign page | Messaging, genuine proof, enquiry measurement |
| `/ai-automation/` | Scope AI-assisted operational work | Documents, approved replies, evaluation |
| `/whatsapp-ai-chatbot/` | Plan customer conversations on WhatsApp | Approved FAQs, leads, human handover |
| `/restaurant-whatsapp-automation/` | Structure restaurant enquiries/order requests | Menu source, availability, staff confirmation |
| `/ai-receptionist/` | Route front-desk enquiries | Callbacks, appointment requests, channel feasibility |
| `/website-chatbot/` | Help visitors find answers and enquire | Knowledge source, accessibility, existing site |
| `/ai-agents/` | Assess bounded tool-using AI | Permissions, human approvals, pilot evaluation |
| `/workflow-automation/` | Connect a predictable process | Forms, routing, duplicate checks, retries |
| `/business-dashboards/` | See operational information clearly | Data definitions, roles, freshness |
| `/work/` | Inspect supplied website examples | Live demos, mobile/desktop captures |
| `/case-studies/` | Read verified experience notes | Features and visitor journeys |
| `/blog/` | Make project-planning decisions | Website briefs, agents/workflows, lead handling |

Pakistan is the factual base; Islamabad/Rawalpindi are mentioned only as remote service markets. Do not create near-duplicate city pages or invent an office.

## Verified case-study template

This template is for future editorial use, not an unfinished public page. Omit sections whose facts are unavailable.

1. **Project identity:** approved name, live URL, permission to publish, date if verified.
2. **Challenge:** the client's actual brief or problem, with its source.
3. **Role and scope:** exactly what Hamid contributed; distinguish design, development, integration and collaboration.
4. **Solution:** decisions made and why they addressed that brief.
5. **Implementation:** verified tools, architecture and integration behaviour. Never infer a stack from a screenshot.
6. **Screenshots:** actual desktop/mobile captures with descriptive text alternatives.
7. **Result:** demonstrable outcome. Include numbers only with the baseline, measurement period and evidence. Otherwise describe a verified functional outcome.
8. **Lessons:** a real implementation lesson supplied by the builder, not invented personal experience.
9. **Author and related service:** link to Hamid's About page and the most relevant service.
10. **CTA:** a natural invitation to discuss a similar need.

The six overviews cover visible features and visitor journeys. Three also include Hamid's confirmed self-directed development contribution. AI service examples and workflow illustrations are not labelled as completed client projects. Video captions/transcripts should be added only from the supplied recordings and reviewed for accuracy.
