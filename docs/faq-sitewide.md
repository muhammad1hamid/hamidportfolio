# HAMID — shared editorial FAQs across the website

Implemented and verified on **25 November 2026**. The approved Contact FAQ design now serves **all 15 existing FAQ pages**, preserving **81 original questions and answers**, their source links and published answer IDs. Pages without an existing FAQ have not received repeated generic content.

## Coverage

| Route                              | Questions |
| ---------------------------------- | --------: |
| `/`                                |         6 |
| `/ai-automation/`                  |         3 |
| `/whatsapp-ai-chatbot/`            |         3 |
| `/ai-receptionist/`                |         3 |
| `/restaurant-whatsapp-automation/` |         3 |
| `/website-chatbot/`                |         3 |
| `/ai-agents/`                      |         3 |
| `/workflow-automation/`            |         3 |
| `/web-development/`                |         3 |
| `/landing-page-development/`       |         3 |
| `/business-dashboards/`            |         3 |
| `/growth/`                         |         8 |
| `/for-agencies/`                   |        10 |
| `/contact/`                        |         4 |
| `/answers/`                        |        23 |
| **Total**                          |    **81** |

## Implementation

`EditorialFAQ` reuses the locked solid charcoal/ivory composition, diagonal background, existing Manrope/Instrument Serif fonts, orange editorial heading, numbered badges and understated curve. All pages now use the same mobile stacking, question controls and 380ms transitions. The first item opens by default; only one item opens at a time; the active item can close. Keyboard navigation, visible focus, inert closed links, reduced motion and the no-script answer fallback are shared rather than copied between pages.

Page-specific answers remain in their existing data or page wrappers. React renders answer text and inline sources as HTML, without arbitrary HTML injection. Source and follow-up links remain real links. No FAQPage, Speakable or experimental search markup was added. No new runtime dependency, canvas, image or animation engine is needed for the FAQ itself.

The answer library keeps its five topic labels, all 23 answer IDs, source destinations and direct-link controls. Explicit answer/topic fragments open the corresponding answer and scroll to the published target. Fragment decoding handles malformed input, and pending scroll work is cancelled on unmount or superseded navigation. Other pages do not automatically scroll when a question is opened. With JavaScript disabled all answers and their links are readable in server-rendered HTML.

`EditorialPageFlow` is a server-rendered layout helper. It groups normal content into the existing `.wrap` container and leaves the FAQ at full width. It preserves the original block layout and margin collapsing around the surrounding service/agency content. It does not use viewport-width margins, horizontal transforms or absolute positioning to force a full-width section. `ContentPage` opts into that behavior only for the affected service and answer routes. Other content pages retain their existing layout.

## Changed files

| File                                                     | Change                                                                                                                             |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `components/ui/EditorialFAQ.tsx`                         | Shared accordion, safe answer/source rendering, keyboard controls, published fragment navigation and no-script fallback            |
| `components/ui/EditorialFAQ.module.css`                  | Shared locked design, mobile layout, page-style isolation, grouped answer headings and source links                                |
| `components/ui/EditorialPageFlow.tsx`                    | Server-side full-width FAQ placement while retaining normal `.wrap` flow for other content                                         |
| `components/contact/ContactFAQ.tsx`                      | Contact-specific questions and direct-email answer now passed to the shared component                                              |
| `components/contact/ContactFAQ.module.css`               | Retains only the existing Contact tail-spacing rule; visual styles move to the shared stylesheet                                   |
| `components/sections/Faq.tsx`                            | Homepage questions and Growth Engine link rendered through the shared component                                                    |
| `components/seo/ContentPage.tsx`                         | Optional full-width-section support; default behavior retained for other pages                                                     |
| `components/seo/GrowthEngine.tsx`                        | Eight original Growth FAQs and inline sources use the shared design                                                                |
| `app/[service]/page.tsx`                                 | Ten standard service FAQ sections use their own original data through the shared design                                            |
| `app/for-agencies/page.tsx`                              | Ten agency questions use the shared design; full-width placement surrounds the existing page content                               |
| `app/answers/page.tsx`                                   | One shared answer library with preserved topics, IDs, sources and permalinks                                                       |
| `components/tools/AnswerNavigation.tsx`                  | Obsolete native-details handler removed; shared state now handles its fragment behavior                                            |
| `scripts/qa-faq-sitewide.mjs`                            | Responsive/content/link/accessibility checks for all FAQ routes and published fragments                                            |
| `scripts/qa.mjs`                                         | Homepage FAQ checks updated for shared controls and the default-open state                                                         |
| `scripts/qa-agency.mjs`                                  | Agency FAQ keyboard and no-script checks updated for shared controls                                                               |
| `scripts/qa-discovery.mjs`                               | Shared FAQ/fragment assertions, current mobile capability navigation, current Contact links and actual WhatsApp event expectations |
| `package.json`                                           | Adds `test:faq-sitewide`; no dependency changes                                                                                    |
| `README.md`, `docs/contact-faq-editorial.md`             | Current implementation links and a note on the shared follow-up                                                                    |
| `docs/faq-sitewide.md`, `docs/screenshots/faq-sitewide/` | This report and ten actual desktop/mobile FAQ captures                                                                             |

