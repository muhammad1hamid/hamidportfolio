# HAMID / The First Conversation

This records the original letter-form version. The later owner-approved final Soft UI reference supersedes its visual layout and seven choices; see [the current final-reference record](contact-final-reference.md). The provider configuration and truthful delivery status described below remain relevant.

Implemented for `/contact/` on 23 November 2026. The supplied contact master prompt defines the design; the owner's subsequent instruction selects **Web3Forms** and the receiving inbox **hamidwork360@gmail.com**.

## Delivered experience

The existing charcoal, ivory, warm orange, Manrope and Instrument Serif identity continues into an asymmetric editorial invitation and a letter-style composer. The single H1 is “Have an idea? Let’s make it real.” The left side includes the approved supporting copy, a restrained typographic signature, the factual Pakistan/worldwide detail and one original inline SVG signal: idea → conversation → next step. The line draws once and reacts subtly to a selected topic. It is decorative and never crosses a field.

The composer has a personal greeting, seven native radio choices, underline fields, concise contextual prompts, optional details, a privacy note and the orange send action. Category changes preserve entered values. The surface is solid charcoal with fine graphite edges; it does not use WebGL, a video, a photo, an AI-generated asset or a glass blur.

Below it are genuine WhatsApp, email and planner destinations, a WhatsApp call enquiry, the supplied LinkedIn/Instagram profiles, a compact four-step process and four useful native HTML FAQ accordions. Navigation, footer, the homepage, the Curve, service pages and planner architecture are preserved. The existing `#project-enquiry`, `#growth-enquiry` and `#talk` entry points remain usable.

On mobile, the introduction is centered, the signal is compact, and the composer follows in normal page flow. Labels and editable fields stay left-aligned. Chips wrap, name/email become full-width, controls have 44px touch targets and input text is 16px. There is no scroll lock or fixed submit bar.

## Why enquiries were previously unavailable

The original contact page only rendered a form when `enquirySiteKey()` could validate the entire legacy delivery configuration: enable flag, exact origin, Turnstile keys, Upstash endpoint/token, HMAC secret, Resend key and sender/recipient addresses. That configuration was unavailable in the supplied checkout, so the page correctly rendered its WhatsApp fallback. Hiding the message would not have restored delivery.

