import Link from "next/link";
import { articleDate, type Article } from "@/data/articles";
import { insightCover, readingTitle, type Insight } from "@/data/insights";
import { serviceBySlug } from "@/data/services";
import { absolute } from "@/data/seo";
import { ContentPage, ProjectCta } from "./ContentPage";
import { InsightImage } from "./InsightImage";
import { JsonLd } from "./JsonLd";

type ArticleDetailProps =
  | { article: Article; library: "blog" }
  | { article: Insight; library: "insights" };

export function ArticleDetail(props: ArticleDetailProps) {
  const { article, library } = props;
  const insight = props.library === "insights" ? props.article : undefined;
  const collection = `/${library}/`;
  const path = `${collection}${article.slug}/`;
  const image = insight
    ? insightCover(insight.slug)
    : `/images/share/blog-${article.slug}.png`;
  return (
    <ContentPage
      path={path}
      title={article.title}
      intro={article.intro}
      label={article.category}
      className={insight ? "insight-detail" : undefined}
      crumbs={[
        { label: insight ? "Insights" : "Guides", href: collection },
        { label: article.title, href: path },
      ]}
    >
      <p className="article-byline">
        {insight ? (
          <>
            <Link href="/about/">Hamid</Link> · Prepared{" "}
          </>
        ) : (
          <>
            Written by <Link href="/about/">Hamid</Link>, independent developer
            &amp; ElevateX founder · Prepared{" "}
          </>
        )}
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
      {insight && (
        <figure className="insight-hero-cover">
          <InsightImage
            insight={insight}
            sizes="(max-width: 700px) 90vw, (max-width: 1240px) 88vw, 1120px"
            priority
          />
          <figcaption>Editorial illustration</figcaption>
        </figure>
      )}
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
            <h2>{insight ? "About Hamid’s insights" : "About the author"}</h2>
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
      {insight && (
        <section className="content-section insight-related">
          <h2>Related reading</h2>
          <ul>
            {insight.relatedReads.map((href) => (
              <li key={href}>
                <Link className="text-link" href={href}>
                  {readingTitle(href)}
                </Link>
              </li>
            ))}
          </ul>
          <Link className="text-link" href="/insights/">
            All insights ↗
          </Link>
        </section>
      )}
      {insight ? (
        <ProjectCta
          title={insight.cta.title}
          text={insight.cta.text}
          whatsappMessage={insight.cta.message}
        />
      ) : (
        <ProjectCta />
      )}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "@id": absolute(`${path}#article`),
          headline: article.title,
          description: article.description,
          image: absolute(image),
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
