# HAMID — final approved Contact reference

Implemented from the owner's **HAMID_Contact_Final_Codex_Reference_Package (1).zip**, its complete `00_MASTER_PROMPT.md`, approved 1199 × 1312 reference and accompanying execution directive. The reference controls the composition; the existing HAMID identity and working contact destinations remain the foundation.

## Visual implementation

The page now presents a compact dark Soft UI form opposite the editorial H1, “Have an idea? / Let’s make it real.” The form uses the exact “Let’s talk.” heading, “Tell me about your idea.” subline, four visible categories — Website, Growth, Automation, Other — icon-led name/email fields, one message area, the orange “Send enquiry” action and “Prefer WhatsApp?” alternative.

The supporting portrait is the actual existing Hamid cutout, presented in a small orange tile using CSS cropping and grayscale. The source file and facial likeness were preserved. The location marker is a static orange decoration, not live presence. Original lightweight SVG paths provide the upper-left curve, hero wave and right-edge light. Their entrance draws once; reduced motion removes it.

Exactly three contact tiles follow: Chat on WhatsApp, Arrange a call and Build a project brief. The process has exactly three compact icon-led stages, followed by four native HTML FAQ rows. A new original dark stone image anchors the lower-left corner behind the content. It is hidden on phones. The reference screenshot is never used as a product background or an interactive substitute.

The original shared navigation, Reviews destination, header CTA and footer continue unchanged. The actual front-facing portrait, darker submit-button text for contrast, concise privacy line and real CAPTCHA state are intentional implementation details. The screenshot's pose and absence of a security widget do not justify changing Hamid's face or removing functional safeguards.

## Mobile transformation

The main introduction is centered, with a compact real portrait and personal note. Decorative curves simplify, the rock is hidden, and the form follows early in normal document flow. Four chips become a 2 × 2 grid, the inputs stack, the textarea remains expandable and the submit action becomes full-width. Three contact tiles become short stacked rows. Process steps become a compact vertical line; FAQs stay native accordions. No fixed composer, clipped form height or body scroll lock is introduced.

## Form architecture and truthful status

The existing owner-supplied public Web3Forms identifier, receiving inbox `hamidwork360@gmail.com`, hCaptcha loader, validated JSON payload, timeout, pending guard, provider response checks, failure preservation and consent-aware analytics remain. The visible form now asks only for name, email, category and message. Incoming website/landing-page, growth and automation contexts map to the corresponding concise category. Agency and AI-assistant contexts map to Other; their entry source is retained. Website is the explicit default and users can change it.

Only a provider HTTP 200 with `success: true` triggers acceptance UI and the lead event. Errors, rate limits, malformed replies and lost responses preserve the note. A lost response is reported as uncertain, with no automatic retry. Explicit review is required before form contents enter a WhatsApp draft. A direct WhatsApp link never carries typed details automatically. No-JavaScript visitors retain direct WhatsApp/email access.

Web3Forms provides the managed remote backend, server CAPTCHA processing, spam filtering and provider rate limits. Custom field validation runs in the browser for this direct integration. It does not claim a bespoke server-side business validator or cross-session deduplication. The original separate Vercel/Turnstile/Upstash/Resend planner and agency paths remain independently configured and retain their own protections. Their source and company requirement were preserved.