The owner selected a new managed form backend rather than configuring those services for this route. The new Contact page therefore submits directly from the browser to `https://api.web3forms.com/submit`, as recommended by the [Web3Forms API documentation](https://docs.web3forms.com/getting-started/api-reference). A server proxy was deliberately not added: Web3Forms documents server-side restrictions and paid safelisting in its [troubleshooting guide](https://docs.web3forms.com/getting-started/troubleshooting).

The original Vercel endpoint and its protected planner/agency paths remain intact. Their server-side validation, hashed rate counters, delivery limits, idempotency leases and Resend acceptance logic are unchanged. They are independently configured and are not implied to be enabled by the contact page's Web3Forms setup.

## Form and delivery contract

Required: name, reply email, project type and message. Optional: company/brand, current URL and preferred timeline. There is no compulsory budget. Agency interest on this concise contact form does not require a company; the dedicated agency form still does.

The project choices are Website / landing page, Improve an existing site, Growth / SEO / AEO, AI automation, AI conversations, Agency partnership and Something else. Valid incoming service/source parameters and the old Growth anchor select the matching topic. Unknown context is ignored. No typed message is erased by context changes.

The public form identifier supplied by the owner is in `data/contact-settings.ts`. Web3Forms describes this identifier as public, rather than a secret credential, in its [FAQ](https://docs.web3forms.com/getting-started/faq). Only Web3Forms controls which verified inbox belongs to the key; a visitor cannot select a recipient through the payload. The optional `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` environment override takes precedence; a deliberately empty override disables email sending after a rebuild.

Submission requires a completed hCaptcha, an empty honeypot and locally validated fields. It uses HTTPS JSON, omits browser credentials, refuses redirects, bounds the wait and sends validated reply information. Repeated submission is prevented while pending and after acceptance. No automatic resend follows a lost response. A client-generated reference is included for correspondence; it is **not** a provider idempotency guarantee.

Only HTTP 200 with `success: true` triggers the success view and `generate_lead`. The message accurately says Web3Forms accepted the enquiry for delivery. It does not claim inbox arrival or that Hamid has read it. Provider rejection, malformed replies, rate limits and lost connections retain the draft and offer retry or a reviewed WhatsApp alternative.

Web3Forms owns the remote server-side processing, CAPTCHA enforcement, spam filters and IP rate limits. The custom field rules here execute in the browser; this direct integration does not claim a bespoke server-side field validator, durable custom receipt store or cross-session deduplication. The existing legacy endpoint retains those independently implemented controls for its own routes. Enable hCaptcha as **required** in Web3Forms so bypassing the site's UI cannot bypass the provider's check. Domain restrictions are optional paid functionality, not presented as a free-plan protection.

The composer stores an unfinished note only in component/page memory. The form and its WhatsApp review are masked for Clarity. Analytics includes approved category/source/status information, not the name, address or message. A WhatsApp click is a contact intent, never a confirmed website lead. Privacy text now explains Web3Forms/hCaptcha and the separate legacy delivery route without claiming that providers never store data.

## Account setup and actual delivery status

1. Create a form at the [Web3Forms dashboard](https://app.web3forms.com/) using `hamidwork360@gmail.com`, verify the inbox and associate the form with it.
2. Copy the form's public Access Key/Form ID. **Done:** the owner supplied it and a matching setup screenshot; it is wired into the production configuration.
3. In that form's settings, enable **hCaptcha** as the required CAPTCHA. **Owner confirmed enabled.** The implementation uses the official free-plan hCaptcha site key; no separate hCaptcha account/secret is needed for this integration. See [Web3Forms hCaptcha setup](https://docs.web3forms.com/getting-started/customizations/spam-protection/hcaptcha).
4. Deploy the current code. No Resend, Upstash or Cloudflare account is required for this Contact page. Those services remain relevant only to the separately configured legacy planner/agency website-send path.
5. Open `/contact/` in a normal browser, complete hCaptcha and send one clearly labelled test note. Check `hamidwork360@gmail.com`, including Spam, Updates and Promotions. Confirm the received message's fields and Reply-To.

**Real inbox delivery is not yet verified.** The real-provider browser probe failed at transport. A subsequent non-submitting connectivity check returned a Cloudflare “Just a moment…” HTTP 403 challenge. The available automated browser therefore could not obtain a genuine provider acceptance or verify the owner's Gmail inbox. No delivery success is claimed. Controlled fixtures below are explicitly separate from this account test. The owner must complete the normal-browser test in step 5; no request to disable CAPTCHA or bypass the provider's protection is required.

## Changed files

| File                                          | Purpose                                                                                                                                       |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/contact/page.tsx`                        | Editorial composition, original signal, genuine alternatives, process, four FAQs, canonical metadata/ContactPage JSON-LD                      |
| `app/first-conversation.css`                  | Contact-scoped typography, material treatment, responsive layout, fields, selection, focus, success/error styling and reduced-motion behavior |
| `components/contact/ContactSignal.tsx`        | Original small inline SVG illustration                                                                                                        |
| `components/contact/ConversationComposer.tsx` | Actual Web3Forms submission, native choices, context prompts, validation, errors, pending guard, honest acceptance and WhatsApp review        |
| `components/contact/Web3FormsCheck.tsx`       | Lazy explicit hCaptcha loading, compact sizing, expiry/error/retry handling and cleanup                                                       |
| `components/contact/ContactEnquiry.tsx`       | Preserved safe query/hash context, now connected to the new composer                                                                          |
| `data/conversation.mjs`                       | Topic registry, shared validation adapter, reviewed message/payload formatting and public-key validation                                      |
| `data/contact-settings.ts`                    | Owner-approved public form identifier                                                                                                         |
| `data/project-enquiry.mjs`                    | Optional client validation policy for the new form; legacy server defaults remain unchanged                                                   |
| `data/site.ts`                                | Adds the owner's supplied email destination                                                                                                   |
| `app/privacy/page.tsx`                        | Describes actual provider paths, drafts and confirmation meaning                                                                              |
| `.env.example`                                | Documents optional public key override and separate legacy configuration                                                                      |
| `scripts/qa-conversation.mjs`                 | Production layout checks, controlled provider cases and legacy planner/agency regression                                                      |
| `scripts/qa-enquiry-browser.mjs`              | Keeps the existing command as an entry point into current contact tests                                                                       |
| `package.json`                                | Adds `test:contact` without new dependencies                                                                                                  |
| `README.md`                                   | Correct current contact configuration and links to this record                                                                                |

## Verification

All final checks below were executed against the production export. Raw logs, the generated test-only export and captures are in ignored `qa-output/first-conversation/`.

| Command/check                                            | Actual result                                                                                                                                |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build`                                          | Passed; 47 canonical pages and host assets generated                                                                                         |
| `npm run typecheck`                                      | Passed                                                                                                                                       |
| `npm run test:enquiry-server`                            | 12 passed, 0 failed; legacy validation, origin checks, spam/rate limits, provider failures and idempotency unchanged                         |
| `npm run test:enquiry-browser`                           | 15 passed, 0 failed; production contact layout and controlled provider/CAPTCHA states, plus legacy planner/agency forms                      |
| `QA_BASE_URL=http://127.0.0.1:3000 npm run test:seo`     | 47 pages, 95 assets, 0 failures                                                                                                              |
| `QA_BASE_URL=http://127.0.0.1:3000 npm run test:browser` | 43 passed, 0 failed; no runtime errors                                                                                                       |
| Screenshot review                                        | Desktop, tablet and mobile reviewed; corrected the submit arrow's inherited SVG padding and confirmed the visible icon in the final captures |

The exported Contact HTML is 67,474 bytes; the local precompressed files are 12,595 bytes with Brotli and 14,687 bytes with gzip. These are file sizes, not page-load timing or a Lighthouse score. The configured page loads no CAPTCHA script before form interaction, as verified by the integration suite. No additional package was installed.

The contact suite covers all requested widths: 320, 360, 375, 390, 414, 430, 480, 768, 1024, 1280, 1440 and 1920px; whole-contact axe scans; HTML/canonical integrity; reduced motion; FAQ keyboard control; 200% CSS reflow emulation; a short viewport representing keyboard space; long field values; actual radio keyboard interaction; focus/errors; provider success/failure/false-success/rate-limit/lost-response scenarios; pending duplicates; CAPTCHA expiry/block/retry; honeypot; no-JavaScript alternatives; and preservation of the original planner review and protected agency form.

The test-only export and CAPTCHA/provider stubs are confined to the ignored QA directory. They are never published as account credentials or successful real leads. No physical phone, actual mobile keyboard, Safari/Firefox coverage, Lighthouse score, inbox delivery or cross-session Web3Forms idempotency is claimed.

### Final captures

- [Desktop 1440px](screenshots/first-conversation/desktop.webp)
- [Desktop 1024px](screenshots/first-conversation/desktop-1024.webp)
- [Tablet 768px](screenshots/first-conversation/tablet.webp)
- [Mobile 390px](screenshots/first-conversation/mobile.webp)
- [Mobile 320px](screenshots/first-conversation/mobile-320.webp)
- [Success state — controlled fixture, not real delivery](screenshots/first-conversation/success-fixture.webp)
- [Error state — controlled fixture](screenshots/first-conversation/error-fixture.webp)

## Design references

The supplied [Stas Bondar contact page](https://www.stabondar.com/contact), [Deduxer contact page](https://www.deduxer.studio/contact) and [Flayks portfolio](https://flayks.com/) were reviewed for personal positioning, the conversational letter format and confident typography respectively. Their copy, images, layout code and branded elements were not used. HAMID's approved visual identity and exact brief remain the design source of truth.
