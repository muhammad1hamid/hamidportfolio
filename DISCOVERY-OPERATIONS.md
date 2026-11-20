# Search and AI visibility operations

Prepared 5 October 2026. Current domain **https://itshamid.com** was selected on 19 November 2026. See `AEO-GEO-IMPLEMENTATION.md` for results and remaining dependencies.

## What can be measured now

The implementation is local. Local metadata, links, content accessibility, tool behavior and performance can be tested. Public indexing, AI impressions, citations and qualified leads require the actual public domain and owner tools. An unavailable measure must remain unavailable, not zero.

Run `npm run check:public` after building. It reads DNS and representative public URLs, compares deployed content to the local export and writes `qa-output/public-launch.json`. It never deploys, changes DNS or submits URLs. A nonzero result means the inspected public destination does not yet match the prepared release.

## Public launch

1. Connect `itshamid.com` to the selected portfolio host.
2. Keep `NEXT_PUBLIC_SITE_URL=https://itshamid.com` and redirect the `www` hostname to this canonical hostname.
3. Build and deploy the static `out/` directory. Preserve normal 404s and the generated redirect/header behavior. Check HTTPS, compression and all assets.
4. Verify the domain in Google Search Console and Bing Webmaster Tools. DNS verification stays in the owner's DNS account. Optional HTML verification values and GA4 can be added through the existing environment variables, followed by a rebuild.
5. Submit the actual deployed sitemap. If using IndexNow, configure its real ownership key, rebuild, deploy, run the dry run and only then submit the verified build.
6. Inspect home, one service, one demo walkthrough, one guide and both watch pages using the public tools. Check firewall access as well as robots directives.
7. Check Search Console's Search generative AI inclusion setting, including property inheritance. Google's [control documentation](https://support.google.com/webmasters/answer/16908024) describes the current setting.

Google's [generative AI guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) prioritizes useful content and normal technical access. Structured data and a crawler allow rule do not guarantee indexing or citation.

## Weekly operational check

- Check unavailable pages, broken media and crawl errors first.
- Review the important pages' indexing/canonical status.
- Check that the planner download and WhatsApp draft still match the visitor's choices.
- Check actual links to external portfolio examples; these destinations can change independently.
- Verify new claims against the owner/source before adding them to guides or walkthroughs.

## Monthly visibility review

Use `discovery/metrics.csv` as an owner-maintained log. Enter the real observation period and source. Record:

- Google AI impressions by page and device in its [Generative AI performance report](https://support.google.com/webmasters/answer/16984139), when available.
- Microsoft-supported citations/cited URLs in [Bing AI Performance](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/).
- Identifiable AI referrals and the pages they enter on.
- WhatsApp contact attempts, separately from owner-confirmed qualified enquiries and projects.
- Which content led to useful conversations and what prospective clients still asked.

Review at 30, 60 and 90 days after the real public launch. These are comparison points, not deadlines for search engines. Do not schedule fictional future values or describe report access as already configured.

## Analytics events

Ahrefs Web Analytics is installed in the `<head>` of the public export. Ahrefs skips traffic events from localhost, and the tag is omitted from noindex builds. After deployment, use **Recheck installation** in the Ahrefs project. [Ahrefs installation guide](https://help.ahrefs.com/en/articles/10247870-about-ahrefs-web-analytics)

Google Tag Manager container `GTM-KF5WH37L` sends to GA4 stream `G-BXP2WE495G`. The site queues denied consent before any Google tag loads. When a visitor allows Google Analytics, the site updates analytics consent and loads the container once. The **Analytics settings** control saves or revokes that choice. Advertising consent stays denied. Verify the published container and the consent update on the live site with [Google Tag Assistant](https://tagassistant.google.com/).

The visitor can allow Microsoft Clarity separately in **Analytics settings**. Existing Clarity choices carry forward. Project form fields and the enquiry handover preview are masked. The site prepares WhatsApp draft text when the visitor opens WhatsApp. Google Analytics and Clarity load on the canonical site after consent. [Clarity installation check](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-setup#verify-your-installation)

- `page_view`: The published Google tag records the initial view. The site records later route changes with a query-free location, previous path and page title.
- `contact_click`: `method=whatsapp`, page path and a fixed context such as `planner`, `demo`, `contact_page` or `growth_engine`. This records a click.
- `generate_lead`: New enquiry receipt accepted by the server. This records website form acceptance. Staff verify email delivery and project qualification separately.
- `ai_referral_landing`: One consented event per document with a recognized referrer or the documented ChatGPT source tag. See the [authority measurement protocol](discovery/authority-methodology.md) for source rules, GA4 setup and the observation log.
- `brief_download`: planner download action and page path.
- `demo_question`: interaction with the demo and page path. Question text is not sent.

The custom events never include the project notes, question, form values or WhatsApp message URL. Review GA4 automatic measurement separately. Referrer data is incomplete and may be stripped; Google and Bing referrals are not automatically classified as AI traffic. No single source measures all AI recommendations.

### Homepage and Growth Engine actions

After Google Analytics consent, the site pushes these events to the existing data layer. Each event includes the pathname. The pillar click also includes the fixed pillar ID.

| Event | Action |
| --- | --- |
| `hero_primary_cta_click` | Select **Discuss your project** in the homepage hero |
| `hero_portfolio_cta_click` | Select **Explore selected work** in the homepage hero |
| `service_pillar_click` | Select one of the four homepage service cards |
| `growth_cta_click` | Select a Growth Engine enquiry CTA on `/growth/` |
| `contact_whatsapp_click` | Select a WhatsApp contact link |
| `planner_open` | Open the homepage brief or follow a featured link to the planner |
| `planner_growth_option_select` | Select Growth Engine as the planner goal |

Use the existing pageview setup to measure visits to `/growth/`. Verify any custom-event triggers and destination tags in GTM Preview before publishing container changes. Use one WhatsApp click event per report and count qualified enquiries from conversations actually received. If you track an enquiry rate, document its denominator and the qualification criteria before comparing periods.

## Prompt observations

Use [the 30-prompt authority dataset](discovery/authority-prompts.csv) for repeatable monitoring and `discovery/prompts.json` for quick checks. Keep branded and non-branded observations separate. Record the date, product/mode, language/country, exact prompt, cited URLs and whether Hamid's identity and demo status were represented correctly. Responses vary, so observations supplement owner analytics.

## Completing the video material

`data/testimonial-pages.ts` supports verified transcript segments, original language, a separately labelled translation, a stable thumbnail and the actual upload/publication date. The two watch pages are usable now; unverified transcript content and dates are intentionally absent.

On 15 November both owner-supplied Drive recordings were accessible. Automatic approval review rejected sending them to ElevenLabs for transcription because explicit permission for that external transfer was missing. No successful transfer or transcript generation occurred. Obtain that permission or use owner-supplied reviewed text. Do not substitute Drive file creation/modified timestamps for the original public video publication date.

Do not infer a testimonial's transcript from its name, company or duration. Once recordings can be transcribed accurately, add reviewed text and captions through a player that supports the captions. Do not claim that supplying an external captions file changes a Google Drive iframe's caption behavior.

VideoObject output and video-sitemap generation are gated on the required real thumbnail/date. Once supplied, the build validates the metadata, generates `video-sitemap.xml` and advertises it in robots.txt. Existing watch pages already belong in the ordinary sitemap. See [Google's video guidance](https://developers.google.com/search/docs/appearance/video).

## Demo evaluation

`npm run test:discovery` checks 20 named routing scenarios, including unsupported requests and ambiguous questions, plus planner exports, draft behavior, sources and no-JavaScript content. Results are written to `qa-output/discovery-audit.json`. This is deterministic application testing, not a language-model accuracy benchmark. Connecting a real model or inbox is a separate integration requiring provider access and a new evaluation.
