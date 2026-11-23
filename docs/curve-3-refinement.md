# THE CURVE 3.0 — implementation record

This refines the existing `/work/` exhibition. The homepage hero, published project facts, 18-project inventory, six existing detail routes, live URLs, archive filters and global brand remain in place. The owner-supplied screenshots describe the earlier problems; the attached 31-section specification defines the refinement.

## Architecture and artwork

The existing straight entrance and right-hand centerline remain the common coordinate system. Wall mounts, floor lettering, panel seams, warm ceiling tracks and the final wall use its position, tangent and lateral basis. The walking range is 84 world units inside the original 88-unit room, leaving a comfortable stopping distance before the recessed final wall. A smooth width profile gently broadens the final alcove.

The roof is a real graphite surface with alternating panel tones, recessed warm-white tracks and instanced cross-seams. Matte walls and floor share a small deterministic grain texture. Frame niches, mounting lights and structural joins use shared materials and instanced geometry. Restrained etched connection diagrams are placed against actual wall transforms. No viewport illustration substitutes for these objects.

The original project order is retained, with a curated L/R/L/L/R rhythm and 4.3-unit station separation. The pictures are larger, correctly wall-aligned and use the existing responsive captures. Continuous proximity brightness follows the damped camera. Dedicated frame light bars and baked wall washes provide depth without 18 shadow lights. All 18 true names appear on perspective-correct floor planes and small title-only wall plaques, using locally drawn text textures.

THE CONVERGENCE is a physical installation on the curved end wall: three beveled mounting islands, small inset interface reliefs, six raised metal connection paths, an abstract ivory-and-orange H, a warm light slit and a discreet world-space signature. The wall remains visible between the sculptural elements. The installation grows through camera perspective; no screen-fixed poster or large CTA headline remains.

## Input, navigation and fullscreen routing

Wheel, keyboard and touch deltas now drive bounded virtual progress instead of a 12,000px document. The immersive route occupies `100dvh`. It cannot scroll past its endpoint into a footer. A route-aware footer boundary omits the normal site footer on the exact Work route, including List view; project-detail routes and other pages retain it. Document scrolling and root attributes are restored on fallback and unmount.

Navigation is initially visible, hides after purposeful forward input, and returns on reverse input. Direction accumulation and a jitter threshold prevent per-event flashing. An explicit Navigation control, focus-within reveal and always-available List view preserve access. Preview/story modes own their input and do not arbitrarily reveal navigation. Replay eases back to the entrance and can be interrupted by new movement.

## Selection, story and exact return

The existing guarded state machine remains the single mode authority. Selection stores the selected ID, original position/quaternion/scale, camera matrix and rendered progress. The same Three.js frame travels away from the wall into the centered preview. During this state, the renderer draws that selected frame sharply above one static 2D copy of the frozen architecture. CSS dims and mildly blurs only the copy. No second WebGL context or continuous post-processing pass is introduced.

The preview has only two main actions: **View Project** and **Read More About This Project**. The latter uses the existing canonical detail URL for documented projects, or opens the existing honest capture-based story when no separate route exists. List and Back are navigation controls. Moving the pointer away from the original wall location does not dismiss the preview. Phones use explicit tap selection.

Opening expands the same art while a rounded near-fullscreen surface grows behind it. The existing HTML story takes over with the same decoded image and matching screen coordinates. Vertical wheel input advances horizontal chapters; native horizontal swipe, chapter buttons and keyboard controls remain. Long text can scroll vertically inside its own region.

Closing returns the current story to its cover, contracts to the centered preview, then reverses the original frame's spatial transformation. Camera progress stays frozen throughout. The exact selected frame control receives focus. Rapid history changes are reconciled after return. The room's world dimensions remain fixed through device rotation; only projection and presentation adapt, avoiding a wall-anchor jump during close.

## Resource and accessibility safeguards

Rendering sleeps when settled. Distant projects use the existing 160px textures; near/selected pictures request the existing 960px captures. The high-resolution window is smaller on phones, with distant large maps disposed. Geometry, material and texture cleanup includes the procedural titles, architectural grain, static backdrop and listeners. Dynamic DPR reduction and the existing slow-device/context-loss fallback remain.

