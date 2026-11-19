# Baseline audit — Hamid portfolio

Audited 30 September 2026, before SEO implementation. The supplied ElevateX brief is applied to Hamid's independent portfolio, as confirmed by the owner. Local preview only; no publication authorized.

## Existing architecture

Next.js 16.3.6 App Router, React 19, TypeScript, static export with trailing slashes. Two public pages: `/` and `/work/`. Content is prerendered, including accordion answers. GSAP/Lenis animations, deferred Three.js decoration, 18 supplied live website projects, genuine desktop/mobile captures, two Google Drive video testimonials. Existing local server serves exported HTML and byte ranges. No analytics, authenticated application, database or private API is present.

## Findings before changes

| Area | Finding | Action |
| --- | --- | --- |
| Entity | Hero is visually clear but does not identify Hamid's work in its introduction | Explain independent web development and AI automation in Pakistan |
| Architecture | No dedicated service, about, contact, article or project detail URLs | Create useful prerendered pages with shared navigation |
| Metadata | Homepage/work have metadata; work copy implies unverified AI projects | Match metadata to actual website archive; unique metadata on new pages |
| Schema | Only an unlinked Person object | Link Person, professional brand Organization, WebSite, WebPage, Service, BreadcrumbList and BlogPosting |
| Crawlability | Wildcard robots allows resources; sitemap has only two URLs | Explicit supported crawler rules and content-driven sitemap |
| Canonicals | Base URL defaults to previous Sites hostname; no supplied replacement | Validate origin; keep configured domain; document public domain requirement |
| Duplicates | Local server serves slashless and index.html variants with 200 | Permanent one-step normalization and portfolio alias |
| 404 | Useful return-home link but lacks dedicated search metadata | Noindex plus useful service/contact links |
| Proof | Real captures and supplied testimonials; six verified feature summaries only in dialogs | Publish six project experience overviews without invented results or stacks |
| Measurement | No verification or GA configuration | Optional environment-based setup, disabled without real IDs |
| Images/fonts | WebP captures already present; desktop images not responsive; font CSS includes unused scripts | Generate smaller responsive assets and Latin font declarations |
| Accessibility | Existing browser checks cover widths, focus, reduced motion and dialogs | Preserve checks; test new pages at mobile/desktop widths with axe |
| Deployment | Static output; localhost cannot be indexed; hosting redirects/HTTPS require host setup | Prepare configuration and owner checklist; do not publish |

## Content and claim boundaries

Preserve Hamid's branding, portrait, orange/dark design, animations, user-supplied 30+ projects / 10+ clients and founder affiliation with ElevateX. Do not infer a physical Islamabad/Rawalpindi office, project results, implementation stacks, pricing, guaranteed delivery time, transcripts or completed AI deployments. Service pages describe possible project scopes and acceptance criteria. New articles are practical planning guides, not claimed client case studies.

Production-export lab measurements are recorded in `qa-output/performance-baseline.json` and the corresponding final file. They are local synthetic measurements, not field Core Web Vitals or ranking evidence.
