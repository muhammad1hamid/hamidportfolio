import Link from "next/link";
import { ResponsiveImage as Image } from "@/components/seo/ResponsiveImage";
import { overviewProjects, pageMeta } from "@/data/seo";
import { ContentPage, ProjectCta } from "@/components/seo/ContentPage";
export const metadata = pageMeta(
  "Website Demo Walkthroughs & Project Notes | Hamid",
  "Explore six website project overviews from Hamid’s portfolio, with actual screenshots, visible features, visitor journeys and links to the live experiences.",
  "/case-studies/",
);
export default function ProjectNotesPage() {
  return (
    <ContentPage
      path="/case-studies/"
      title="The details behind the experience."
      intro="A closer look at six websites in the portfolio. Bridal House, Editing Julian and Qadeer Jewellers are self-directed demos built by Hamid. Explore their visitor journeys alongside actual screenshots and live links."
      label="Project notes"
      type="CollectionPage"
    >
      <div className="content-card-grid project-notes-grid">
        {overviewProjects.map((project) => (
          <article className="content-card" key={project.id}>
            <Link
              href={`/work/${project.slug}/`}
              tabIndex={-1}
              aria-hidden="true"
            >
              <Image
                src={project.thumbnail}
                alt=""
                width={1440}
                height={960}
                sizes="(max-width: 700px) 90vw, 40vw"
              />
            </Link>
            <span className="eyebrow">{project.industry}</span>
            {project.projectType && (
              <span className="project-type">{project.projectType}</span>
            )}
            <h2>
              <Link href={`/work/${project.slug}/`}>{project.title} ↗</Link>
            </h2>
            <p>{project.description}</p>
            <Link className="text-link" href={`/work/${project.slug}/`}>
              Read the experience notes ↗
            </Link>
          </article>
        ))}
      </div>
      <section className="content-section">
        <h2>Proof you can explore.</h2>
        <p>
          Demo walkthroughs explain what the interface demonstrates and what a
          real project would need to confirm. They do not claim client
          commissions or commercial results. The full archive includes all 18
          supplied websites.
        </p>
        <Link className="text-link" href="/work/">
          Open the complete website archive ↗
        </Link>
      </section>
      <ProjectCta />
    </ContentPage>
  );
}
