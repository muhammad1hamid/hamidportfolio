# itshamid.com authority and growth release

Prepared on 20 November 2026 in the existing repository. The updated portfolio is available on [localhost](http://localhost:3000/). The audit checked the live Vercel site separately from the prepared release. [Route inventory and technical ledger](docs/audit/authority-baseline.md)

## What visitors get

- [The HAMID intro build note](http://localhost:3000/insights/hamid-intro-motion/) uses a frame captured from the actual intro and dated Chromium QA. It explains how the existing experience gives people a skip control, honors reduced motion and renders the site in HTML. It is featured on Insights and linked from Web Development.
- [What a WhatsApp Click Actually Measures](http://localhost:3000/insights/measure-whatsapp-enquiries/) now traces the site's own click and accepted-form events. It keeps the existing slug and connects to Growth Engine, enquiry privacy and the inbox decisions that define a qualified lead.
- The same Manrope and Instrument Serif typography uses fewer requests. The Work archive prioritizes its first useful screenshot. The homepage contact section stacks in the narrow tablet layout so the enquiry button stays inside the page.
- The recognized AI landing event uses the existing consent flow and Google tag. It records a source category and a safe landing location. The form event carries the observed source in the same document after a fresh accepted receipt.

## Files changed in this pass

| File | Change |
| --- | --- |
| `data/insights.json` | New technical article and evidence-led refresh of the existing WhatsApp article |
| `data/insights.ts`, `components/seo/ArticleDetail.tsx`, `components/seo/InsightImage.tsx` | Optional evidence caption and use of the actual capture without poster overlay. The template retains source links, author, breadcrumbs, related reading and BlogPosting markup |
| `public/images/insights/hamid-intro-motion.webp` | Original 1200 × 675 WebP converted from a browser screenshot of the portfolio |
| `public/images/responsive/insight-hamid-intro-motion-480.webp`, `public/images/responsive/insight-hamid-intro-motion-768.webp`, `public/images/share/insights-hamid-intro-motion.jpg` | Responsive crop sizes and an article-specific OG image from the existing asset pipeline |
| `scripts/seo-assets.mjs` | Makes the type overlay optional for evidence photos and captures |
| `app/insights/page.tsx`, `app/insights.css`, `app/[service]/page.tsx` | Updated editorial entry copy, native dark frame for capture art and contextual Web Development link |
| `app/globals.css`, `package.json`, `package-lock.json` | Version-pinned self-hosted variable Manrope, with the existing family name and 400–800 weight range |
| `components/projects/Work.tsx` | First archive screenshot uses existing eager/high-priority option. Other archive and homepage previews keep their previous loading behavior |
| `app/home-growth.css` | Single-column contact block at up to 767 CSS px and shrinkable tracks at wider widths |
| `data/referral-source.ts` | Exact known HTTPS host matching and the exact documented ChatGPT campaign marker, read from document entry |
| `app/layout.tsx`, `components/seo/Analytics.tsx`, `data/google-analytics.ts` | Consent transition and deduplicated landing event through the existing GA4 tag. Safe accepted-lead source and context |
| `app/privacy/page.tsx` | Privacy explanation for recognized referral categories and form event fields |
| `vercel.json` | Explicit permanent routes for `/index.html` and `/portfolio/index.html` alongside existing portfolio and trailing-slash rules |
| `scripts/qa-analytics.mjs`, `scripts/qa-enquiry-browser.mjs` | Collector interception and a confirmed form fixture for the new attribution parameters |
| `scripts/qa-authority-performance.mjs`, `scripts/qa-authority-ux.mjs` | Reproducible Chromium transfer and load measurements and browser checks for reflow, accessibility and editorial navigation |
| `CONTENT-PUBLISHING.md`, `docs/content/authority-editorial.md`, `docs/content/editorial-calendar.csv` | Originality criteria, links, proof register, briefs and 12 opportunities with eight release or refresh slots in 90 days |
| `DISCOVERY-OPERATIONS.md`, `discovery/metrics.csv`, `discovery/authority-*.csv`, `discovery/authority-methodology.md` | Measured event definitions, 30 manual prompt seeds, empty observation ledger and owner report instructions |
| `docs/authority/partner-prospect-register.csv`, `docs/authority/permission-and-outreach.md` | Two researched community options, permission leads tied to existing testimonial evidence and three unsent drafts |
| `docs/audit/authority-baseline.md`, `docs/audit/authority-performance.md` | Deployed/local audit, before-and-after lab measurements, UX and test results |

## Production handoff

1. Use this export as the release candidate for the Vercel project. After release, verify `/for-agencies/`, `/privacy/`, the new Insights article, `/portfolio/` and the HTML aliases. Confirm canonical HTTPS and check the `www` certificate and redirect. Keep the portfolio export and Vercel function configuration together.
2. In the owner’s search tools, verify the canonical property, sitemap, URL Inspection, Google Generative AI report and firewall evidence. Record the date and denominator when using field measurements or content results. A public route or sitemap entry alone provides technical reachability evidence.
3. Verify the existing GA4 tag in the live site’s consent flow. Add the two event dimensions and review `generate_lead` as a key event after owner approval. Review data redaction and automatic measurement at property level. Follow the [measurement protocol](discovery/authority-methodology.md).
4. Configure the enquiry provider account values from the [contact handoff](CONTACT-IMPLEMENTATION.md) before testing real receipt and inbox delivery. The local fixture results cover behavior with controlled responses. Calendly is deferred.
5. Obtain rights before additional testimonials or partner credits. Review outreach drafts with the relevant proof before sending. [Permission register and drafts](docs/authority/permission-and-outreach.md)

The live site was read for the audit. The new code and content are in the local release candidate, so public indexing and production referrals are still unmeasured. The observation CSV contains no consumer AI runs. Backlink exports, mail delivery and real device verification require the corresponding owner tools or devices.

## Rollback

- Roll back an affected production deployment through the host to the last accepted release. Retest HTTPS, route rules and the enquiry endpoint.
- To undo the font optimization alone, restore the five Manrope weight CSS imports and original package version, then rebuild. To restore the archive's former loading behavior, remove its first-card `eager` flag.
- Remove the consent event bridge, referral event effect and lead parameters together to roll back the new telemetry. Keep the consent and enquiry infrastructure.
- Keep existing content slugs. If the new article has gone live, assess links and indexing before removing a URL. Rebuild after any content or host rule rollback.
