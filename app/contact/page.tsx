import Link from "next/link";
import { site } from "@/data/site";
import { pageMeta } from "@/data/seo";
import { ContentPage } from "@/components/seo/ContentPage";
import { Arrow } from "@/components/ui/Arrow";

const growthMessage = encodeURIComponent(
  "Hi Hamid, I’d like to discuss Growth Engine.\nWebsite: [your website]\nMain goal: [your goal]",
);

export const metadata = pageMeta(
  "Contact Hamid — Websites, Search Visibility & Automation",
  "Discuss a website, Growth Engine visibility review or automation project with Hamid on WhatsApp. Share your goal, current setup and useful references.",
  "/contact/",
);
export default function ContactPage() {
  return (
    <ContentPage
      path="/contact/"
      title="A good project starts with a conversation."
      intro="Tell me what you want to build or improve. We can discuss a website, a Growth Engine review for search and AI visibility, or a process you want to automate."
      label="Contact"
      type="ContactPage"
    >
      <div className="content-actions hero-page-actions">
        <a
          className="button button-accent"
          href={site.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          data-contact-context="contact_page"
        >
          Message Hamid on WhatsApp <Arrow diagonal />
        </a>
        <Link
          href="/plan/"
          className="text-link"
          data-site-event="planner_open"
        >
          Prepare a project brief ↗
        </Link>
      </div>
      <div className="content-two-columns">
        <section>
          <h2>Reach me directly</h2>
          <p>WhatsApp · +92 335 6709222</p>
          <div className="related-links">
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn ↗
            </a>
            <a href={site.instagram} target="_blank" rel="noopener noreferrer">
              Instagram ↗
            </a>
          </div>
          <p>Remote collaboration · Based in Pakistan</p>
        </section>
        <section>
          <h2>What to include</h2>
          <ul className="plain-list">
            <li>Your business and the audience you serve</li>
            <li>The website, conversation or process you want to improve</li>
            <li>Your current tools and any useful examples</li>
            <li>
              Content readiness, target date and budget constraints, if known
            </li>
          </ul>
        </section>
      </div>
      <section className="content-proof growth-enquiry" id="growth-enquiry">
        <div>
          <h2>Discuss Growth Engine</h2>
          <p>
            Start with your website and a goal, such as getting a specific page
            discovered or making it easier for visitors to enquire.
          </p>
        </div>
        <a
          className="button button-accent"
          href={`${site.whatsapp}?text=${growthMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          data-contact-context="growth_engine"
        >
          Message about Growth Engine <Arrow diagonal />
        </a>
      </section>
      <section className="content-section">
        <h2>What happens next?</h2>
        <p>
          We discuss the goal and clarify what is technically and practically
          needed. A proposal can then define deliverables, responsibilities,
          timing and any third-party costs once we agree the scope.
        </p>
        <div className="related-links">
          <Link href="/services/">Choose a service ↗</Link>
          <Link href="/blog/business-website-brief/">
            Prepare a useful website brief ↗
          </Link>
        </div>
      </section>
    </ContentPage>
  );
}
