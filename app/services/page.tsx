import Link from "next/link";
import { servicePillars } from "@/data/services";
import { pageMeta } from "@/data/seo";
import { ContentPage, ProjectCta } from "@/components/seo/ContentPage";
import { Arrow } from "@/components/ui/Arrow";
import { enquiryHref } from "@/data/project-enquiry.mjs";

const title = "Web Development, SEO & AI Automation Services | Hamid";
const description =
  "Explore Hamid’s services for building a website, improving search and AI visibility, automating work and helping customers get answers.";
export const metadata = pageMeta(title, description, "/services/");

export default function ServicesPage() {
  return (
    <ContentPage
      path="/services/"
      title="Find the right starting point."
      intro="I’m Hamid, an independent developer based in Pakistan. Start with the part of your website or business that needs attention, then explore what the work could include."
      label="Services"
      type="CollectionPage"
      className="service-index"
    >
      <nav className="service-index-nav" aria-label="Service groups">
        {servicePillars.map((pillar) => (
          <a key={pillar.id} href={`#${pillar.id}`}>
            {pillar.name} <span aria-hidden="true">↓</span>
          </a>
        ))}
      </nav>
      <div className="service-groups">
        {servicePillars.map((pillar) => (
          <section id={pillar.id} key={pillar.id} className="service-group">
            <header>
              <span className="eyebrow">{pillar.action}</span>
              <h2>{pillar.name}</h2>
              <p>{pillar.summary}</p>
            </header>
            <ul className="service-group-links">
              {pillar.services.map((service) => (
                <li key={service.slug}>
                  <Link href={`/${service.slug}/`}>
                    <span>
                      <strong>{service.displayName}</strong>
                      <span>{service.descriptor}</span>
                    </span>
                    <Arrow diagonal />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <section className="content-section">
        <h2>Need help choosing?</h2>
        <p>
          Bring the problem you want to solve. The planner suggests a scope you
          can use to start the conversation.
        </p>
        <div className="related-links">
          <Link href="/plan/" data-site-event="planner_open">
            Find your starting scope ↗
          </Link>
          <Link href="/blog/ai-agent-chatbot-workflow/">
            Compare chatbots, agents and workflows ↗
          </Link>
        </div>
      </section>
      <section
        className="content-proof"
        aria-labelledby="services-agency-title"
      >
        <h2 id="services-agency-title">Development for agencies</h2>
        <p>
          Bring an approved design, a scoped website or a feature that needs a
          developer. I can work behind the scenes while your team leads the
          client relationship.
        </p>
        <Link
          href="/for-agencies/"
          className="text-link"
          data-agency-placement="services"
          data-agency-destination="agency_page"
        >
          Explore Agency Partnerships <Arrow diagonal />
        </Link>
      </section>
      <ProjectCta contactHref={enquiryHref("", "services")} />
    </ContentPage>
  );
}
