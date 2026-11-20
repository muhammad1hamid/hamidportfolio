# Editorial ownership and evidence

The [ElevateX editorial requirements](../../CONTENT-PUBLISHING.md) guide article writing for Hamid. The public site keeps the HAMID identity. Use the 90-day [editorial calendar](editorial-calendar.csv) to reserve time for builds, review and verification.

## Route and intent map

| Route | Reader intent and evidence | Contextual destinations | Main next step |
| --- | --- | --- | --- |
| `/` | Identify Hamid and decide if the work is relevant. Portfolio screenshots and service scope | `/services/`, `/growth/`, `/work/`, `/insights/` | `/contact/?source=home` |
| `/growth/` | Understand audit, content and conversion implementation. Visible service scope and example scenarios | `/insights/measure-whatsapp-enquiries/`, `/insights/mobile-website-launch-checklist/`, `/blog/business-website-brief/` | `/contact/#growth-enquiry` |
| `/insights/` | Read build notes and examples. Current technical article has a real capture and browser evidence | `/insights/hamid-intro-motion/`, `/insights/measure-whatsapp-enquiries/`, `/blog/` | Select an article |
| `/blog/` | Make a scope, workflow or budget decision. Evergreen decision guides | `/blog/landing-page-or-full-website/`, `/blog/business-website-brief/`, `/insights/` | Select a guide |
| `/insights/hamid-intro-motion/` | Evaluate a real motion implementation on the portfolio | `/work/`, `/insights/mobile-website-launch-checklist/`, `/web-development/` | Contextual WhatsApp draft |
| `/insights/measure-whatsapp-enquiries/` | Compare click, message and lead stages. Event wiring and controlled enquiry tests | `/insights/whatsapp-enquiry-path/`, `/growth/`, `/privacy/` | Contextual WhatsApp draft |
| `/web-development/` | Scope a website build and preview delivery quality | `/case-studies/`, `/testimonials/`, `/insights/hamid-intro-motion/` | Website enquiry |
| `/for-agencies/` | Understand scope, review and handover with Hamid. Verified self-directed demos and process | `/work/bridal-house/`, `/work/editing-julian/`, `/work/qadeer-jewellers/`, `/privacy/` | `/for-agencies/#agency-enquiry` |
| `/work/` and `/case-studies/` | Compare actual screens and read build context. Classifications follow supplied evidence | `/work/bridal-house/`, `/work/editing-julian/`, `/work/qadeer-jewellers/` | `/contact/` |
| `/about/` and `/editorial-policy/` | Verify authorship, disclosures and correction requests | `/work/`, `/insights/`, `/contact/` | Contact Hamid with correction or enquiry |

Keep the guide about page scope at `/blog/landing-page-or-full-website/`. Refresh the Insights articles on demos and workflow choice when an additional artifact is available. The prospective growth audit needs dated observations and a specific change with evidence. A how-to checklist for Next.js requires a separate reader task and code example to justify its own article.

## Reusable brief

Copy these fields into the editorial ticket. Keep one reader question per article.

- **Title, slug and existing target.** Identify the canonical route and any guide or service with a similar intent.
- **Buyer, question, intent and focus topic.** Name who needs the answer and which decision they are making. Identify the pillar and priority.
- **Claim and evidence.** Write an answer-first summary and the distinct lesson from a real build, audit or test. Attach source URLs, tested code paths, run settings and date. List evidence that still needs approval.
- **Outline.** Open with the direct answer, then actual example and trade-offs, a decision or task the reader can complete, limits and next step. Use semantic headings. Add a table or diagram when it clarifies the comparison.
- **Links and action.** Give two to four contextual links where available, one relevant service and a named WhatsApp or form action. Check the route list for overlap before reserving a new URL.
- **Visual.** Attach the owned or approved original, its 1200 × 675 crop, alt text, accurate caption and social crop. For a measurement screenshot preserve real labels and date. Document permission before publishing project or collaborator material.
- **Author, reviewer and approval.** Attribute Hamid using the existing author page. Record technical reviewer, artifact owner, scope, real publish and modification dates, locale and corrections path.
- **Publish test.** Confirm a complete article and real artifact, working assets, canonical, sitemap, BlogPosting data, valid internal links and JS-independent body. Check mobile and keyboard reading.
- **Measurement and refresh.** Record current status, source and review date. Revisit on a material platform, process or evidence change. Track engagement and independently verified qualified enquiries using the agreed definitions.

## Proof register