The owner previously confirmed required hCaptcha is enabled. **Real provider acceptance and Gmail inbox arrival remain unverified.** The earlier real-provider probe encountered an automated Cloudflare challenge; controlled success tests are not evidence of inbox delivery. The remaining account check is a normal-browser submission with hCaptcha, followed by confirmation in the receiving inbox. No new credentials or calendar setup are needed for this visual update. See [the original configuration record](contact-first-conversation.md#account-setup-and-actual-delivery-status).

## Files and assets

| File                                          | Change                                                                                                               |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `app/contact/page.tsx`                        | Same route/metadata/schema; composes the approved hero, form, alternatives, process, FAQ and background layers       |
| `app/first-conversation.css`                  | Reference-specific proportions, dark Soft UI materials, local lighting, mobile composition, focus and reduced motion |
| `components/contact/ConversationComposer.tsx` | Retains submission/state logic; concise heading, four radios, minimal fields, accurate states and reviewed fallback  |
| `components/contact/ContactFormFields.tsx`    | Native accessible name/email/message controls and stroke icons                                                       |
| `components/contact/ContactSections.tsx`      | Real portrait/personal note, genuine contact tiles, three-stage process and four FAQs                                |
| `components/contact/ContactIcon.tsx`          | Small consistent original SVG icon set                                                                               |
| `components/contact/ContactArtwork.tsx`       | Decorative orange paths and responsive stone accent                                                                  |
| `components/contact/ContactSignal.tsx`        | Refined hero wave and single accent node                                                                             |
| `data/conversation.mjs`                       | Four canonical category records and safe incoming context mapping                                                    |
| `public/images/contact/stone-640.webp`        | Original transparent stone render, 640 × 427, 30,664 bytes                                                           |
| `public/images/contact/stone-960.webp`        | Retina alternative, 960 × 640, 61,636 bytes                                                                          |
| `docs/contact-final-art.json`                 | Exact final generation prompt and built-in tool provenance                                                           |
| `scripts/qa-conversation.mjs`                 | Updated 13-width design checks, four categories, concise fields and preserved state/security regressions             |
| `README.md` and earlier report                | Current implementation link and historical-version note                                                              |

The stone was generated with the built-in `image_gen` tool and optimized to project-local alpha WebP. No CLI/API fallback or stock mountain was used. The exact prompt is saved in [contact-final-art.json](contact-final-art.json). The actual portrait source is `/images/responsive/hamid-hero-warm-320.webp`. No new runtime package was installed.

## Verification and visual review

The first full reference pass succeeded at 320, 360, 375, 390, 414, 430, 480, 768, 1024, 1200, 1280, 1440 and 1920px. Its 15 functional checks passed. Screenshot review compared the actual 1200px main page with the approved image, then trimmed extra vertical space from the hero wave and increased lower-section text for readability. The final checks below passed after the refinement. A final desktop capture also verified the upper-left curve placement and accessibility at 1200 and 1440px.

The suite checks all four categories and canonical payloads; native radio keyboard input; missing/invalid fields; error focus; all contact destinations; required CAPTCHA, expiry, block and retry; honeypot; false or malformed success; HTTP errors and rate limits; ambiguous network outcomes; pending duplicates; safe GA4 events; no-JavaScript contact access; long values; reduced motion; FAQ keyboard control; 200% CSS reflow and a short viewport representing keyboard space. It also exercises the original planner review/send flow and the dedicated agency company requirement with their actual endpoint in a controlled fixture.

Raw results, captures and the test-only export are in ignored `qa-output/contact-final/`. The available browser is Windows Chrome with responsive emulation. Physical phones, a real mobile keyboard, Safari/Firefox and a new Lighthouse score are not claimed. The privacy notice and existing delivery safeguards were retained; private form content stays out of analytics and browser storage.

### Final executed checks

| Check                         | Actual result                                                                                                               |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Production build              | Passed; 47 canonical pages and host assets generated                                                                        |
| TypeScript                    | Passed                                                                                                                      |
| Contact suite                 | 15 passed, 0 failed; all 13 required widths, all four categories and controlled provider/CAPTCHA states                     |
| Original server suite         | 12 passed, 0 failed; existing validation, rate limits, failure handling and idempotency preserved                           |
| General website browser suite | 43 passed, 0 failed; no runtime errors                                                                                      |
| SEO/accessibility suite       | 47 pages, 97 assets, 0 failures                                                                                             |
| Formatting and diff checks    | Passed on the changed files                                                                                                 |
| Screenshot inspection         | Approved reference compared at 1200px, plus desktop/tablet and 320/390px mobile review; final curve placement checked again |

The SEO test initially flagged its old requirement for visible breadcrumbs on every interior page. The approved Contact reference omits a breadcrumb trail, so `scripts/qa-seo.mjs` now explicitly exempts only `/contact/` from that visual/schema assumption. Canonical, indexability, H1, metadata, assets and accessibility checks remain. Other interior pages retain their original breadcrumb checks. No hidden navigation or decorative schema was added to satisfy a score.

The exported Contact HTML measures approximately 64.6 kB, or 12.4 kB in the local Brotli export. These are file-size measurements, not load-time or Lighthouse claims. The small real portrait is reused; the 30.7/61.6 kB stone alternatives load lazily and the stone is hidden on mobile.

### Final screenshots and reference comparison

- [Approved reference beside the actual 1200px implementation](screenshots/contact-final/reference-comparison.webp)
- [Desktop 1200px, full main page](screenshots/contact-final/desktop-1200.webp)
- [Desktop 1440px](screenshots/contact-final/desktop-1440.webp)
- [1024px](screenshots/contact-final/desktop-1024.webp)
- [Tablet 768px](screenshots/contact-final/tablet-768.webp)
- [Mobile 390px](screenshots/contact-final/mobile-390.webp)
- [Mobile 320px](screenshots/contact-final/mobile-320.webp)
- [Success appearance — controlled fixture, not real inbox delivery](screenshots/contact-final/success-fixture.webp)
- [Failure appearance — controlled fixture](screenshots/contact-final/error-fixture.webp)
