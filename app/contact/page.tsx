import Link from "next/link";
import { site } from "@/data/site";
import { pageMeta } from "@/data/seo";
import { ContentPage, ProjectCta } from "@/components/seo/ContentPage";
export const metadata = pageMeta(
  "Contact Hamid — Discuss a Website or Automation Project",
  "Contact Hamid on WhatsApp to discuss web development, chatbots or business automation. Share your goal, current setup and references for a scoped conversation.",
  "/contact/",
);
export default function ContactPage() {
  return (
    <ContentPage
      path="/contact/"
      title="A good project starts with a conversation."
      intro="Tell me what you want to build, what is happening today and what a useful outcome would look like. I work from Pakistan and collaborate remotely with businesses and agencies worldwide."
      label="Contact"
      type="ContactPage"
    >
      <div className="content-two-columns">
        <section>
          <h2>Reach me directly</h2>
          <p>WhatsApp is the main route for project enquiries.</p>
          <a
            className="contact-number"
            href={site.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            +92 335 6709222 ↗
          </a>
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
      <section className="content-section">
        <h2>What happens next?</h2>
        <p>
          We discuss the goal and clarify what is technically and practically
          needed. A proposal can then define deliverables, responsibilities,
          timing and any third-party costs. No fixed quote or delivery promise
          is made before that scope is agreed.
        </p>
        <div className="related-links">
          <Link href="/services/">Choose a service ↗</Link>
          <Link href="/blog/business-website-brief/">
            Prepare a useful website brief ↗
          </Link>
          <Link href="/#contact">Open the optional local brief form ↗</Link>
        </div>
      </section>
      <ProjectCta title="Share what you have in mind." />
    </ContentPage>
  );
}
