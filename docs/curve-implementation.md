# THE CURVE implementation record

## Repository audit before implementation

The route is an exported Next.js App Router page at `app/work/page.tsx`, using React 19, Three.js 0.183, GSAP 3.14 and plain CSS. Static hosting serves `out/`. The canonical is `https://itshamid.com/work/`. Six individual project URLs already exist. The root navigation, footer and session-scoped HAMID intro are shared.

`data/projects.ts` is the authoritative inventory of 18 entries. `data/project-details.ts` contains six factual experience notes. Bridal House, Qadeer Jewellers and Editing Julian are classified as self-directed demos. Ink Grail, Dylan Seedin and Elevate X carry experience notes. Twelve other entries are portfolio previews. Elevate X has saved captures and an unavailable live destination. The adapter derives names, descriptions, classifications, links and chapters from these sources.

Every project has an existing desktop and mobile capture. Most desktop images are 1440 × 960. Editing Julian and Elevate X have documented top crops. The asset pipeline generates 160px and 960px versions with matching crops for distant and nearby frames.

The existing brand uses Manrope, Instrument Serif, charcoal `--bg`, ivory `--text`, orange `--accent` and restrained cyan. Existing gallery filters, screenshot dialogs and link tracking remain available through the list control.

The global `Experience` starts Lenis on desktop routes with reveal targets. Work opts out of that controller so browser-native scroll is the sole camera driver. Shared route decoration animates headings and a separate veil, which does not transform the scene projection surface.

## Implementation decisions

The implementation uses the existing Three.js directly inside a lazy client lifecycle. React owns the HTML and explicit interaction states. One sampled centerline defines wall surfaces, frame anchors and camera poses. GSAP owns cancellable spatial transitions. No additional runtime dependencies were added.

The scene was staged through `?curve=1` while verifying four authentic frames, then enabled as the default Work experience after spatial and interaction gates passed. The existing gallery remains server-rendered throughout enhancement and fallback. `?view=list` opens that gallery directly.

The current local process-section edits predate this task and remain in the working tree. This task implements the Work route independently.

## Architecture and input ownership

The centerline integrates a smooth heading over an 88-unit corridor. Its first 14 units are straight, followed by a continuous right turn. Indexed wall, floor, ceiling and recessed-light meshes sample this same curve. Wall anchors use a tangent, right vector and inward normal. Frames use that local basis and maintain the actual capture aspect ratio. Desktop half-width is 3.2 units. Portrait layouts use 2.12 units with an adjusted perspective. Static vertex shading adds restrained wall-light pools and floor contact shading without shadow maps or additional dynamic lights.

The visitor moves over 77 units. Browser-native document scroll advances a sticky scene, with time-based camera damping. The shared Lenis setup skips this route. Buttons offer forward and backward steps. At the end a physical wall and an HTML contact invitation provide a conclusion and a return control.

The deterministic mode graph covers INITIALIZING, WALK, PREVIEW_OPENING, PREVIEW, PREVIEW_CLOSING, DETAIL_OPENING, DETAIL, DETAIL_CLOSING, RETURNING and FALLBACK. During WALK the document owns vertical scrolling. A native modal freezes document scroll during preview and detail. In DETAIL the HTML story translates vertical wheel movement into native horizontal scrolling. Touch uses the browser's horizontal overflow and snap behavior. Scrollable chapter text consumes vertical input when necessary. Escape, visible Close and browser Back use the same return sequence.

The actual 3D frame moves from its wall transform to a camera-aligned pose, then expands to a responsive cover rectangle. Position, quaternion and uniform scale animate together. The HTML cover takes ownership at matching coordinates using the same already-loaded image. From later chapters, a 280ms return layer brings that cover back in one movement without replaying every intermediate chapter. The 3D frame then contracts to the central preview and returns to its wall pose and saved camera progress. An immutable value snapshot records the camera, wall transform, selected project, aspect and viewport. Resizing recalculates the responsive destination and local mounting transform. Mobile preview width is capped at 72vw, compared with 90vw for the fullscreen cover, with height limits preserving the actual image aspect ratio.

