import Link from "next/link";
import { site } from "@/data/site";
import { ContactSignal } from "./ContactSignal";
import { ContactIcon, type ContactIconName } from "./ContactIcon";

const callLink = `${site.whatsapp}?text=${encodeURIComponent("Hi Hamid, I’d like to talk through a project on a call. My idea is:\nMy time zone is:")}`;

export function ContactEditorialIntro() {
  return (
    <div className="conversation-invitation">
      <header className="conversation-heading">
        <span className="eyebrow">Contact</span>
        <h1>
          <span>Have an idea?</span>
          <em>Let’s make it real.</em>
        </h1>
        <p>
          A new website, a smarter workflow, or something still taking shape.
          Tell me a little about it.
        </p>
      </header>
      <div className="contact-personal-note">
        <div className="contact-portrait-tile">
          <img
            src="/images/responsive/hamid-hero-warm-320.webp"
            width="320"
            height="320"
            alt="Portrait of Hamid"
            decoding="async"
          />
        </div>
        <div className="contact-personal-copy">
          <p>A direct conversation with Hamid.</p>
          <span>
            <i aria-hidden="true" />
            Based in Pakistan · Working worldwide
          </span>
        </div>
      </div>
      <ContactSignal />
    </div>
  );
}

export function ContactAlternatives() {
  return (
    <nav
      className="conversation-contact-links"
      aria-label="Other ways to start a conversation"
    >
      <a
        href={site.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="contact-option contact-option-whatsapp"
        data-contact-context="contact_page"
      >
        <ContactIcon name="whatsapp" />
        <span>
          <strong>Chat on WhatsApp</strong>
          <span>Quick and direct</span>
        </span>
      </a>
      <a
        id="talk"
        href={callLink}
        target="_blank"
        rel="noopener noreferrer"
        className="contact-option contact-option-call"
        data-contact-context="discovery_call"
      >
        <ContactIcon name="calendar" />
        <span>
          <strong>Arrange a call</strong>
          <span>Discuss your idea live</span>
        </span>
      </a>
      <Link
        href="/plan/"
        className="contact-option contact-option-planner"
        data-site-event="planner_open"
      >
        <ContactIcon name="document" />
        <span>
          <strong>Build a project brief</strong>
          <span>
            Use the Website Planner <span aria-hidden="true">↗</span>
          </span>
        </span>
      </Link>
    </nav>
  );
}

const steps: { title: string; copy: string; icon: ContactIconName }[] = [
  {
    title: "Share the idea",
    copy: "Tell me what you’re working on.",
    icon: "conversation",
  },
  {
    title: "Define the approach",
    copy: "We discuss the goal, scope and next steps.",
    icon: "automation",
  },
  {
    title: "Build & deliver",
    copy: "Once we’re aligned, work begins.",
    icon: "bolt",
  },
];
export function ContactProcessStrip() {
  return (
    <section className="conversation-next" aria-labelledby="contact-next-title">
      <div className="contact-section-intro">
        <span className="eyebrow">What happens next</span>
        <h2 id="contact-next-title">
          A simple
          <br />
          and <em>clear process.</em>
        </h2>
      </div>
      <ol aria-label="From your idea to a project">
        {steps.map((step) => (
          <li key={step.title}>
            <span className="contact-process-icon">
              <ContactIcon name={step.icon} />
            </span>
            <h3>{step.title}</h3>
            <p>{step.copy}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

const questions = [
  [
    "Do I need a finished project brief?",
    "No. A few sentences about your idea and who it’s for are enough. If you’d like more structure, the project planner can help you put an outline together.",
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
    "I review your idea and follow up with questions or a useful next step. Scope, timing and terms are agreed before a project begins.",
  ],
] as const;
export function ContactFAQ() {
  return (
    <section className="conversation-faq" aria-labelledby="contact-faq-title">
      <div className="contact-section-intro">
        <span className="eyebrow">FAQ</span>
        <h2 id="contact-faq-title">
          Quick <em>answers.</em>
        </h2>
        <p>A few common questions before you reach out.</p>
      </div>
      <div className="contact-faq-rows">
        {questions.map(([question, answer], index) => (
          <details key={question}>
            <summary>
              {question}
              <span aria-hidden="true">+</span>
            </summary>
            <div>
              <p>
                {answer}
                {index === 3 && (
                  <>
                    {" "}
                    You can also{" "}
                    <a href={`mailto:${site.email}`}>email me directly</a>.
                  </>
                )}
              </p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
