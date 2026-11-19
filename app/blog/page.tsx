import Link from "next/link";
import { articles, articleCategories, articleDate } from "@/data/articles";
import { pageMeta } from "@/data/seo";
import { ContentPage, ProjectCta } from "@/components/seo/ContentPage";
export const metadata = pageMeta(
  "Website & Business Automation Planning Guides | Hamid",
  "Read practical guides from Hamid on website briefs, chatbots, AI agents and enquiry workflows. Make clearer decisions before commissioning a business project.",
  "/blog/",
);
export default function BlogPage() {
  return (
    <ContentPage
      path="/blog/"
      title="Better questions. Clearer projects."
      intro="Practical planning notes about websites, conversational systems and business workflows. These guides explain choices and trade-offs before you commission the work."
      label="Guides"
      type="CollectionPage"
    >
      <div className="content-card-grid">
        {articles.map((article) => (
          <article className="content-card" key={article.slug}>
            <span className="eyebrow">{article.category}</span>
            <h2>
              <Link href={`/blog/${article.slug}/`}>{article.title}</Link>
            </h2>
            <p>{article.intro}</p>
            <p className="article-byline">
              By <Link href="/about/">Hamid</Link> ·{" "}
              <time dateTime={article.date}>{articleDate(article.date)}</time>
            </p>
            <Link className="text-link" href={`/blog/${article.slug}/`}>
              Read the guide ↗
            </Link>
          </article>
        ))}
      </div>
      <section className="content-section">
        <h2>Topics as the library grows</h2>
        <p>
          Articles are organised under these topics when a useful guide is
          ready. Topics without an article do not create empty archive pages.
        </p>
        <ul className="topic-list">
          {articleCategories.map((category) => (
            <li key={category}>{category}</li>
          ))}
        </ul>
      </section>
      <ProjectCta />
    </ContentPage>
  );
}
