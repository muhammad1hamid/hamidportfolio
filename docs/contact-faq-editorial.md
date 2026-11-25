# HAMID — locked editorial Contact FAQ

The approved design has since been moved into a shared component and applied to all existing FAQ pages. See the [sitewide implementation record](faq-sitewide.md) for the current file locations, coverage and verification. This document records the original Contact-only implementation and design reference.

Implemented and checked on **25 November 2026** for `/contact/` from the owner's **HAMID — Final Locked FAQ Section / Solid Editorial Split Design** brief and the supplied 1459 × 746 reference image.

## Delivered experience

The Contact FAQ is now a full-width solid charcoal and warm ivory composition. Its desktop background boundary runs from 40% of the width at the top to 29.5% at the bottom. Only the background is clipped: the heading, questions, answers and focus outlines remain horizontal and unrestricted.

The left panel uses the approved “Everything / you need to / know.” heading, existing Manrope and Instrument Serif typography, the exact supporting copy, a short orange eyebrow stroke and a lightweight original curved SVG line. The right panel contains the four exact approved questions, rounded rectangular number badges, short vertical separators, thin horizontal dividers and plain plus/minus controls. There are no FAQ cards, gradients, glows, images, glass effects, textures or animation libraries.

The existing form, contact hero, portrait, alternatives and process remain unchanged. The FAQ moves out of the constrained page wrapper to achieve the approved full-width design. The previous FAQ mountain and its trailing page space are removed. Its old asset files are retained for the historical record but are no longer rendered or fetched by this page. Navigation, footer, homepage, services, gallery and delivery implementation were not modified by this task.

## Changed files

| File                                                     | Change                                                                                                                                              |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/contact/ContactFAQ.tsx`                      | Dedicated interactive FAQ; factual answers; first item open; single-open state; keyboard navigation; semantic controls and no-script fallback       |
| `components/contact/ContactFAQ.module.css`               | Scoped solid split layout, clipped backgrounds, typography, numbered rows, responsive stacking, state transitions, visible focus and reduced motion |
| `components/contact/ContactSections.tsx`                 | Re-exports the new FAQ in place of the old native-details section; other three section implementations retained                                     |
| `app/contact/page.tsx`                                   | Places FAQ outside the centered wrapper, removes the previous mountain rendering and applies FAQ-specific tail spacing                              |
| `app/first-conversation.css`                             | Removes only obsolete FAQ, mountain and answer-animation rules; other Contact styling retained                                                      |
| `scripts/qa-contact-faq.mjs`                             | Reproducible responsive, keyboard, touch, state, motion, long-content, accessibility and no-script checks; optional before/after comparison         |
| `scripts/qa-conversation.mjs`                            | Updates the existing FAQ checks for real buttons and the default-open state; preserves form, planner and agency checks                              |
| `package.json`                                           | Adds `test:contact-faq`; no dependency changes                                                                                                      |
| `README.md`                                              | Links this implementation record and focused test command                                                                                           |
| `docs/contact-final-reference.md`                        | Marks the earlier FAQ appearance as superseded; keeps the form/hero implementation history                                                          |
| `docs/contact-faq-editorial.md`                          | This report                                                                                                                                         |
| `docs/screenshots/contact-faq/desktop-1462.webp`         | Actual desktop FAQ capture                                                                                                                          |
| `docs/screenshots/contact-faq/desktop-1024.webp`         | Actual compact desktop capture                                                                                                                      |
| `docs/screenshots/contact-faq/tablet-768.webp`           | Actual stacked tablet capture                                                                                                                       |
| `docs/screenshots/contact-faq/mobile-390.webp`           | Actual mobile capture                                                                                                                               |
| `docs/screenshots/contact-faq/mobile-320.webp`           | Actual narrow mobile capture                                                                                                                        |
| `docs/screenshots/contact-faq/reference-comparison.webp` | Supplied reference beside the actual 1462px browser capture                                                                                         |

## Layout and interaction implementation

Desktop uses a centered grid with room reserved between the editorial column and the accordion. A separate solid background layer creates the diagonal. At widths of 1000px and below, the layout stacks: a centered dark introduction ends in a short angled transition above the ivory list. At 600px and below, the accordion becomes `number / question / control`, with 20px horizontal padding, 35px badges and 15px answer text. Questions wrap naturally and the section grows with its content.

One React state value stores the active item. Item 01 is expanded initially; activating another closes the previous one; activating the current item closes it. Resize does not reset that state. The entire question row is a real button inside an H3. CSS grid rows animate between `0fr` and `1fr`, with answer opacity and a 5px translation, using the existing `cubic-bezier(0.22, 1, 0.36, 1)` easing over 380ms. There are no arbitrary maximum heights, delayed state timers, automatic scrolling or scroll locks. Transitions can reverse during rapid activation.

Each button has a stable ID, `aria-expanded` and `aria-controls`. Its answer region refers back through `aria-labelledby`. Closed answers are hidden from accessibility APIs and made inert, including their links. Decorative numbers, separators and SVGs are not announced. Enter/Space activate; Tab follows document order; arrows, Home and End move between question controls. Focus outlines remain visible. Reduced motion removes transitions and answer translation immediately.

Before hydration the question controls are disabled rather than misleadingly clickable. All answers are present once in server HTML. If JavaScript is disabled, a small scoped no-script style exposes all four answers; they carry no false hidden/inert state and direct email remains usable. No FAQPage, Speakable or other new structured data was added.

The right panel uses a darker orange (`#bd400b`) for small active text and controls, improving contrast on ivory. The left headline and decorative line retain bright orange. Open state also has a minus, expanded content and semantic state, so color is not the only indicator. International availability is described without inventing a history of international clients. No prices, guarantees or response-time promises were introduced.

