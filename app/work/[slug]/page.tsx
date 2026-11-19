import Link from "next/link";
import { ResponsiveImage as Image } from "@/components/seo/ResponsiveImage";
import { notFound } from "next/navigation";
import { overviewProjects, pageMeta, absolute } from "@/data/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { projectDetails } from "@/data/project-details";
import demoProjects from "@/data/demo-projects.json";
import { ContentPage, ProjectCta } from "@/components/seo/ContentPage";
export const dynamicParams = false;
export function generateStaticParams() {
  return overviewProjects.map((project) => ({ slug: project.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = overviewProjects.find((project) => project.slug === slug);
  if (!project) notFound();
  return pageMeta(
    `${project.title} — ${project.projectType ? "Demo Walkthrough" : "Website Experience Notes"} | Hamid`,
    project.description,
    `/work/${project.slug}/`,
  );
}
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = overviewProjects.find((project) => project.slug === slug);
  if (!project) notFound();
  const notes = projectDetails[project.id];
  const demo = demoProjects[project.id as keyof typeof demoProjects];
  const path = `/work/${project.slug}/`;
  return (
    <ContentPage
      path={path}
      title={project.title}
      intro={demo?.summary || project.description}
      label={project.projectType || project.industry || "Website project"}
      crumbs={[
        { label: "Work", href: "/work/" },
        { label: project.title, href: path },
      ]}
    >
      {demo && (
        <div className="project-facts">
          <span>{demo.type}</span>
          <span>{demo.role}</span>
          <span>Concept showcase · not commissioned client work</span>
        </div>
      )}
      <div className="content-actions hero-page-actions">
        <a
          className="button button-accent"
          href={project.liveUrl!}
          target="_blank"
          rel="noopener noreferrer"
        >
          {demo ? "Explore the live demo" : "Explore the live website"} ↗
        </a>
        <Link className="text-link" href="/web-development/">
          Discuss a website like this ↗
        </Link>
      </div>
      <div className="project-detail-shots">
        <figure>
          <Image
            src={project.thumbnail}
            alt={`${project.title} desktop homepage screenshot`}
            width={1440}
            height={960}
            sizes="(max-width: 700px) 90vw, 65vw"
          />
          <figcaption>Desktop experience</figcaption>
        </figure>
        <figure className="detail-mobile">
          <Image
            src={project.mobileThumbnail!}
            alt={`${project.title} mobile homepage screenshot`}
            width={390}
            height={844}
            sizes="(max-width: 700px) 55vw, 260px"
          />
          <figcaption>Mobile experience</figcaption>
        </figure>
      </div>
      <section className="content-section">
        <h2>Inside the experience</h2>
        <p>{notes.idea}</p>
      </section>
      {demo && (
        <section className="content-section">
          <h2>How the experience supports the visitor</h2>
          <div className="content-card-grid">
            {demo.decisions.map((decision) => (
              <article className="content-card" key={decision.title}>
                <h3>{decision.title}</h3>
                <p>{decision.text}</p>
              </article>
            ))}
          </div>
          <h3 className="spaced-title">What the demo shows</h3>
          <p>{demo.scope}</p>
          <h3 className="spaced-title">Questions for a real project</h3>
          <p>{demo.lesson}</p>
          <p className="article-byline">
            Project type and development contribution confirmed by Hamid on{" "}
            <time dateTime="2026-10-05">5 October 2026</time>. Experience
            commentary describes the visible example.
          </p>
        </section>
      )}
      <section className="content-section">
        <h2>Details to explore</h2>
        <ul className="feature-grid">
          {notes.highlights.map((feature, i) => (
            <li key={feature}>
              <span aria-hidden="true">0{i + 1}</span>
              <p>{feature}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="content-section">
        <h2>The visitor journey</h2>
        <ol className="content-steps">
          {notes.journey.map((step, i) => (
            <li key={step}>
              <span aria-hidden="true">0{i + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </section>
      <aside className="content-proof">
        <h2>What these notes cover</h2>
        <p>
          {demo
            ? "This is a self-directed website demo built by Hamid. Names and media shown belong to their respective owners; the example does not imply a commission, endorsement or measured business result."
            : "This overview describes the visible website and supplied screenshots. Open the live website to explore its current experience."}
        </p>
        <div className="related-links">
          <Link href="/case-studies/">More project experience notes ↗</Link>
          <Link href="/web-development/">Web development services ↗</Link>
          <Link href="/plan/">Plan a similar website</Link>
          <Link href="/editorial-policy/">How examples are presented</Link>
        </div>
      </aside>
      <ProjectCta title="Bring your own direction." />
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