The scene renders on demand during movement, texture changes and transitions. It sleeps when idle, hidden or covered by detail. Every project has a 160px thumbnail. Nearby frames upgrade to 960px, while distant high-resolution textures are retired. Adaptive DPR can reduce to 0.8 under sustained slow rendering and fall back to the gallery if instability continues. WebGL context loss, reduced motion, forced colors, data-saving preferences and a visible List view use the original semantic archive.

A route-scoped startup script reserves the first viewport before enhancement. Its watchdog restores the archive if hydration does not finish. A separate initialization timeout recovers from a stalled scene import. The two nearby-project shortcuts remain in fixed left/right slots and reserve space for longer titles, preventing movement of mobile controls as the visitor walks.

## Real project accounting

| Left wall                       | Classification                 | Right wall                 | Classification                                          |
| ------------------------------- | ------------------------------ | -------------------------- | ------------------------------------------------------- |
| Bridal House                    | Self-directed demo, full notes | Ink Grail Tattoos          | Experience notes                                        |
| Dylan Seedin Photography        | Experience notes               | Qadeer Jewellers           | Self-directed demo, full notes                          |
| Classic Detailers               | Portfolio preview              | Editing Julian             | Self-directed demo, full notes                          |
| Aurelia Beauty Lounge           | Portfolio preview              | Bespoke Tailors Islamabad  | Portfolio preview                                       |
| Fortress Events Complex         | Portfolio preview              | Carpe Diem Barbershop      | Portfolio preview                                       |
| The Luxury Florist              | Portfolio preview              | Iron Lodge Gym             | Portfolio preview                                       |
| Infinity Salon                  | Portfolio preview              | Davis — Designer Portfolio | Portfolio preview                                       |
| Defence Marquee & Event Complex | Portfolio preview              | LuxWatch                   | Portfolio preview                                       |
| M. Hamid — Design Services      | Portfolio preview              | Elevate X                  | Experience notes, saved captures, unavailable live site |

The six existing note sets produce six chapters each. The twelve portfolio previews have three concise chapters using their descriptions and authentic desktop/mobile screenshots. Existing live links and six detailed routes remain available. Elevate X's original destination is clearly labelled. The canonical, metadata, schema and sitemap continue to use the existing route registry. Hash-based project states add browser history without introducing canonical routes.

## Files in this implementation

| File                                   | Purpose                                                                                        |
| -------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `app/layout.tsx`                       | Installs the small Work-only startup guard before first paint                                  |
| `app/work/page.tsx`                    | Integrates the progressive Work experience around the existing archive content and metadata    |
| `app/curve.css`                        | Responsive scene HUD, preview, HTML chapters and fallback integration using the existing theme |
| `components/curve/bootstrap.ts`        | Route and device preference checks, startup space reservation and hydration watchdog           |
| `components/curve/CurveExperience.tsx` | Client lifecycle, mode ownership, native scroll, history, focus and fallback                   |
| `components/curve/scene.ts`            | Three.js renderer, architectural scene, raycasting, moving frames, resize and disposal         |
| `components/curve/geometry.ts`         | Shared curve, inward-facing mesh geometry, wall anchors, camera and cover projection           |
| `components/curve/machine.ts`          | Explicit guarded state transitions                                                             |
| `components/curve/textures.ts`         | Progressive texture loading, cache retirement, failure tracking and memory estimates           |
| `components/curve/projects.ts`         | Derived placement and factual metadata from the authoritative project inventory                |
| `components/curve/CaseStudy.tsx`       | Accessible HTML chapters, wheel/touch navigation and return to the shared cover                |
| `components/motion/Experience.tsx`     | Excludes Work from the global smooth-scroll driver                                             |
| `scripts/seo-assets.mjs`               | Reproducible 160px and 960px crops from the existing screenshots                               |
| `public/images/curve/`                 | 36 generated WebP variants, totaling 800,104 bytes across both sizes                           |
| `scripts/qa-curve-math.mjs`            | Geometry, orientation, state and projection regression checks                                  |
| `scripts/qa-curve.mjs`                 | Responsive browser journeys, repeated return cycles, gestures, accessibility and metrics       |
| `scripts/qa-curve-recovery.mjs`        | Keyboard, short phone, preference, slow image, WebGL and route recovery checks                 |
| `scripts/qa-curve-performance.mjs`     | Reproducible local resource, frame-interval, layout-stability and idle-render measurements     |
| `docs/curve-implementation.md`         | Audit, implementation decisions, content accounting and verification report                    |

