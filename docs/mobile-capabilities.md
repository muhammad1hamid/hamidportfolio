# HAMID — mobile capabilities showcase

Implemented 23 November 2026 for the homepage's **What I Build & Improve** section. The supplied mobile mockup and master prompt define the composition. The owner's later instruction explicitly excludes videos, so the delivered showcase uses static imagery and HTML visuals only.

## Result and scope

Below 768px, the section presents the exact two-line headline, **Different disciplines. / One way of thinking.**, a short personal introduction, four compact selectors in a 2 × 2 grid, and one horizontal capability showcase. Each category has its own meaningful visual, concise description, focus tags and real service destinations. The active selector has an orange outline and check, while the four small pagination marks follow selection and swiping. A restrained next-card edge indicates the carousel continues; it is smaller at 320px.

At 768px and above, the original heading, H mark, service cards, spacing and destinations remain. The homepage hero, Selected Work, About, testimonials, process timeline, workbench, FAQs, final contact section, navigation, footer and Curve gallery were not redesigned.

## Files

| File                                                    | Responsibility                                                                                                                              |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/sections/Capabilities.tsx`                  | Keeps the existing server-rendered section/desktop cards and adds the responsive heading and mobile showcase                                |
| `data/capability-showcase.ts`                           | One presentation registry, joined to the four existing service pillars; shared selector/slide names, text, tags and CTA routes              |
| `components/sections/MobileCapabilityStudio.tsx`        | Single active index, native scroll synchronization, selectors, keyboard controls, focus, pagination and resize cleanup                      |
| `components/sections/MobileCapabilityStudio.module.css` | Styles scoped to this section and below 768px; selector grid, device framing, media compositions and native scroll snap                     |
| `components/sections/CapabilityMedia.tsx`               | Actual Bridal House capture, original HTML search structure, illustrative workflow and an excerpt from the existing enquiry demo            |
| `scripts/qa-capabilities.mjs`                           | Viewport/state tests, real touch gestures, keyboard/resize/reduced-motion/no-JS checks, links, accessibility and baseline pixel comparisons |

No new dependency, global stylesheet, video, model-generated artwork, analytics event definition or route was added. Existing Process/timeline work in the workspace remains outside this change.

## Visuals and truthful content

- **Web Experiences:** reuse `public/images/curve/bridal-house-960.webp`, the actual 960 × 640, 57,466-byte project capture, within a small device frame built in CSS. Its caption retains **Self-directed demo**. The primary link opens `/work/`, and the secondary opens `/services/#web-experiences`.
- **Growth Engine:** a legible HTML structure of real existing routes: `/web-development/`, `/answers/`, `/contact/`. It is labelled **Site structure example**, with no ranking, traffic graph or fabricated result. Its CTA uses `/growth/`.
- **Smart Systems:** a clearly labelled illustrative Capture → Organise → Draft a reply flow, based on the existing workbench example. Human approval before sending is explicit. Existing `ExploreIcon` paths are reused. Its CTA opens `/services/#smart-systems`.
- **AI Conversations:** the actual remote-collaboration question and first answer sentence from `demoKnowledge` in `data/enquiry-demo.ts`. The interface labels this as a sample from the existing approved-answer demo and says no message is sent. Its CTA opens `/services/#ai-conversations`.

The supplied screenshot is an art-direction reference, not evidence of its pictured client or results. No fictional laptop website, new client relationship, metrics or success story was introduced. No image prompt was needed. A recording was considered before the user excluded video; it is not referenced or shipped in the final assets.

## Interaction and accessibility

CSS scroll snap handles real horizontal finger swipes. Normal vertical page scrolling remains native, with no body lock or custom touch-move cancellation. The selected index is shared by the selector state, active slide and pagination. Selecting a tile scrolls only the horizontal track. Native scroll events update selection, and a ResizeObserver keeps the current category aligned after viewport changes.

The selectors are regular buttons in a named group with `aria-pressed` and a visible check, rather than mixing tab and carousel semantics. Left/Right and Home/End work on the selectors and track. Focus stays on the relevant selector or carousel during keyboard changes. Inactive slides become inert after hydration so their offscreen CTAs do not steal Tab focus. Every CTA is a genuine HTML link, using the existing consent-aware `service_pillar_click` tracking attributes; changing a category is not reported as a successful lead.

