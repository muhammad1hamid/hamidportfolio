# HAMID — Open Graph and social preview implementation

Implemented on **26 November 2026** for `https://itshamid.com/`. The system supplies **47 dedicated 1200 × 630 JPEG banners**, a natural **1100 × 1100 portrait**, and two responsive portrait variants. The live site's page layout, hero, animations, forms, navigation and portfolio functionality are preserved.

## Confirmed cause of the old preview

The initial production HTML still advertised `https://itshamid.com/images/share/home.png`. The existing `scripts/seo-assets.mjs` actively regenerated that asset with the former “Stand out online. Get found. Work smarter.” copy. The homepage's actual HTML title and visible hero had already changed. The initial response contained one `og:image`; duplicate tags were not the cause.

Browser-, Facebook-, LinkedIn-, WhatsApp-, Twitter- and Google-style requests all returned HTTP 200 and the same old image reference. The image itself returned HTTP 200, `image/png`, 1200 × 630, 50,744 bytes and a Vercel cache HIT. Its bytes differed from the Windows-local PNG export, so byte identity is not claimed. The stale production reference and unchanged legacy generation content are confirmed; a CDN HIT alone does not establish an incorrect CDN cache, and platform cache behavior was not inferred from it.

The new production metadata references a new filename, `/images/social/hamid-home-v2.jpg`. The obsolete homepage banner-generation code was removed. Old `/images/share/` files remain available for historical references and already-shared URLs; they are no longer the active public-page social images. Historical evidence images inside published articles were retained rather than rewriting their original screenshots.

## Design and portrait provenance

The flagship banner uses the real `public/images/hamid-hero-warm.webp` source, **1100 × 1100 with alpha**. It is resized and composited against solid charcoal; no facial feature, expression, hair, beard or eye shape is generated or retouched. The warm edge treatment already exists in that source. The homepage eye-strip is a separate website decoration and is not included in the social banner.

The natural representative square is a high-quality JPEG export of the real `public/images/hamid-hero.webp`, also **1100 × 1100**. It retains that source's crop, expression and background. It is intentionally not advertised as 1200px: the available source does not support that size without upscaling. The original files remain unchanged. The About portrait, present on both homepage and About page, now references the natural square and matching responsive files with meaningful alt text; its layout remains the same.

The left side uses HAMID with the orange asterisk, bold ivory Manrope “Build. Grow.”, warm orange italic Instrument Serif “Automate.”, the service line and domain. The real portrait sits in the right-center region so its complete face remains within the simulated center-square crop. The composition uses solid near-black, no large corner glow, no glass cards and no invented proof. The 47-image overview was visually inspected alongside full-size flagship, About, Growth, project, Work and article examples.

