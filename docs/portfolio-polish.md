# HAMID portfolio — Unslop polish record

23 November 2026. A light polish of the existing portfolio, using its established visual direction and the owner's standing instruction to choose and implement the best approach.

## Direction

- **Product:** Hamid's independent website development, search visibility and practical automation work for businesses and agencies.
- **Character:** precise, warm, considered.
- **World:** a graphite working studio, with real website captures as the evidence.
- **Moments:** the actual Hamid portrait and the real portfolio work carry the visual richness.
- **Signature:** the existing HAMID mark and restrained warm orange accent.

The existing site already has a coherent identity. This run uses polish mode: the charcoal/ivory/orange palette, Manrope and Instrument Serif, section order, content, portraits, project captures and current mobile hero composition remain. The owner-approved cinematic intro, spatial project transitions, header border beam, serif headline treatments and three dimensional hero cards are accepted brand choices. The Curve scene and its reverse transitions remain intact.

## Audit and nine passes

| Pass    | Observed issue                                                                                                                                                                         | Implemented treatment                                                                                                                                                                                                    |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Spacing | Repeated section endings use 65, 90, 100 and 110px; sibling controls use inconsistent fixed gaps/paddings                                                                              | Repeated homepage endings use 96px desktop and 64px mobile; related groups use 12/16/20/24/40px steps; fluid sizing and intentional optical offsets remain                                                               |
| Color   | Growth service card is permanently brown/orange, while other service cards are neutral; form panels have a radial orange wash; tiny decorative dots and the testimonial frame add glow | Shared neutral panel surfaces, quieter default arrows and selected controls, flat enquiry panels; orange remains on primary actions, meaningful states and the owner's visual assets                                     |
| Icons   | Secondary action arrows range from 13 to 18px; workbench navigation icons are larger than needed                                                                                       | Reuse the existing icon set with 16px secondary arrows and 24px workbench icons; illustration/brand icons keep their intended proportions                                                                                |
| Copy    | Existing copy already describes specific services and honestly separates demos, experience notes and measured work                                                                     | Retain published words, facts, destinations and demo classifications; retain approved headline punctuation; introduce no claims, testimonials, results or filler                                                         |
| Type    | 9–11px tracked capitals in mobile labels/captions, 10px project categories, bold orange article metadata, and negative tracking on small hero descriptions                             | Sentence-case labels at 12–13px, 12px mobile project categories/testimonial labels, 14px mobile contact links, neutral article metadata and normal tracking on small hero copy; headline families and composition remain |
| Layout  | Service cards and long content pages need more consistent internal grouping                                                                                                            | Keep all sections, responsive alignments and layouts; balance service-card padding, list spacing and content-page vertical rhythm                                                                                        |
| Details | Permanently highlighted secondary controls compete with the current primary action                                                                                                     | Neutral raised selected states with meaningful small accents; preserve focus rings, touch targets, semantic labels and clear project proof labels                                                                        |
| Visuals | Existing original portraits, project screenshots and illustrative workflow already explain the work                                                                                    | Preserve those assets; remove redundant decorative color washes; no stock visuals, generated replacements, new scenes or image prompts were needed                                                                       |
| Motion  | Shared button hovers rise 3px with a 500ms transform transition                                                                                                                        | Use a 2px hover lift and 160–180ms named transitions with the existing easing; preserve the owner's explicitly approved intro, hero/card motion, navbar beam and functional gallery movement                             |

The mobile floating WhatsApp action retains its destination, visibility rules and comfortable touch target. Its neutral raised surface and small orange arrow give the project content more attention. The selected Work and Services mobile center alignment remains.

## Changed files

