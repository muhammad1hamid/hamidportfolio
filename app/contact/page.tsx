import Link from "next/link";
import { ContactEnquiry } from "@/components/contact/ContactEnquiry";
import { ContactSignal } from "@/components/contact/ContactSignal";
import { Breadcrumbs } from "@/components/seo/ContentPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { Arrow } from "@/components/ui/Arrow";
import { configuredWeb3FormsKey } from "@/data/conversation.mjs";
import { contactSettings } from "@/data/contact-settings";
import { pageMeta, pageSchema } from "@/data/seo";
import { site } from "@/data/site";
import "../contact.css";
import "../first-conversation.css";

const path = "/contact/";
const heading = "Have an idea? Let’s make it real.";
const description =
  "A direct conversation with Hamid about a new website, stronger search visibility, AI automation or agency collaboration. No finished brief needed.";
const callLink = `${site.whatsapp}?text=${encodeURIComponent("Hi Hamid, I’d like to talk through a project on a call. My idea is:\nMy time zone is:")}`;
const steps = [
  ["Share the idea", "Tell me what you’re working on."],
  ["Let’s talk", "We clarify the goal and constraints."],
  ["Define the scope", "We agree on a practical approach."],
  ["Build with clarity", "Work begins once scope and terms are agreed."],
] as const;
const questions = [
  [
    "Do I need a finished project brief?",
    "No. A few sentences about your idea and who it’s for are enough. If you’d like a little structure, the project planner can help you put an outline together.",
  ],
  [
    "Can you improve an existing website?",
    "Yes. Share your website URL and what you’d like to change. We can work out whether a focused improvement or a larger rebuild makes sense.",
  ],
  [
    "Can we work together internationally?",
    "Yes. I work remotely from Pakistan. We can agree on practical ways to collaborate and a time that works across our time zones if a call would help.",
  ],
  [
    "What happens after I send an enquiry?",
    "I review your idea and follow up with questions or a useful next step. An enquiry starts a conversation; scope, timing and costs are agreed before any project begins.",
  ],
] as const;

export const metadata = pageMeta(
  "Contact Hamid — The First Conversation",
  description,
  path,
);

export default function ContactPage() {
  const accessKey = configuredWeb3FormsKey(
    process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ??
      contactSettings.web3FormsAccessKey,
  );
  return (
    <main id="main" className="content-page wrap first-conversation">
      <Breadcrumbs items={[{ label: "Contact", href: path }]} />
      <div className="first-conversation-grid">
        <div className="conversation-invitation">
          <header className="conversation-heading">
            <span className="eyebrow">Start something / Hamid</span>
            <h1>
              <span>Have an idea?</span>
              <em>Let’s make it real.</em>
            </h1>
            <p>
              A new website, a smarter workflow, or something still taking
              shape. Tell me a little about it.
            </p>
            <p className="conversation-human">
              A direct conversation with Hamid.
              <br />
              No complicated brief needed.
            </p>
          </header>
          <ContactSignal />
          <div className="conversation-signature">
            <span className="personal-signature" aria-hidden="true">
              Hamid.
            </span>
            <div>
              <span>Hamid / Independent developer</span>
              <p>Based in Pakistan · Working worldwide</p>
            </div>
          </div>
          <a
            className="invitation-direct"
            href={site.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            data-contact-context="contact_invitation"
          >
            Rather say hello on WhatsApp? <Arrow diagonal />
          </a>
        </div>

        <section
          className="conversation-sheet"
          id="project-enquiry"
          aria-labelledby="project-enquiry-title"
        >
          <span
            className="contact-anchor"
            id="growth-enquiry"
            aria-hidden="true"
          />
          <ContactEnquiry accessKey={accessKey} />
        </section>
      </div>

      <section
        className="conversation-alternatives"
        aria-labelledby="contact-alternatives-title"
      >
        <div className="conversation-section-heading">
          <h2 id="contact-alternatives-title">
            A different way to <em>say hello.</em>
          </h2>
          <p>Start wherever feels natural.</p>
        </div>
        <div className="conversation-contact-links">
          <div>
            <span className="conversation-method-label">
              A QUICK CONVERSATION
            </span>
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              data-contact-context="contact_page"
            >
              WhatsApp Hamid <Arrow diagonal />
            </a>
            <p>+92 335 6709222</p>
          </div>
          <div>
            <span className="conversation-method-label">
              STRAIGHT TO MY INBOX
            </span>
            <a href={`mailto:${site.email}`}>
              {site.email} <Arrow diagonal />
            </a>
            <p>A note, an idea, a useful link.</p>
          </div>
          <div>
            <span className="conversation-method-label">
              A LITTLE MORE STRUCTURE
            </span>
            <Link href="/plan/" data-site-event="planner_open">
              Build a quick project brief <Arrow diagonal />
            </Link>
            <p>Need help shaping your idea?</p>
          </div>
        </div>
        <div className="conversation-social-row">
          <a
            id="talk"
            href={callLink}
            target="_blank"
            rel="noopener noreferrer"
            data-contact-context="discovery_call"
          >
            Prefer to talk it through? Arrange a call on WhatsApp{" "}
            <Arrow diagonal />
          </a>
          <div>
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
        className="conversation-next"
        aria-labelledby="contact-next-title"
      >
        <div className="conversation-section-heading">
          <h2 id="contact-next-title">
            An idea. A conversation.
            <br />
            <em>A clear next step.</em>
          </h2>
          <p>Here’s how it can take shape.</p>
        </div>
        <ol>
          {steps.map(([title, copy], index) => (
            <li key={title}>
              <span className="conversation-step-number" aria-hidden="true">
                0{index + 1}
              </span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="conversation-faq" aria-labelledby="contact-faq-title">
        <div>
          <h2 id="contact-faq-title">
            Before we <em>talk.</em>
          </h2>
          <p>A few useful answers.</p>
          <Link href="/services/" className="text-link">
            Explore services <Arrow diagonal />
          </Link>
          <Link
            href="/for-agencies/"
            className="text-link"
            data-agency-placement="contact"
            data-agency-destination="agency_page"
          >
            Looking for an agency partner? <Arrow diagonal />
          </Link>
        </div>
        <div>
          {questions.map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
      <JsonLd
        data={pageSchema(path, heading, description, { type: "ContactPage" })}
      />
    </main>
  );
}
