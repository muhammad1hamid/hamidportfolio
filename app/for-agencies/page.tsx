import Link from "next/link";
import { ProjectEnquiryForm } from "@/components/contact/ProjectEnquiryForm";
import {
  ProjectLiveLink,
  ProjectMeta,
  ProjectStoryLink,
} from "@/components/projects/ProjectLinks";
import { ProjectVisual } from "@/components/projects/ProjectVisual";
import { Breadcrumbs } from "@/components/seo/ContentPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { ResponsiveImage } from "@/components/seo/ResponsiveImage";
import { Arrow } from "@/components/ui/Arrow";
import {
  agencyCapabilities,
  agencyEngagements,
  agencyExamples,
  agencyPath,
  agencyProcess,
  agencyQuestions,
  agencySituations,
} from "@/data/agency-partnerships";
import demos from "@/data/demo-projects.json";
import { agencyContactHref } from "@/data/project-enquiry.mjs";
import { storyProjects } from "@/data/projects";
import { absolute, pageMeta, pageSchema, serviceSchema } from "@/data/seo";
import { site } from "@/data/site";
import { enquirySiteKey } from "@/server/enquiry/config.mjs";
import "../contact.css";
import "./agency.css";

const title = "White-Label Web Development for Agencies | Hamid";
const description =
  "White-label web development and landing pages for creative and marketing agencies. Partner directly with Hamid for scoped builds, practical integrations and clear handovers.";
const heroTitle = "Your client. Your vision. My build.";
const whatsapp =
  site.whatsapp +
  "?text=" +
  encodeURIComponent(
    "Hi Hamid, I’d like to discuss a white-label agency project. Here’s a short summary:",
  );

export const metadata = pageMeta(title, description, agencyPath);

function DeliveryFlow() {
  return (
    <figure className="agency-flow">
      <div className="agency-flow-figure">
        <div className="agency-flow-brief" aria-hidden="true">
          <span>Approved layouts</span>
          <div className="agency-flow-wireframe">
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className="agency-flow-build">
          <div className="agency-flow-chrome">
            <span className="preview-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>Build for review</span>
            <i className="accent-dot" aria-hidden="true" />
          </div>
          <ResponsiveImage
            src="/images/projects/bridal-house.webp"
            alt="Bridal House demo build, showing a finished design with collection and consultation links"
            width={1440}
            height={960}
            sizes="(max-width: 800px) 77vw, 40vw"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </div>
      <ol className="agency-flow-steps" aria-label="Delivery flow">
        <li>Agency brief</li>
        <li>Development</li>
        <li>Agency review</li>
      </ol>
      <figcaption>
        Your agency presents the work.{" "}
        <span>Shown with the Bridal House demo.</span>
      </figcaption>
    </figure>
  );
}

