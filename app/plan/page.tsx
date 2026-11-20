import Link from "next/link";
import { WebsitePlanner } from "@/components/tools/WebsitePlanner";
import { ContentPage } from "@/components/seo/ContentPage";
import { experienceMeta } from "@/data/experience";
import { enquirySiteKey } from "@/server/enquiry/config.mjs";
import "../contact.css";
export const metadata = experienceMeta("/plan/");
export default function PlanPage() {
  return (
    <ContentPage
      path="/plan/"
      title="Find a practical starting point."
      intro="Plan a new website or a Growth Engine review of an existing one. Build a brief to keep, refine or discuss with Hamid."
      label="Website planner"
    >
      <WebsitePlanner siteKey={enquirySiteKey()} />
      <noscript>
        <p>
          The interactive planner needs JavaScript. You can still use the
          checklist below or read the{" "}
          <a href="/blog/business-website-brief/">website brief guide</a>.
        </p>
      </noscript>
      <section className="content-section">
        <h2>How the recommendation works</h2>
        <p>
          One offer with a small page scope suggests a focused landing page.
          Collection browsing suggests a collection-led site. Broader service
          and portfolio needs suggest separate pages. For Growth Engine, the
          planner helps you choose priority pages and prepare for a visibility
          review. Cost and timing are agreed once the scope is clear.
        </p>
        <div className="content-two-columns">
          <div>
            <h3>Example: a service business</h3>
            <p>
              A business looking for enquiries might start with Home, Services
              and Contact, approved photography and a WhatsApp link. The next
              decisions are who prepares the copy, who receives enquiries and
              whether the business needs editing access.
            </p>
          </div>
          <div>
            <h3>Your discovery checklist</h3>
            <ul className="plain-list">
              <li>Who is visiting, and what should they do?</li>
              <li>What content is ready and who approves it?</li>
              <li>Which accounts or integrations are involved?</li>
              <li>Who owns the site and maintains it after launch?</li>
            </ul>
          </div>
        </div>
        <div className="related-links">
          <Link href="/blog/business-website-brief/">Write a useful brief</Link>
          <Link href="/growth/">Explore Growth Engine</Link>
          <Link href="/blog/what-affects-website-cost/">
            Understand website scope and cost
          </Link>
          <Link href="/answers/">More project questions</Link>
        </div>
      </section>
    </ContentPage>
  );
}