## Verified results

| Check                                                | Actual result                                                                     |
| ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| `npm run build`                                      | Passed; 47 canonical pages and production host assets generated                   |
| `npm run typecheck`                                  | Passed                                                                            |
| `node scripts/qa-contact-faq.mjs`                    | **18 passed, 0 failed**                                                           |
| `npm run test:contact`                               | **15 passed, 0 failed**; controlled provider/CAPTCHA and legacy endpoint fixtures |
| `QA_BASE_URL=http://127.0.0.1:3000 npm run test:seo` | **47 pages, 96 assets, 0 failures**                                               |
| Prettier checks                                      | Passed for changed implementation/test files                                      |
| `git diff --check`                                   | Passed                                                                            |

The focused suite exercised **320, 360, 375, 390, 414, 430, 768, 1024, 1280, 1440, 1462 and 1920px**. Each width was tested with every answer expanded in turn. Checks cover wrapping, answer alignment, badge/control separation, full-width containment, touch target size, the diagonal safe area, mobile centering and no horizontal overflow.

Keyboard tests verify Enter, Space, arrows, Home/End, focus appearance and exclusion of a closed answer's email link. Motion tests verify 380ms transitions, rapid activation, hover without opening and state preservation across desktop/mobile resize. Reduced-motion, 200% CSS zoom/reflow, a long answer enlarged to 30px text, no-script access and mobile touch emulation also passed. Axe WCAG A/AA checks passed for the FAQ at 320, 390, 768, 1024 and 1440px. The Contact suite additionally checks accessibility across its current Contact layouts. No browser runtime errors were recorded.

Before editing, a baseline captured the Contact hero/form, portrait, alternatives and process at the same 12 widths. Their document positions, dimensions, fonts, colors and padding matched after the FAQ change. Fifteen element screenshots compared those sections at 320, 390, 768, 1024 and 1440px. They matched within 0.001% of pixels; the small observed difference was in the 1440px hero capture. Fixed navigation was excluded from those element comparisons. The first comparison attempt used screenshots taken after visiting the FAQ, which introduced scroll-dependent capture differences; taking both at the same initial page position resolved that test artifact without changing the Contact design.

The existing Contact suite passed all four categories, validation, error focus, pending/duplicate handling, guarded success, malformed/failed responses, uncertain network outcomes, CAPTCHA expiry/block/retry, honeypot, safe GA4 lead events, unconfigured fallback and no-script access. It also verified the planner's review/send path and the agency form's company requirement with controlled fixtures. These checks do not establish real email receipt.

Raw build logs, before/after captures and JSON results remain in ignored `qa-output/faq-editorial/`. The SEO suite writes `qa-output/seo-audit.json`. To repeat the focused checks after a production build and local start, run `npm run test:contact-faq`. It accepts `QA_BASE_URL`, `QA_FAQ_OUTPUT` and `CHROME_PATH`. Baseline comparison is optional and only applies when matching baseline files exist in that output directory.

## Screenshot review

The supplied reference was inspected against an actual browser capture close to its dimensions. The implementation retains the same dark/ivory split, slanted boundary, oversized heading, serif orange word, eyebrow, supporting copy, lower-left curve, badge shape, vertical separators, answer indent, dividers and plus/minus hierarchy. Existing website fonts are retained; this is a faithful responsive implementation, not a claim of pixel-identical raster reproduction. After the initial review, the desktop grid was corrected to use all available width and the question size was refined. Mobile and 1024px captures were inspected again.

- [Reference and actual desktop comparison](screenshots/contact-faq/reference-comparison.webp)
- [Desktop 1462px](screenshots/contact-faq/desktop-1462.webp)
- [Desktop 1024px](screenshots/contact-faq/desktop-1024.webp)
- [Tablet 768px](screenshots/contact-faq/tablet-768.webp)
- [Mobile 390px](screenshots/contact-faq/mobile-390.webp)
- [Mobile 320px](screenshots/contact-faq/mobile-320.webp)

## Limits and account requirements

Testing used installed Windows Chrome with responsive and touch emulation. Physical phones, Safari, Firefox, assistive-technology user testing and native browser-menu zoom were not verified. The 200% test uses CSS zoom/reflow. No new Lighthouse score is claimed. There is no configured lint script; TypeScript, formatting, build and browser checks were run instead.

This FAQ requires no account setup. Web3Forms, hCaptcha, WhatsApp, planner behavior and analytics code are unchanged. As recorded in the earlier Contact implementation, genuine receipt at `hamidwork360@gmail.com` still requires an ordinary human submission and owner inbox confirmation; automated controlled success is not a delivery confirmation. No new real enquiry was sent for this FAQ-only change.