## Verification record

The four-frame spatial gate was inspected in desktop and phone screenshots. A separate 24-cycle left/right preview test verified exact camera and frame matrix restoration. The full development suite then passed 32 complete open/chapter/close cycles across both sides, including middle and final chapter returns, browser history, touch gestures, context loss and orientation changes. It checked ten widths from 320 to 1920 CSS pixels and found zero scoped accessibility violations or browser runtime errors.

The projection checks verify that the 3D preview corners match their HTML cover rectangle at 320, 390, 1440 and 1920 pixels. The math suite also verifies inward normals, straight entrance, rightward path, perpendicular wall bases and guarded transitions.

A final Chrome development sample around the bend recorded 43 draw calls, 24,904 triangles, 26 cached textures and approximately 25.34 MiB of uncompressed texture memory including mipmaps. Mean moving-frame interval was 17.23 ms in that run. Physical phone GPU performance, Safari and Firefox require device/browser verification.

The archive baseline before implementation transferred approximately 532 kB at 1440px and 450 kB at 390px in the local browser capture. The records and all screenshots are in `qa-output/curve/`.

## Completed features

- Real continuous curved architecture, nine projects per wall, correctly oriented frames and native forward/back travel.
- Hover-intent and touch selection, persistent centered previews, explicit opening and spatial reverse transitions.
- Six existing detailed stories and twelve factual short stories, using the original screenshots and project classifications.
- HTML chapters with wheel, horizontal touch swipes, keyboard arrows and visible chapter controls.
- Browser history, direct project hashes, Escape, modal focus return, orientation handling and route cleanup.
- Original searchable/filterable archive, no-JavaScript content and reduced-motion/WebGL recovery.
- Responsive layout at every specified width, progressive textures, idle render suspension and adaptive rendering quality.
- Existing route canonical, sitemap, metadata, structured data, contact destinations and consent-aware external-link tracking retained.

## Scope and verification limits

Automated checks use installed Google Chrome on this Windows machine, including browser-emulated touch. Physical Android/iOS GPU performance, Safari, Firefox, real mobile browser chrome and hardware trackpad momentum have not been verified. These require a physical-device/browser pass before making cross-device performance claims. Local timings are not production field Core Web Vitals.

Live external project destinations were not independently re-audited during this task. Existing destination URLs and the recorded unavailable status are preserved; local tests verify their markup and the site's own routes. Tests do not submit real enquiries or claim email delivery.

Optional new analytics events were not added. Existing project-link tracking remains subject to the site's consent controls and does not turn project clicks into qualified leads. No new backend or third-party account configuration is required for THE CURVE.

The separate uncommitted process-timeline redesign was already present at the start and is outside this implementation's file list.

## Local production measurements

Measured on 22 November 2026 against the optimized static export at `http://127.0.0.1:3000`. Browser was installed Google Chrome on Windows, using AMD Radeon integrated graphics through ANGLE / Direct3D11. External analytics requests were blocked, the intro session was marked seen, and no artificial network throttling was applied. The phone row is Chrome touch/device emulation using the same desktop GPU. Measurements ran independently of other browser tests.

| Measurement                                   | Desktop 1440 × 900 | Emulated phone 390 × 844 |
| --------------------------------------------- | -----------------: | -----------------------: |
| Scene ready from navigation                   |             738 ms |                   323 ms |
| Observed LCP                                  |             768 ms |                   188 ms |
| Initial resource transfer, excluding document |    1,020,689 bytes |            743,953 bytes |
| JavaScript resource transfer                  |      365,593 bytes |            365,593 bytes |
| Initial scene texture requests                |                 20 |                       20 |
| Moving rAF interval median / p95              |     16.7 / 16.9 ms |           16.7 / 17.1 ms |
| Maximum interval in the sample                |            49.9 ms |                  17.5 ms |
| Initial main-thread long tasks                |                  2 |                        1 |
| Observed layout-shift sum                     |            0.00068 |                        0 |
| Draw calls during a settled 500ms idle window |                  0 |                        0 |
| Render buffer                                 |         1440 × 900 |               585 × 1266 |