export default function AgencyPage() {
  const siteKey = enquirySiteKey();
  return (
    <main id="main" className="content-page agency-page wrap">
      <Breadcrumbs items={[{ label: "For Agencies", href: agencyPath }]} />

      <div className="agency-hero">
        <header className="content-hero agency-intro">
          <span className="eyebrow">
            <i className="accent-dot" /> For creative & marketing agencies
          </span>
          <h1>
            <span>Your client.</span> <span>Your vision.</span>{" "}
            <em>My build.</em>
          </h1>
          <p className="agency-lede">
            White-label web development for agencies that need a technical
            partner behind the scenes.
          </p>
          <p className="agency-summary">
            I turn approved designs and clear briefs into websites, landing
            pages and scoped integrations. You lead the client relationship. I
            handle the agreed build.
          </p>
          <div className="content-actions agency-hero-actions">
            <a
              className="button button-accent"
              href="#agency-enquiry"
              data-agency-placement="hero"
              data-agency-destination="enquiry"
            >
              Discuss an agency project <Arrow diagonal />
            </a>
            <a
              className="text-link agency-link"
              href="#agency-work"
              data-agency-placement="hero"
              data-agency-destination="proof"
            >
              See relevant work <Arrow />
            </a>
          </div>
          <p className="agency-location">
            Based in Pakistan · Collaborating worldwide
          </p>
        </header>
        <DeliveryFlow />
      </div>

      <section
        className="agency-section agency-split"
        aria-labelledby="agency-fit-title"
      >
        <div className="agency-section-lead">
          <span className="eyebrow">When delivery needs extra hands</span>
          <h2 id="agency-fit-title">
            More on your desk. <em>Room for the details.</em>
          </h2>
        </div>
        <dl className="agency-situations">
          {agencySituations.map(({ title, text, output }) => (
            <div key={title}>
              <dt>{title}</dt>
              <dd>
                <p>{text}</p>
                <p className="agency-output">{output}</p>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        className="agency-section"
        aria-labelledby="agency-capabilities-title"
      >
        <div className="agency-section-lead agency-split">
          <div>
            <span className="eyebrow">What I can build for your clients</span>
            <h2 id="agency-capabilities-title">
              The technical side, <em>taken care of.</em>
            </h2>
          </div>
          <p>
            Scope a complete website or bring me in for one specific piece.
            We’ll agree on the build, how it will be reviewed and what your team
            needs at handover.
          </p>
        </div>
        <div className="agency-capabilities">
          {agencyCapabilities.map(({ title, text, links }) => (
            <article className="agency-capability" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
              {links.length > 0 && (
                <div className="agency-related">
                  {links.map(({ label, href }) => (
                    <Link
                      href={href}
                      key={href}
                      className="text-link agency-link"
                    >
                      {label} <Arrow diagonal />
                    </Link>
                  ))}
                </div>
              )}
            </article>
          ))}
          <article className="agency-capability agency-growth">
            <span className="eyebrow">Scoped add-on</span>
            <h3>Growth Engine</h3>
            <p>
              Plan redirects and metadata for a migration, improve search and AI
              readability, or define how to measure the enquiry path.
            </p>
            <Link href="/growth/" className="text-link agency-link">
              Explore Growth Engine <Arrow diagonal />
            </Link>
          </article>
        </div>
      </section>

      <section
        className="agency-section agency-trust agency-split"
        aria-labelledby="agency-trust-title"
      >
        <div className="agency-section-lead">
          <span className="eyebrow">The white-label relationship</span>
          <h2 id="agency-trust-title">
            Your agency stays <em>front and center.</em>
          </h2>
          <div className="agency-founder">
            <ResponsiveImage
              src="/images/hamid-hero.webp"
              alt=""
              width={1000}
              height={1000}
              sizes="76px"
            />
            <div>
              <strong>Hamid</strong>
              <Link href="/about/" className="text-link agency-link">
                Meet the developer <Arrow diagonal />
              </Link>
            </div>
          </div>
        </div>
        <dl className="agency-trust-rules">
          <div>
            <dt>Client communication</dt>
            <dd>
              Your agency manages the relationship and client updates. I work in
              the tools we agree on and join client conversations when you
              request it.
            </dd>
          </div>
          <div>
            <dt>Confidentiality and access</dt>
            <dd>
              Agree on who can see private briefs and where they’re shared. We
              can discuss an NDA and sign it, if agreed, before exchanging
              sensitive materials.
            </dd>
          </div>
          <div>
            <dt>Ownership, credit and handover</dt>
            <dd>
              Record code access, IP ownership or transfer, billing, attribution
              and any portfolio use in the project agreement. Publishing a
              client name, logo or testimonial requires explicit permission.
            </dd>
          </div>
        </dl>
      </section>

      <section
        className="agency-section"
        id="agency-work"
        tabIndex={-1}
        aria-labelledby="agency-work-title"
      >
        <div className="agency-section-lead agency-split">
          <div>
            <span className="eyebrow">Selected build examples</span>
            <h2 id="agency-work-title">
              See the work <em>in practice.</em>
            </h2>
          </div>
          <p>
            These self-directed websites show how I build around photography,
            service content and a clear next action. Inspect the captures and
            decisions for each demo.
          </p>
        </div>
        <div className="agency-proof-grid">
          {agencyExamples.map(({ id, focus, contribution }) => {
            const project = storyProjects.find((item) => item.id === id);
            if (!project || project.proofType !== "self-directed-demo")
              throw new Error(`Missing verified demo metadata for ${id}`);
            return (
              <article className="agency-proof" key={id}>
                <ProjectVisual
                  project={project}
                  sizes="(max-width: 760px) 90vw, (max-width: 1440px) 43vw, 640px"
                />
                <div className="agency-proof-copy">
                  <ProjectMeta project={project} />
                  <h3>{project.title}</h3>
                  <p className="agency-proof-focus">{focus}</p>
                  <p>{contribution}</p>
                  <p className="agency-output">{demos[id].role}</p>
                  <div className="agency-related">
                    <ProjectStoryLink project={project} entry="agency_proof" />
                    {project.liveStatus !== "unavailable" && (
                      <ProjectLiveLink project={project} entry="agency_proof" />
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <aside className="agency-proof-note">
          <div>
            <h3>Reviewing private work</h3>
            <p>
              If permission allows, we can arrange to discuss an available
              redacted sample or walkthrough.
            </p>
          </div>
          <div className="agency-related">
            <Link href="/work/" className="text-link agency-link">
              Browse all work <Arrow diagonal />
            </Link>
            <Link href="/testimonials/" className="text-link agency-link">
              Client video testimonials <Arrow diagonal />
            </Link>
            <a
              href="#agency-enquiry"
              className="text-link agency-link"
              data-agency-placement="proof"
              data-agency-destination="enquiry"
            >
              Discuss a similar build <Arrow />
            </a>
          </div>
        </aside>
      </section>

      <section
        className="agency-section"
        aria-labelledby="agency-process-title"
      >
        <div className="agency-section-lead">
          <span className="eyebrow">How the partnership works</span>
          <h2 id="agency-process-title">
            From brief to <em>handover.</em>
          </h2>
        </div>
        <ol className="agency-timeline">
          {agencyProcess.map(({ title, text }) => (
            <li key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="agency-section agency-split"
        aria-labelledby="agency-engagement-title"
      >
        <div className="agency-section-lead">
          <span className="eyebrow">Flexible by scope</span>
          <h2 id="agency-engagement-title">
            Start with the <em>work you have.</em>
          </h2>
        </div>
        <ul className="agency-engagements">
          {agencyEngagements.map(({ title, text }) => (
            <li key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="agency-section agency-split agency-questions"
        aria-labelledby="agency-questions-title"
      >
        <div className="agency-section-lead">
          <span className="eyebrow">Before we collaborate</span>
          <h2 id="agency-questions-title">
            The practical <em>questions.</em>
          </h2>
        </div>
        <div className="agency-question-list">
          {agencyQuestions.map(({ question, answer }) => (
            <details key={question} name="agency-faq">
              <summary>
                {question}
                <span aria-hidden="true" />
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section
        className="agency-section agency-split agency-enquiry"
        id="agency-enquiry"
        tabIndex={-1}
        aria-labelledby="agency-enquiry-title"
      >
        <div className="agency-section-lead">
          <span className="eyebrow">Discuss your project</span>
          <h2 id="agency-enquiry-title">
            Have a client project <em>that needs building?</em>
          </h2>
          <p>
            Share the brief, timeline or the part that’s holding delivery up. A
            small paid pilot is welcome.
          </p>
          {siteKey && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link agency-link"
              data-contact-context="agency_enquiry"
              data-agency-placement="enquiry"
              data-agency-destination="whatsapp"
            >
              Discuss on WhatsApp <Arrow diagonal />
            </a>
          )}
        </div>
        <div className="contact-panel agency-enquiry-panel">
          <h3>Send an agency brief</h3>
          {siteKey ? (
            <ProjectEnquiryForm siteKey={siteKey} source="agency" agencyOnly />
          ) : (
            <div className="agency-fallback">
              <p>
                Website submissions are currently unavailable. Share a short
                project summary on WhatsApp and keep private client material for
                a later conversation.
              </p>
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="button button-accent"
                data-contact-context="agency_enquiry"
                data-agency-placement="enquiry"
                data-agency-destination="whatsapp"
              >
                Message about an agency project <Arrow diagonal />
              </a>
            </div>
          )}
          <div className="agency-related">
            <Link
              href={agencyContactHref}
              className="text-link agency-link"
              data-agency-placement="enquiry"
              data-agency-destination="contact"
            >
              Contact options <Arrow diagonal />
            </Link>
            {!siteKey && (
              <Link href="/privacy/" className="text-link agency-link">
                Privacy notice <Arrow diagonal />
              </Link>
            )}
          </div>
        </div>
      </section>

      <JsonLd
        data={pageSchema(agencyPath, heroTitle, description, {
          mainEntity: `${agencyPath}#service`,
        })}
      />
      <JsonLd
        data={{
          ...serviceSchema({
            slug: "for-agencies",
            name: "White-label web development for agencies",
            description,
          }),
          provider: { "@id": absolute("/#person") },
          audience: {
            "@type": "BusinessAudience",
            audienceType: "Creative, web design, marketing and SEO agencies",
          },
        }}
      />
    </main>
  );
}