The agency source diff includes indentation from the new server layout wrapper. Its non-FAQ copy and controls were not rewritten. Pre-existing uncommitted process/timeline work was kept outside this implementation and its commit.

## Actual verification

| Check                                                | Result                                                                           |
| ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| Production build                                     | Passed; 47 canonical pages and production assets generated                       |
| TypeScript                                           | Passed                                                                           |
| `npm run test:faq-sitewide`                          | **19 passed, 0 failed**                                                          |
| `npm run test:contact-faq`                           | **18 passed, 0 failed**; original Contact design and interaction checks retained |
| `npm run test:browser`                               | **43 passed, 0 failed**, no runtime errors                                       |
| `npm run test:agency`                                | **9 passed, 0 failed**                                                           |
| `npm run test:discovery`                             | **7 checks and 20 demo cases passed**, no runtime errors                         |
| `QA_BASE_URL=http://127.0.0.1:3000 npm run test:seo` | **47 pages, 96 assets, 0 failures**                                              |
| Formatting and diff checks                           | Passed on changed files                                                          |

Every FAQ route was exercised at **320, 390, 768 and 1440px**. Every answer was opened in turn at 320 and 1440px. Homepage, Growth, standard service, agency and answer-library variants also passed **360, 375, 414, 430, 1024, 1280 and 1920px**. The retained Contact suite covers its full 12-width matrix, rapid activation, touch, long content, 200% CSS zoom/reflow, reduced motion and keyboard navigation.

The checks confirm full-width containment, no horizontal overflow after responsive layout settles, safe spacing around the diagonal, unchanged fonts, answer readability, control separation, single-open behavior and accessible state. Axe WCAG A/AA checks passed on every FAQ route at 320 and 1440px. Six representative page types were also checked without JavaScript. All 23 answer fragments and all five topic fragments opened their correct content. Original questions, answers, source links and answer IDs matched the captured baseline.

The Contact layout, service/agency headings, breadcrumbs, initial actions and other selected upper-page regions were compared with the published pre-update version at 390 and 1440px. Their positions and sizes matched within a 0.2px subpixel tolerance. The first integration exposed altered margin collapsing; the final server layout helper preserves normal block flow. Browser capture also required waiting for the site's existing responsive widgets to settle after viewport changes; the tests use a bounded condition, not hidden overflow or product-style changes.

The discovery test still referred to an older mobile capability layout and earlier Contact CTA names. Its selectors now exercise the actual mobile capability picker, current Growth selection, WhatsApp link and project-brief link. Its analytics assertion checks the existing generic Contact event rather than claiming an obsolete Growth-specific WhatsApp event. Production analytics code was not changed.

## Screenshots

These are actual Chrome captures. Fixed navigation and the existing floating mobile Contact action were hidden only for the isolated FAQ screenshots.

| Page type       | Desktop                                                      | Mobile                                                     |
| --------------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| Homepage        | [1440px](screenshots/faq-sitewide/home-1440.webp)            | [390px](screenshots/faq-sitewide/home-390.webp)            |
| Growth Engine   | [1440px](screenshots/faq-sitewide/growth-1440.webp)          | [390px](screenshots/faq-sitewide/growth-390.webp)          |
| Web development | [1440px](screenshots/faq-sitewide/web-development-1440.webp) | [390px](screenshots/faq-sitewide/web-development-390.webp) |
| Agencies        | [1440px](screenshots/faq-sitewide/agencies-1440.webp)        | [390px](screenshots/faq-sitewide/agencies-390.webp)        |
| Answer library  | [1440px](screenshots/faq-sitewide/answers-1440.webp)         | [390px](screenshots/faq-sitewide/answers-390.webp)         |

Local logs, baseline evidence and full test results are in ignored `qa-output/faq-sitewide/`. The Contact FAQ suite retains its output in `qa-output/faq-editorial/`. The general and SEO suites also write their usual reports under `qa-output/`.

## Limits

Browser checks used installed Windows Chrome with responsive and touch emulation. Physical phones, Safari, Firefox, native browser-menu zoom and assistive-technology user testing were not performed. The 200% check uses CSS zoom/reflow. No new Lighthouse score or email-delivery result is claimed. This change requires no external account setup and does not modify the enquiry providers, forms, booking behavior or analytics implementation.
