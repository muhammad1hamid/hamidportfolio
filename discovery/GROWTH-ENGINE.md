# Growth Engine implementation notes

## Starting point

The live page returned HTTP 200 with a self-canonical URL and the headline “Be easier to find. Easier to understand. Easier to choose.” The live sitemap contained 43 canonical pages and one Growth Engine entry on November 20, 2026. The desktop and mobile baselines are in `qa-output/growth-before-1440.png` and `qa-output/growth-before-390.png`.

Next.js 16 exports static HTML from `app/[service]/page.tsx` using the shared service catalog. `app/services/page.tsx` and `app/page.tsx` already expose the fourth pillar. `app/contact/page.tsx` links to Hamid's WhatsApp, and `app/plan/page.tsx` builds a local brief. Insights and guides are static routes. Vercel publishes the GitHub main branch. The shared layout provides the navigation, footer, locally hosted SIL Open Font License Manrope and Instrument Serif, and consent-gated Google Tag Manager. `app/sitemap.ts` and `app/robots.ts` own the search files.

## Reference images

The original images were viewed in the conversation and from `C:/Users/sahar/AppData/Local/Temp/`. The off-white page, strong blue sections and photographic signal field combine their shared design elements.

| File | Source feature | Original implementation |
| --- | --- | --- |
| codex-clipboard-bc1b5f20-d55c-4049-b0de-240f557f4b09.png | Cobalt and neutral poster fields, condensed visual hierarchy, photographic objects | Alternating warm paper and cobalt, oversized hero type and optical-glass art |
| codex-clipboard-2d3a6e97-0222-4504-8f2f-6d0d4573c37c.png | Tactile paper, one subject and directional labels | Off-white sections, concise diagram labels and spacious margins |
| codex-clipboard-00f587fa-3467-4085-afef-2192b6c925ad.png | Dramatic studio lighting, one directional action | Refracted light converges in the hero artwork |
| codex-clipboard-0ed82eef-383a-4f96-be66-fd9e8c997a9b.png | Serif accent paired with precise dark type and an image-led composition | Instrument Serif used to emphasize the third hero statement and key transitions |
| codex-clipboard-9c9783f2-d515-44de-b936-39474ef2ed6a.png | Ruled comparisons with a restrained blue highlight | Audit preview separates findings, remedies and verification |
| codex-clipboard-bddc632b-a09b-42e0-aab1-bebbbd8f7c2c.png | Glossy cobalt focal object and readable dark-on-light layouts | Blue optical glass on one hero panel and an ink-on-paper workstream layout |
| codex-clipboard-745543ea-b701-4be1-93db-876aab9a0b14.png | Short callouts alongside dimensional subjects | Three labelled discovery paths and sample enquiry stages |

The built-in image generator created a square, original studio still life of a bevelled glass website pane on a cobalt plinth with converging optical reflections. The picture contains no text. The visible labels are HTML. The press-ready source is `public/images/growth/discovery-field.webp`, with 520px and 900px variants. The generated image and labels represent an illustrative discovery concept.

The built-in tool used this brief.

> Create one original commercial editorial still-life photograph for the hero image on itshamid.com Growth Engine, a technical SEO, answer clarity and conversion service. Square image, edge-to-edge intense royal cobalt studio field (#2248f0, with a considered deep-blue falloff toward the lower right). A single sculptural tall clear glass rectangular pane, evoking the outline of a website window without any text or UI painted onto it, stands upright at a subtle angle on a low contiguous cobalt plinth. Three thin silver-white optical reflections travel through it diagonally from camera left, resolving into a single brighter sharply focused refracted beam toward the right. Use physically plausible thick bevelled glass, bright specular highlights, real weight, hard directional studio shadows and a restrained tactile fine film grain. Make the central object impactful at miniature thumbnail sizes. Frame with 15 percent breathing room at top and bottom and darker clean margins for separate web HTML labels. Luxury design-studio art direction and macro product photography, crisp and intelligent. No lettering, no dashboard mockup, no human, no robot, no chess, no logo, no watermark or text, no stock AI aesthetics, no extra objects. The art will appear full-bleed within a picture panel alongside large black and cobalt type on warm off-white.

## Market and search research

- LoudFace's outcome-first positioning informed the direct hero and enquiry path. [LoudFace](https://www.loudface.co/)
- iPullRank's service coverage informed a clear distinction between technical, content and implementation work. [iPullRank services](https://ipullrank.com/services)
- Seer's emphasis on research informed the method and the limits stated for AI discovery. [Seer Interactive GEO](https://www.seerinteractive.com/generative-engine-optimization)
- Grow and Convert's buyer-intent framing informed the three illustrative customer journeys. [Grow and Convert case study](https://www.growandconvert.com/ai/b2b-saas-ai-visibility-case-study/)
- Siege's educational resources informed the related reading and use of practical examples. [Siege Media](https://www.siegemedia.com/)
- Google describes ordinary Search eligibility and useful content for AI features. OpenAI documents separate crawlers for Search and training. Keep the site's existing crawler controls and use dated observations for visibility work. [Google AI features](https://developers.google.com/search/docs/appearance/ai-features) · [OpenAI crawlers](https://developers.openai.com/api/docs/bots)

## Consent and measurement

These events use the original GA4 tag after a visitor allows Google Analytics. Site events contain the pathname and fixed labels.

| Event | Trigger and fixed parameters |
| --- | --- |
| `growth_engine_cta_click` | Growth CTA click. Records placement, `growth_contact` destination and `growth_engine` service. |
| `growth_engine_section_view` | A workstreams, journey or deliverables heading becomes visible after consent. Records section and service once per visit. |
| `growth_engine_scenario_select` | The visitor switches the sample radio selection. Records scenario and service. |
| `click_whatsapp` | The visitor opens Growth Engine's contextual WhatsApp draft. Records destination and service. |

Use the new Growth Engine CTA event for its click-through rate. Keep the older `growth_cta_click` data layer action for continuity. Count confirmed enquiries from conversations actually received. The local planner creates a downloadable brief.

## Prompt benchmark protocol

Use the 30 buyer questions in `growth-prompts.json`. Record each sample separately with capture date and time, platform, model or search mode, country, language, exact prompt, mentions, cited URLs, identity accuracy and a screenshot or trace. Start with three independent sessions per practical prompt and platform. Keep settings and locale comparable when repeating the sample. Report within the observed dates and conditions, including disagreements between sessions. Count qualified enquiries using messages actually received, and use the existing `metrics.csv` for dated visibility and acquisition evidence where reports are available. Leave unavailable values blank with a reason.

## Education topics

| Buyer question | Useful starting resource | Future editorial scope |
| --- | --- | --- |
| How do SEO, AEO and GEO differ? | Growth Engine FAQ | Annotated page example showing the work behind each term |
| How do I measure discovery? | Measuring WhatsApp enquiries | Search Console and GA4 measurement examples with real dates and access |
| How do I launch a React website? | Mobile website launch checklist | Technical checks demonstrated on a published route |
| What should an audit deliver? | Illustrative Growth Engine audit | A publishable audit walkthrough with permission and click-to-verify evidence |
| How does a visitor become an enquiry? | WhatsApp enquiry path | Mobile contact-flow patterns with documented friction and checks |
| What does Search Console report? | Growth Engine FAQ | Indexing and visibility guidance for recently verified domains |
