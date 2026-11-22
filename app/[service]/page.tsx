import Link from "next/link";
import { notFound } from "next/navigation";
import { servicePages, serviceBySlug } from "@/data/services";
import { enquiryHref, serviceForPath } from "@/data/project-enquiry.mjs";
import { pageMeta, serviceSchema } from "@/data/seo";
import { ContentPage, ProjectCta } from "@/components/seo/ContentPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { ServiceDecisions } from "@/components/seo/ServiceDecisions";
import { GrowthEngine } from "@/components/seo/GrowthEngine";

export const dynamicParams = false;
export function generateStaticParams() {
  return servicePages.map((service) => ({ service: service.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const service = serviceBySlug((await params).service);
  if (!service) notFound();
  return pageMeta(service.title, service.description, `/${service.slug}/`);
}
export default async function ServicePage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const service = serviceBySlug((await params).service);
  if (!service) notFound();
  if (service.deliverables) return <GrowthEngine service={service} />;
  const path = `/${service.slug}/`;
  const contactHref = enquiryHref(serviceForPath(path), "services");
  return (
    <ContentPage
      path={path}
      title={service.title.replace(" — Hamid", "")}
      intro={service.intro}
      label={service.name}
      mainEntity={`${path}#service`}
      crumbs={[
        { label: "Services", href: "/services/" },
        { label: service.name, href: path },
      ]}
    >
      <div className="content-actions hero-page-actions">
        <Link className="button button-accent" href={contactHref}>
          Discuss this service ↗
        </Link>
        <Link className="text-link" href="/work/">
          Explore actual website work ↗
        </Link>
      </div>
      <ServiceDecisions slug={service.slug} />
      <div className="content-two-columns">
        <section>
          <h2>The problem to solve</h2>
          <p>{service.problem}</p>
        </section>
        <section>
          <h2>Who it suits</h2>
          <p>{service.audience}</p>
        </section>
      </div>
      <section className="content-section">
        <span className="eyebrow">An agreed scope</span>
        <h2>What we can build around.</h2>
        <ul className="feature-grid">
          {service.features.map((feature, i) => (
            <li key={feature}>
              <span aria-hidden="true">0{i + 1}</span>
              <p>{feature}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="content-section">
        <h2>How the work moves forward</h2>
        <ol className="content-steps">
          {service.flow.map((step, i) => (
            <li key={step}>
              <span aria-hidden="true">0{i + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </section>
      <div className="content-two-columns">
        <section>
          <h2>A practical use case</h2>
          <p>{service.example}</p>
        </section>
        <section>
          <h2>Tools and integration decisions</h2>
          <p>{service.integration}</p>
        </section>
      </div>
      {service.slug === "web-development" ||
      service.slug === "landing-page-development" ? (
        <aside className="content-proof">
          <h2>See the work, then discuss your direction.</h2>
          <p>
            Explore supplied live websites, actual desktop and mobile
            screenshots, and the experience notes behind selected projects.
          </p>
          <Link href="/case-studies/" className="text-link">
            Read project experience notes ↗
          </Link>
          <Link href="/testimonials/" className="text-link">
            Watch client video testimonials ↗
          </Link>
          {service.slug === "web-development" && (
            <Link href="/insights/hamid-intro-motion/" className="text-link">
              Read how the HAMID intro works ↗
            </Link>
          )}
        </aside>
      ) : (
        <aside className="content-proof">
          <h2>Start with your process.</h2>
          <p>
            Bring an example of the enquiry or task you want to improve. We can
            assess feasibility and define a small pilot. Published website work
            is available in the portfolio; completed automation results are not
            claimed here.
          </p>
          <Link href="/blog/" className="text-link">
            Read practical planning guides ↗
          </Link>
        </aside>
      )}
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
        <h2>Connected services</h2>
        <div className="related-links">
          {service.related.map((slug) => {
            const related = serviceBySlug(slug)!;
            return (
              <Link key={slug} href={`/${slug}/`}>
                {related.name} ↗
              </Link>
            );
          })}
        </div>
      </section>
      <ProjectCta contactHref={contactHref} />
      <p className="article-byline">
        Scope discussed with <Link href="/about/">Hamid</Link> ·{" "}
        <Link href="/answers/">Project questions</Link> ·{" "}
        <Link href="/editorial-policy/">Content standards</Link>
      </p>
      <JsonLd data={serviceSchema(service)} />
    </ContentPage>
  );
}