The immersive route adds initial bytes relative to the original archive. Three.js is imported only when entering the immersive mode, 160px textures cover distant work, high-resolution textures are retired outside the nearby window, and the phone render ratio is capped at 1.5. These measurements demonstrate local behavior only; they do not establish real-phone frame rates or public-site field performance.

## Automated verification and artifacts

- `npm run build` completed with TypeScript checking and static export of 47 canonical pages. The existing postbuild script intentionally withholds the video sitemap because verified video publication dates/thumbnails are missing; this is unrelated to the new gallery.
- `node scripts/qa-curve-math.mjs` passed straight entrance/right bend, local frame bases, inward surface normals, 3D-to-HTML projection at four sizes and guarded mode transitions.
- Development acceptance passed at 320, 360, 375, 390, 430, 768, 1024, 1280, 1440 and 1920px. All 18 scene frames were accounted for. Thirty-two complete cycles across both walls restored the exact camera matrix and every frame matrix; texture counts remained bounded. Six scoped axe scans returned zero violations. Browser runtime errors were empty.
- The final production export passed the same ten-width journeys, six scoped accessibility scans and four additional full return cycles. Real frame hover, direct mobile frame tap, native touch walking, horizontal chapter swipes, history, orientation and context-loss recovery passed. A separate right-wall hover near the bend, click on the centered image, wheel-driven chapter movement and return to the identical progress value also passed.
- Recovery checks passed at 320 × 568 with keyboard-only opening, chapter arrows, Escape and focus return. Double Close, interrupted expansion, list switching, stored view preference, dynamic reduced motion, failed WebGL startup, delayed high-resolution textures, direct project hash and route unmount also passed.
- `QA_BASE_URL=http://127.0.0.1:3000 npm run test:seo` passed for 47 pages and 88 referenced assets with zero failures. Canonicals, sitemap entries, server-rendered content, metadata, images and structured data remain valid under that suite.
- `npm run test:browser` passed all 43 existing website checks with zero failures and no runtime errors, including the portfolio archive, planner, navigation and intro behavior.
- Prettier checks and `git diff --check` passed. This repository does not define a separate lint command; no lint result is claimed.

The final export's interaction smoke run and its screenshots are recorded in `qa-output/curve/production-qa.log` and `qa-output/curve/results.json`. The 32-cycle instrumented run is retained separately in `development-results.json` and `development-qa.log`. Other records are `recovery-results.json`, `performance.json`, `build.log`, `seo.log`, `site-browser.log` and `right-hover.log`.

Reviewed screenshots include:

- [Desktop corridor](../qa-output/curve/corridor-1440.png)
- [Phone corridor](../qa-output/curve/corridor-390.png)
- [320px corridor](../qa-output/curve/corridor-320.png)
- [Phone bend](../qa-output/curve/curve-bend-390.png)
- [Desktop centered preview](../qa-output/curve/preview-1440.png)
- [Desktop fullscreen cover](../qa-output/curve/cover-1440.png)
- [Phone fullscreen cover](../qa-output/curve/cover-390.png)
- [Phone chapter](../qa-output/curve/curve-story-390.png)
- [Short-phone case study](../qa-output/curve/short-phone-detail.png)
- [Reduced-motion archive](../qa-output/curve/fallback-reduced.png)

Artifacts are local and intentionally ignored by Git. Functional browser journeys were automated; screenshots were visually reviewed. No physical-device, Safari or Firefox validation is claimed.

## Running and viewing

The optimized export is served locally at [http://localhost:3000/work/](http://localhost:3000/work/). `npm run build` regenerates all gallery textures and the export. `npm start` serves that export. For development in this environment, use `npm run dev -- --port 3001 --webpack`; the project's existing font URLs require the webpack path.

Run the Curve browser suite with `QA_BASE_URL` pointing to the desired local server. Its default is port 3001 for instrumented development checks; set port 3000 for production. `QA_CURVE_CYCLES` defaults to 32. Production deliberately excludes the development matrix/debug interface.