The server-rendered archive still contains the 18 real projects and crawlable links. Reduced motion, forced colors, save-data/low-memory signals and unsupported WebGL use the accessible archive. Keyboard frame controls replace the removed visual bottom project boxes. Modal focus, Escape, explicit controls and native semantic links remain available. No experience, client status, metric or testimonial was added.

## Changed files

| File                                                  | Responsibility                                                                                                                         |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `components/curve/architecture.ts`                    | Shared/instanced architecture, floor and plaque lettering, wall graphics and physical final installation                               |
| `components/curve/geometry.ts`                        | Common alcove-width profile, surface UVs/panel shading, updated walk range and preview projection                                      |
| `components/curve/projects.ts`                        | Deterministic staggered wall assignment and station spacing; original facts/IDs retained                                               |
| `components/curve/scene.ts`                           | Larger frames, proximity brightness, static-background compositing, immutable return pose, projection-only resize and resource cleanup |
| `components/curve/CurveExperience.tsx`                | Virtual input ownership, navigation hysteresis, two preview actions, accessible frame controls, replay and focus/history restoration   |
| `components/curve/CaseStudy.tsx`                      | Rounded-surface image-coordinate handoff, calmer cover return and Page-key chapter navigation                                          |
| `components/curve/textures.ts`                        | Bounded near-texture windows                                                                                                           |
| `components/layout/RouteFooter.tsx`, `app/layout.tsx` | Exact-route footer exclusion                                                                                                           |
| `app/curve.css`                                       | Viewport composition, layer ordering, restrained HUD, navigation movement, frozen backdrop and rounded viewer                          |
| `scripts/qa-curve*.mjs`                               | Spatial math, actual journeys, all-project returns, recovery, navigation and production performance checks                             |
| `docs/curve-implementation.md`                        | Marks the original implementation report as historical and points to this refinement                                                   |
| `docs/screenshots/curve-3/*.webp`                     | Seven final browser captures for review                                                                                                |

## Verification artifacts

Verified on 23 November 2026. Full-resolution captures, logs and JSON measurements are local files in `qa-output/curve-3/` and are intentionally ignored by Git. The seven review captures below are included in the repository.

### Actual results

