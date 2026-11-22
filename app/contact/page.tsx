import Link from "next/link";
import { ContactEnquiry } from "@/components/contact/ContactEnquiry";
import { Breadcrumbs } from "@/components/seo/ContentPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { Arrow } from "@/components/ui/Arrow";
import { pageMeta, pageSchema } from "@/data/seo";
import { site } from "@/data/site";
import { enquirySiteKey } from "@/server/enquiry/config.mjs";
import "../contact.css";

const path = "/contact/";
const heading = "Good work starts with a conversation.";
const description =
  "Discuss a website, search visibility or an automation project with Hamid. Share your goal, current setup and any useful examples.";
const growthMessage = encodeURIComponent(
  "Hi Hamid, I’d like to discuss Growth Engine.\nWebsite: [your website]\nMain goal: [your goal]",
);
const callMessage = encodeURIComponent(
  "Hi Hamid, I’d like to discuss a project on a short call. Here’s what I’m working on:",
);

const questions = [
  [
    "Do I need a finished brief?",
    "A few sentences about your goal and who it’s for are enough. Your current website or an example can help me understand the context.",
  ],
  [
    "Can you work on my existing website?",
    "Yes. Share the URL and what needs to change. I’ll use those details to work out whether a targeted improvement or a larger rebuild makes sense.",
  ],
  [
    "Do you work internationally?",
    "Yes. I work remotely from Pakistan. If we need a call, we can agree on a time across both time zones.",
  ],
  [
    "Can I get in touch without a budget?",
    "Yes. Share your priorities and any constraints you know. We can discuss which parts of the project fit once the scope is clear.",
  ],
  [
    "What happens after I share my project?",
    "I review your goal and current setup, then follow up with questions or a next step. Once the scope is clear, we can discuss deliverables, timing and costs.",
  ],
] as const;

export const metadata = pageMeta(
  "Contact Hamid — Project Enquiries & Collaboration",
  description,
  path,
);

export default function ContactPage() {
  const siteKey = enquirySiteKey();
  return (
    <main id="main" className="content-page wrap contact-page">
      <Breadcrumbs items={[{ label: "Contact", href: path }]} />
      <div className="contact-grid">
        <div className="contact-introduction">
          <header className="content-hero contact-heading">
            <span className="eyebrow">
              <i className="accent-dot" /> Start a project / Hamid
            </span>
            <h1>
              Good work starts with a <em>conversation.</em>
            </h1>
            <p>
              Tell me what you’re building or what needs improving. A little
              context gives us something useful to start with.
            </p>
            <p className="contact-location">
              Independent developer · Based in Pakistan, working worldwide
            </p>
          </header>
          <nav className="contact-choices" aria-label="Contact options">
            <a href="#project-enquiry" className="contact-choice-main">
              Share a brief <Arrow />
            </a>
            <a href="#talk">Ask about a call</a>
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              data-contact-context="contact_page"
            >
              WhatsApp <Arrow diagonal />
            </a>
          </nav>
          <div className="contact-process">
            <span className="eyebrow">From first idea to build</span>
            <ol aria-label="Project process">
              {["Idea", "Conversation", "Scope", "Build"].map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
        <section
          className="contact-panel"
          id="project-enquiry"
          aria-labelledby="project-enquiry-title"
        >
          <span
            className="contact-anchor"
            id="growth-enquiry"
            aria-hidden="true"
          />
          <span className="eyebrow">
            <i className="accent-dot" /> Project enquiry
          </span>
          <h2 id="project-enquiry-title">Tell me about your project.</h2>
          {siteKey ? (
            <>
              <p className="contact-panel-intro">
                A few useful details are enough to begin. You don’t need a
                finished brief.
              </p>
              <ContactEnquiry siteKey={siteKey} />
            </>
          ) : (
            <div className="contact-fallback">
              <p>
                Website enquiries are temporarily unavailable. Send me your
                goal, current website or a useful example on WhatsApp.
              </p>
              <a
                className="button button-accent"
                href={site.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                data-contact-context="contact_page"
              >
                Message Hamid on WhatsApp <Arrow diagonal />
              </a>
              <div className="related-links">
                <a
                  href={`${site.whatsapp}?text=${growthMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-contact-context="growth_engine"
                >
                  Message about Growth Engine <Arrow diagonal />
                </a>
              </div>
            </div>
          )}
          <div className="contact-planner">
            <span>Want to organize your ideas first?</span>
            <Link
              href="/plan/"
              className="text-link"
              data-site-event="planner_open"
            >
              Prepare a project brief <Arrow diagonal />
            </Link>
          </div>
        </section>
      </div>

      <section
        id="talk"
        className="contact-details"
        aria-labelledby="contact-call-title"
      >
        <div>
          <h2 id="contact-call-title">Prefer to talk it through?</h2>
          <p>
            Message me with your goal and time zone. We can agree on a time to
            review what you have and what you need next.
          </p>
          <a
            className="button button-outline"
            href={`${site.whatsapp}?text=${callMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            data-contact-context="discovery_call"
          >
            Arrange a call on WhatsApp <Arrow diagonal />
          </a>
        </div>
        <div>
          <h2>Find me online.</h2>
          <p>WhatsApp · +92 335 6709222</p>
          <div className="related-links">
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn <Arrow diagonal />
            </a>
            <a href={site.instagram} target="_blank" rel="noopener noreferrer">
              Instagram <Arrow diagonal />
            </a>
          </div>
        </div>
      </section>

      <section
        className="contact-questions"
        aria-labelledby="contact-questions-title"
      >
        <div>
          <h2 id="contact-questions-title">Before we talk.</h2>
          <Link href="/services/" className="text-link">
            Explore services <Arrow diagonal />
          </Link>
        </div>
        <div>
          {questions.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
          <details>
            <summary>Do you work with agencies?</summary>
            <p>
              Yes. Choose Agency or white-label partnership and tell me what
              needs building.{" "}
              <Link
                href="/for-agencies/"
                className="text-link"
                data-agency-placement="contact"
                data-agency-destination="agency_page"
              >
                See how agency projects work <Arrow diagonal />
              </Link>
            </p>
          </details>
          <details>
            <summary>Can we discuss SEO, AEO and GEO?</summary>
            <p>
              Yes. Share the URL and a specific goal, like making a service
              easier to find or helping more visitors enquire.{" "}
              <a
                className="text-link"
                href={`${site.whatsapp}?text=${growthMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                data-contact-context="growth_engine"
              >
                Message about Growth Engine <Arrow diagonal />
              </a>
            </p>
          </details>
        </div>
      </section>
      <JsonLd
        data={pageSchema(path, heading, description, { type: "ContactPage" })}
      />
    </main>
  );
}
