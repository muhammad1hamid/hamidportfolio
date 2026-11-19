import Link from "next/link";
import { Work } from "@/components/projects/Work";
import { Arrow } from "@/components/ui/Arrow";
import { pageMeta, pageSchema } from "@/data/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/ContentPage";

const title = "Website Portfolio — 18 Live Project Previews | Hamid";
const description =
  "Explore 18 websites in Hamid’s portfolio, from bridal and jewellery collections to creative portfolios and service businesses, with mobile previews and live links.";
export const metadata = pageMeta(title, description, "/work/");

export default function WorkPage() {
  return (
    <main id="main" className="archive-page">
      <div className="archive-heading wrap">
        <Breadcrumbs items={[{ label: "Work", href: "/work/" }]} />
        <div className="section-marker">
          <span>The project archive</span>
          <span>Websites / Experiences / Details</span>
        </div>
        <h1>
          THE WORK.
          <br />
          <em>And what’s next.</em>
        </h1>
        <p>
          A collection of 18 website experiences. Explore actual desktop and
          mobile captures, then open the live websites.
        </p>
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
