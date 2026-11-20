import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMeta, absolute } from "@/data/seo";
import { storyProjects, projectProofLabels } from "@/data/projects";
import { projectDetails } from "@/data/project-details";
import demoProjects from "@/data/demo-projects.json";
import { projectLinkData } from "@/data/project-events";
import { JsonLd } from "@/components/seo/JsonLd";
import { ContentPage, ProjectCta } from "@/components/seo/ContentPage";
import { ProjectVisual } from "@/components/projects/ProjectVisual";
import { ProjectLiveLink } from "@/components/projects/ProjectLinks";
import { Arrow } from "@/components/ui/Arrow";
import { agencyExamples } from "@/data/agency-partnerships";
import { enquiryHref } from "@/data/project-enquiry.mjs";

export const dynamicParams = false;

export function generateStaticParams() {
  return storyProjects.map(({ slug }) => ({ slug }));
}

function findStory(slug: string) {
  const project = storyProjects.find((item) => item.slug === slug);
  if (!project) notFound();
  const demo =
    project.proofType === "self-directed-demo"
      ? demoProjects[project.id as keyof typeof demoProjects]
      : undefined;
  return { project, demo };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { project, demo } = findStory((await params).slug);
  return pageMeta(
    `${project.title} — ${demo ? "Demo Walkthrough" : "Website Experience Notes"} | Hamid`,
    demo?.summary ?? project.description,
    project.detailUrl,
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { project, demo } = findStory((await params).slug);
  const notes = projectDetails[project.id];
  const path = project.detailUrl;
  const contactHref = enquiryHref("website", "work");
  const next =
    storyProjects[(storyProjects.indexOf(project) + 1) % storyProjects.length];

  return (
    <ContentPage
      path={path}
      title={project.title}
      intro={demo?.summary ?? project.description}
      label={projectProofLabels[project.proofType]}
      crumbs={[
        { label: "Work", href: "/work/" },
        { label: "Project stories", href: "/case-studies/" },
        { label: project.title, href: path },
      ]}
      className="project-story-page"
    >
      <div className="story-header-tools">
        <dl className="story-facts">
          <div>
            <dt>Industry</dt>
            <dd>{project.industry}</dd>
          </div>
          {demo && (
            <div>
              <dt>Role</dt>
              <dd>{demo.role}</dd>
            </div>
          )}
          <div>
            <dt>Evidence</dt>
            <dd>Desktop and mobile captures</dd>
          </div>
        </dl>
        <div className="story-header-actions">
          <Link
            className="button button-accent"
            href={contactHref}
            {...projectLinkData(project.slug, "project_story", "contact")}
          >
            Discuss a similar project <Arrow diagonal />
          </Link>
          <ProjectLiveLink project={project} entry="project_story" />
        </div>
      </div>
      {project.liveStatus === "unavailable" && (
        <p className="project-source-note story-source-note">
          The supplied domain is currently unavailable. This story uses saved
          screenshots.
        </p>
      )}

      <nav className="story-jump-links" aria-label="In this project story">
        <a href="#screens">Screens</a>
        <a href="#decisions">Decisions</a>
        <a href="#journey">Visitor journey</a>
        <a href="#evidence">Evidence</a>
      </nav>

      <section
        id="screens"
        className="story-screens"
        aria-label="Desktop and mobile captures"
      >
        <figure>
          <ProjectVisual
            project={project}
            sizes="(max-width: 740px) 88vw, 880px"
            eager
          />
          <figcaption>
            <strong>Desktop</strong>
            <span>{notes.desktop}</span>
          </figcaption>
        </figure>
        <figure className="story-mobile-capture">
          <ProjectVisual project={project} device="mobile" />
          <figcaption>
            <strong>Mobile</strong>
            <span>{notes.mobile}</span>
          </figcaption>
        </figure>
      </section>

      <section className="story-section story-split">
        <h2>{demo ? "The design premise" : "About the experience"}</h2>
        <p>{notes.idea}</p>
      </section>

      <section className="story-section" id="decisions">
        <h2>Decisions you can see.</h2>
        <div className="story-decisions">
          {notes.decisions.map((decision) => (
            <article key={decision.title}>
              <h3>{decision.title}</h3>
              <dl>
                <div>
                  <dt>Why it matters</dt>
                  <dd>{decision.reason}</dd>
                </div>
                <div>
                  <dt>What the site presents</dt>
                  <dd>{decision.implementation}</dd>
                </div>
                <div>
                  <dt>What to inspect</dt>
                  <dd>{decision.inspect}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="story-section" id="journey">
        <h2>The visitor journey</h2>
        <ol className="story-journey">
          {notes.journey.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <div className="story-split story-features">
          <h3>Visible features</h3>
          <ul className="plain-list">
            {notes.highlights.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="story-section story-evidence" id="evidence">
        <h2>{demo ? "What the demo demonstrates" : "What you can inspect"}</h2>
        <p>{notes.evidence}</p>
        {demo && (
          <>
            <p>{demo.scope}</p>
            <h3>Before using this approach on a real project</h3>
            <p>{demo.lesson}</p>
            <p className="article-byline">
              Hamid confirmed the demo status and development contribution on{" "}
              <time dateTime="2026-10-05">5 October 2026</time>.
            </p>
          </>
        )}
        <Link className="text-link" href="/editorial-policy/">
          How project evidence is presented <Arrow diagonal />
        </Link>
      </section>

      <section
        className="story-section story-related"
        aria-labelledby="story-related-title"
      >
        <div>
          <h2 id="story-related-title">Planning a website?</h2>
          <Link
            className="text-link"
            href="/web-development/"
            {...projectLinkData(project.slug, "project_story", "service")}
          >
            Explore web development services <Arrow diagonal />
          </Link>
          <Link className="text-link" href="/plan/">
            Plan a similar website <Arrow diagonal />
          </Link>
          {agencyExamples.some(({ id }) => id === project.id) && (
            <Link
              className="text-link"
              href="/for-agencies/"
              data-agency-placement="case_study"
              data-agency-destination="agency_page"
            >
              Need a build partner for your agency? <Arrow diagonal />
            </Link>
          )}
        </div>
        <div>
          <h3>Next project story</h3>
          <Link
            className="story-next-link"
            href={next.detailUrl}
            {...projectLinkData(next.slug, "project_related", "story")}
          >
            {next.title} <Arrow diagonal />
          </Link>
          <Link className="text-link" href="/work/">
            Back to all work <Arrow diagonal />
          </Link>
        </div>
      </section>
      <ProjectCta
        title="Have a similar project in mind?"
        contactHref={contactHref}
      />
      {demo && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            "@id": absolute(`${path}#project`),
            name: `${project.title} — self-directed website demo`,
            description: demo.summary,
            genre: "Self-directed website demonstration",
            creator: { "@id": absolute("/#person") },
            url: absolute(path),
            mainEntityOfPage: { "@id": absolute(`${path}#webpage`) },
            image: absolute(project.thumbnail),
          }}
        />
      )}
    </ContentPage>
  );
}
