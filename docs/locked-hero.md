# HAMID / The Origin 3.0

The 1324 × 754 reference controls the layout. It places the centered headline and two CTAs above a lower portrait, with Web Experiences high on the left, Smart Systems below it and Growth Engine on the right. The isolated Web and Growth renders set their material and inset direction. The supplied card sheets set the Smart Systems workflow treatment and shared edge, arrow and hover details.

The desktop heading is a single line at standard text size. The orange italic phrase has a fine drawn underline. The header keeps the site's navigation, logo and contact CTA. The portrait ends the desktop hero, with Selected Work following in page order. Tablet moves the cards into a row below the portrait. Phones stack all three complete cards under the centered portrait and CTAs.

The existing [Hamid cutout](../public/images/hamid-hero-warm.webp) is displayed with a monochrome CSS grade. An original translucent SVG brush uses the same 1100 × 1100 coordinates as the photo. Both pupils sit inside the brush at approximately (487, 398) and (622, 396). Crop and movement apply to the image and brush together. The watermark and curved stroke sit below the photo in a decorative layer. Four original SVGs depict a rocket, paper plane with dashed trail, code laptop and bulb. They are muted at rest and respond to a fine pointer with a small color change.

| Link              | Destination                  | Artwork                                                               |
| ----------------- | ---------------------------- | --------------------------------------------------------------------- |
| Discuss a project | `/contact/?source=home`      | Existing pill and arrow                                               |
| Explore work      | `/work/`                     | Existing Work destination                                             |
| Web Experiences   | `/services/#web-experiences` | Real Fortress Events Complex portfolio capture inside a CSS laptop    |
| Growth Engine     | `/growth/`                   | Labeled example search interface for an event venue                   |
| Smart Systems     | `/services/#smart-systems`   | Labeled sample workflow for an enquiry, its details and a draft reply |

Card titles, descriptions and actions are genuine HTML. The curved rims and return edges use CSS, while the visual inset is clipped to its shell. Focus retains a visible outline outside the shell. The existing intro signal starts the headline, then the description, CTAs, portrait and staggered cards. Hover lifts each card by six pixels and recenters its tilt slightly. Touch and reduced-motion modes preserve the content and links.

| Changed file                          | Purpose                                                                           |
| ------------------------------------- | --------------------------------------------------------------------------------- |
| `components/hero/Hero.tsx`            | Single H1, portrait stacking and initial animation integration                    |
| `components/hero/HeroArt.tsx`         | Original eye brush and four decorative SVG sketches                               |
| `components/hero/CapabilityCards.tsx` | Linked previews, service descriptions and accessible artwork labels               |
| `app/hero.css`                        | Reference-aligned composition, portrait, watermark, doodles and responsive stage  |
| `app/hero-cards.css`                  | Curved materials, inset device/search/workflow previews and interaction states    |
| `scripts/qa-signature-hero.mjs`       | Visual, responsive, eye-alignment and interaction verification                    |
| `scripts/qa.mjs`                      | Updates full-site expectations for the revised hero and its Selected Work handoff |

## Visual comparison

At 1324 × 754 the final layout places the two CTAs at y258, the portrait at the center, Web Experiences at approximately (201, 299), Growth Engine at (815, 344) and Smart Systems at (217, 503). The hero ends at y751. The existing site header retains its 100px height. The card artwork reflects the supplied references using the genuine project screenshot and labeled sample interfaces.

| View       | Earlier hero                                       | Locked hero                                                                 |
| ---------- | -------------------------------------------------- | --------------------------------------------------------------------------- |
| 1324 × 754 | [Before](../qa-output/locked-hero/before-1324.png) | [After](../qa-output/locked-hero/visual-1324.png)                           |
| 1440 × 900 | [Before](../qa-output/locked-hero/before-1440.png) | [After](../qa-output/locked-hero/visual-1440.png)                           |
| 390 × 844  | [Before](../qa-output/locked-hero/before-390.png)  | [Complete mobile hero](../qa-output/locked-hero/visual-mobile-complete.png) |
| 768 × 1024 |                                                    | [Tablet](../qa-output/locked-hero/visual-768.png)                           |

Screenshots and raw test reports are local files in `qa-output/locked-hero/`.

[1324 × 754 reference beside the implementation](../qa-output/locked-hero/reference-comparison.png)

## Verification

- `npm run build` and `npm run typecheck` passed. The static export contains 47 canonical pages. The repository does not define a separate lint command.
- `node scripts/qa-signature-hero.mjs` passed at 17 viewport sizes from 320px to 1920px, including short and landscape viewports. It checks the single HTML and accessible H1, desktop headline alignment, portrait and brush geometry, rendered color at both pupils, CTA clearance and card navigation.
- Four scoped axe scans returned zero violations. Browser checks passed for keyboard focus, touch, reduced motion, forced colors, no JavaScript and 200% text size. All four doodles responded to pointer hover on the final build.
- `npm run test:browser` passed all 43 checks on the initial locked build. The final placement and hover refinements passed the focused hero suite. No runtime errors were recorded by either suite.
- `npm run test:seo` checked 47 pages and 89 assets with zero failures.
- `npm run test:origin` passed all 17 checks. The one-second HAMID hold, upward curtain, staggered content, skip controls and history behavior were verified.
- Prettier and `git diff --check` passed for the edited hero files.

## Loading measurements

Three cold Chrome contexts per scenario, against the local optimized export, on 23 November 2026. Optional analytics were blocked in the lab. The phone measurements use Chrome emulation at DPR 2. The throttled run used 4× CPU slowdown, 150ms latency and 1.6 Mbps download speed.

| Scenario                          | Median browser LCP | Median CLS |
| --------------------------------- | -----------------: | ---------: |
| 1440 × 900, intro previously seen |             312 ms |      0.029 |
| 390 × 844, intro previously seen  |             284 ms |          0 |
| 390 × 844, throttled              |           1,300 ms |      0.038 |

The genuine responsive portrait is eager and reserves its original dimensions. The device screenshot uses existing responsive WebP files, the other previews and accents are CSS or small inline SVG, and the hero adds no runtime dependency. Browser paint timing is independent of how long an eligible first-visit intro remains on screen.

Desktop and mobile checks used installed Chrome and emulated touch on Windows. Physical mobile devices, Safari, Firefox and real-user performance metrics remain unverified.
