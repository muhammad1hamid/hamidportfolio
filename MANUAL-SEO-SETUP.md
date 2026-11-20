# Manual Setup Checklist

The code is prepared locally. No website publication, search submission, analytics account creation or business listing has been performed.

Update, 19 November 2026. Hamid selected `https://itshamid.com` as the canonical domain. Complete the hosting and account verification steps below for this domain. `DISCOVERY-OPERATIONS.md` covers AI visibility reporting and the public-release check.

## 1. Choose and configure the public website

- [x] Select the canonical public HTTPS origin **https://itshamid.com**, without `www`.
- [ ] Copy `.env.example` to `.env.local` when adding configuration. Keep `NEXT_PUBLIC_SITE_URL=https://itshamid.com` in the production build environment.
- [ ] Set `SEO_NOINDEX=false` for public production. Use `true` for staging, with hosting access control for genuinely private content. Robots directives are not authentication.
- [ ] Run `npm run build`. Environment changes require rebuilding the static export.
- [ ] Publish `out/` when you are ready. The existing `.openai/hosting.json` belongs to the earlier Sites deployment; it has not been modified or published by this upgrade.
- [ ] At the host, redirect HTTP and the alternate hostname directly to the chosen HTTPS hostname. Preserve path and query parameters; avoid redirect chains.
- [ ] Serve unknown URLs with HTTP 404 and the exported `404.html`, rather than a homepage fallback with 200.
- [ ] Apply the generated `out/_redirects` and `out/_headers` if your host supports that format. Otherwise translate them to the host's settings. These files do not configure Sites or every other hosting provider automatically.
- [ ] Enable Brotli/gzip delivery or let the CDN compress HTML, JS, CSS and text. The local preview supports the generated `.br`/`.gz` files. Retain immutable caching only for versioned `/_next/static/` assets; refresh other images when they change.
- [ ] Confirm `/robots.txt`, `/sitemap.xml`, `/llms.txt`, one service page and one missing URL from a signed-out browser. Allow public crawler access through any CDN or firewall.

## 2. Google Search Console

- [ ] Open [Search Console](https://search.google.com/search-console), add the final domain and verify ownership using the DNS record Google supplies. A Domain property covers hostname/protocol variants.
- [ ] If using a URL-prefix property and HTML-tag verification instead, copy only the real tag's `content` value into `GOOGLE_SITE_VERIFICATION`, rebuild and publish, then select Verify.
- [ ] Submit the final domain's `/sitemap.xml` under Sitemaps.
- [ ] Use URL Inspection on the homepage, one service, one project and one article. Confirm the live page is accessible and the declared canonical is correct.
- [ ] Review Page indexing and Performance after data arrives. Inspect real search queries and enquiries before deciding what content to expand.

Verification options are documented in [Google's ownership guide](https://support.google.com/webmasters/answer/9008080?hl=en).

## 3. Bing Webmaster Tools

- [ ] Sign in to [Bing Webmaster Tools](https://www.bing.com/webmasters/), add the final site or import the verified Search Console property.
- [ ] For HTML meta verification, place the supplied `msvalidate.01` content value in `BING_SITE_VERIFICATION`, rebuild and publish, then verify. No code has been invented.
- [ ] Submit `/sitemap.xml` in Sitemaps and inspect representative live URLs.
- [ ] Review crawl/indexing problems and search performance after Bing processes the site.

Bing documents sitemap submission in its [Sitemaps help](https://www2.bing.com/webmasters/help/sitemaps-3b5cf6ed).

## 4. Google Analytics 4

The published container `GTM-KF5WH37L` sends to web stream `G-BXP2WE495G`. In a fresh browser session, open the public site and allow Google Analytics. **Analytics settings** in the footer lets visitors change their choice. Advertising consent stays denied.

In Tag Assistant, confirm the analytics consent update and one page view each for initial load and navigation to another page. Use Realtime or DebugView to check receipt there. The published Google tag records the initial view and the site measures subsequent route changes. Keep **Page changes based on browser history events** off in the stream's enhanced pageview settings to count each navigation once. Count WhatsApp clicks separately from conversations received. [Google Consent Mode](https://developers.google.com/tag-platform/security/guides/consent) · [Google's SPA measurement guide](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications)

## 5. IndexNow — optional, after publication

- [ ] Generate a dedicated random public ownership key. For example, in the project directory: `node -e "console.log(require('node:crypto').randomBytes(16).toString('hex'))"`.
- [ ] Save it as `INDEXNOW_KEY` in the local/build environment. Do not reuse an API secret. IndexNow intentionally requires a public ownership key file.
- [ ] Rebuild and publish. Verify `https://YOUR-FINAL-DOMAIN/KEY.txt` returns exactly that key as text.
- [ ] Run `npm run indexnow` for a **dry run**. It lists new, changed and removed canonical URLs and makes no submission.
- [ ] After deploying that exact export, run `npm run indexnow -- --submit`. The script verifies the live key and compares live changed HTML with the local export before notifying IndexNow. If your host rewrites HTML, resolve that mismatch rather than submitting an unverified build.
- [ ] Keep `.indexnow-state.json` across deployments or persist it in private CI storage. It records previously accepted page hashes; it is excluded from Git and from the exported website.
- [ ] Re-run the dry run after meaningful content changes or page removal. Deleted URLs must return a permanent redirect, 404 or 410 before submission. An accepted request does not guarantee indexing.

Protocol details: [IndexNow documentation](https://www.indexnow.org/documentation).

## 6. Google Business Profile and Bing Places

- [ ] Confirm whether Hamid's business actually meets customers in person. **An online-only business is not eligible for a Google Business Profile.** Do not invent an office or use a location merely to target Islamabad/Rawalpindi. If genuinely eligible, use the real business/service-area details and complete owner verification. See [Google's eligibility rules](https://support.google.com/business/answer/13763036?hl=en).
- [ ] Review current eligibility and onboarding at [Bing for Business / Places](https://www.bing.com/forbusiness/) before creating a listing. Supply real details and complete its verification process; no listing or physical address was created in this task.
- [ ] Keep the public identity consistent: **Hamid**, **+92 335 6709222**, the final website, and a truthful description of independent web development and AI automation work in Pakistan.

## 7. Validate after publishing

- [ ] Run [PageSpeed Insights](https://pagespeed.web.dev/) for mobile and desktop. Local lab measurements are not real-user Core Web Vitals. Review field LCP, INP and CLS when sufficient data is available.
- [ ] Check structured data with [Schema Markup Validator](https://validator.schema.org/) and supported search features with [Google's Rich Results Test](https://search.google.com/test/rich-results). Valid schema does not guarantee a rich result.
- [ ] Check HTTPS/hostname redirects, 404 response status, share-image previews and anonymous access on the actual host.
- [ ] Keep services, contact details, project screenshots and guides current. Add client outcomes, case-study implementation details and video transcripts only after they are verified.

## Search and AI visibility expectations

The site now provides readable HTML, explicit service descriptions, internal links, linked entities and crawler access. Google says ordinary SEO fundamentals also apply to its AI features and that no special AI schema or text file is required. Inclusion is not guaranteed. [Google AI features guidance](https://developers.google.com/search/docs/appearance/ai-features).

`OAI-SearchBot` supports ChatGPT search discovery; `GPTBot` has a separate training purpose. Both are allowed because the brief requested them. Review those choices independently if your preference changes. [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots).
