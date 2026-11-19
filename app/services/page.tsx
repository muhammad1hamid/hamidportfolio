import Link from "next/link";
import { servicePages } from "@/data/services";
import { pageMeta } from "@/data/seo";
import { ContentPage, ProjectCta } from "@/components/seo/ContentPage";
const title = "Web Development, Chatbots & Automation Services | Hamid";
const description =
  "Explore Hamid’s website, chatbot and business automation services. Find the right scope, understand the process and discuss a project with an independent builder.";
export const metadata = pageMeta(title, description, "/services/");
export default function ServicesPage() {
  return (
    <ContentPage
      path="/services/"
      title="A connected skill set. A clear scope."
      intro="I’m Hamid, an independent web developer and AI automation builder based in Pakistan. Explore the work below, from a focused business website to a connected workflow, and choose a starting point for your project."
      label="Services"
      type="CollectionPage"
    >
      <div className="content-card-grid">
        {servicePages.map((service, i) => (
          <article className="content-card" key={service.slug}>
            <span className="eyebrow">{String(i + 1).padStart(2, "0")}</span>
            <h2>
              <Link href={`/${service.slug}/`}>{service.name} ↗</Link>
            </h2>
            <p>{service.intro}</p>
            <Link className="text-link" href={`/${service.slug}/`}>
              Explore {service.name.toLowerCase()} ↗
            </Link>
          </article>
        ))}
      </div>
      <section className="content-section">
        <h2>Not sure where to start?</h2>
        <p>
          A website makes your offer understandable. A chatbot can help with
          repeated questions. A workflow connects predictable steps. An agent
          may be useful when the task needs more flexible decisions. Start with
          the problem your team is facing.
        </p>
        <Link className="text-link" href="/blog/ai-agent-chatbot-workflow/">
          Compare chatbots, agents and workflows ↗
        </Link>
      </section>
      <ProjectCta />
    </ContentPage>
  );
}
