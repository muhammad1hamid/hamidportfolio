# Hamid portfolio — AEO/GEO implementation

Status reviewed **15 November 2026**. Application implementation and full regression checks were completed on 5 October; the unchanged export was checked locally again on 15 November. This report supersedes the implementation status in the original roadmap and the 1 October SEO report.

The local site is available at **http://localhost:3000/**. Hamid selected **https://itshamid.com** as the production canonical origin on 19 November 2026. Branding remains Hamid, with ElevateX as a founder affiliation.

## Delivered experience

The site now contains **36 canonical, prerendered pages**, up from the previous 26. It retains the dark/orange design, rounded controls, shared Hero/About portrait, 18 portfolio examples, ten service pages, six project detail pages and both portrait testimonial recordings.

| Addition | What visitors can do |
| --- | --- |
| `/answers/` | Read 20 grouped buyer questions, open a specific answer by URL and follow relevant service/example links. Answers exist in the initial HTML. |
| `/plan/` | Choose a goal, pages, content and integrations; receive a scope recommendation; download their brief or deliberately open a WhatsApp draft. The site does not send the message. |
| `/demos/enquiry-assistant/` | Try a clearly labelled rules-based demonstration with supported answers, source links, unsupported-question handling and a human handover draft. It is not connected to an AI model or live inbox. |
| `/testimonials/` | Find both recordings and their individual watch pages. |
| `/testimonials/abdullah-abbasii/` and `/testimonials/usman/` | Open a prominent portrait player directly, without depending on switching the homepage carousel. |
| `/editorial-policy/` | Understand the distinction between demos, testimonials, planning guidance and measured results. |
| Three new guides | Compare a landing page with a full website, understand quote factors, and plan chatbot human handover. |

The existing agent/chatbot/workflow guide now links to the demonstration. `/web-development/`, `/landing-page-development/` and `/whatsapp-ai-chatbot/` have clearer fit, scope, decision and limitation content. Homepage, navigation, footer and contextual links make the new resources discoverable.

## Phase status

| Roadmap phase | Implemented locally | Remaining dependency |
| --- | --- | --- |
| 0 — Audience, questions and baseline | Buyer answer library, 15-prompt observation set and measurement template; owner-confirmed domain and demo status | Public search/citation/enquiry baseline requires the live property and real observations |
| 1 — Crawlability and mobile delivery | Canonicals, metadata, crawler rules, sitemap, static HTML, share images, preview directives, reduced mobile animation loading and public-release checker | Connect and publish the domain; verify live HTTPS, redirects, crawler access and search properties |
| 2 — Evidence and video | Three honest demo walkthroughs; two dedicated watch pages; conditional transcript/video metadata support | Reviewed transcripts/captions, durable thumbnail and verified publication date |
| 3 — Useful answers | Three strengthened service pages, 20 answers, three new guides and one expanded existing guide | Maintain content using actual buyer questions and confirmed service terms |
| 4 — Website planner | Working recommendations, text download, WhatsApp draft, keyboard/mobile support and readable method without JavaScript | No external account required |
| 5 — Bounded service demonstration | Working rules-based enquiry flow, source links, fallbacks and 20-case evaluation | A live model/inbox would be a separate integration; the current page clearly explains this limit |
| 6 — Identity and external references | Consistent identity/contact details, author links, editorial policy and two LinkedIn draft posts | Owner publication and genuine external references; no posts or outreach were sent |
| Ongoing measurement | Optional analytics events, AI-referrer classification, operational checklist and 30/60/90-day review template | Real analytics/verification IDs and public traffic; no automated reviews were scheduled |

## SEO and AI discovery changes

- Every canonical page has its own title, description, share image and self-referencing canonical URL. The sitemap uses the selected production origin and includes the new pages.
- Important text, links, answers and video embeds are present in exported HTML. Main explanations remain readable without JavaScript.
- Linked `Person`, `Organization`, `WebSite`, `WebPage`, `Service`, `BreadcrumbList` and article metadata are retained. `CreativeWork` describes the owner-confirmed demo projects. No invented ratings, addresses or client outcomes were added.
- Bridal House, Editing Julian and Qadeer Jewellers are explicitly described as **self-directed demo websites built by Hamid**. Their walkthroughs explain visible decisions and limitations without presenting them as commissioned client case studies.
- Public crawler access and generous snippet/image/video preview directives are configured. Access still needs checking on the eventual host/CDN.
- `llms.txt` includes the new resources as an experimental overview. It is not treated as a ranking mechanism.
- VideoObject and video-sitemap output are gated on real required metadata. Their absence today is intentional; the watch pages are already included in the ordinary sitemap.
- Analytics stays off without a real measurement ID. Custom interaction events omit free-text notes, questions and WhatsApp message values. Contact clicks are attempts, not confirmed leads.

These changes improve content clarity and technical access; they do not establish indexing, AI citations or rankings. Google's [generative AI guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) continues to emphasize useful content and ordinary search foundations. OpenAI documents [search and training crawlers separately](https://developers.openai.com/api/docs/bots). Guidance was checked again on 15 November 2026.

## Performance

The first-screen intro overlay was removed. Phones use native scrolling; GSAP/Lenis effects load only on suitable wide-screen devices with reduced motion disabled. Existing responsive WebP images, local fonts, explicit image geometry, lazy below-fold media and Brotli/gzip delivery are retained. A narrow-screen article/table overflow issue was fixed.

The latest **local lab** run used Chrome, a 390 × 844 viewport, 4× CPU throttling, 150 ms latency, 1.6 Mbps download and three cold browser contexts.

