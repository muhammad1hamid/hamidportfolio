import Link from "next/link";
import type { ReactNode } from "react";
import { serviceBySlug, type GrowthService } from "@/data/services";
import { pageSchema, serviceSchema } from "@/data/seo";
import { Arrow } from "@/components/ui/Arrow";
import { Breadcrumbs } from "./ContentPage";
import { JsonLd } from "./JsonLd";
import { ResponsiveImage } from "./ResponsiveImage";
import { GrowthJourneys } from "./GrowthJourneys";
import {
  GrowthAuditPreview,
  GrowthSignal,
  GrowthWorkstreamVisual,
} from "./GrowthVisuals";
import "@/app/growth-engine.css";

const path = "/growth/";
const contactPath = "/contact/#growth-enquiry";

const problems = [
  [
    "Hard to find",
    "Make important pages accessible, well structured and relevant to what customers are looking for.",
  ],
  [
    "Hard to understand",
    "Answer the questions buyers ask with specific examples and trustworthy information.",
  ],
  [
    "Hard to act on",
    "Connect service pages to clear enquiry paths and contact options people can use.",
  ],
];

const journey = [
  [
    "Search-ready foundations",
    "A priority service page has a clear URL and an internal link.",
  ],
  ["Clear answers", "The page answers a question the buyer actually has."],
  [
    "Confident decisions",
    "Genuine examples help the buyer decide whether the offer fits.",
  ],
  [
    "Measurable enquiries",
    "An easy contact step gives the buyer somewhere to go next.",
  ],
];

const engagement = [
  [
    "Audit & Roadmap",
    "A scoped visibility, content and conversion review with priorities and verification steps.",
  ],
  [
    "Implementation Sprint",
    "A defined set of technical, page or conversion changes, shipped and checked.",
  ],
  [
    "Ongoing Improvement",
    "Agreed review dates, measured experiments and site updates when the evidence supports them.",
  ],
];

const reading = [
  {
    href: "/insights/measure-whatsapp-enquiries/",
    label: "What a WhatsApp Click Actually Measures",
  },
  {
    href: "/insights/mobile-website-launch-checklist/",
    label: "A Mobile Launch Checklist for Business Websites",
  },
  {
    href: "/blog/business-website-brief/",
    label: "How to Write a Useful Business Website Brief",
  },
];

function GrowthCta({
  placement,
  children = "Discuss your growth goals",
  kind = "primary",
}: {
  placement: string;
  children?: ReactNode;
  kind?: "primary" | "inline";
}) {
  return (
    <Link
      href={contactPath}
      className={
        kind === "primary"
          ? "button button-accent growth-button"
          : "growth-link"
      }
      data-site-event="growth_cta_click"
      data-growth-placement={placement}
    >
      {children} <Arrow diagonal />
    </Link>
  );
}

