# HAMID Signature Hero revamp

## Current homepage

Desktop restores “Stand out online. Get found. Work smarter.” with the original layout, thin orbit, HAMID watermark and work cue. Both layouts use the current edited portrait. Below 720 px, the portrait sits above the centered “Build. Grow. Automate.” headline, with the orbit hidden. The navigation CTA retains its steady glow and rotating accent.

`components/hero/Hero.tsx` renders one heading and the existing links. `app/hero.css` applies the desktop composition, centers the mobile copy and staggers the three desktop lines during the intro. `components/hero/PortraitMotion.tsx` keeps desktop pointer movement on the portrait and its orbit.

The production build and TypeScript passed. Chromium verified 13 widths, four accessibility scans, CTA navigation, the header glow and the motion fallbacks. The primary CTA ends at 555 px on the 320 × 568 viewport and 594 px on the 390 × 844 viewport. [Local preview](http://localhost:3000/) · [Desktop](qa-output/hero-restored/hero-1440.png) · [Mobile](qa-output/hero-restored/hero-390.png) · [Browser results](qa-output/hero-restored/results.json)

The Origin suite passed all 17 checks and the full browser suite passed all 42 checks. The viewport assertions in `scripts/qa.mjs` now load the homepage at each measured width because Chromium briefly reported stale offscreen layout during resize. The SEO suite verified 46 pages and 81 assets. [Full browser report](qa-output/report.json) · [Origin results](qa-output/origin-qa.json)

## Initial revamp

The first revamp used “Build. Grow.” in Manrope and “Automate.” in orange Instrument Serif italic across viewports.

- Desktop uses a centered two-column composition. The real Hamid portrait sits on the right with a feathered edge, one tilted hairline orbit and two small nodes. Cyan is reserved for a short orbit segment, the smaller node and interaction feedback.
- Below 720 px, the larger portrait leads the visual layout above the HAMID watermark and headline. The description and full-width primary CTA follow. The phone header carries the HAMID wordmark and menu. At 350 px and below, the eyebrow starts with “Developer” to fit on one line. The trust line appears with the two-column composition.
- The primary link opens `/contact/?source=home`. The secondary link opens `/work/`, and the bottom cue jumps to `#work`. Both hero links use the existing consented CTA event names. The enquiry page currently uses its WhatsApp fallback while email delivery awaits provider configuration.
- The header CTA uses a 1.5 px masked ring and a single rotating gradient layer. The 7.2 s rotation becomes about 5.9 s on pointer hover or visible keyboard focus. The pill and ivory icon also provide a static appearance for reduced motion, forced colors and unsupported masking.
- The upward Origin curtain starts the hero reveal. The portrait fades and scales from 1.035 to 1. The ivory and orange lines start at 115 ms and 225 ms, followed by the description at 320 ms and primary CTA at 420 ms. The longest introduced entrance ends at 800 ms while the curtain completes. The existing one-second wordmark hold and once-per-tab policy govern first entry.
- The orbit node laps in 18 s on a desktop fine pointer. Pointer movement is limited to 6 CSS px horizontally for the orbit and 2.5 px for the portrait, with a single scheduled update per frame. The effect stops offscreen and when the document is hidden. Hero content and links render directly in HTML.

## Files

| File | Implementation |
| --- | --- |
| `components/hero/Hero.tsx` | Server-rendered hero, approved copy, real links, responsive image choices and mobile reading order |
| `components/hero/PortraitMotion.tsx` | Small client component for fine-pointer parallax, viewport gating and cleanup |
| `app/hero.css` | Fluid typography, responsive composition, portrait masks, orbit, CTA states and curtain-synchronized entrance |
| `components/layout/Navigation.tsx` | Header CTA decoration and speed controls, keyboard activation and home-specific small-screen header |
| `app/navigation-beam.css` | Thin perimeter mask, rotation, focus, static fallbacks and pause while the intro covers the header |
| `app/globals.css`, `app/refinements.css`, `app/home-growth.css` | Retire the superseded hero-specific rules and add the restrained cyan accent token |
| `components/motion/brand-particles.ts` | Lets the homepage entrance follow the existing curtain state and retains page-lead animation on other routes |
| `scripts/seo-assets.mjs` | Generates 320w, 480w, 640w and 768w WebPs from the edited hero portrait |
| `public/images/hamid-hero-warm.webp`, `public/images/responsive/hamid-hero-warm-*.webp` | Edited hero portrait with transparency for the orbit and responsive same-source derivatives |
| `scripts/qa-origin.mjs` | Verifies when the portrait, headline, description and CTA start during the curtain exit |
| `scripts/qa.mjs`, `scripts/qa-discovery.mjs` | Check the exact approved headline, widths, work link and existing consented CTA events |
| `scripts/qa-signature-hero.mjs` | Viewport screenshots, accessibility, beam pixels and paint trace, parallax, route and fallback checks |

The beam rotates a masked gradient layer. The entrances use opacity and transforms. [Animation performance guidance](https://web.dev/articles/animations-guide) · [CSS mask composition](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-composite) · [Animation playback rate](https://developer.mozilla.org/en-US/docs/Web/API/Animation/updatePlaybackRate)

## Controlled performance comparison

The baseline is the homepage at commit `f7d2dd7`. Chrome ran three fresh contexts per device for each build on the same machine. The 390 × 844 profile used 4× CPU slowdown, 150 ms latency and 200,000 bytes/s. The 1440 × 960 profile used 1× CPU, 40 ms and 1,250,000 bytes/s. This comparison used reduced motion and blocked external requests to isolate page loading. The existing intro is timed separately.

| Profile | LCP before → after | CLS before → after | Same-origin transfer before → after |
| --- | ---: | ---: | ---: |
| 390 px mobile | 1,232 → 992 ms | 0.028 → 0.002 | 335.7 → 332.8 KB |
| 1440 px desktop | 456 → 460 ms | 0.017 → 0.001 | 716.7 → 700.8 KB |

Chrome selected the 320w hero photo on the final mobile profile and the 640w photo on desktop. The baseline desktop LCP candidate was text, and the final candidate was the photo. JavaScript transfer rose by 177 bytes in these samples. Lab performance and real-user field metrics have different collection conditions. Field LCP, CLS and INP await real visitor data after release.

Raw runs and before/after screenshots are under `qa-output/hero-before/` and `qa-output/hero-release/`. The screenshot and interaction suite writes to `qa-output/signature-hero/`.

## Verified results

| Command or suite | Result |
| --- | --- |
| `npm run build` and `npm run typecheck` | Passed. The production export contains 46 canonical pages |
| `npm run test:browser` | 42 checks passed with no runtime errors |
| `npm run test:seo` | 46 pages and 80 assets verified |
| `npm run test:discovery` | 7 checks and 20 enquiry demo cases passed |
| `node scripts/qa-signature-hero.mjs` | 11 viewport layouts and 7 check groups passed, including four axe scans, keyboard and touch actions, both Work links, reduced motion, forced colors, JavaScript-disabled HTML and desktop parallax |
| `npm run test:origin` | 14 of 17 checks passed in the concurrent browser run. The isolated rerun on the polished build passed all 17 |

At 320 × 568 the primary CTA ends at 541 px. At 390 × 844 it ends at 592 px. The captured beam moved between the top and bottom border and left the button interior clear. A 1.2 s desktop DevTools trace recorded zero main-thread Paint or Layout events with the beam both paused and running. This is a short lab observation on one machine.

The shipped HTML contains one headline, the approved description, the canonical homepage URL and the Contact and Work destinations. Calculated contrast against the charcoal background is 16.54:1 for ivory, 7.90:1 for orange, 12.14:1 for body copy and 9.71:1 for cyan focus. The primary label against the orange fill is 7.46:1.

The first Origin run recorded a full wordmark hold of 1,016–1,017 ms and the staggered reveal at five viewport widths. Three assertions in that concurrent run needed an isolated retest. The timing assertions now check the browser’s configured hero delay and honor the route hook’s 200 ms arrival window. The isolated run on the polished build verified the full introduction and staggered reveal at all seven sampled viewport sizes, plus skip, reduced motion, failure handling and route navigation. The run log is `qa-output/hero-polish-origin.log`.

### Screenshots

- [Desktop at 1440 px](qa-output/signature-hero/hero-1440.png) · [Desktop at 1920 px](qa-output/signature-hero/hero-1920.png)
- [Tablet at 768 px](qa-output/signature-hero/hero-768.png) · [Tablet at 1024 px](qa-output/signature-hero/hero-1024.png)
- [Phone at 320 px](qa-output/signature-hero/hero-320.png) · [360 px](qa-output/signature-hero/hero-360.png) · [375 px](qa-output/signature-hero/hero-375.png) · [390 px](qa-output/signature-hero/hero-390.png) · [430 px](qa-output/signature-hero/hero-430.png)
- [Header beam at the top edge](qa-output/signature-hero/beam-top.png) · [Header beam at the bottom edge](qa-output/signature-hero/beam-bottom.png) · [390 px curtain exit frame](qa-output/origin-390-lift.png)

Device checks used Chromium emulation. Physical phone and Safari behavior remain unverified. This build is available on localhost. Production deployment and configuration of form delivery are separate from this implementation.

## Portrait and background polish

The follow-up uses the supplied original `../assets/mypic1.jpeg` for the homepage portrait. The retouch keeps natural skin color, adds a soft orange edge on the hair and shoulder, and removes the backdrop. The exported image carries alpha, which lets the ellipse and its moving node sit behind Hamid. The shared portrait on About and other routes still uses the original site asset.

The HAMID watermark is visible behind the hero and hidden from assistive technology. A single warm background light responds to the mouse on desktop through the existing animation-frame handler. It settles when the pointer leaves, the tab is backgrounded, or the portrait leaves the viewport. Touch and reduced-motion layouts use the static composition. The existing moving header beam now has a low-intensity steady inner and outer edge glow.

The revised production export passed all 11 viewport checks, eight interaction groups and four axe scans in Chromium. The moving dot's screenshot difference averaged 0.20 out of 255 behind the head and 21.43 outside it at the sampled positions. Both header beam paint samples recorded zero main-thread Paint or Layout events over 1.2 seconds.

| Controlled Chrome profile | LCP from prior revamp → polished | CLS | Same-origin transfer |
| --- | ---: | ---: | ---: |
| 390 px mobile | 992 → 996 ms | 0.002 → 0.004 | 332.8 → 338.1 KB |
| 1440 px desktop | 460 → 408 ms | 0.001 → 0.006 | 700.8 → 716.4 KB |

These are medians of three runs per viewport. They use reduced motion and block external requests. The final 320w WebP is 8.9 KB and the 640w WebP is 25.6 KB. The final comparison is in `qa-output/hero-polished/performance.json`.

[Polished desktop](qa-output/hero-polish/hero-1440.png) · [Polished tablet](qa-output/hero-polish/hero-768.png) · [Polished phone](qa-output/hero-polish/hero-390.png) · [Browser evidence](qa-output/hero-polish/results.json)

The portrait-first follow-up passed the 11-viewport browser suite. At 390 px the portrait renders 343 px wide. On the 320 × 568 test viewport, the primary CTA ends at 555 px. [Updated phone at 390 px](qa-output/hero-mobile-portrait/hero-390.png) · [Updated phone at 320 px](qa-output/hero-mobile-portrait/hero-320.png)
