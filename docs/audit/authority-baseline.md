# itshamid.com authority and technical baseline

Audit on 20 November 2026. This distinguishes the public Vercel deployment, the frozen local build before the change, and the prepared build on localhost. An HTTP response describes availability at test time. Search Console is needed to verify indexed URLs.

## Source and deployment inventory

- Next.js 16.3.6 App Router, React 19, structured JSON/TypeScript content and static HTML export with canonical trailing slashes. The homepage and navigation are crawlable in the original document. Interactive planner, project previews, enquiry UI and motion hydrate on top of the HTML.
- `data/seo.ts` and the sitemap route generate canonical metadata, site and page entity graphs, assets and URLs from the existing content. `scripts/seo-assets.mjs` generates responsive WebP variants and share cards. `scripts/postbuild-seo.mjs` generates static host rules and precompressed assets.
- Vercel serves the live canonical host. The local smoke server reads `out/` and exposes the same enquiry handler. The repo currently has no checked-in CI workflow. Build and validation commands are in `package.json`. Host configuration is in `vercel.json`.
- Host inputs include `NEXT_PUBLIC_SITE_URL`, `SEO_NOINDEX`, `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION`. See `.env.example` and the [contact implementation](../../CONTACT-IMPLEMENTATION.md) for the enquiry, anti-spam, retention and provider setup names. Credentials and property exports stayed outside the audit.
- The live public pages include home, service library, Growth Engine, the work archive, six project stories, six evergreen guides, Insights, contact, planner, editorial policy and testimonial watch routes. The project archive still contains all 18 entries. Agency and Privacy were present in the local baseline and are part of the prepared export.

## Reachability and page inventory

| Check | Public Vercel | Local export at audit start |
| --- | --- | --- |
| Sitemap | 43 URLs, all 43 returned HTTP 200 | 45 listed routes. After implementation the new article brings this to 46 |
| Canonical, page title and H1 | All 43 returned a matching self-canonical, title and one H1 | Canonical site URL, English HTML, title, description, Open Graph, visible breadcrumbs and valid JSON-LD tested by the SEO suite |
| Indexing directives | No `noindex` found on the 43 listed HTML responses | Index/follow and normal snippet preferences in export. Owner URL Inspection required for live indexing status |
| Core navigation | Same eight destinations across all 43 pages, including older guides and Insights | All 45 pre-change pages shared the same header/nav fingerprint. Agency entry is part of pending release |
| `/for-agencies/` and `/privacy/` | 404 | 200, present before this update |
| `/index.html` | 404 | 301 to `/` |
| `/portfolio/` | 404 | 301 to `/work/` |
| `/work` | Resolves to `/work/` | 301 to `/work/` |
| Plain HTTP apex | 308 to HTTPS apex on a subsequent check | Local HTTP preview |
| HTTPS `www` | Windows TLS validation reported a hostname mismatch on retest | Owner-controlled host and certificate |
| Response headers | Public sitemap and robots returned 200 with Vercel cache headers and HSTS. The public home response is in the captured evidence | HTML served with gzip when accepted and `Vary: Accept-Encoding` |

Public route results and nav links are in `qa-output/authority-public.json`. The live homepage response headers are in `qa-output/authority-tools/public-home-headers.txt`. The earlier local inventory includes per-route metadata, schema types, content lengths and response headers in `qa-output/authority-route-baseline.json`. Local redirects run through `scripts/serve.mjs`. The prepared Vercel rules make the two `index.html` aliases explicit.

## Crawler and technical action ledger

| Priority | Verified observation | Action and status |
| --- | --- | --- |
| P0 | Release drift for Agency and Privacy. Old aliases fail on current Vercel deploy | Prepared local pages and explicit legacy redirects. After release, recheck status, Location header, canonical and sitemap on Vercel |
| P0 | `www.itshamid.com` failed TLS hostname verification in a public check | Check the `www` domain assignment and certificate in Vercel. Configure the redirect at the host after the certificate is valid. Recheck from another network |
| P1 | Homepage requested five separate Latin Manrope faces and two other font files in the mobile lab | Use one version-pinned self-hosted variable Manrope file. Confirm font transfer and visual checks across routes |
| P1 | Mobile Work archive LCP was a lazily loaded Bridal House screenshot in all three before runs | Prioritize the single first visible archive image. Keep responsive sizing and subsequent previews lazy |
| P1 | Public `robots.txt` explicitly allows Googlebot, Bingbot, OAI-SearchBot, GPTBot, Claude and Perplexity agents on ordinary pages and disallows API/admin paths | Site rules were read only. CDN/firewall treatment, crawler request logs, Google AI inclusion and indexing coverage require owner access |
| P1 | Homepage portrait was discoverable in initial HTML, eager and marked high priority in the Lighthouse trace | Keep responsive sources. The Lighthouse single-run diagnostics reported render delay after the resource fetch. Recheck a normal-motion profile and field data before another change to the hero |
| P2 | Both watch pages returned 200. Existing players load after a visitor action. Video sitemap still awaits verified thumbnail and original publication metadata | Keep current watch routes and player flow. Verify transcript, thumbnail, date and permission before adding richer data |
| Separate follow-up | Public PageSpeed API mobile request returned 429 after the TLS retry. No usable p75 field measurements were obtained | Use an authorized PSI or CrUX view and record URL versus origin scope. Define LCP 2.5 s, INP 200 ms and CLS 0.1 as field goals, with 28-day p75 data when available. [PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/about) · [Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds) |

No report of the public route set or robots rules confirms that a given AI service crawled, indexed or cited a page. The [owner measurement protocol](../../discovery/authority-methodology.md) covers the checks that require access. [Google AI search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) · [OpenAI crawler docs](https://developers.openai.com/api/docs/bots)

## Functional baseline

The introductory particle sequence had a bounded startup path, keyboard and pointer skip, a once-per-tab marker, reduced-motion and save-data paths, and an intentional one-second hold. A fresh normal-motion screenshot and 17 pre-change Chromium checks were captured. The planner has an HTML entry point and a downloadable brief. The unconfigured local contact and agency pages offer WhatsApp. Verified form success needs the external provider setup from the contact handoff. Calendly remains deferred at the owner’s request.
