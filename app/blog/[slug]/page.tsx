import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, articleBySlug, articleDate } from "@/data/articles";
import { serviceBySlug } from "@/data/services";
import { absolute, pageMeta } from "@/data/seo";
import { ContentPage, ProjectCta } from "@/components/seo/ContentPage";
import { JsonLd } from "@/components/seo/JsonLd";
export const dynamicParams = false;
export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const article = articleBySlug((await params).slug);
  if (!article) notFound();
  const path = `/blog/${article.slug}/`;
  return (
    <ContentPage
      path={path}
      title={article.title}
      intro={article.intro}
      label={article.category}
      crumbs={[
        { label: "Guides", href: "/blog/" },
        { label: article.title, href: path },
      ]}
    >
      <p className="article-byline">
        Written by <Link href="/about/">Hamid</Link>, independent developer &
        ElevateX founder · Prepared{" "}
        <time dateTime={article.date}>{articleDate(article.date)}</time>
        {article.modified && (
          <>
            {" "}
            · Updated{" "}
            <time dateTime={article.modified}>
              {articleDate(article.modified)}
            </time>
          </>
        )}
      </p>
      <div className="article-layout">
        <aside className="article-toc">
          <nav aria-label="On this page">
            <h2>In this guide</h2>
            <ol>
              {article.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.heading}</a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>
        <article className="article-body" aria-label={article.title}>
          {article.sections.map((section) => (
            <section id={section.id} key={section.id}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {"items" in section && section.items && (
                <ul className="plain-list">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.table && (
                <div
                  className="comparison-table"
                  role="region"
                  aria-label={section.heading}
                  tabIndex={0}
                >
                  <table>
                    <thead>
                      <tr>
                        {section.table.headers.map((cell) => (
                          <th scope="col" key={cell}>
                            {cell}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) =>
                            j === 0 ? (
                              <th key={j} scope="row">
                                {cell}
                              </th>
                            ) : (
                              <td key={j}>{cell}</td>
                            ),
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {section.links && (
                <div className="related-links">
                  {section.links.map((link) => (
                    <Link href={link.href} key={link.href}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </section>
          ))}
          {article.sources.length > 0 && (
            <section>
              <h2>Source and further reading</h2>
              <ul className="plain-list">
                {article.sources.map((source) => (
                  <li key={source.url}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {source.title} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section>
            <h2>About the author</h2>
            <p>
              Hamid is a Pakistan-based independent web developer and AI
              automation builder, and founder of ElevateX. These guides describe
              practical planning approaches; examples are illustrative unless
              explicitly identified as published website work.
            </p>
            <Link href="/about/" className="text-link">
              Meet Hamid ↗
            </Link>
            <p>
              <Link href="/editorial-policy/">
                How guides and examples are prepared
              </Link>
            </p>
          </section>
        </article>
      </div>
      <section className="content-section">
        <h2>Related services</h2>
        <div className="related-links">
          {article.related.map((slug) => (
            <Link key={slug} href={`/${slug}/`}>
              {serviceBySlug(slug)!.name} ↗
            </Link>
          ))}
        </div>
      </section>
      <ProjectCta />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "@id": absolute(`${path}#article`),
          headline: article.title,
          description: article.description,
          image: absolute(`/images/share/blog-${article.slug}.png`),
          datePublished: article.date,
          dateModified: article.modified || article.date,
          author: { "@id": absolute("/#person") },
          publisher: { "@id": absolute("/#organization") },
          mainEntityOfPage: { "@id": absolute(`${path}#webpage`) },
          articleSection: article.category,
          inLanguage: "en",
        }}
      />
    </ContentPage>
  );
}