| File                                            | Change                                                                                                                                                                              |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/globals.css`                               | Shared label typography, breadcrumb-independent neutral text hierarchy and quicker button feedback                                                                                  |
| `app/refinements.css`                           | Homepage section rhythm, mobile category legibility, decorative-dot cleanup and quieter floating WhatsApp action                                                                    |
| `app/home-growth.css`                           | Neutral service cards, state-aware arrows, readable summaries and consistent card/list spacing                                                                                      |
| `app/contact.css`                               | Flat enquiry surface, quieter process indicator, clearer secondary links and consistent padding                                                                                     |
| `app/testimonials.css`                          | Readable captions, neutral selected controls, repeated spacing and removal of the background wash/oversized shadow                                                                  |
| `app/projects.css`                              | Legible categories/proof labels, restrained metadata weight and consistent action arrows                                                                                            |
| `app/hero-cards.css`                            | Normal letter spacing on small descriptive copy; approved card visuals/placement retained                                                                                           |
| `app/growth-engine.css`                         | Quieter kicker and specimen captions; published Growth Engine scope/content retained                                                                                                |
| `app/content.css`                               | Shared content-page spacing and breadcrumb legibility                                                                                                                               |
| `app/insights.css`                              | Neutral article metadata and state-aware reading links, consistent action icons                                                                                                     |
| `components/sections/ExploreFurther.module.css` | Quiet workbench navigation, label typography, icon sizing and grouping; interactive illustrations/functions retained                                                                |
| `scripts/qa.mjs`                                | Update the generic homepage regression check to validate the already-approved mobile order and scroll-reachable CTA touch targets; tablet/desktop CTAs still fit their first screen |

Existing in-progress Process/timeline source changes were left intact and are outside this commit. No dependency, route, project record, schema fact, backend configuration or analytics event was changed.

## Verification

Browser artifacts and raw measurements are saved locally in `qa-output/unslop/` and are ignored by Git. Initial and reviewed captures cover the homepage, Services, Growth Engine, Contact, Insights and About at 1440px and 390px. The reviewed set contains no page overflow or browser errors. Individual section review captures hide fixed navigation/contact chrome only during capture, so those fixed layers do not appear halfway through a long screenshot.

Observed mobile measurements:

| Element                                                      | Before                                 | After                                |
| ------------------------------------------------------------ | -------------------------------------- | ------------------------------------ |
| Project category                                             | 10px, uppercase, 0.7px tracking        | 12px, original case, 0.12px tracking |
| Shared service/contact labels                                | 12px, uppercase, 1.44px tracking       | 13px, original case, 0.13px tracking |
| Testimonial kicker                                           | 9px, uppercase                         | 12px, original case                  |
| Contact choice links                                         | 12px                                   | 14px                                 |
| Homepage service summary                                     | 14px                                   | 15px                                 |
| Small text with negative tracking in the six inspected pages | Present in the three hero descriptions | None found by the same query         |

| Production verification                                             | Actual result                                                                                                                                            |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build`                                                     | Passed; 47 canonical pages and host assets generated                                                                                                     |
| `npm run typecheck`                                                 | Passed                                                                                                                                                   |
| Prettier on all changed source and report files; `git diff --check` | Passed                                                                                                                                                   |
| `node scripts/qa-signature-hero.mjs`                                | 17 viewport layouts passed, four scoped WCAG axe scans, touch/keyboard links, 200% text, reduced motion, no-JavaScript and retained intro/hover behavior |
| `npm run test:browser`                                              | 43 passed, 0 failed; no browser runtime errors                                                                                                           |
| `npm run test:seo`                                                  | 47 pages, 91 assets, 0 failures; includes canonical/indexing/schema checks, responsive overflow checks and 45 whole-page WCAG axe scans                  |
| `npm run test:discovery`                                            | Seven checks and all 20 deterministic demo routing cases passed; no browser errors                                                                       |
| `node scripts/qa-curve-navigation.mjs`                              | Passed navigation direction/jitter/focus, endpoint clamp, reverse/replay, footer and scroll cleanup, 18 HTML entries and six working detail destinations |
| Final visual audit                                                  | Twelve page/viewport combinations, no overflow or browser errors; third and final review round                                                           |

An initial general-browser run retained the old expectation that phone CTAs appear before the portrait and fit the first screen. That expectation conflicted with the owner's already-approved mobile order. The test now verifies portrait/cards → intro → scroll-reachable CTAs with at least 44px touch height; tablet/desktop still require first-screen CTA visibility. The corrected full run passed. No product behavior was weakened to accommodate the old test.

There is no ESLint task configured; no ESLint result is claimed.

## Review captures

- [Desktop service section](screenshots/unslop/capabilities-desktop.webp)
- [Mobile selected work](screenshots/unslop/selected-work-mobile.webp)
- [Mobile contact page](screenshots/unslop/contact-mobile.webp)
- [Desktop interactive workbench](screenshots/unslop/workbench-desktop.webp)
- [Preserved mobile hero](screenshots/unslop/hero-mobile.webp)
- [Services directory](screenshots/unslop/services-desktop.webp)

## Limits and method credit

Tests use Windows Chrome and touch emulation. Physical mobile devices, Safari and Firefox are not claimed. Automated captures block third-party requests, so embedded video playback and external service availability are not inferred from them. Existing enquiry configuration/fallback behavior is retained; no email delivery or appointment was simulated as a real successful lead.

Method: **Unslop by Damir Sokolovsky** ([@heydamir](https://x.com/heydamir), [heydamir.design/unslop](https://heydamir.design/unslop)), CC BY 4.0. The supplied method was applied as a brand-preserving polish pass.