The track is labelled as a carousel, the slides are named, and a polite status reports the selected capability. Pagination is decorative and is not presented as a fake clickable control. Reduced motion uses immediate programmatic scrolling. Forced-color and keyboard focus states remain visible. Without JavaScript all four slide descriptions and five destination links remain in the server HTML, the track still scrolls horizontally and no slide is inert.

## Loading and performance

There are no videos, player controls, video downloads, autoplay loops, new carousel library or extra 3D renderer. The existing project capture loads lazily with fixed source dimensions. The other three visuals are HTML/SVG, so their meaning is available without downloading large media. The slides share a stable row height; selection does not resize the section. UI feedback uses named color/border transitions, and the site-wide reduced-motion preference is respected.

No Lighthouse score or physical-phone frame rate is claimed. The existing H-to-HAMID intro and other homepage motion remain unchanged.

## Verification

Raw logs, before/after screenshots and JSON records are in the ignored local folder `qa-output/capabilities/`.

| Check                                                | Actual result                                                                                                                                              |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build`                                      | Passed; 47 canonical production pages and host assets generated                                                                                            |
| `npm run typecheck`                                  | Passed                                                                                                                                                     |
| Prettier and `git diff --check` on the changed files | Passed                                                                                                                                                     |
| `node scripts/qa-capabilities.mjs`                   | Passed at 320, 360, 375, 390, 414, 430, 480, 768, 1024, 1280 and 1440px; all four mobile selections, stable section height, no overflow, valid CTA targets |
| Dedicated accessibility scans                        | No WCAG A/AA axe violations in the mobile section at 320 and 390px                                                                                         |
| Actual touch emulation                               | Left/right swipes, both end boundaries and vertical scrolling through the carousel passed                                                                  |
| Input and recovery                                   | Keyboard Left/Right/Home/End, runtime reduced motion, mobile-to-tablet-to-mobile resize and current-category restoration passed                            |
| No JavaScript / media                                | Four descriptions and five real CTA links in HTML, no inert panels without hydration, no video elements or video requests                                  |
| Desktop/tablet protection                            | 0 changed pixels and identical card geometry at 768, 1024, 1280 and 1440px against the original baseline; unrelated hero compared at seven recorded widths |
| `npm run test:browser`                               | 43 passed, 0 failed, no runtime errors                                                                                                                     |
| `npm run test:seo`                                   | 47 pages, 92 referenced assets, 0 failures; includes indexability, canonical/schema, responsive overflow and whole-page accessibility checks               |

The last card's end spacing was corrected during review so it can fully reach its intended snap position. The final complete suite passed. A first touch harness used a fixed page coordinate that could hit a CTA after native scrolling; it now derives the swipe position from the actual track bounds. No page-level input interception was added to accommodate the test.

Measured section heights at a 900px test viewport:

| Phone width | Previous section | New section | Reduction |
| ----------- | ---------------- | ----------- | --------- |
| 320px       | 1,610px          | 1,085px     | 32.6%     |
| 390px       | 1,535px          | 1,038px     | 32.4%     |
| 430px       | 1,486px          | 1,022px     | 31.2%     |

These are local layout measurements, not business or speed claims. All four selected states maintain the same height at each tested width.

## Screenshots

- [Web Experiences at 390px](screenshots/mobile-capabilities/web-mobile.webp)
- [Growth Engine at 390px](screenshots/mobile-capabilities/growth-mobile.webp)
- [Smart Systems at 390px](screenshots/mobile-capabilities/systems-mobile.webp)
- [AI Conversations at 390px](screenshots/mobile-capabilities/conversations-mobile.webp)
- [320px mobile](screenshots/mobile-capabilities/mobile-320.webp)
- [430px mobile](screenshots/mobile-capabilities/mobile-430.webp)
- [Unchanged 768px tablet](screenshots/mobile-capabilities/tablet-768.webp)
- [Unchanged 1440px desktop](screenshots/mobile-capabilities/desktop-1440.webp)

Chrome on Windows and touch emulation are the available browser environments. Physical iOS/Android hardware and Safari/Firefox are not claimed. No external account configuration is required for this section.