| Command / check                                          | Result                                                                                                                                                                                                                      |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build`                                          | Passed; 47 canonical static pages and host assets generated                                                                                                                                                                 |
| `npm run typecheck`                                      | Passed                                                                                                                                                                                                                      |
| Prettier check on the changed source, tests and reports  | Passed                                                                                                                                                                                                                      |
| `git diff --check` on this change                        | Passed                                                                                                                                                                                                                      |
| `node scripts/qa-curve-math.mjs`                         | Passed path/right bend, wall normals, projection at five viewport sizes, rotated projection and guarded mode transitions                                                                                                    |
| `node scripts/qa-curve.mjs` against the production build | Passed at 320, 360, 375, 390, 430, 768, 1024, 1280, 1440 and 1920px; six scoped axe scans; all 18 different project open/chapter/close journeys; touch, hover, history, rotation, idle rendering, context loss and fallback |
| Same journey script against the development build        | Passed at 390 and 1440px, with all 18 camera and frame-world-matrix return assertions; bounded image texture cache                                                                                                          |
| `node scripts/qa-curve-navigation.mjs`                   | Passed nav hysteresis/focus reveal, endpoint clamp, reverse/replay interruption, route cleanup, 18 list entries and six canonical detail destinations returning HTTP 200                                                    |
| `node scripts/qa-curve-recovery.mjs`                     | Passed 320 × 568 keyboard flow, rapid Back/Forward during close, repeated close, interrupted opening, list switches, runtime reduced motion, unavailable WebGL, delayed image delivery, deep links and route unmount        |
| `npm run test:browser`                                   | 43 passed, 0 failed; no browser runtime errors                                                                                                                                                                              |
| `npm run test:seo`                                       | 47 pages, 91 referenced assets, 0 failures; includes 45 whole-page axe scans, canonical/schema/robots checks, internal reachability, redirects and responsive overflow checks                                               |
| Homepage screenshot comparison                           | Desktop hero: 0 differing pixels below the animated header. Mobile hero: 96 differing pixels (0.033% of the compared area), with no hero source/layout changes                                                              |

There is no configured ESLint task in this repository; no ESLint pass is claimed. Formatting, TypeScript, production compilation and browser checks were executed.

### Measured performance

Production static files were served locally, using Windows Chrome with AMD Radeon graphics. Each movement sample contains 180 animation-frame intervals. Phone sizing and touch were emulated on the same computer; these are not physical-phone or field Web Vitals results. Third-party analytics requests were blocked during automated browser tests to keep test visits out of reporting.

| Measurement                                   | 1440 × 900      | 390 × 844, touch emulation |
| --------------------------------------------- | --------------- | -------------------------- |
| Gallery ready                                 | 1,366ms         | 758ms                      |
| Initial transfer, including app and images    | 1,023,059 bytes | 736,480 bytes              |
| Median moving frame interval                  | 16.7ms          | 16.7ms                     |
| 95th-percentile moving interval               | 17.0ms          | 17.0ms                     |
| Maximum moving interval                       | 17.4ms          | 17.2ms                     |
| Extra WebGL draws during settled 500ms sample | 0               | 0                          |
| Measured CLS                                  | 0.000314        | 0                          |

The development inspection at mid-corridor recorded 23 cached project image maps (about 17.1MiB estimated decoded/mipmapped image memory), no pending or failed image loads, and 39 total GPU textures including architectural lettering and materials. Repeated return tests assert at most 24 cached project image maps; that bound does not describe all procedural GPU resources. No universal FPS, memory or loading guarantee is inferred from these local samples.

### Completed feature checklist

- [x] True curved room, structured ceiling, quiet material texture, wall details and physical mounting.
- [x] All 18 original projects, staggered placement, true floor titles and title-only plaques.
- [x] Bottom project-name boxes removed; purposeful direction-based navigation.
- [x] Sharp centered preview with two working main actions over the dimmed, softly blurred room.
- [x] Same-image expansion into rounded HTML chapters, with one input owner at a time.
- [x] Story → preview → original wall pose, frozen camera and correct focus restoration.
- [x] Physical THE CONVERGENCE relief, endpoint clamp, reverse and interruptible replay.
- [x] Touch, keyboard, resize/rotation, reduced motion, unavailable-WebGL and no-JavaScript archive.
- [x] Footer excluded only from the exact Work route; normal pages retain scrolling and footer.
- [x] Existing homepage hero, published facts and service/contact functionality preserved.

### Final screenshots

| Stage            | Capture                                                               |
| ---------------- | --------------------------------------------------------------------- |
| Entrance         | [Desktop entrance](screenshots/curve-3/entrance.webp)                 |
| Curved middle    | [Staggered frames and floor lettering](screenshots/curve-3/bend.webp) |
| Centered preview | [Sharp art and two actions](screenshots/curve-3/preview.webp)         |
| Rounded story    | [Case-study cover](screenshots/curve-3/case-study.webp)               |
| Final alcove     | [THE CONVERGENCE](screenshots/curve-3/finale.webp)                    |
| Mobile preview   | [390px touch layout](screenshots/curve-3/mobile-preview.webp)         |
| Mobile ending    | [390px final alcove](screenshots/curve-3/mobile-finale.webp)          |

### Remaining verification limits

Chrome desktop and Chrome touch emulation were actually tested. Physical iOS/Android hardware, Safari, Firefox, real trackpad hardware and throttled cellular networks were not available for this run. Reduced motion and resource-degradation fallbacks are tested, but cannot guarantee performance on every GPU. Existing external demo URLs remain the owner's supplied destinations; no new client, business outcome, credential or case-study claim was introduced. No new external account or service configuration is required for this refinement.