export function GrowthEngine({ service }: { service: GrowthService }) {
  return (
    <main id="main" className="growth-page">
      <div className="wrap growth-masthead">
        <Breadcrumbs
          items={[
            { label: "Services", href: "/services/" },
            { label: service.name, href: path },
          ]}
        />
        <header className="growth-hero">
          <div className="growth-hero-copy">
            <p className="growth-kicker">
              Growth Engine / Search &amp; AI visibility
            </p>
            <h1>
              <span>{service.headline[0]}</span>{" "}
              <span>{service.headline[1]}</span> <em>{service.headline[2]}</em>
            </h1>
            <p className="growth-lead">{service.intro}</p>
            <div className="growth-actions">
              <GrowthCta placement="hero" />
              <a className="growth-link" href="#whats-included">
                Explore Growth Engine <span aria-hidden="true">↓</span>
              </a>
            </div>
            <p className="growth-hero-scope">
              Technical SEO · Answer readiness (AEO) · AI search (GEO) ·
              Conversion paths
            </p>
          </div>
          <GrowthSignal />
        </header>
      </div>

      <section
        className="wrap growth-block growth-problem"
        aria-labelledby="growth-problem"
      >
        <div className="growth-split">
          <h2 id="growth-problem">
            A great website shouldn’t be <em>invisible.</em>
          </h2>
          <p>{service.problem}</p>
        </div>
        <dl className="growth-problem-list">
          {problems.map(([name, detail]) => (
            <div key={name}>
              <dt>{name}</dt>
              <dd>{detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="growth-warm-band" aria-labelledby="growth-map-title">
        <div className="wrap growth-block growth-map">
          <div className="growth-split">
            <h2 id="growth-map-title">
              Discovery is a journey. <em>Build the whole path.</em>
            </h2>
            <p>
              Help the right people find what you offer, understand the work and
              take a next step with confidence.
            </p>
          </div>
          <ol className="growth-path">
            {journey.map(([title, text], i) => (
              <li key={title}>
                <span className="growth-step-number" aria-hidden="true">
                  0{i + 1}
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="whats-included"
        className="wrap growth-block growth-included"
        aria-labelledby="growth-workstreams-title"
      >
        <div className="growth-split">
          <h2 id="growth-workstreams-title" data-growth-section="workstreams">
            One Growth Engine. <em>Five practical workstreams.</em>
          </h2>
          <p>
            From technical foundations to clearer content and conversion paths,
            I focus on improvements I can ship, verify and measure.
          </p>
        </div>
        <div className="growth-workstreams">
          {service.deliverables.map((item) => (
            <section className="growth-workstream" id={item.id} key={item.id}>
              <div className="growth-workstream-copy">
                <p className="growth-kicker">{item.discipline}</p>
                <h3>{item.title}</h3>
                <p className="growth-workstream-lead">{item.detail}</p>
                <p>{item.checks}</p>
                <p className="growth-workstream-output">
                  <strong>Example output</strong> {item.sample}
                </p>
              </div>
              <GrowthWorkstreamVisual id={item.id} />
            </section>
          ))}
        </div>
      </section>

      <section
        id="sample-journey"
        className="growth-tinted"
        aria-labelledby="growth-journey-title"
      >
        <div className="wrap growth-block">
          <div className="growth-split">
            <h2 id="growth-journey-title" data-growth-section="journey">
              From a question <em>to a conversation.</em>
            </h2>
            <p>
              Choose a starting point to see how search, clear information and a
              useful next action work together.
            </p>
          </div>
          <GrowthJourneys />
        </div>
      </section>

      <section
        id="deliverables"
        className="wrap growth-block growth-delivery"
        aria-labelledby="growth-delivery-title"
      >
        <div className="growth-split">
          <h2 id="growth-delivery-title" data-growth-section="deliverables">
            Know what gets reviewed. <em>Know what gets shipped.</em>
          </h2>
          <p>
            I agree the deliverables with you at the start. See how a finding
            can turn into a specific change and a way to verify it.
          </p>
        </div>
        <GrowthAuditPreview />
        <dl className="growth-output-list">
          {service.outputs.map((item) => (
            <div key={item.title}>
              <dt>{item.title}</dt>
              <dd>{item.detail}</dd>
            </div>
          ))}
        </dl>
        <div className="growth-delivery-action">
          <p>{service.limits}</p>
          <GrowthCta placement="deliverables" />
        </div>
      </section>

      <section
        className="wrap growth-block growth-audiences"
        aria-labelledby="growth-audience-title"
      >
        <h2 id="growth-audience-title">
          Different starting points. <em>One practical approach.</em>
        </h2>
        <div className="growth-audience-list">
          {service.fit.map((item) => (
            <article key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <p className="growth-first-step">
                <strong>Typical first step</strong>
                {item.firstStep}
              </p>
              <GrowthCta placement={`audience_${item.id}`} kind="inline">
                {item.id === "founder"
                  ? "Discuss a launch"
                  : item.id === "agency"
                    ? "Discuss agency delivery"
                    : "Discuss your existing site"}
              </GrowthCta>
            </article>
          ))}
        </div>
      </section>

      <section className="growth-ink" aria-labelledby="growth-method-title">
        <div className="wrap growth-block">
          <h2 id="growth-method-title">
            Find the bottleneck. Fix what matters. <em>Measure the change.</em>
          </h2>
          <ol className="growth-path growth-method">
            {service.process.map((step, i) => (
              <li key={step.title}>
                <span className="growth-step-number" aria-hidden="true">
                  0{i + 1}
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="growth-method-note">
            If Search Console has limited history, I document the technical
            baseline and note which reports need more time.
          </p>
        </div>
      </section>

      <section
        className="wrap growth-block growth-proof"
        aria-labelledby="growth-proof-title"
      >
        <div className="growth-split">
          <h2 id="growth-proof-title">
            See the actual work. <em>Check the evidence.</em>
          </h2>
          <div>
            <p>
              This page is one example of my implementation. You can inspect the
              published sitemap and crawl rules. In the portfolio, self-directed
              demos show interface choices and working visitor paths.
            </p>
            <Link href="/about/" className="growth-author">
              <ResponsiveImage
                src="/images/hamid-hero.webp"
                alt="Portrait of Hamid"
                width={1000}
                height={1000}
                sizes="(max-width: 740px) 86px, 120px"
              />
              <span>
                <strong>Hamid</strong>Independent developer
              </span>
              <Arrow diagonal />
            </Link>
          </div>
        </div>
        <div className="growth-proof-work">
          <Link href="/work/bridal-house/" className="growth-proof-project">
            <ResponsiveImage
              src="/images/projects/bridal-house.webp"
              alt="Bridal House website homepage and collection navigation"
              width={1440}
              height={900}
              sizes="(max-width: 600px) 90vw, 43vw"
            />
            <span>Self-directed demo</span>
            <h3>
              Bridal House <Arrow diagonal />
            </h3>
          </Link>
          <Link href="/work/editing-julian/" className="growth-proof-project">
            <ResponsiveImage
              src="/images/projects/editing-julian.webp"
              alt="Editing Julian website homepage and video portfolio"
              width={1440}
              height={900}
              sizes="(max-width: 600px) 90vw, 43vw"
            />
            <span>Self-directed demo</span>
            <h3>
              Editing Julian <Arrow diagonal />
            </h3>
          </Link>
        </div>
        <div className="growth-actions">
          <Link className="growth-link" href="/work/">
            See website work <Arrow diagonal />
          </Link>
          <Link className="growth-link" href="/testimonials/">
            Watch client testimonials <Arrow diagonal />
          </Link>
          <a className="growth-link" href="/sitemap.xml">
            View the published sitemap <Arrow diagonal />
          </a>
          <a className="growth-link" href="/robots.txt">
            View crawl rules <Arrow diagonal />
          </a>
        </div>
      </section>

      <section
        className="wrap growth-block growth-engagement"
        aria-labelledby="growth-engagement-title"
      >
        <div className="growth-split">
          <h2 id="growth-engagement-title">
            Start where your site <em>needs it most.</em>
          </h2>
          <div>
            <p>Typical engagement formats</p>
            <dl>
              {engagement.map(([title, text]) => (
                <div key={title}>
                  <dt>{title}</dt>
                  <dd>{text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="growth-tinted" aria-labelledby="growth-faq-title">
        <div className="wrap growth-block growth-faq">
          <h2 id="growth-faq-title">
            Good questions <em>before we begin.</em>
          </h2>
          <div>
            {service.faqs.map((faq) => (
              <details key={faq.q}>
                <summary>{faq.q}</summary>
                <p>
                  {faq.a}
                  {faq.source && (
                    <>
                      {" "}
                      <a href={faq.source.url}>{faq.source.label}</a>.
                    </>
                  )}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section
        className="wrap growth-block growth-reading"
        aria-labelledby="growth-reading-title"
      >
        <h2 id="growth-reading-title">
          Explore the thinking <em>behind the work.</em>
        </h2>
        <ul>
          {reading.map((article) => (
            <li key={article.href}>
              <Link href={article.href}>
                {article.label} <Arrow diagonal />
              </Link>
            </li>
          ))}
        </ul>
        <div className="growth-actions" aria-label="Related services">
          {service.related.map(serviceBySlug).map(
            (related) =>
              related && (
                <Link
                  className="growth-link"
                  key={related.slug}
                  href={`/${related.slug}/`}
                >
                  {related.displayName} <Arrow diagonal />
                </Link>
              ),
          )}
          <Link className="growth-link" href="/services/">
            All services <Arrow diagonal />
          </Link>
        </div>
      </section>

      <section
        className="growth-warm-band"
        aria-labelledby="growth-close-title"
      >
        <div className="wrap growth-block growth-close">
          <h2 id="growth-close-title">
            Let’s find the next <em>useful improvement.</em>
          </h2>
          <div>
            <p>
              Share your website, your audience and the outcome you want to
              improve. I’ll help you find a practical starting scope.
            </p>
            <div className="growth-actions">
              <GrowthCta placement="closing" />
              <Link
                className="growth-link"
                href="/plan/"
                data-site-event="planner_open"
              >
                Plan your project <Arrow diagonal />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <JsonLd data={pageSchema(path, service.title, service.description)} />
      <JsonLd data={serviceSchema(service, service.descriptor)} />
    </main>
  );
}
