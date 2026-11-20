# Performance, reflow and release checks

Test date 20 November 2026. See the [baseline and technical ledger](authority-baseline.md) for HTTP, crawler and release findings.

## Controlled performance

The priority matrix covers home, Growth Engine, Contact, Work, Bridal House, Insights, the WhatsApp measurement article, Guides and Agency. The before build was frozen as a separate localhost export before changes. The comparison runs against the production export on the same machine. All measurements below are lab observations.

### Chrome DevTools

Three fresh contexts per route and profile in each build. The mobile profile was 390 × 844 with 4× CPU slowdown, 150 ms latency and 200,000 bytes/s download. The desktop profile was 1440 × 960 with 1× CPU, 40 ms and 1,250,000 bytes/s. Both used reduced motion, no retained cache and blocked third-party requests. Measurements include main-document and same-origin resource transfer bytes. The browser watched LCP and session-window CLS. LCP is the observed first-screen candidate in that test. The candidate can change with scheduling and layout.

Each cell shows before → after medians. The sample size is three per build, per route and per device (108 navigations in the matrix).

| Route | Profile | LCP s | CLS | All transfer KB | Fonts KB | JS KB |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| `/` | mobile | 1.17 → 1.11 | 0.005 → 0.028 | 392.3 → 335.6 | 115.4 → 68.9 | 153.5 → 153.8 |
| `/` | desktop | 0.38 → 0.37 | 0.016 → 0.017 | 777.7 → 716.7 | 115.4 → 68.9 | 153.5 → 153.8 |
| `/growth/` | mobile | 1.20 → 1.14 | 0.055 → 0.054 | 292.0 → 250.6 | 94.1 → 47.6 | 138.5 → 139.2 |
| `/growth/` | desktop | 0.34 → 0.34 | 0.035 → 0.032 | 600.4 → 539.7 | 94.1 → 47.6 | 155.6 → 156.3 |
| `/contact/` | mobile | 0.95 → 0.95 | 0.064 → 0.058 | 260.3 → 232.4 | 79.6 → 47.6 | 144.5 → 145.2 |
| `/contact/` | desktop | 0.27 → 0.27 | 0.001 → 0.001 | 623.3 → 577.5 | 79.6 → 47.6 | 161.7 → 162.3 |
| `/work/` | mobile | 2.30 → 0.99 | 0.030 → 0.031 | 396.9 → 340.3 | 94.1 → 47.6 | 144.4 → 144.7 |
| `/work/` | desktop | 0.28 → 0.31 | 0.011 → 0.012 | 869.9 → 809.2 | 94.1 → 47.6 | 154.0 → 154.3 |
| `/work/bridal-house/` | mobile | 1.12 → 1.02 | 0.059 → 0.071 | 337.6 → 291.3 | 71.7 → 25.1 | 136.9 → 137.2 |
| `/work/bridal-house/` | desktop | 0.35 → 0.31 | 0.001 → 0.001 | 724.6 → 663.9 | 71.7 → 25.1 | 154.0 → 154.3 |
| `/insights/` | mobile | 0.82 → 0.83 | 0.002 → 0.002 | 273.5 → 228.1 | 71.7 → 25.1 | 136.9 → 137.2 |
| `/insights/` | desktop | 0.28 → 0.26 | 0.002 → 0.002 | 826.9 → 740.9 | 71.7 → 25.1 | 154.0 → 154.3 |
| `/insights/measure-whatsapp-enquiries/` | mobile | 1.01 → 1.12 | 0.001 → 0.000 | 252.6 → 206.9 | 71.7 → 25.1 | 136.9 → 137.2 |
| `/insights/measure-whatsapp-enquiries/` | desktop | 0.30 → 0.30 | 0.002 → 0.002 | 609.2 → 548.8 | 71.7 → 25.1 | 154.0 → 154.3 |
| `/blog/` | mobile | 0.94 → 0.95 | 0.017 → 0.019 | 231.2 → 204.0 | 57.2 → 25.1 | 136.9 → 137.2 |
| `/blog/` | desktop | 0.26 → 0.26 | 0.002 → 0.002 | 707.5 → 665.6 | 57.2 → 25.1 | 154.0 → 154.3 |
| `/for-agencies/` | mobile | 1.22 → 1.17 | 0.001 → 0.002 | 316.9 → 267.3 | 94.1 → 47.6 | 144.4 → 145.0 |
| `/for-agencies/` | desktop | 0.34 → 0.33 | 0.016 → 0.015 | 638.2 → 577.5 | 94.1 → 47.6 | 161.5 → 162.1 |

