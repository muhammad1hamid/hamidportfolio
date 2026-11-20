# HAMID / Origin

The intro plays on the first eligible entry in each tab. A centered H releases warm and off-white particles that assemble AMID. The full name holds for 340 ms on the 2.48-second timeline. All five letters then separate into moving fragments as the charcoal curtain lifts and the current page settles into view. A cold start can extend the total slightly so the letter formation still has time to read.

## Visual direction

The live homepage supplied the Manrope type, charcoal ground, warm orange accent and off-white lettering. The brief supplied the choreography. A motion-specific reference file was unavailable. The finished intro uses a soft orange aura and the five letters as its only visual focal point.

The first frame comes from static markup. The browser loads the two small particle modules on eligible visits and starts them as soon as the stage and stylesheet are ready. Canvas 2D measures Manrope 800 and rasterizes HAMID once into a tight glyph strip. Occupied cells contain both a sampled ink pixel and the original piece of the letter. Seeded paths carry points from H pixels to the A, M, I and D cells. At lockup, the same raster matches the settled points. During breakup every piece moves, shrinks and fades from its glyph position. The curtain starts while pieces are still in motion.

## Integration

| File | Responsibility |
| --- | --- |
| `app/layout.tsx`, `SignatureIntro.tsx`, `app/origin.css` | First-frame markup, site colors, curtain, and keyboard-operable Skip intro |
| `components/motion/origin-session.ts` | Per-tab session guard, startup timeout, motion and connection checks, focus, and lifecycle cleanup |
| `components/motion/origin-word.ts`, `brand-particles.ts` | Font metrics, glyph sampling, responsive particle budgets, canvas drawing, and hero reveal |
| `components/motion/useNavigationMotion.ts`, `Experience.tsx` | 290 ms navigation veil, 220 ms destination entrance on prompt route commits, and coordination with existing scroll effects |
| `app/globals.css`, `app/refinements.css` | Removal of the dormant intro styles |
| `scripts/origin-assets.mjs`, `package.json`, `.gitignore` | Compile the TypeScript particle modules into local browser assets for development and production |
| `scripts/qa-origin.mjs`, `scripts/qa.mjs` | Motion and regression checks |

Skip intro returns keyboard focus to the main content. Reduced motion and forced colors show that content immediately. Backgrounding or substantially resizing the viewport exits the intro. The startup watchdog restores the page if the particle layer is late to initialize. The animation cancels its frame request and releases the canvas on exit.

Internal navigation uses ordinary Next.js links and route commits. Fragments, modifier clicks, downloads, external links and forms keep their native interactions. A late, cancelled or failed route can continue after the decorative veil clears.

## Verification

| Check | Result |
| --- | --- |
| `npm run build`, `npm run typecheck` | Passed with the Next.js 16.3.6 static export |
| `npm run test:origin` | 17 checks passed, including keyboard and pointer skip, deep-link reveal, reduced motion, refresh, history, resize, storage and canvas failure, and JavaScript disabled |
| `npm run test:browser` | 37 checks passed, including homepage and portfolio accessibility, 18 project links, mobile menu, contact and downloads |
| `npm run test:seo` | 43 pages and 80 assets checked with zero failures |
| `npm run test:discovery` | Seven checks and 20 demo cases passed |
| `node scripts/qa-analytics.mjs` | Seven consent and GA4 checks passed with test collection intercepted |
| Prettier and `git diff --check` | Passed for the feature files and patch |

Chrome viewport coverage included 1440×900, 1366×768, 1024×768, 768×1024, 430×932, 390×844 and 320×568. The slower sequence took 2.482–2.533 seconds in the recorded run. The complete word held for 300–333 ms before breaking into 202–656 fragments. Device pixel ratio was capped at 2. Set `QA_ORIGIN_SCREENSHOTS=1` for frame captures at 1440 and 390 pixels. Run the motion suite by itself for timing measurements.

The public homepage heading matched **Stand out online. Get found. Work smarter.** The export kept that heading and the same destinations, including `/growth/` and the 18-project archive. The site checks also verified structured data, canonical URLs, consent behavior and one GA4 page view on a client navigation.

## Mobile lab measurements

The same local static server and Chrome test used cold 390×844 contexts, 4× CPU throttling, 150 ms latency and 1.6 Mbps download. Each column is the median of three runs from `npm run test:performance`.

| Metric | Before | Release |
| --- | ---: | ---: |
| Largest Contentful Paint | 1,248 ms | 1,012 ms |
| Cumulative Layout Shift | 0.0206 | 0.0215 |
| Startup blocking | 288 ms | 408 ms |
| Transferred JavaScript | 152,315 bytes | 153,055 bytes |

Chrome classified the simulated slow link as 4G and sometimes reused that estimate on later fast visits. The final version combines connection hints below 2 Mbps with at least 125 ms estimated round-trip latency and at least 125 ms measured time to the current response. Slow visits that meet those conditions go straight to the page. The particle modules and large canvas operations are reserved for eligible visits. Startup blocking was 120 ms higher in the release sample.

These measurements describe the local browser and network simulation. Physical phones, Safari, screen-reader sessions and field Core Web Vitals remain unmeasured.
