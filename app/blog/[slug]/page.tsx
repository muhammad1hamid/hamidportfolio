import { notFound } from "next/navigation";
import { ArticleDetail } from "@/components/seo/ArticleDetail";
import { articles, articleBySlug } from "@/data/articles";
import { pageMeta } from "@/data/seo";

type ArticleRoute = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticleRoute) {
  const article = articleBySlug((await params).slug);
  if (!article) notFound();
  return pageMeta(
    `${article.title} | Hamid`,
    article.description,
    `/blog/${article.slug}/`,
    undefined,
    article.date,
    article.modified,
  );
}

export default async function ArticlePage({ params }: ArticleRoute) {
  const article = articleBySlug((await params).slug);
  if (!article) notFound();
  return <ArticleDetail article={article} library="blog" />;
}
