import { notFound } from "next/navigation";
import { ArticleDetail } from "@/components/seo/ArticleDetail";
import {
  insightBySlug,
  insightPath,
  insights,
  insightShareImage,
} from "@/data/insights";
import { pageMeta } from "@/data/seo";

type InsightRoute = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return insights.map((insight) => ({ slug: insight.slug }));
}

export async function generateMetadata({ params }: InsightRoute) {
  const insight = insightBySlug((await params).slug);
  if (!insight) notFound();
  return pageMeta(
    `${insight.title} | Hamid`,
    insight.description,
    insightPath(insight.slug),
    insightShareImage(insight.slug),
    insight.date,
    insight.modified,
  );
}

export default async function InsightPage({ params }: InsightRoute) {
  const insight = insightBySlug((await params).slug);
  if (!insight) notFound();
  return <ArticleDetail article={insight} library="insights" />;
}
