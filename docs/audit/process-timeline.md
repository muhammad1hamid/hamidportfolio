# How We Work timeline

The homepage shows five steps from Discover through Launch & improve between the video testimonials and Before We Build. The section uses HAMID’s Manrope and Instrument Serif pairing, graphite cards, and an orange rail. Each card has a small illustration of its work product. [Local preview](http://localhost:3000/#process-title)

## Reference inspection

- The exact @ibrandify listing opened in Chromium and identified **Scroll animated timeline** as MIT-licensed. Its Preview link opened the working demo at 1440 and 390 CSS pixels. The listing requires an account for the separately hosted component source. The supplied React snippet was available for review. [21st.dev reference](https://dev.21st.dev/@ibrandify/components/scroll-timeline)
- Desktop preview inspection showed a centered two-tone rail, outlined circular markers, alternating milestone blocks, and short pill labels near each node. The first block appeared on the left. The mobile preview moved the rail near the left edge and arranged all copy to its right.
- Scrolling into the second milestone extended the foreground past its node. The earlier text was fully visible while upcoming text was subdued. The supplied snippet uses 100 ms transitions on the rail, 500 ms on the markers and 700 ms on the cards. The HAMID implementation uses a directly scroll-linked fill and a 420 ms card transition.
- The local cards, illustrations and progress logic were written for this section. The reference demo’s dates, financing milestones and intro/outro spacers were omitted.

## Layout and behavior

Desktop alternates the milestone cards around the center rail from 1024 CSS pixels. Below that threshold, the cards form one column to the right of the rail. The five diagrams show a brief, a scope checklist, a browser build, a desktop and phone check, and a handover package. The 320, 360 and 375 px layouts reserve that space for text.

The orange fill measures from the center of the first node to the center of the final node. It follows the viewport midpoint in either scroll direction. A passive listener schedules one animation-frame callback. A ResizeObserver refreshes geometry when cards reflow. A single IntersectionObserver removes each card’s offset after approximately 28% of the card enters view. Reveals use 14 px of movement and retain legible text while pending. The final node changes to the completed state when the fill reaches it.

The initial HTML contains the section H2 and all five H3s and descriptions in one ordered list. CSS supplies the static rail and cards with scripts disabled. A reduced-motion media rule suppresses the animated fill and card movement immediately. Cards are informational and focus proceeds to the existing links in the surrounding sections.

| Section height | Previous |  Updated |
| -------------- | -------: | -------: |
| 1440 × 900     |   563 px | 1,049 px |
| 390 × 844      |   901 px | 1,113 px |

## Files

| File                                        | Change                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------- |
| `components/sections/Process.tsx`           | Section heading, introduction, and five original diagram variants         |
| `data/content.ts`                           | Typed milestone copy in the approved order                                |
| `components/ui/scroll-timeline.tsx`         | Reusable ordered timeline with viewport progress and one-time reveals     |
| `app/process-timeline.css`                  | Shared brand tokens, responsive geometry, card states and motion fallback |
| `app/globals.css` and `app/refinements.css` | Retired styles for the prior process layout                               |
| `components/motion/scroll-experience.ts`    | Retired the horizontal rail tween                                         |
| `scripts/qa-timeline.mjs`                   | Browser geometry, scroll behavior, accessibility checks and captures      |

## Verification

- `npm run build` and `npm run typecheck` passed. Prettier on the timeline files and `git diff --check` passed. The project uses its existing Next.js, Tailwind v4 and TypeScript setup with `@/components/ui`.
- `node scripts/qa-timeline.mjs` passed at **320, 360, 375, 390, 430, 768, 820, 1024, 1280 and 1440 CSS px**. The checks covered rail alignment, forward and reverse progress, scroll restoration, viewport rotation and resize, long-copy reflow, keyboard focus, and runtime motion preferences.
- Four scoped axe WCAG scans passed. The scripts-disabled and reduced-motion runs exposed all five steps. A 640 CSS px run at 2× scale exercised the reflow of a 1280 px window at 200% zoom.
- The first motion test found a stale fill when reduced motion was enabled midway. The CSS fallback now applies on the media preference change. The final run passed the live toggle and recorded zero page errors.
- On an emulated 390 × 844 Chrome viewport with 4× CPU throttling, the synthetic scroll sampled 72 frame intervals and observed zero long tasks and zero timeline-attributed layout shift. The p95 interval was 33.8 ms in that sample. Physical-device and field measurements remain open.
- `npm run test:browser` passed 42 checks. `npm run test:discovery` passed seven check groups and 20 demo cases. `npm run test:seo` verified 46 pages and 81 assets. `npm run test:origin` passed 17 intro and navigation checks.

## Screenshots

- Desktop [before](../../qa-output/process-timeline/before-1440.png), [updated section](../../qa-output/process-timeline/after-1440.png), and [rail during a scroll](../../qa-output/process-timeline/desktop-progress.png)
- [Tablet at 768 px](../../qa-output/process-timeline/after-768.png)
- Mobile [before](../../qa-output/process-timeline/before-390.png), [opening](../../qa-output/process-timeline/mobile-first.png), [middle](../../qa-output/process-timeline/mobile-middle.png), and [handover](../../qa-output/process-timeline/mobile-last.png)
- [Browser measurements](../../qa-output/process-timeline/results.json)
