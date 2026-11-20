export const growthGoal = "Growth Engine — SEO, AEO & GEO";

export const goals = [
  "Generate enquiries",
  "Promote one offer",
  "Showcase a portfolio",
  "Present a catalogue",
  growthGoal,
] as const;
export const businessTypes = [
  "Service business",
  "Creative professional",
  "Retail or showroom",
  "Agency",
] as const;
export const pageOptions = [
  "Home",
  "Services",
  "About",
  "Work or gallery",
  "Contact",
  "Guides or news",
];
export const integrationOptions = [
  "WhatsApp contact",
  "Booking provider",
  "CRM",
  "Payments",
  "Content editing",
];
export type PlanInput = {
  business: string;
  goal: string;
  pages: string[];
  integrations: string[];
  content: string;
  notes: string;
};
export const defaultPlan: PlanInput = {
  business: businessTypes[0],
  goal: goals[0],
  pages: ["Home", "Services", "Contact"],
  integrations: ["WhatsApp contact"],
  content: "Some content ready",
  notes: "",
};
export function buildPlan(input: PlanInput) {
  const growth = input.goal === growthGoal;
  const landing =
    input.goal === "Promote one offer" &&
    input.pages.length <= 3 &&
    !input.integrations.includes("Payments");
  const catalogue = input.goal === "Present a catalogue";
  const websiteType = landing
    ? "A focused landing page"
    : catalogue
      ? "A collection-led website"
      : "A multi-page website";
  const type = growth ? "Review an existing website" : websiteType;
  const pages = input.pages.join(", ");
  const checklist = growth
    ? [
        "Bring your public site URL, main audience and one discovery or enquiry goal.",
        `Choose the pages to review: ${pages || "the priority pages we agree during discovery"}.`,
        "Identify who can share Search Console or analytics insights and approve site updates.",
        "Review crawlability, buyer questions, proof and the main enquiry path before agreeing fixes.",
        "Record a baseline for available search and enquiry signals and agree when to check them again.",
      ]
    : [
        "Define one main visitor action and the information needed before it.",
        `Prepare content for: ${pages || "the pages we agree during discovery"}.`,
        input.content === "Content ready"
          ? "Check image permissions, final copy and the person responsible for approval."
          : "List missing copy, images and brand assets; assign an owner for each.",
        "Agree domain, hosting, source files, editing access and ongoing support.",
        ...input.integrations.map(
          (item) =>
            ({
              "WhatsApp contact":
                "Confirm the receiving WhatsApp number. A contact link does not provide chatbot API access.",
              "Booking provider":
                "Confirm the booking provider and whether the website links to it or creates bookings through an integration.",
              CRM: "Confirm CRM access, field mapping, duplicate handling and who receives new enquiries.",
              Payments:
                "Confirm payment-provider availability, products, fulfilment and refund responsibilities before choosing a checkout.",
              "Content editing":
                "List what your team will edit, how often and who needs access.",
            })[item] || "Review the integration scope.",
        ),
        "Check the complete enquiry journey on mobile and desktop before launch.",
      ];
  const websiteReason = landing
    ? "One offer and a small page scope can work as sections around one clear action."
    : catalogue
      ? "Collection browsing needs a clear structure and a plan for maintaining item details."
      : "Separate pages give visitors room to compare your offer, learn about you and decide how to enquire.";
  const reason = growth
    ? "Start with an audit of how people find key pages, understand your offer and get in touch."
    : websiteReason;
  const websiteService = landing
    ? "/landing-page-development/"
    : "/web-development/";
  const related = growth ? "/growth/" : websiteService;
  const demo = catalogue
    ? "/work/qadeer-jewellers/"
    : input.goal === "Showcase a portfolio"
      ? "/work/editing-julian/"
      : "/work/bridal-house/";
  const example = growth ? "/insights/measure-whatsapp-enquiries/" : demo;
  const exampleLabel = growth
    ? "Read the enquiry measurement guide"
    : "See a related website demo";
  const text = [
    growth ? "GROWTH ENGINE PROJECT BRIEF" : "WEBSITE PROJECT BRIEF",
    `Business: ${input.business}`,
    `Goal: ${input.goal}`,
    `Starting direction: ${type}`,
    reason,
    `Pages: ${pages || "To discuss"}`,
    `Connections: ${input.integrations.join(", ") || "None selected"}`,
    `Content: ${input.content}`,
    ...(input.notes.trim()
      ? [`Project notes: ${input.notes.trim().slice(0, 600)}`]
      : []),
    "",
    "SCOPE CHECKLIST",
    ...checklist.map((item) => `- ${item}`),
    "",
    "Planning guidance, not a quote or delivery commitment. Final scope, price and timing need agreement.",
  ].join("\n");
  return { type, reason, checklist, related, example, exampleLabel, text };
}
