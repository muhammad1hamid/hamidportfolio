import Link from "next/link";
import { ContentPage } from "@/components/seo/ContentPage";
import { InsightImage } from "@/components/seo/InsightImage";
import { Arrow } from "@/components/ui/Arrow";
import { articleDate } from "@/data/articles";
import { insightPath, insights, type Insight } from "@/data/insights";
import { pageMeta } from "@/data/seo";

export const metadata = pageMeta(
  "Website & Automation Insights | Hamid",
  "Read build notes and practical articles on website design, accessible motion, WhatsApp enquiries, mobile launch checks and workflow automation.",
  "/insights/",
);

function InsightCard({
  insight,
  featured = false,
}: {
  insight: Insight;
  featured?: boolean;
}) {
  const Heading = featured ? "h2" : "h3";
  const headingId = `insight-${insight.slug}`;
  return (
    <article
      className={featured ? "insight-card insight-feature" : "insight-card"}
    >
      <Link href={insightPath(insight.slug)} aria-labelledby={headingId}>
        <div className="insight-card-cover">
          <InsightImage
            insight={insight}
            sizes={
              featured
                ? "(max-width: 800px) 90vw, (max-width: 1240px) 56vw, 800px"
                : "(max-width: 600px) 90vw, (max-width: 1240px) 44vw, 600px"
            }
            priority={featured}
          />
        </div>
        <div className="insight-card-copy">
          <div className="insight-card-meta">
            <span>{insight.category}</span>
            <time dateTime={insight.date}>{articleDate(insight.date)}</time>
          </div>
          <Heading id={headingId}>{insight.title}</Heading>
          <p>{insight.excerpt}</p>
          <span className="insight-card-action" aria-hidden="true">
            Read insight <Arrow diagonal />
          </span>
        </div>
      </Link>
    </article>
  );
}

export default function InsightsPage() {
  const [featured, ...more] = insights;
  return (
    <ContentPage
      path="/insights/"
      title="Insights"
      intro="Build notes and practical articles on designing business websites, improving enquiries and deciding what to automate."
      label="Insights"
      type="CollectionPage"
      className="insights-index"
    >
      <InsightCard insight={featured} featured />
      <section className="insight-feed" aria-labelledby="more-insights">
        <h2 id="more-insights">More insights</h2>
        <div className="insight-grid">
          {more.map((insight) => (
            <InsightCard key={insight.slug} insight={insight} />
          ))}
        </div>
      </section>
      <section className="content-section insight-library">
        <div>
          <h2>Planning a project?</h2>
          <p>
            Explore the guide library for help with website scope, project
            briefs and chatbot handover.
          </p>
        </div>
        <Link className="button button-outline" href="/blog/">
          Browse planning guides <Arrow diagonal />
        </Link>
      </section>
    </ContentPage>
  );
}