Chrome reported the homepage portrait as the mobile LCP element. The work archive started with the first Bridal House screenshot as LCP in all three baseline runs, and later runs could settle on text after that image was prioritized. Load timing reflects both the font and priority changes in the complete build. In this profile, desktop Work LCP rose by 0.03 s and the mobile WhatsApp article rose by 0.11 s while their transfer sizes fell.

### Lighthouse

Lighthouse 13.6.0 navigation reports, Chrome headless, local static build with third-party analytics and video URLs blocked. Mobile uses the simulated 412 × 823 profile, 4× CPU and 150 ms RTT. Desktop uses the simulated 1440 × 960 profile, 1× CPU and 40 ms RTT. The paired run alternates before/after order across three independent cold navigations per route and device. It uses reduced-motion Chrome, standard performance weights, 450 ms load/quiet windows, a 9 s load time limit and no full-page audit screenshot. Screenshot evidence is in the separate DevTools/UX runs. Compare Lighthouse estimates within the same profile and run settings.

Each cell shows before → after medians. The sample size is three per build, per route and per device (108 navigations in the matrix).

| Route | Profile | Score / 100 | LCP s | CLS | TBT ms | Speed Index s |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| `/` | mobile | 91 → 94 | 3.19 → 3.04 | 0.007 → 0.007 | 173 → 93 | 1.37 → 1.29 |
| `/` | desktop | 100 → 100 | 0.66 → 0.29 | 0.017 → 0.017 | 0 → 0 | 0.38 → 0.31 |
| `/growth/` | mobile | 92 → 99 | 3.04 → 1.08 | 0.040 → 0.036 | 159 → 102 | 1.12 → 1.06 |
| `/growth/` | desktop | 100 → 100 | 0.66 → 0.61 | 0.035 → 0.032 | 0 → 0 | 0.34 → 0.29 |
| `/contact/` | mobile | 98 → 98 | 0.91 → 0.91 | 0.068 → 0.061 | 126 → 109 | 0.91 → 0.92 |
| `/contact/` | desktop | 100 → 100 | 0.25 → 0.25 | 0.001 → 0.001 | 0 → 0 | 0.25 → 0.25 |
| `/work/` | mobile | 100 → 100 | 0.91 → 0.91 | 0.032 → 0.032 | 69 → 65 | 0.91 → 0.98 |
| `/work/` | desktop | 100 → 100 | 0.25 → 0.25 | 0.011 → 0.011 | 0 → 0 | 0.25 → 0.25 |
| `/work/bridal-house/` | mobile | 100 → 100 | 0.91 → 0.91 | 0.002 → 0.002 | 61 → 61 | 0.93 → 0.91 |
| `/work/bridal-house/` | desktop | 100 → 100 | 0.57 → 0.55 | 0.001 → 0.001 | 0 → 0 | 0.25 → 0.25 |
| `/insights/` | mobile | 95 → 97 | 2.82 → 2.51 | 0.002 → 0.002 | 67 → 67 | 0.91 → 0.91 |
| `/insights/` | desktop | 100 → 100 | 0.59 → 0.55 | 0.002 → 0.002 | 0 → 0 | 0.25 → 0.25 |
| `/insights/measure-whatsapp-enquiries/` | mobile | 96 → 97 | 2.74 → 2.44 | 0.017 → 0.017 | 65 → 132 | 1.06 → 1.06 |
| `/insights/measure-whatsapp-enquiries/` | desktop | 100 → 100 | 0.61 → 0.57 | 0.002 → 0.002 | 0 → 0 | 0.29 → 0.29 |
| `/blog/` | mobile | 99 → 99 | 0.91 → 0.91 | 0.005 → 0.005 | 115 → 121 | 0.91 → 0.91 |
| `/blog/` | desktop | 100 → 100 | 0.25 → 0.25 | 0.003 → 0.003 | 0 → 0 | 0.25 → 0.25 |
| `/for-agencies/` | mobile | 100 → 100 | 1.21 → 1.21 | 0.036 → 0.036 | 76 → 88 | 1.21 → 1.21 |
| `/for-agencies/` | desktop | 100 → 100 | 0.68 → 0.66 | 0.016 → 0.016 | 0 → 0 | 0.29 → 0.36 |

Mobile Lighthouse gave the homepage a median score of 94 and an estimated LCP of 3.04 s. The mobile Work score and LCP held around 100 and 0.91 s in the 412 px Lighthouse profile. The Work improvement above was observed in the 390 px DevTools profile.

PageSpeed’s public endpoint returned HTTP 429 on retry. Real-user p75, INP, consented third-party costs and physical phone timings remain unmeasured. Lighthouse total blocking time is a lab diagnostic. The field target remains LCP ≤2.5 s, INP ≤200 ms and CLS ≤0.1 at p75 when usable data exists. [PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/about) · [Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds)