| Item | Verified evidence and scope, 20 November 2026 | Publication decision |
| --- | --- | --- |
| HAMID intro | `components/motion/origin-session.ts`, `brand-particles.ts`, 17 Chromium intro checks and the original site screenshot | Build note in local release. Local browser observations described as such |
| WhatsApp and enquiry events | `components/seo/Analytics.tsx`, `ProjectEnquiryForm.tsx`, published-tag interception and server/browser fixtures | Existing insight refreshed. Test responses and staff qualification are distinct evidence |
| Bridal House, Editing Julian, Qadeer Jewellers | Owner-confirmed self-directed builds, existing desktop/mobile captures, scope in `data/demo-projects.json` | Keep demo labels and visible interface decisions. Business metrics and commercial history awaiting evidence |
| Other project previews and stories | Supplied project URLs and identified captures, scope in `data/projects.ts` and `data/project-details.ts` | Maintain existing classifications. Obtain permission and role evidence for additional claims |
| Abdullah Abbasii and Usman | Owner-supplied recordings and attribution in `data/testimonial-pages.ts` | Existing watch-page presentation only. Obtain permission for new quotes or reuse and verify exact wording |
| Growth and AI services | Scope and illustrative scenarios in the repo. Field traffic and qualified lead figures require owner records | Service descriptions and disclosed examples are publishable. Results awaiting measurement |
| Agency partnerships | Published process in the prepared local page and clearly marked demo evidence | New client identity, testimonial, attribution or logo requires specific written approval |

## Draft briefs for the next evidence pieces

### What actually slowed the portfolio on mobile?

**Proposed route** `/insights/mobile-performance-audit/` · **Audience** founders and front-end leads · **Pillar** Growth Engine · **Status** evidence review

Answer how to find the expensive first paint on a site with real project images. Use the homepage, work archive and one project story as three distinct cases. Open with the difference between bytes and time. Show the actual before/after request waterfall for the work archive and the Manrope requests on the homepage. Explain why a first visible image gained priority while later project captures remain lazy. Include a short reproduction with cache policy, viewport, CPU/network settings and run count. Finish with one mobile test owners can run before changing their own hero.

Keep the Chrome and Lighthouse measurements in their own tables. Label the screenshots “local test” and date the raw evidence. Cite the existing [baseline audit](../audit/authority-baseline.md), asset pipeline, DevTools records and owner-approved diagrams. Include the mobile launch checklist, Work archive and Growth Engine service with an audit-specific contact action. Verify the LCP element and run medians before publication. Field data stays unknown until a usable p75 report exists. Refresh after the first measured live release. [Lighthouse scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/) · [PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/about)

### What does a real search-readiness audit prove?

**Proposed route** `/insights/portfolio-search-readiness/` · **Audience** growth leads · **Pillar** Growth Engine · **Status** awaiting deployed checks

Answer what a team can verify before receiving an indexing or AI report. Open with the real comparison between deployed and prepared routes. Walk through a 200 HTML response, one self-canonical from static markup, a structured article with a source and an internal link, and the public crawler policy. Show the difference between observing a 404/redirect and verifying the indexed result. Include a short list of owner checks for crawl permissions, canonical choice and Generative AI impressions. Reserve the claims of actual inclusion or referral performance for dated property exports.

Use the audit snapshot, updated title/canonical proof and a redacted owner-provided URL Inspection result if available. Put the dates on both states. Link to editorial standards, the intro build note as a real artifact, Growth Engine and the enquiry page. Hamid reviews crawler and release facts. Publish after the new deployment is reachable and the article names which metrics were available. Update on crawler policy changes or a measured public comparison. [Google AI search optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) · [Generative AI reports](https://support.google.com/webmasters/answer/16984139)

### What does an agency need back from a developer?

**Proposed route** `/insights/white-label-handover-checklist/` · **Audience** studio delivery leads · **Pillar** Web Experiences · **Status** draft

Answer which files, decisions and verification results let a studio operate the work after handover. Start with who owns the design, communications and deployment accounts. Use the prepared agency workflow and an owned demo to show an example handover for an approved design. Include a compact checklist for repository access, test steps, asset rights, credential transfer through a private channel, launch ownership and known issues. Document what varies by the written scope. An owned demo can illustrate the checklist. Real client evidence depends on the rights holder’s written approval.

Link to the Agency page, mobile release checklist and one verified demo walkthrough. Use an original crop of the demo plus a separately labeled example checklist. Hamid checks the actual file list, wording and rights before release. Use the agency enquiry action. Review after using the checklist on an approved project.
