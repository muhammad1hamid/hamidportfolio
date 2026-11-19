import catalog from "./articles.json";
import guides from "./guides.json";
export type Article = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  modified?: string;
  related: string[];
  intro: string;
  sections: {
    id: string;
    heading: string;
    paragraphs: string[];
    items?: string[];
    links?: { label: string; href: string }[];
    table?: { headers: string[]; rows: string[][] };
  }[];
  sources: { title: string; url: string }[];
};
export const articles: Article[] = [...guides, ...catalog];
export const articleDate = (date: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
export const articleCategories = [
  "AI Automation",
  "WhatsApp Automation",
  "AI Chatbots",
  "Web Development",
  "Business Automation",
  "Restaurant Technology",
  "AI Agents",
];
export const articleBySlug = (slug: string) =>
  articles.find((article) => article.slug === slug);
