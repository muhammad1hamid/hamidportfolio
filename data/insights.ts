import records from "./insights.json";
import { articleBySlug, type Article } from "./articles";

export type Insight = Article & {
  excerpt: string;
  cover: {
    alt: string;
    poster: string[];
    tone: string;
  };
  relatedReads: string[];
  cta: {
    title: string;
    text: string;
    message: string;
  };
};

export const insights: Insight[] = records;

export const insightBySlug = (slug: string) =>
  insights.find((insight) => insight.slug === slug);

export const insightPath = (slug: string) => `/insights/${slug}/`;
export const insightCover = (slug: string) => `/images/insights/${slug}.webp`;
export const insightShareImage = (slug: string) =>
  `/images/share/insights-${slug}.jpg`;

export function readingTitle(path: string) {
  const [library, slug] = path.split("/").filter(Boolean);
  if (library === "blog") return articleBySlug(slug)?.title;
  if (library === "insights") return insightBySlug(slug)?.title;
}
