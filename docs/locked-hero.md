# HAMID / The Origin 3.0

The supplied references place the centered headline and two CTAs above a lower portrait, with Web Experiences high on the left, Smart Systems below it and Growth Engine on the right. The latest owner feedback expands this arrangement across the first desktop viewport and gives the graphics more space inside each card. The supplied Web and Growth renders provide the actual device artwork. The card sheets guide the workflow treatment and shared glass edge, arrow and hover details.

The desktop heading is a single line at standard text size. The orange italic phrase has a fine drawn underline. The desktop hero fills at least one viewport with wider card placement, a larger portrait and additional space under the header. Selected Work follows in page order. Tablet moves the cards into a row below the portrait. Phones stack all three complete cards under the centered portrait and CTAs.

The existing [Hamid cutout](../public/images/hamid-hero-warm.webp) is displayed with a monochrome CSS grade. An original translucent SVG brush uses the same 1100 × 1100 coordinates as the photo. Both pupils sit inside the brush at approximately (487, 398) and (622, 396). A shared gradient mask fades the brush and its irregular tails toward the temples and ears. Crop and movement apply to the image and brush together. The watermark and curved stroke sit below the photo in a decorative layer. Four original SVGs depict a rocket, paper plane with dashed trail, code laptop and bulb. They are muted at rest and respond to a fine pointer with a small color change.

| Link              | Destination                  | Artwork                                                                                        |
| ----------------- | ---------------------------- | ---------------------------------------------------------------------------------------------- |
| Discuss a project | `/contact/?source=home`      | Existing pill and arrow                                                                        |
| Explore work      | `/work/`                     | Existing Work destination                                                                      |
| Web Experiences   | `/services/#web-experiences` | Isolated architectural laptop artwork from the supplied card render, labeled Design concept    |
| Growth Engine     | `/growth/`                   | Isolated Google search panel from the supplied clean card render, labeled Example search       |
| Smart Systems     | `/services/#smart-systems`   | Original beveled panel with connected enquiry, draft and reply icons, labeled Example workflow |

Card titles, descriptions and actions are HTML. The curved rims, localized glass reflections and return edges use CSS, while the artwork is clipped to its shell. Titles have their own full-width row and supporting copy has reserved space beside the graphics. At larger text sizes or narrow tablet card widths, the artwork moves below the text. Focus retains a visible outline outside the shell. The existing intro signal starts the headline, then the description, CTAs, portrait and staggered cards. Hover lifts each card by seven pixels and responds to the pointer with a bounded local rotation. The pointer values reset on leave, preference changes and unmount. Touch and reduced-motion modes preserve the content and links.

The laptop cutout comes from the owner-supplied `Web Experiences Glassmorphic Card-1 (1).png`. Its original architectural screen is illustrative. The Google panel comes from `Growth Engine SEO Card-4.png`, whose generic result contains no ranking or performance metric. The workflow recreates the supplied panel's material and connected-node arrangement with neutral icons. Artwork lives in `public/images/hero-cards/` as two responsive WebP pairs and one small SVG. Together these files total approximately 95 kB.

| Changed file                          | Purpose                                                                           |
| ------------------------------------- | --------------------------------------------------------------------------------- |
| `components/hero/Hero.tsx`            | Single H1, portrait stacking and initial animation integration                    |
| `components/hero/PortraitMotion.tsx`  | Frame-scheduled local pointer rotation, shared portrait movement and cleanup      |
| `components/hero/HeroArt.tsx`         | Original eye brush and four decorative SVG sketches                               |
| `components/hero/CapabilityCards.tsx` | Linked previews, service descriptions and accessible artwork labels               |
| `app/hero.css`                        | Reference-aligned composition, portrait, watermark, doodles and responsive stage  |
| `app/hero-cards.css`                  | Curved materials, inset device/search/workflow previews and interaction states    |
| `public/images/hero-cards/`           | Optimized reference laptop and search cutouts, plus the original workflow panel   |
| `scripts/qa-signature-hero.mjs`       | Visual, responsive, eye-alignment and interaction verification                    |
| `scripts/qa.mjs`                      | Updates full-site expectations for the revised hero and its Selected Work handoff |

## Visual comparison

The current desktop composition fills 1024 × 768, 1280 × 720, 1324 × 754, 1440 × 900 and 1920 × 1080 viewports. The portrait and cards expand within bounded dimensions. The existing site header retains its 100px height. The card artwork uses the supplied reference graphics and labeled sample interfaces.

| View        | Earlier hero                                       | Locked hero                                                            |
| ----------- | -------------------------------------------------- | ---------------------------------------------------------------------- |
| 1324 × 754  | [Before](../qa-output/card-polish/before-1324.png) | [After](../qa-output/card-polish/final/hero-1324.png)                  |
| 1440 × 900  | [Before](../qa-output/card-polish/before-1440.png) | [After](../qa-output/card-polish/final/hero-1440.png)                  |
| 1920 × 1080 | [Before](../qa-output/card-polish/before-1920.png) | [After](../qa-output/card-polish/final/hero-1920.png)                  |
| 390 × 844   | [Before](../qa-output/card-polish/before-390.png)  | [Complete mobile hero](../qa-output/card-polish/final/section-390.png) |
| 768 × 1024  | [Before](../qa-output/card-polish/before-768.png)  | [Tablet](../qa-output/card-polish/final/hero-768.png)                  |

The current screenshots and raw test reports are local files in `qa-output/card-polish/`.

## Verification

- `npm run build` and `npm run typecheck` passed. The static export contains 47 canonical pages. The repository does not define a separate lint command.
- `node scripts/qa-signature-hero.mjs` passed at 17 viewport sizes from 320px to 1920px, including short and landscape viewports. It checks the single HTML and accessible H1, a desktop hero filling its viewport, one-line Web Experiences title, portrait and brush geometry, rendered color at both pupils, CTA clearance and card navigation. Pixel comparison with the preview hidden confirms unobstructed title and description areas at 390, 1024, 1324 and 1440px.
- Four scoped axe scans returned zero violations. Browser checks passed for keyboard focus, touch, reduced motion, forced colors, no JavaScript and 200% text size. Local per-card rotation changed with pointer position and reset when the pointer left.
- `npm run test:browser` passed all 43 checks. The final card-spacing adjustment passed the focused hero suite. No runtime errors were recorded by either suite.
- `npm run test:seo` checked 47 pages and 91 assets with zero failures.
- `npm run test:origin` passed all 17 checks. The one-second HAMID hold, upward curtain, staggered content, skip controls and history behavior were verified.
- Prettier and `git diff --check` passed for the edited hero files.

## Loading measurements

Three cold Chrome contexts per scenario, against the local optimized export, on 23 November 2026. Optional analytics were blocked in the lab. The phone measurements use Chrome emulation at DPR 2. The throttled run used 4× CPU slowdown, 150ms latency and 1.6 Mbps download speed.

| Scenario                          | Median browser LCP | Median CLS |
| --------------------------------- | -----------------: | ---------: |
| 1440 × 900, intro previously seen |             248 ms |      0.030 |
| 390 × 844, intro previously seen  |             228 ms |          0 |
| 390 × 844, throttled              |           1,296 ms |      0.038 |

The responsive portrait is eager and reserves its original dimensions. The supplied reference device artwork is optimized into responsive transparent WebP files. The workflow and accents use SVG and CSS. The hero adds no runtime dependency. Browser paint timing is independent of how long an eligible first-visit intro remains on screen.

Desktop and mobile checks used installed Chrome and emulated touch on Windows. Physical mobile devices, Safari, Firefox and real-user performance metrics remain unverified.
