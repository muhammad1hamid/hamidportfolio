import Link from "next/link";
const decisions: Record<
  string,
  {
    title: string;
    intro: string;
    questions: string[];
    links: { label: string; href: string }[];
  }
> = {
  "web-development": {
    title: "What changes the scope of a website?",
    intro:
      "Page types, content preparation, editing access and external connections determine the work. A clear brief lets us discuss price and timing against your actual requirements.",
    questions: [
      "Which visitors and enquiries should the site serve?",
      "Who supplies copy, images and approvals?",
      "Will your team edit content, and how often?",
      "Are bookings or payments links, embeds or full integrations?",
    ],
    links: [
      {
        label: "Understand website cost factors",
        href: "/blog/what-affects-website-cost/",
      },
      { label: "Explore the Bridal House demo", href: "/work/bridal-house/" },
      { label: "Prepare a website brief", href: "/plan/" },
    ],
  },
  "landing-page-development": {
    title: "When is a landing page the right starting point?",
    intro:
      "A landing page works around one offer, one audience and one main action. If visitors need to compare several services or browse a larger body of work, a multi-page website may suit them better.",
    questions: [
      "What is the single offer and who is it for?",
      "What genuine proof can a visitor inspect?",
      "Where does an enquiry go after the main action?",
      "What content will change when the campaign changes?",
    ],
    links: [
      {
        label: "Compare a landing page and full website",
        href: "/blog/landing-page-or-full-website/",
      },
      { label: "Watch client perspectives", href: "/testimonials/" },
      { label: "Plan your page", href: "/plan/" },
    ],
  },
  "whatsapp-ai-chatbot": {
    title: "What needs agreeing before a WhatsApp assistant?",
    intro:
      "Start with the approved business information, account setup and receiving team. Decide what the assistant may answer, what it must escalate and how the team confirms that an enquiry was received.",
    questions: [
      "Who keeps answers, hours and service information current?",
      "Which questions or commitments require a person?",
      "Which business messaging provider and inbox will be used?",
      "How will we test English, Urdu and unsupported requests?",
    ],
    links: [
      { label: "Plan human handover", href: "/blog/chatbot-human-handover/" },
      {
        label: "Try the rules-based enquiry demo",
        href: "/demos/enquiry-assistant/",
      },
      { label: "More automation questions", href: "/answers/#topic-2" },
    ],
  },
};
export function ServiceDecisions({ slug }: { slug: string }) {
  const item = decisions[slug];
  if (!item) return null;
  return (
    <section className="content-proof service-decisions">
      <h2>{item.title}</h2>
      <p>{item.intro}</p>
      <ul className="plain-list">
        {item.questions.map((question) => (
          <li key={question}>{question}</li>
        ))}
      </ul>
      <div className="related-links">
        {item.links.map((link) => (
          <Link href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
