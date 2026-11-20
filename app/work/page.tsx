import Link from "next/link";
import { Work } from "@/components/projects/Work";
import { Arrow } from "@/components/ui/Arrow";
import { pageMeta, pageSchema } from "@/data/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/ContentPage";
import { projects, storyProjects } from "@/data/projects";

const title = "Website Portfolio — 18 Projects & Previews | Hamid";
const description =
  "Browse 18 website experiences with real desktop and mobile captures, original website links and six documented project stories.";
export const metadata = pageMeta(title, description, "/work/");

export default function WorkPage() {
  return (
    <main id="main" className="archive-page">
      <div className="archive-heading wrap">
        <Breadcrumbs items={[{ label: "Work", href: "/work/" }]} />
        <div className="section-marker">
          <span>Work / The archive</span>
        </div>
        <h1>
          The work.
          <br />
          <em>The thinking behind it.</em>
        </h1>
        <p>
          Browse {projects.length} website experiences. Compare desktop and
          mobile captures, open live previews where available, or explore the
          decisions behind a project.
        </p>
        <Link className="archive-stories-link" href="/case-studies/">
          <span>
            <strong>Go behind the work</strong>
            <small>
              {storyProjects.length} project stories with design decisions and
              visitor journeys
            </small>
          </span>
          <Arrow diagonal />
        </Link>
      </div>
      <Work archive />
      <div className="archive-contact wrap">
        <span>Have something in mind?</span>
        <Link href="/contact/">
          Let’s build it <Arrow diagonal />
        </Link>
      </div>
      <JsonLd
        data={pageSchema("/work/", title, description, "CollectionPage")}
      />
    </main>
  );
}