Generation uses the already-installed Sharp library and bundled official website font families. It does not require Chrome, image-generation APIs or network access in production. The font files are from the official [Google Fonts Manrope source](https://github.com/google/fonts/tree/main/ofl/manrope) and [Instrument Serif source](https://github.com/google/fonts/tree/main/ofl/instrumentserif); their supplied open-font licenses are included. Repeating generation with the same installed environment produced identical SHA-256 values for all 47 banners. Cross-platform pixel identity is not asserted, as rasterizer versions can differ.

## Assets and public URLs

All banner rows below are **1200 × 630, image/jpeg**. Sizes are the actual local exports; deployment may regenerate with its installed rasterizer. The full route, URL, source, dimensions, classification and byte-size inventory is in [social-preview-assets.csv](social-preview-assets.csv). Detailed generation provenance and hashes are in [asset-manifest.json](../scripts/social/asset-manifest.json).

| Asset                         |   Bytes | Public URL                                                                                      |
| ----------------------------- | ------: | ----------------------------------------------------------------------------------------------- |
| Homepage                      |  99,183 | [hamid-home-v2.jpg](https://itshamid.com/images/social/hamid-home-v2.jpg)                       |
| About                         | 100,162 | [hamid-about-v2.jpg](https://itshamid.com/images/social/hamid-about-v2.jpg)                     |
| Contact                       |  80,271 | [hamid-contact-v2.jpg](https://itshamid.com/images/social/hamid-contact-v2.jpg)                 |
| Agencies                      | 100,783 | [hamid-for-agencies-v2.jpg](https://itshamid.com/images/social/hamid-for-agencies-v2.jpg)       |
| Work                          | 125,248 | [hamid-work-v2.jpg](https://itshamid.com/images/social/hamid-work-v2.jpg)                       |
| Growth Engine                 |  50,639 | [hamid-growth-v2.jpg](https://itshamid.com/images/social/hamid-growth-v2.jpg)                   |
| Natural portrait, 1100 × 1100 |  77,091 | [hamid-portrait-square-v1.jpg](https://itshamid.com/images/social/hamid-portrait-square-v1.jpg) |
| Natural portrait, 768 × 768   |  29,648 | [768px portrait](https://itshamid.com/images/social/hamid-portrait-square-v1-768.jpg)           |
| Natural portrait, 480 × 480   |  14,363 | [480px portrait](https://itshamid.com/images/social/hamid-portrait-square-v1-480.jpg)           |

The 47 banners range from **36,730 to 125,248 bytes** locally, below the suggested 150–300KB range while retaining clean typography and a high-quality portrait. Files were not padded to meet a minimum target.

## Route coverage

| Pages                                                                                                  | Preview treatment                                                                                                  |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Homepage, About, Contact, Agencies                                                                     | Real Hamid portrait with distinct page messaging                                                                   |
| Work and project-story index                                                                           | Collage of actual Bridal House, Ink Grail and Qadeer Jewellers captures                                            |
| Six project detail pages                                                                               | Corresponding project's actual screenshot and existing truthful demo/experience classification                     |
| Web and landing-page services                                                                          | Real Bridal House screenshot explicitly identified as a self-directed demo                                         |
| Remaining services and Growth Engine                                                                   | Handcrafted editorial process diagrams relevant to the service; no invented traffic, ranking or conversion figures |
| Six blog guides                                                                                        | Their own titles and relevant existing topic artwork                                                               |
| Seven Insights articles                                                                                | Their own original cover or evidence capture with descriptive titles                                               |
| Blog/Insights indexes, answers, planner, enquiry demo, privacy, editorial policy and testimonial pages | Dedicated relevant editorial previews; testimonial images do not invent speaker photographs or publication data    |

No duplicate page or route was created. Unknown, unregistered preview requests have a branded homepage fallback; every currently indexable route has a specific image. A new route or article must be represented in the build catalog, and the test checks complete sitemap coverage.

## Metadata and structured data

The existing Next.js server metadata helper remains the single metadata entry point. The normal SEO title stays **Web Development, SEO & AI Automation | Hamid**. The homepage social title is **Hamid — Web Development, SEO & AI Automation**, with the approved concise descriptions. Other routes keep their existing titles, descriptions, canonical destinations and article dates.

Each initial HTML response includes one `og:title`, `og:description`, `og:url`, `og:site_name`, image and image attribute set. Image URLs are absolute HTTPS with explicit `secure_url`, `image/jpeg`, 1200 × 630 dimensions and meaningful alt text. X uses `summary_large_image`, its own title/description and the same real banner with alt text. No unverified X account or `og:video` was added. The actual exported homepage tags are recorded in [social-home-metadata.html](social-home-metadata.html).

Existing index/follow and `max-image-preview:large` permissions were retained. The existing noindex branch, private-path robots exclusions and security headers were preserved. `robots.txt` does not block public social images.

The existing `https://itshamid.com/#person` entity now points to the natural representative square. No duplicate Person or new identity was created. The existing homepage/About WebPage objects use the same square through `primaryImageOfPage`; other WebPage objects point to their relevant route banner. Existing Person, Organization, WebSite, Service and article relationships remain. BlogPosting images now use the corresponding new article banner; Insights retain their original article cover as the article image.

These references make a preferred image discoverable. Google chooses its own search-result image; Open Graph is not a guarantee of a portrait thumbnail or a rich-result feature. Google's [image guidance](https://developers.google.com/search/docs/appearance/google-images) recommends discoverable HTML image elements and relevant context. Social metadata follows the [Open Graph protocol](https://ogp.me/).

## Changed files

| File or directory                                                                                                                       | Implementation                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `data/social-preview-design.json`                                                                                                       | Brand composition settings, portrait sources, homepage social copy and topic-image mappings                          |
| `data/social-images.json`                                                                                                               | Generated route-to-image metadata registry for all 47 public pages                                                   |
| `data/social-preview.ts`                                                                                                                | Shared registry/fallback and representative portrait helpers                                                         |
| `data/seo.ts`                                                                                                                           | Centralized OG/X output, preserved normal SEO copy, natural Person image and relevant WebPage primary images         |
| `data/insights.ts`                                                                                                                      | Routes Insights social-image requests to the versioned registry                                                      |
| `scripts/social/catalog.mjs`                                                                                                            | Builds specific preview records from existing service, article, insight, experience and project data                 |
| `scripts/social-assets.mjs`                                                                                                             | Deterministic build-time composition, local-font typography, genuine screenshots, portrait exports and bounds checks |
| `scripts/social/fonts/`                                                                                                                 | Official Manrope/Instrument Serif TTFs and their licenses                                                            |
| `scripts/social/asset-manifest.json`                                                                                                    | Source, classification, text bounds, size and SHA-256 provenance                                                     |
| `scripts/seo-assets.mjs`                                                                                                                | Removes obsolete homepage/generic banner generator; retains existing responsive and historical compatibility assets  |
| `scripts/brand-assets.mjs`                                                                                                              | Uses the current flagship banner if the older root PNG compatibility image is regenerated                            |
| `components/sections/About.tsx`                                                                                                         | Natural representative photo in the existing visible HTML portrait slot                                              |
| `components/seo/ResponsiveImage.tsx`                                                                                                    | Matching 480/768/1100px natural JPEG portrait sources                                                                |
| `components/seo/ArticleDetail.tsx`                                                                                                      | Relevant new blog banner in existing article image metadata                                                          |
| `public/images/social/`                                                                                                                 | 47 real banner files and three portrait sizes                                                                        |
| `vercel.json`, `scripts/postbuild-seo.mjs`, `scripts/serve.mjs`                                                                         | Explicit immutable caching for the new versioned social-image namespace; other protections remain                    |
| `package.json`                                                                                                                          | Build/dev asset generation, `assets:social` and `test:social`; no new package dependency                             |
| `scripts/qa-social-preview.mjs`                                                                                                         | Raw HTML, schema, asset, thumbnail and crawler-style request checks                                                  |
| `scripts/qa-seo.mjs`, `scripts/qa-agency.mjs`, `scripts/qa.mjs`                                                                         | Expected homepage social copy and versioned Work/Agencies image URLs updated; other assertions retained              |
| `README.md`, `CONTENT-PUBLISHING.md`, `MANUAL-SEO-SETUP.md`                                                                             | Generation, maintenance, versioning and follow-up instructions                                                       |
| `docs/social-preview-system.md`, `docs/social-preview-assets.csv`, `docs/social-home-metadata.html`, `docs/screenshots/social-preview/` | Implementation evidence, metadata, inventory and actual crop simulations                                             |

Existing uncommitted process/timeline edits are unrelated and excluded from this change.

## Actual test results

| Check                              | Result                                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| Production build                   | Passed; 47 canonical pages generated                                                             |
| TypeScript                         | Passed                                                                                           |
| Social-preview suite               | **6/6 passed**, 47 raw HTML page records, 48 primary images and five bot-style User-Agent checks |
| SEO/accessibility suite            | **47 pages, 97 assets, 0 failures**                                                              |
| Agency regression                  | **9/9 passed**                                                                                   |
| General website browser regression | **43/43 passed**, no runtime errors                                                              |
| Repeated generation                | All 47 banner SHA-256 values matched on unchanged inputs in this environment                     |
| Formatting/diff checks             | Passed on changed implementation and test files                                                  |

The existing general browser test initially expected `/images/share/work.png`; that assertion now checks the actual versioned Work preview. The homepage's new social title/description intentionally differ from its normal SEO title/description, so the SEO assertions test those exact approved values rather than removing the checks.

The social suite checks unique complete initial-HTML metadata, self-canonicals, article versus website type, declared dimensions/MIME, alt text, a single stable Person, relevant primary images and direct image delivery without authentication or redirects. Public images are tested for image indexing blocks. Bot-style requests are ordinary HTTP requests with those User-Agent strings; they do not establish actual platform ingestion or access from those platforms' networks.

The 1200 × 630, 600 × 315, 300 × 158, 96 × 96 and 80 × 80 simulations were generated and inspected. The real face survives the center-square crops. Platforms may choose other crops or presentation styles, so universal thumbnail appearance is not promised. Existing desktop/mobile UI behavior and accessibility were checked by the regression suites. The retained natural square is discoverable in actual homepage/About HTML without client JavaScript.

- [Flagship 1200 × 630](screenshots/social-preview/home-1200x630.webp)
- [600 × 315](screenshots/social-preview/home-600x315.webp)
- [300 × 158](screenshots/social-preview/home-300x158.webp)
- [96 × 96 center crop](screenshots/social-preview/home-96x96.webp)
- [80 × 80 center crop](screenshots/social-preview/home-80x80.webp)
- [All 47 route previews](screenshots/social-preview/all-47-previews.webp)

Raw audit HTML, original metadata, response headers, logs, crop PNGs and test JSON are in ignored `qa-output/social-preview/`. The SEO/browser suites also write their standard reports under `qa-output/`.

## Deployment, cache and account follow-up

Production verification completed after deployment of commit `b0fb1a3`. The social suite passed **6/6 against `https://itshamid.com`**, covering all 47 page responses, 48 main image responses and five bot-style User-Agent requests. Every checked image returned HTTP 200 directly with the declared JPEG MIME/dimensions. The deployed homepage JPEG was visually inspected and measures **99,908 bytes**, 1200 × 630; the deployed About banner measures 99,959 bytes. These small differences from the Windows-local banner sizes reflect the production rasterizer. The representative square remains 77,091 bytes, 1100 × 1100. The live versioned responses return the configured one-year immutable cache policy.

The public LinkedIn Post Inspector was also opened in Chrome and the canonical URL submitted. LinkedIn redirected the inspection to `/post-inspector/login`, so no successful inspection or cache refresh is claimed. Facebook's Sharing Debugger loaded and explicitly required Facebook login. A fresh WhatsApp message and authenticated Search Console inspection were unavailable. Those remaining manual checks do not block delivery of the verified public assets and metadata.

New metadata and real files are deployed together. Versioned `/images/social/` responses have `public, max-age=31536000, immutable`; changing an already-published design requires incrementing its version rather than silently overwriting the cached URL. `npm run build` runs the asset generator before Next exports pages. Old URLs remain available. A new versioned filename avoids depending on a purge of the previous image; no broad CDN purge is needed or claimed.

The implementation can verify live HTTP and crawler-style responses. Actual Facebook/LinkedIn platform re-scraping and a newly composed WhatsApp message require those platforms to fetch the URL. Opening the Facebook debugger through the available web reader was blocked; LinkedIn's inspector exposed no readable result. No authenticated platform session or Search Console account is available here, and no successful platform refresh or indexing request is claimed.

Manual follow-up after deployment:

1. Open [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/), enter `https://itshamid.com/`, inspect the selected new image and use its re-scrape control if available.
2. Open [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/), inspect that same canonical URL and check the portrait banner.
3. Compose a **new** WhatsApp message containing `https://itshamid.com/` and allow its preview to load. Existing messages and WhatsApp's separate cache may retain an earlier image. A Facebook re-scrape is not claimed to clear WhatsApp's cache. Do not permanently alter canonicals with random query parameters.
4. In [Google Search Console](https://search.google.com/search-console), inspect the homepage/About live URLs, confirm the canonical and image accessibility, and request recrawling if appropriate. Check the existing sitemap; do not submit image files as new webpages. Google's timing, ranking and thumbnail choice remain outside this implementation's control.

No promotional video, autoplay behavior, fake testimonial image, traffic metric, award or client claim was added. No external account setup is required for the code or assets themselves.
