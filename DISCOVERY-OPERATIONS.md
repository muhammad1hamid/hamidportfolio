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

Analytics remains inactive unless a real `NEXT_PUBLIC_GA_MEASUREMENT_ID` is configured. Existing privacy/consent and SPA setup guidance in `MANUAL-SEO-SETUP.md` still applies.

- `page_view`: query-free page location and title; `discovery_source` is an identified referring AI hostname or `unattributed`.
- `contact_click`: `method=whatsapp`, page path and `context` (`planner`, `demo` or `contact_link`). This records an attempt, not a delivered enquiry.
- `brief_download`: planner download action and page path.
- `demo_question`: interaction with the demo and page path. Question text is not sent.

The custom events never include the project notes, question, form values or WhatsApp message URL. Review GA4 automatic measurement separately. Referrer data is incomplete and may be stripped; Google and Bing referrals are not automatically classified as AI traffic. No single source measures all AI recommendations.

## Prompt observations

Use `discovery/prompts.json` for a small manual comparison set. Keep branded and non-branded observations separate. Record the date, product/mode, language/country, exact prompt, cited URLs and whether Hamid's identity and demo status were represented correctly. Responses vary, so observations supplement owner analytics rather than establishing a universal rank.

## Completing the video material

`data/testimonial-pages.ts` supports verified transcript segments, original language, a separately labelled translation, a stable thumbnail and the actual upload/publication date. The two watch pages are usable now; unverified transcript content and dates are intentionally absent.

On 15 November both owner-supplied Drive recordings were accessible. Automatic approval review rejected sending them to ElevenLabs for transcription because explicit permission for that external transfer was missing. No successful transfer or transcript generation occurred. Obtain that permission or use owner-supplied reviewed text. Do not substitute Drive file creation/modified timestamps for the original public video publication date.

Do not infer a testimonial's transcript from its name, company or duration. Once recordings can be transcribed accurately, add reviewed text and captions through a player that supports the captions. Do not claim that supplying an external captions file changes a Google Drive iframe's caption behavior.

VideoObject output and video-sitemap generation are gated on the required real thumbnail/date. Once supplied, the build validates the metadata, generates `video-sitemap.xml` and advertises it in robots.txt. Existing watch pages already belong in the ordinary sitemap. See [Google's video guidance](https://developers.google.com/search/docs/appearance/video).

## Demo evaluation

`npm run test:discovery` checks 20 named routing scenarios, including unsupported requests and ambiguous questions, plus planner exports, draft behavior, sources and no-JavaScript content. Results are written to `qa-output/discovery-audit.json`. This is deterministic application testing, not a language-model accuracy benchmark. Connecting a real model or inbox is a separate integration requiring provider access and a new evaluation.
