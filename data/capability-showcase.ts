import { servicePillars } from "./services";

const presentations = {
  "web-experiences": {
    description:
      "Purposeful websites, landing pages and digital experiences built with clarity and care.",
    tags: ["Design", "Development", "Performance"],
    primary: { label: "View examples", href: "/work/" },
    secondary: { label: "Explore Web", href: "/services/#web-experiences" },
  },
  "growth-engine": {
    description:
      "Make useful digital experiences easier to discover through search and answer engines.",
    tags: ["SEO", "AEO", "Content"],
    primary: { label: "Explore Growth Engine", href: "/growth/" },
    secondary: null,
  },
  "smart-systems": {
    description:
      "Practical workflows that reduce repetitive tasks and connect the tools that matter.",
    tags: ["Workflows", "Integrations", "Human review"],
    primary: {
      label: "Explore Smart Systems",
      href: "/services/#smart-systems",
    },
    secondary: null,
  },
  "ai-conversations": {
    description:
      "Helpful conversations that answer common questions and guide visitors to the right next step.",
    tags: ["Approved answers", "Enquiries", "Handover"],
    primary: {
      label: "Explore AI Conversations",
      href: "/services/#ai-conversations",
    },
    secondary: null,
  },
} as const;

export type CapabilityId = keyof typeof presentations;

export const capabilityShowcase = servicePillars.map((pillar) => ({
  id: pillar.id as CapabilityId,
  title: pillar.name,
  ...presentations[pillar.id as CapabilityId],
}));
