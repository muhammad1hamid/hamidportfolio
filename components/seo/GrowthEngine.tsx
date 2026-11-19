import Link from "next/link";
import { serviceBySlug, type GrowthService } from "@/data/services";
import { pageSchema, serviceSchema } from "@/data/seo";
import { Arrow } from "@/components/ui/Arrow";
import { Breadcrumbs } from "./ContentPage";
import { JsonLd } from "./JsonLd";

const path = "/growth/";
const contactPath = "/contact/#growth-enquiry";

export function GrowthEngine({ service }: { service: GrowthService }) {
  return (
    <main id="main" className="content-page growth-page wrap">
      <Breadcrumbs
        items={[
          { label: "Services", href: "/services/" },
          { label: service.name, href: path },
        ]}
      />
      <header className="growth-hero">
        <div>
          <span className="eyebrow">
            <i className="accent-dot" /> Search & AI visibility
          </span>
          <h1>
            <span>{service.headline[0]}</span>{" "}
            <span>{service.headline[1]}</span> <em>{service.headline[2]}</em>
          </h1>
          <p>{service.intro}</p>
          <div className="content-actions">
            <Link
              href={contactPath}
              className="button button-accent"
              data-site-event="growth_cta_click"
            >
              Discuss Growth Engine <Arrow diagonal />
            </Link>
            <a className="text-link" href="#whats-included">
              See what’s included ↓
            </a>
          </div>
        </div>
        <nav className="growth-scope" aria-labelledby="growth-scope-title">
          <h2 id="growth-scope-title">What we can review</h2>
          <ol>
            {service.deliverables.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>
                  {item.title} <span aria-hidden="true">↓</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </header>
      <section className="growth-problem">
        <h2>A website can look great and still be hard to discover.</h2>
        <p>{service.problem}</p>
      </section>
      <section id="whats-included" className="content-section growth-included">
        <h2>What’s inside the Growth Engine</h2>
        <div className="growth-deliverables">
          {service.deliverables.map((item) => (
            <section id={item.id} key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </section>
          ))}
        </div>
      </section>
      <section className="content-section">
        <h2>Who it’s for</h2>
        <div className="growth-fit">
          {service.fit.map((item) => (
            <div key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="content-section">
        <h2>How it works</h2>
        <ol className="growth-process">
          {service.process.map((step) => (
            <li key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <div className="content-two-columns growth-outputs">
        <section>
          <h2>What you receive</h2>
          <ul className="plain-list">
            {service.outputs.map((output) => (
              <li key={output}>{output}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2>Scope & expectations</h2>
          <p>{service.limits}</p>
        </section>
      </div>
      <section className="content-section content-faq">
        <h2>Questions before we start</h2>
        {service.faqs.map((faq) => (
          <details key={faq.q}>
            <summary>{faq.q}</summary>
            <p>{faq.a}</p>
          </details>
        ))}
      </section>
      <section className="content-section">
        <h2>Related services and reading</h2>
        <div className="related-links">
          {service.related.map((slug) => {
            const related = serviceBySlug(slug)!;
            return (
              <Link key={slug} href={`/${slug}/`}>
                {related.displayName} ↗
              </Link>
            );
          })}
          <Link href="/insights/measure-whatsapp-enquiries/">
            How to measure WhatsApp enquiries ↗
          </Link>
          <Link href="/services/">All services ↗</Link>
        </div>
      </section>
      <section className="content-cta growth-closing">
        <div>
          <h2>Let’s find the next useful improvement.</h2>
          <p>
            Bring your website and one goal. We’ll find a practical place to
            start.
          </p>
        </div>
        <div className="content-actions">
          <Link
            href={contactPath}
            className="button button-light"
            data-site-event="growth_cta_click"
          >
            Discuss Growth Engine <Arrow diagonal />
          </Link>
          <Link
            href="/plan/"
            className="text-link"
            data-site-event="planner_open"
          >
            Plan your scope ↗
          </Link>
        </div>
      </section>
      <JsonLd data={pageSchema(path, service.title, service.description)} />
      <JsonLd data={serviceSchema(service, service.descriptor)} />
    </main>
  );
}