| Measure | Latest result, 15 November |
| --- | --- |
| LCP | 2.092 s median; individual runs 4.720 s, 2.092 s and 1.968 s |
| CLS | 0.0070 median |
| Transferred resources | 409,435 bytes median |
| Transferred JavaScript | 150,112 bytes median |
| Custom startup blocking measure | 468 ms median; not INP or a Lighthouse TBT score |

Against the 5 October pre-change capture, transferred resources fell from 455,800 bytes by approximately **10.2%**, and JavaScript from 200,078 bytes by approximately **25.0%**. Timing has varied across sessions: the 6 October post-change LCP median was 4.164 s. The latest faster median is not proof of a stable production speed improvement. One current run also exceeded 2.5 s. **Real-user Core Web Vitals, including INP, remain unmeasured.** Check the public host and field data after launch.

Evidence: `qa-output/performance-aeo-before.json`, `qa-output/performance-aeo-after.json` and `qa-output/performance-nov15-baseline.json`.

## Validation and limits

| Check | Result and date |
| --- | --- |
| Production build | Passed on 5 October; 36 canonical content pages exported |
| SEO/structure audit | 36 pages and 67 assets checked, zero recorded failures on 5 October; titles, descriptions, canonicals, schemas, internal links, no-JavaScript content, accessibility and widths 320/390/768/1440 |
| Existing browser regression | 36 checks passed, zero failures or runtime errors on 5 October |
| Discovery workflows | Six grouped checks passed on 5 October: planner export/reset, WhatsApp draft, demo fallback/handover, answer deep links, initial watch players and no-JavaScript explanations |
| Deterministic demo evaluation | 20/20 named scenarios passed on 5 October; not a language-model accuracy benchmark |
| Local availability | Home, answers, planner, demo and both watch pages returned HTTP 200 on 15 November |
| Public release check | The 15 November result covered the former domain. Use `npm run check:public` to validate the new domain against the exported build. |

Detailed test output is in `qa-output/seo-audit.json`, `report.json`, `discovery-audit.json` and `public-launch.json`. Existing screenshots were reviewed at mobile and desktop sizes. This continuation made documentation changes only; it did not invalidate the tested application export.

Google Drive controls its embedded player's internal accessibility and captions. The portfolio audit covers the surrounding controls, iframe names and fallback links, not full accessibility of Google's cross-origin player. Actual iPhone/Safari playback and the production CDN still need verification.

## Files added and extended

| Area | Main files |
| --- | --- |
| New routes | `app/answers/`, `app/plan/`, `app/demos/enquiry-assistant/`, `app/testimonials/`, `app/editorial-policy/` |
| Tools and navigation | `components/tools/WebsitePlanner.tsx`, `EnquiryDemo.tsx`, `AnswerNavigation.tsx`, `components/sections/ExploreFurther.tsx`, `components/seo/ServiceDecisions.tsx`, `app/discovery.css` |
| New content/data | `data/answers.json`, `demo-projects.json`, `experience-pages.json`, `experience.ts`, `guides.json`, `planner.ts`, `enquiry-demo.ts`, `testimonial-pages.ts`, `referral-source.ts` |
| Extended pages and metadata | `app/[service]/page.tsx`, `app/work/[slug]/page.tsx`, `app/blog/[slug]/page.tsx`, `data/articles.ts`, `data/articles.json`, `data/seo.ts`, `data/site.ts`, `app/robots.ts`, `app/sitemap.ts` |
| Shared presentation | Homepage, About, Work, Navigation, Footer, animation loading, analytics and responsive content styles |
| Build and checks | `scripts/seo-assets.mjs`, `postbuild-seo.mjs`, `video-sitemap.mjs`, `qa-discovery.mjs`, `check-public-launch.mjs`, `package.json`, `.env.example` |
| Handover | This report, `DISCOVERY-OPERATIONS.md`, `PUBLISHING-DRAFTS.md`, `discovery/prompts.json`, `discovery/metrics.csv`, README and existing publishing/setup guides |

Share-image coverage increased to 36 page-specific cards. Existing user work was preserved; no commit, push, external publication or account change was made.

## Remaining owner actions and withheld information

1. **Public launch:** connect `itshamid.com` to the portfolio host, publish `out/`, configure HTTPS/redirects/404 handling and rerun `npm run check:public`. Full steps are in `MANUAL-SEO-SETUP.md`.
2. **Search and measurement:** verify actual Google/Bing properties, submit the deployed sitemap and configure real analytics/optional IndexNow values. None are configured in the checked local environment. There is no public indexing/citation baseline yet.
3. **Video transcripts:** both supplied Drive recordings were accessible on 15 November. Upload to ElevenLabs for transcription was rejected by automatic approval review because sending the recordings, which may contain personal information, to that external service was not explicitly authorized. No successful transfer or transcription occurred. Explicit permission or owner-supplied reviewed transcripts is required before that step continues.
4. **Video publication metadata:** provide or verify the actual public upload date and a durable thumbnail before enabling video-specific search metadata. Drive creation/modified timestamps do not establish the original public publication date. Captions must be installed in a player/source that supports them; an unrelated VTT file cannot change a Drive iframe.
5. **Evidence and terms:** real prices, delivery commitments, client metrics, awards, physical office details and quotes were not invented. Add them only when the underlying facts are available. Review the prepared profile/posts before publishing externally.

The safe local implementation is complete. Public launch, account verification, accurate video text and ongoing real-world measurement remain explicit dependencies rather than completed claims.
