import Link from "next/link";
import { ResponsiveImage } from "@/components/seo/ResponsiveImage";
import { Arrow } from "@/components/ui/Arrow";
import { defaultPlan } from "@/data/planner";
import { projectLinkData } from "@/data/project-events";
import { projects } from "@/data/projects";
import { ExploreWorkbench } from "./ExploreWorkbench";
import styles from "./ExploreFurther.module.css";

const bridalHouse = projects.find(({ slug }) => slug === "bridal-house")!;
const briefFields = [
  ["Business", defaultPlan.business],
  ["Goal", defaultPlan.goal],
  ["Pages", defaultPlan.pages.join(", ")],
  ["Integration", defaultPlan.integrations.join(", ")],
];

export function ExploreFurther() {
  return (
    <section
      className={`explore-further wrap ${styles.section}`}
      aria-labelledby="explore-title"
    >
      <header className={styles.intro}>
        <p className={styles.marker}>Before we build</p>
        <h2 id="explore-title">
          See the thinking.
          <br />
          <em>Find your direction.</em>
        </h2>
        <p className={styles.lead}>
          Explore real work, plan a practical scope, or try a simple enquiry
          flow — all in one place.
        </p>
      </header>

      <ExploreWorkbench
        work={
          <>
            <header className={styles.previewHeading}>
              <p className="eyebrow">Self-directed website demo</p>
              <h3>
                Inside <em>Bridal House.</em>
              </h3>
            </header>
            <div className={styles.previewSample}>
              <ResponsiveImage
                className={styles.workImage}
                src={bridalHouse.thumbnail}
                alt="Bridal House homepage showing the couture collection and consultation links"
                width={1440}
                height={960}
                sizes="(max-width: 959px) 86vw, (max-width: 1450px) 55vw, 780px"
              />
              <p>{bridalHouse.description}</p>
            </div>
            <div className={styles.actions}>
              <Link className={styles.secondaryLink} href="/case-studies/">
                All project walkthroughs
              </Link>
              <Link
                className={`button button-accent ${styles.cta}`}
                href={bridalHouse.detailUrl!}
                {...projectLinkData(
                  bridalHouse.slug,
                  "before_we_build",
                  "story",
                )}
              >
                See the walkthrough <Arrow diagonal />
              </Link>
            </div>
          </>
        }
        brief={
          <>
            <header className={styles.previewHeading}>
              <p className="eyebrow">Example project scope</p>
              <h3>
                Give your project <em>a starting point.</em>
              </h3>
            </header>
            <div className={styles.previewSample}>
              <dl className={styles.briefSample}>
                {briefFields.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <p>
                Choose a goal, pages and integrations, then build a brief you
                can keep or discuss with Hamid.
              </p>
            </div>
            <div className={styles.actions}>
              <Link
                className={`button button-accent ${styles.cta}`}
                href="/plan/"
                data-site-event="planner_open"
              >
                Build your brief <Arrow diagonal />
              </Link>
            </div>
          </>
        }
      />

      <div className={`related-links ${styles.related}`}>
        <Link className="text-link" href="/insights/">
          Read website and automation insights
        </Link>
        <Link className="text-link" href="/answers/">
          Browse website and automation questions
        </Link>
      </div>
    </section>
  );
}
