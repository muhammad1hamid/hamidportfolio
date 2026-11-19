import catalog from "./services.json";

export const servicePages = catalog;
export const serviceBySlug = (slug: string) =>
  servicePages.find((service) => service.slug === slug);

export type GrowthService = Extract<
  (typeof servicePages)[number],
  { deliverables: unknown }
>;

export const servicePillars = [
  {
    id: "web-experiences",
    name: "Web Experiences",
    action: "Build",
    summary:
      "Distinctive websites, focused landing pages and dashboards that make work easier.",
    href: "/services/#web-experiences",
  },
  {
    id: "growth-engine",
    name: "Growth Engine",
    action: "Get discovered",
    summary:
      "Make your business easier to find, understand and choose across search and AI.",
    href: "/growth/",
  },
  {
    id: "smart-systems",
    name: "Smart Systems",
    action: "Automate",
    summary:
      "Connect tools and hand off repeatable work with practical automation.",
    href: "/services/#smart-systems",
  },
  {
    id: "ai-conversations",
    name: "AI Conversations",
    action: "Connect",
    summary:
      "Answer common questions and guide enquiries through your site or WhatsApp.",
    href: "/services/#ai-conversations",
  },
].map((pillar) => ({
  ...pillar,
  services: servicePages.filter((service) => service.pillar === pillar.id),
}));
