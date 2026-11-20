import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";
import { ProjectVisual } from "@/components/projects/ProjectVisual";
import {
  ProjectMeta,
  ProjectStoryLink,
} from "@/components/projects/ProjectLinks";
import { storyProjects } from "@/data/projects";
import { pageMeta } from "@/data/seo";
import { ContentPage, ProjectCta } from "@/components/seo/ContentPage";

const title = "Project Stories — Website Demos & Experience Notes | Hamid";
const description =
  "Explore six website stories with real desktop and mobile captures, design decisions and visitor journeys. Self-directed demos are labelled on each story.";
export const metadata = pageMeta(title, description, "/case-studies/");

export default function ProjectStoriesPage() {
  return (
    <ContentPage
      path="/case-studies/"
      title="The thinking behind the experience."
      intro="See the page structure, visual decisions and visitor journeys behind six selected websites."
      label="Project stories"
      type="CollectionPage"
      className="stories-page"
    >
      <div className="story-index-grid">
        {storyProjects.map((project) => (
          <article
            className="story-index-item"
            key={project.id}
            data-project={project.slug}
          >
            <ProjectVisual project={project} />
            <div className="project-entry-copy">
              <ProjectMeta project={project} />
              <h2>{project.title}</h2>
              <p>{project.description}</p>
              {project.liveStatus === "unavailable" && (
                <p className="project-source-note">
                  Story uses saved screenshots
                </p>
              )}
              <ProjectStoryLink project={project} entry="story_index" />
            </div>
          </article>
        ))}
      </div>
      <section className="content-section story-index-note">
        <div>
          <h2>How to read the stories</h2>
          <p>
            Self-directed demos show what a concept explores. Experience notes
            describe what visitors can inspect in a website or saved capture.
            Business outcomes need separate evidence.
          </p>
          <Link className="text-link" href="/editorial-policy/">
            Read the editorial standards <Arrow diagonal />
          </Link>
        </div>
        <Link className="button button-light" href="/work/">
          Explore the full archive <Arrow diagonal />
        </Link>
      </section>
      <ProjectCta />
    </ContentPage>
  );
}
