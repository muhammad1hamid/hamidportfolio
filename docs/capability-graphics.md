# Mobile capability cards — graphics refinement

23 November 2026. Replaced the text-heavy media on Growth Engine, Smart Systems and AI Conversations with original 3D object illustrations, following the owner's feedback. The approved Web Experiences screenshot/device composition is retained.

## Visual result

- **Growth Engine:** graphite and ivory browser objects behind a realistic magnifying glass, with a small warm orange accent. No rankings, traffic figures or claimed results appear in the artwork.
- **Smart Systems:** three physical workflow modules connected by brushed copper, with enquiry, document and approval symbols. This is an illustrative workflow rather than a client deployment.
- **AI Conversations:** a graphite phone with ivory and orange speech-bubble objects. It is a concept illustration rather than a real conversation or product screenshot.

The three cards now have restrained neutral surface shading, a thin return edge and inset highlights for physical depth. Their inner paragraph panels, numbered lists and secondary chips are removed. Each retains its HTML category heading, short service description and real CTA. The Web Experiences tags, screenshot, caption, laptop treatment and links remain.

The 2 × 2 selectors, swipe track, orange selected state, pagination and existing destinations are unchanged. The desktop layout remains the same. No video, autoplay, new 3D renderer or dependency was introduced.

## Assets and generation

The built-in `image_gen` tool produced three original 1536 × 1024 renders with alpha transparency. They were resized into responsive WebP files, preserving the alpha channel. The exact prompts are in [capability-art-prompts.json](capability-art-prompts.json). No CLI model/API fallback was used.

| Project asset                                         | Dimensions | File size    |
| ----------------------------------------------------- | ---------- | ------------ |
| `public/images/capability-art/growth-480.webp`        | 480 × 320  | 18,154 bytes |
| `public/images/capability-art/growth-960.webp`        | 960 × 640  | 49,458 bytes |
| `public/images/capability-art/systems-480.webp`       | 480 × 320  | 22,058 bytes |
| `public/images/capability-art/systems-960.webp`       | 960 × 640  | 57,046 bytes |
| `public/images/capability-art/conversations-480.webp` | 480 × 320  | 14,932 bytes |
| `public/images/capability-art/conversations-960.webp` | 960 × 640  | 38,022 bytes |

The images load lazily, have explicit dimensions and responsive source sets, and use descriptive alternatives that identify them as 3D concept illustrations. Service meaning and navigation remain available as HTML. No image contains a fabricated client, metric or testimonial.

## Changed files

| File                                                    | Change                                                                                                                                       |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/sections/CapabilityMedia.tsx`               | Keeps the original Web preview and replaces the other three HTML text panels with responsive illustrations                                   |
| `components/sections/MobileCapabilityStudio.module.css` | Removes unused panel styles; adds graphic presentation and subtle depth on the three revised cards                                           |
| `components/sections/MobileCapabilityStudio.tsx`        | Applies depth only to the three revised cards, preserves Web tags, and prevents hidden-desktop scroll events from resetting mobile selection |
| `public/images/capability-art/*.webp`                   | Six optimized, project-local image files                                                                                                     |
| `scripts/qa-capabilities.mjs`                           | Verifies that selected graphics fully decode in addition to the existing layout/input checks                                                 |
| `docs/capability-art-prompts.json`                      | Exact prompts and built-in generation method                                                                                                 |
| `docs/mobile-capabilities.md`                           | Marks the earlier implementation record and points to this update                                                                            |

No other homepage section was restyled. Pre-existing Process/timeline work in the shared workspace remains outside this change.

## Validation

Raw artifacts are in the ignored local folder `qa-output/capability-art/`.

| Verification                    | Actual result                                                                                                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Production build and TypeScript | Passed; 47 canonical pages and host assets generated                                                                                                                           |
| Formatting and diff checks      | Passed                                                                                                                                                                         |
| Complete capabilities suite     | Passed at 320, 360, 375, 390, 414, 430, 480, 768, 1024, 1280 and 1440px; all four categories, decoded images, stable height, real links and no overflow                        |
| Mobile accessibility            | No scoped WCAG A/AA axe violations at 320 and 390px                                                                                                                            |
| Input and resize                | Both touch directions and boundaries, vertical page scrolling, keyboard arrows/Home/End, reduced motion and mobile → desktop → mobile category restoration passed              |
| Desktop protection              | 0 changed pixels and identical card geometry at 768, 1024, 1280 and 1440px                                                                                                     |
| Approved Web visual             | 0 changed pixels in the first 800px of the Web-selected section at 320, 390 and 430px, excluding only the neighboring-slide edge; its screenshot/device treatment is unchanged |
| General browser suite           | 43 passed, 0 failed; no browser runtime errors                                                                                                                                 |
| No JavaScript / media           | Four capability descriptions and five genuine destination links remain in HTML; no video elements or video requests                                                            |

The small reduction in overall section height comes from replacing the taller text panels. Card height remains stable when changing category. A resize check exposed hidden desktop scroll events resetting mobile selection; those events are now ignored and the active category is realigned after returning to mobile. The final complete suite passed after that correction.

## Final review captures

- [Growth Engine](screenshots/capability-graphics/growth-mobile.webp)
- [Smart Systems](screenshots/capability-graphics/systems-mobile.webp)
- [AI Conversations](screenshots/capability-graphics/conversations-mobile.webp)

The browser environment is Windows Chrome with mobile touch emulation. Physical phones, Safari and Firefox are not claimed. The illustrations communicate service categories; they do not document business outcomes. No account setup is required.

## Compact-height follow-up

Reduced mobile card padding, media minimum height, tag spacing and action spacing in `MobileCapabilityStudio.module.css`. Bounded the illustrations to keep them from growing excessively on wider phones. Content, typography, destinations and the four selectors remain unchanged; all four slides retain a stable shared height.

| Mobile width | Card before | Card after |
| ------------ | ----------- | ---------- |
| 320px        | 587px       | 485px      |
| 390px        | 527px       | 471px      |
| 430px        | 504px       | 451px      |

Production build, formatting and the complete 11-width capabilities suite passed after this spacing adjustment. Touch swiping, keyboard input, reduced motion, resize restoration, image decoding, accessible links and no overflow were verified. Desktop/tablet section comparisons remained at zero changed pixels. Additional layout measurements at 600 and 767px also showed no overflow. The screenshots above document the original graphics refinement; current follow-up captures and measurements are in the ignored `qa-output/capability-height/` folder.
