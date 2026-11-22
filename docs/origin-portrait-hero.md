# HAMID / THE ORIGIN portrait hero

## Audit

The homepage is a Next.js App Router static export. Its server-rendered hero sits immediately above `#work`, the existing Selected Work section. It uses the shared Manrope and Instrument Serif fonts and the charcoal, ivory, orange and cyan theme. The header's contact button and the one-per-session HAMID particle intro are separate shared components.

The previous hero had one `<h1>` element containing two responsive headline branches. Both “Stand out online. Get found. Work smarter.” and “Build. Grow. Automate.” appeared in the raw HTML and DOM text. Chrome's accessible tree exposed only the active branch at each width. The hero now renders “Build. Grow. Automate.” once, including in the static HTML. The accessible heading and visible copy match across breakpoints.

The asset review compared the 1100 × 1100 opaque portrait and the existing 1100 × 1100 transparent warm portrait. The site's established transparent version has clean edges and enough room around Hamid's face for the new composition. The hero reuses that photograph and its existing 320w, 480w, 640w and 768w WebP derivatives. CSS applies a neutral grade. The source image and facial detail are retained.

## Design and behavior

The reference informed the centered editorial hierarchy and the relationship between the portrait and interface cards. The HAMID layout uses dark matte surfaces, ivory sans serif text, an orange italic second line, fine connector strokes and the familiar watermark behind the photograph. The three cards depict a browser wireframe, a search field and a simple workflow. They describe services and carry no client, traffic or performance claims.

Desktop keeps the portrait prominent in the center with three staggered cards. Tablet puts smaller cards on either side with a more frontal alignment. Phones put the text and CTAs first, then the portrait, two compact cards at the shoulders and a Smart Systems link. At larger text sizes the phone grid can use a single column. AI Conversations remains available in the homepage service section.

The existing curtain's reveal signal starts the eyebrow and headline, then the description, actions, portrait and cards. The elements are in the page from the first render. Repeat visits and direct anchor visits show the full hero immediately. Desktop hover and keyboard focus add a small lift and a clearer border. Fine-pointer movement is limited to about 7px on the cards and 2.5px on the portrait along the horizontal axis. During normal scrolling, the artwork drifts slightly as the visitor reaches Selected Work. Touch devices omit pointer and scroll-linked motion. Reduced-motion and forced-colors modes show the full static composition.

## Destinations

| Hero control      | Existing destination         |
| ----------------- | ---------------------------- |
| Discuss a project | `/contact/?source=home`      |
| Explore work      | `/work/`                     |
| Web Experiences   | `/services/#web-experiences` |
| Growth Engine     | `/growth/`                   |
| Smart Systems     | `/services/#smart-systems`   |
| Selected work     | `/#work`                     |

The primary and portfolio CTAs retain their existing click events. The project enquiry, Work corridor and service pages use the same routes as before.

## Files

| File                                                   | Change                                                                                          |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `components/hero/Hero.tsx`                             | One server-rendered heading, concise copy, real CTAs, responsive portrait and Selected Work cue |
| `components/hero/CapabilityCards.tsx`                  | Three linked illustrations using the existing service names and destinations                    |
| `components/hero/PortraitMotion.tsx`                   | Shared pointer and scroll motion, with frame scheduling, preference checks and cleanup          |
| `app/hero.css`                                         | Editorial composition, portrait crop, responsive cards, focus states and curtain-synced reveal  |
| `scripts/qa-signature-hero.mjs`                        | Static and accessible heading, layout, links, interaction, zoom and reduced-motion verification |
| `scripts/qa-origin.mjs`                                | Checks the revised reveal order and waits for the visible Work heading in either gallery view   |
| `scripts/qa.mjs`                                       | Updates the full-site test to expect one consistent hero and its approved CTA labels            |
| `scripts/qa-discovery.mjs`, `scripts/qa-analytics.mjs` | Update the scoped contact CTA locator to its approved label                                     |

## Screenshots

| View                   | Before                                                        | After                                                                       |
| ---------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Desktop, 1440 × 900    | [Previous hero](../qa-output/origin-portrait/before-1440.png) | [New hero](../qa-output/origin-portrait/final/hero-1440.png)                |
| Tablet, 768 × 1024     | [Previous hero](../qa-output/origin-portrait/before-768.png)  | [New hero](../qa-output/origin-portrait/final/hero-768.png)                 |
| Phone, 390 × 844       | [Previous hero](../qa-output/origin-portrait/before-390.png)  | [Full hero composition](../qa-output/origin-portrait/final/section-390.png) |
| Small phone, 320 × 568 | [Previous hero](../qa-output/origin-portrait/before-320.png)  | [Full hero composition](../qa-output/origin-portrait/final/section-320.png) |

The screenshots and raw browser reports are local QA artifacts under `qa-output/`.

## Verified results

| Check                                   | Result                                                                                                                                                     |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build` and `npm run typecheck` | Passed. The production export contains 47 canonical pages.                                                                                                 |
| `node scripts/qa-signature-hero.mjs`    | Passed at 16 viewports from 320px to 1920px, including the short phone and landscape cases. The face, cards and links remained clear.                      |
| Keyboard and touch                      | Passed the CTA and card navigation, focus order, focus indicators, mobile menu, 200% text-size layout and Selected Work anchor checks.                     |
| Accessibility scans                     | Four scoped axe scans of the hero and header returned zero violations. Reduced motion, forced colors and no-JavaScript rendering passed.                   |
| `npm run test:origin`                   | All 17 checks passed, including seven sizes, the upward curtain and approximately 1.00–1.02 seconds of HAMID hold, stage order, skip controls and history. |
| `npm run test:browser`                  | All 43 existing site checks passed with no runtime errors.                                                                                                 |
| `npm run test:seo`                      | 47 pages and 88 assets checked with zero failures. Homepage canonical, metadata and structured data retained.                                              |
| `npm run test:discovery`                | Seven browser checks and 20 demo cases passed. Both hero click events kept their original names in the test data layer.                                    |

The repo does not define a separate lint command. Formatting checks passed for the hero and its dedicated test scripts. The initial intro suite passed its homepage choreography checks and timed out waiting for the hidden archive heading on Work. The regression test now waits for the accessible heading in whichever Work view is active. The subsequent run passed.

## Performance

Three cold Chrome contexts per row, served from the optimized export on Windows on 22 November 2026. Optional analytics requests were blocked for the lab runs. The phone rows use desktop Chrome's touch and viewport emulation at DPR 2.

| Scenario                                                      | Median browser LCP | Median CLS | Portrait selected |
| ------------------------------------------------------------- | -----------------: | ---------: | ----------------- |
| 1440 × 900, intro previously seen                             |             496 ms |      0.024 | 640w, 25.6 kB     |
| 390 × 844, intro previously seen                              |             504 ms |          0 | 768w, 32.5 kB     |
| 390 × 844, 4× CPU slowdown, 150 ms latency, 1.6 Mbps download |           1,428 ms |      0.036 | 768w, 32.5 kB     |

Chrome reported the portrait as the largest paint in both phone scenarios and requested one responsive portrait per load. The image is requested eagerly with explicit dimensions and high priority. The desktop largest-paint candidate was the watermark. The first eligible desktop visits also painted behind the preserved intro curtain, so its paint timing is separate from the intro's approximately 3.4-second visible sequence. The intro's skip button, preferences and slow-device checks remain in effect.

No additional runtime dependency or generated likeness is involved. Device-level metrics, field Core Web Vitals, physical iOS and Android, Safari and Firefox remain unverified.
