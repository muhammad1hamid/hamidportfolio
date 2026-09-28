export const categories = [
  "All",
  "Web",
  "AI Systems",
  "Automation",
  "Chatbots",
] as const;
export type Category = Exclude<(typeof categories)[number], "All">;
export type Project = {
  id: string;
  title: string;
  slug: string;
  category: Category;
  featured: boolean;
  thumbnail: string;
  preview?: string;
  description: string;
  technologies: string[];
  liveUrl: string | null;
  year: number | null;
  status: "placeholder" | "published";
  visual: "web" | "commerce" | "workflow" | "chat" | "brand" | "system";
};

// These are explicitly labeled presentation slots, not claims of client work.
// Replace the content and set status to "published" when real projects are added.
export const projects: Project[] = [
  {
    id: "slot-01",
    title: "The web experience",
    slug: "web-experience",
    category: "Web",
    featured: true,
    thumbnail: "/images/projects/web.webp",
    description:
      "A space for a considered, custom-built website. Project details and live link coming soon.",
    technologies: [],
    liveUrl: null,
    year: null,
    status: "placeholder",
    visual: "web",
  },
  {
    id: "slot-02",
    title: "The connected business",
    slug: "connected-business",
    category: "Automation",
    featured: true,
    thumbnail: "/images/projects/automation.webp",
    description:
      "A space for a workflow that connects the moving parts of a business. Case study coming soon.",
    technologies: [],
    liveUrl: null,
    year: null,
    status: "placeholder",
    visual: "workflow",
  },
  {
    id: "slot-03",
    title: "A better conversation",
    slug: "better-conversation",
    category: "Chatbots",
    featured: true,
    thumbnail: "/images/projects/chatbot.webp",
    description:
      "A space for a business-specific conversational experience. Project details coming soon.",
    technologies: [],
    liveUrl: null,
    year: null,
    status: "placeholder",
    visual: "chat",
  },
  {
    id: "slot-04",
    title: "Intelligence, applied",
    slug: "intelligence-applied",
    category: "AI Systems",
    featured: true,
    thumbnail: "/images/projects/ai-system.webp",
    description:
      "A space for a useful AI system, built around a real business need. Case study coming soon.",
    technologies: [],
    liveUrl: null,
    year: null,
    status: "placeholder",
    visual: "system",
  },
  {
    id: "slot-05",
    title: "The next storefront",
    slug: "next-storefront",
    category: "Web",
    featured: true,
    thumbnail: "/images/projects/commerce.webp",
    description:
      "A space for an e-commerce experience with a clear path to purchase. Project details coming soon.",
    technologies: [],
    liveUrl: null,
    year: null,
    status: "placeholder",
    visual: "commerce",
  },
  {
    id: "slot-06",
    title: "A distinct presence",
    slug: "distinct-presence",
    category: "Web",
    featured: true,
    thumbnail: "/images/projects/brand.webp",
    description:
      "A space for a brand-led digital experience. Project details and live link coming soon.",
    technologies: [],
    liveUrl: null,
    year: null,
    status: "placeholder",
    visual: "brand",
  },
];
