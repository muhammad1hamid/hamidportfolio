# Selected Projects and Project Stories

## Design and source audit

The portfolio uses Next.js 16.3.6 App Router with static export. The work pages use the homepage’s charcoal background (`#101112`), raised surfaces (`#191b1d`), off-white type (`#f0f0ec`) and warm orange accent (`#ff8651`). Manrope and Instrument Serif carry the existing editorial hierarchy. The layouts use the shared page gutters, focus states, buttons and reduced-motion preference.

The supplied `portfolio_reference_motion_keyframes.jpg` was reviewed. Its large focal screen and smaller supporting previews informed the scale and sequencing of the Selected Work grid. Hamid’s actual website captures supply the visuals. The showcase uses a short hover scale and user-opened desktop/mobile previews. The layout also draws on image-led hierarchy and clearly separated project context, decisions and evidence. [Refokus work](https://www.refokus.com/work) · [Flowout project story](https://www.flowout.com/case-studies/cadmium) · [Webflow case-study guidance](https://webflow.com/blog/write-the-perfect-case-study)

## Changes by route

| Surface | Previous | Updated |
| --- | --- | --- |
| Homepage Selected Work | Four similar project cards | Wide Bridal House feature with an adjacent information rail, an asymmetric Ink Grail and Editing Julian pair, and a smaller Dylan Seedin feature |
| `/work/` | Eighteen compact rows and a single substantive category | Responsive capture grid, separate screenshot/story/source actions, archive-to-stories callout and filters driven by the actual evidence categories |
| `/case-studies/` | Six compact project-note cards | Project Stories index with authentic captures, visible evidence types and a direct explanation of how to read each story |
| Six `/work/[slug]/` routes | Short notes with a screenshot pair | Paired responsive captures with captions, two observable decisions, visitor journey, verified scope where available, evidence, related work and real contact actions |

The archive retains all 18 owner-supplied URLs. Elevate X’s URL returned an expiry notice on 20 November 2026, even though the server returned HTTP 200. Its archive entry and story use the existing saved captures and label the original URL. Dylan Seedin takes its homepage position. The Editing Julian and Elevate X display crops focus on the opening interface and omit the source pages’ logo, client and statistics rows. The supplied image files remain available for maintenance.

## Evidence inventory

The website registry holds stable slugs, original URLs, capture paths, feature order and public proof types. The checks below refer to the supplied screenshots and owner confirmation dates. Unresolved facts are marked **Unknown**. A 200 check establishes that the supplied URL served the named site on 20 November 2026.

| Project | Proof type | Development role | Client permission | Metrics | Asset rights | Approved testimonial | Project date | URL check | Evidence notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Bridal House | Self-directed demo | Hamid, confirmed | N/A for demo | Unknown | Unknown | Unknown | Unknown | 200 | Desktop and mobile captures. Hamid confirmed demo and role on 5 October 2026. |
| Ink Grail Tattoos | Experience notes | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown | 200 | Supplied captures and observable studio interface |
| Qadeer Jewellers | Self-directed demo | Hamid, confirmed | N/A for demo | Unknown | Unknown | Unknown | Unknown | 200 | Desktop and mobile captures. Hamid confirmed demo and role on 5 October 2026. |
| Classic Detailers | Portfolio preview | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown | 200 | Supplied desktop and mobile captures |
| Aurelia Beauty Lounge | Portfolio preview | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown | 200 | Supplied desktop and mobile captures |
| Carpe Diem Barbershop | Portfolio preview | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown | 200 | Supplied desktop and mobile captures |
| Dylan Seedin Photography | Experience notes | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown | 200 | Supplied captures and observable portfolio interface |
| Fortress Events Complex | Portfolio preview | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown | 200 | Supplied desktop and mobile captures |
| Infinity Salon | Portfolio preview | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown | 200 | Supplied desktop and mobile captures |
| Defence Marquee & Event Complex | Portfolio preview | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown | 200 | Supplied desktop and mobile captures |
| Bespoke Tailors Islamabad | Portfolio preview | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown | 200 | Supplied desktop and mobile captures |
| The Luxury Florist | Portfolio preview | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown | 200 | Supplied desktop and mobile captures |
| Iron Lodge Gym | Portfolio preview | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown | 200 | Supplied desktop and mobile captures |
| Davis — Designer Portfolio | Portfolio preview | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown | 200 | Supplied desktop and mobile captures |
| Editing Julian | Self-directed demo | Hamid, confirmed | N/A for demo | Unknown | Unknown | Unknown | Unknown | 200, www redirect | Desktop and mobile captures. Hamid confirmed demo and role on 5 October 2026. |
| M. Hamid — Design Services | Portfolio preview | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown | 200 | Supplied desktop and mobile captures |
| LuxWatch | Portfolio preview | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown | 200 | Supplied desktop and mobile captures |
| Elevate X | Experience notes | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown | Expiry notice | Saved desktop and mobile captures |

To add a client case study, collect the approved publication name, documented role and deliverables, explicit permission for public use, and rights to each caption, image or quotation. Any measured outcome needs its baseline, time window, source and calculation. Elevate X needs an owner-confirmed replacement live URL or domain renewal before its action can be labelled Live preview.

## Search and measurement

The existing archive, story index and six detail canonicals feed the static sitemap. The pages have distinct descriptions, classification-aware share cards, meaningful screenshot alternatives, and breadcrumb structured data. Existing demo CreativeWork markup identifies Hamid’s confirmed development contribution. Evidence notes render in HTML and link to the relevant service and next story. [Google Search Central content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) · [Google Search Central image guidance](https://developers.google.com/search/docs/appearance/google-images)

The existing consent flow gates `project_open`, `open_live_preview` and contextual `contact_click` events. Their project fields are the known slug, the page section, and destination type. The current GA4 page-view flow covers story visits.

## Implementation files

| Files | Role |
| --- | --- |
| `data/projects.ts`, `data/project-details.ts`, `data/demo-projects.json` | Archive, proof labels, story decisions, and owner-confirmed roles |
| `components/projects/Work.tsx`, `ProjectVisual.tsx`, `ProjectLinks.tsx` | Featured and archive presentations, screenshot dialog and separate actions |
| `app/work/page.tsx`, `app/case-studies/page.tsx`, `app/work/[slug]/page.tsx` | Archive, story index and six static story routes |
| `app/projects.css`, `app/layout.tsx`, `app/globals.css`, `app/refinements.css`, `app/content.css` | Responsive project system and retirement of its old layout and placeholder rules |
| `data/project-events.ts`, `data/google-analytics.ts`, `components/seo/Analytics.tsx` | Consent-gated interaction parameters |
| `data/seo.ts`, `scripts/seo-assets.mjs`, `public/images/share/` | Shared route registration, build-time evidence validation and regenerated social previews |
| `scripts/qa.mjs` | Browser regression, story media, evidence and consent checks |

## Verification

| Check | Observed result |
| --- | --- |
| `npm run build`, `npm run typecheck` | Passed. Static export registered 43 canonical pages. The workspace continues to emit its existing parent lockfile warning. |
| `npm run test:browser` | 39 passed with zero browser runtime errors. Coverage includes filters, image loads, keyboard focus, screenshot dialogs, story labels, CTAs, menus and analytics consent. |
| `npm run test:seo` | 43 pages and 76 referenced assets checked with zero failures, including canonical paths, metadata, structured data and accessibility. |
| `npm run test:discovery` | Seven checks and 20 demo cases passed. |
| `npm run test:origin` | All 17 checks passed, including the existing one-second HAMID hold, upward exit, skip controls and reduced-motion behavior. |
| `npm run test:performance` | Three cold Chrome runs at 390×844 with 4× CPU slowdown, 150 ms latency and 1.6 Mbps download. Median LCP was 1.008 s, CLS 0.0215, startup blocking 346 ms and transferred JavaScript 151,018 bytes. |
| Responsive Chrome | 54 successful renders across all nine updated pages at 320, 375, 390, 768, 1280 and 1440 px. The homepage, archive, story index and a detailed story also rendered their essential content with JavaScript disabled. |
| Google tag collection test | After test consent, the installed tag produced one request each for story open, live preview and contextual contact with the approved fields. Collection was intercepted before test events reached the property. |
| Prettier and Git whitespace check | Passed on the edited feature files and patch. The project has no separate lint command. |

Desktop and mobile comparison images were saved locally under `qa-output/selected-before-*.png` and `qa-output/selected-after-*.png`. The preview checks used Chrome, including mobile-sized viewports and automated axe accessibility checks. Physical-device, Safari and field measurements remain open.