Initial local regression budgets for this profile are 180 KB of same-origin JS and 400 KB total on the mobile priority routes, medians over three fresh trials. All nine mobile routes fit both budgets in the final run. Repeat after changing fonts, media, navigation or analytics. Review any reported budget increase against screenshots and behavior. Treat a mobile Lighthouse score around 90 as a diagnostic target and investigate repeatable delays. The budgets are checked in the local audit.

## Reflow, accessibility and theme

The responsive suite opened each of the ten routes at 320, 360, 375, 390, 430, 768, 1024 and 1440 px, plus 844 × 390 landscape and a 720 × 480 CSS reflow check corresponding to 200% at a 1440 × 960 viewport. The final export passed all 100 route and viewport checks. At 720 px the homepage originally scrolled to 765 px because the contact CTA extended past its track. Stacking the contact block through 767 px brings the scroll width back to 720 px. The suite loads the page at each size so media-query updates settle before measurement.

The main regions passed 20 axe scans at 390 and 1440 px. Keyboard tests on the article verified focus, the table of contents, the anchor and back navigation. The article body, actual figure caption, service link and WhatsApp action were present with JavaScript disabled. Separate Chromium tests cover mobile menu focus return, native project previews, form validation and retry, consent, reduced motion, pointer/keyboard skip, slow connections and reload/history. Device coverage is Chromium emulation. Safari, mobile on-screen keyboards and real device assistive technology await a device check.

The site uses the original dark palette, Manrope body/heading family, Instrument Serif accents, spacing and motion rules. The new cover uses a real frame from the portfolio rather than third-party art. Browser images follow the supplied references’ bold central composition and restrained copy. The intro retains its one-second full-wordmark hold and upward particle exit.

## Verification commands

| Command | Observed result |
| --- | --- |
| `npm run build` | Production static export succeeds, 46 canonical routes. Next reports an unrelated package-lock above the repo and uses this repo's package lock |
| `npm run typecheck` | Pass |
| `npm run test:seo` | 46 pages, 80 assets, no failures in the SEO snapshot |
| `npm run test:browser` | 39 checks passed, including Work filters and all 18 previews, contact brief download, mobile navigation and no runtime errors |
| `npm run test:origin` | 17 checks passed, including seven lockup widths, one-second hold, timeout, fail-open and history/anchor handling |
| `npm run test:discovery` | 7 checks and 20 enquiry demo cases passed |
| `npm run test:agency` | 9 browser checks passed |
| `npm run test:enquiry-server` | 12 fixture checks passed. No external email is needed for the test |
| `npm run test:enquiry-browser` | 14 fixture checks passed, including accepted receipt, no duplicate conversion, server error/retry and AI category on an accepted form |
| `node scripts/qa-analytics.mjs` | 10 checks passed via the published GTM/GA4 client. The browser intercepted the collector payloads and kept test events out of the property |
| `node scripts/qa-authority-ux.mjs` | 100/100 layouts and 20/20 axe scans passed, plus keyboard, history and no-JavaScript article checks |
| `git diff --check` | Pass |

The first production compile found a webpack font path resolution error. The package URL now resolves through Next's CSS loader and the production build passes. The initial collector assertion expected a second event copy of the path. The actual `page_location` field already carried the expected canonical path and the corrected test verifies the on-wire fields. The fixture confirms new enquiry events after server acceptance. Owner email delivery and production analytics property reports are separate verification.

## Evidence and reproduction

- `qa-output/authority-before/performance.json` and `qa-output/authority-final/performance.json` contain raw Chrome runs. Reproduce with `QA_BASE_URL`, `QA_LABEL` and `node scripts/qa-authority-performance.mjs` while the appropriate static export is served. Default runs are three per route and profile.
- `qa-output/authority-lighthouse-paired/` contains the raw Lighthouse JSON and summary. The local runner is `qa-output/authority-lighthouse-paired.mjs` with Lighthouse 13.6.0 installed under the QA output directory. The paired directory captures the profile and settings per run. No Lighthouse dependency ships with the site.
- `qa-output/authority-ux/` includes the responsive report and screenshots at every tested viewport for the homepage and new article, plus mobile and desktop images of the Insights index. `qa-output/authority-tools/intro-lockup-original.png` is the source frame for the visible cover.
- `qa-output/origin-qa.json` and `qa-output/ga4-local.json` record the intro and published-tag checks. The test plan covers project navigation and the phone form fixture. `qa-output/authority-test-*.log` includes the browser suite logs.
