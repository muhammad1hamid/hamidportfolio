import Link from "next/link";
import { About } from "@/components/sections/About";
import { site } from "@/data/site";
import { pageMeta } from "@/data/seo";
import { ContentPage, ProjectCta } from "@/components/seo/ContentPage";
export const metadata = pageMeta(
  "About Hamid — Independent Developer & ElevateX Founder",
  "Meet Muhammad Hamid, a Pakistan-based developer and ElevateX founder working across websites, search and AI visibility, and automation.",
  "/about/",
);
export default function AboutPage() {
  return (
    <ContentPage
      path="/about/"
      title="The person behind the work."
      intro={`I’m ${site.personName}, an independent developer and the founder of ElevateX. I work from Pakistan with businesses and agencies worldwide.`}
      label="About"
      type="AboutPage"
      mainEntity="/#person"
    >
      <About />
      <section className="content-section">
        <h2>Work with a builder, directly.</h2>
        <p>
          My work connects visual direction with practical implementation:
          websites that explain an offer, pages that answer the questions buyers
          search for, and automation grounded in the way a team operates.
        </p>
        <div className="related-links">
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
            {site.personName} on LinkedIn ↗
          </a>
          <a href={site.instagram} target="_blank" rel="noopener noreferrer">
            Hamid on Instagram ↗
          </a>
          <a
            href="https://www.elevatexlab.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            ElevateX ↗
          </a>
        </div>
      </section>
      <section className="content-section">
        <h2>Explore before we talk.</h2>
        <p>
          The portfolio includes actual website captures and live links. Project
          walkthroughs explain visible features and visitor journeys. Bridal
          House, Editing Julian and Qadeer Jewellers are self-directed demo
          websites I built. Client video testimonials have their own watch
          pages.
        </p>
        <div className="related-links">
          <Link href="/work/">Website portfolio ↗</Link>
          <Link href="/services/">Explore services ↗</Link>
          <Link href="/growth/">Search and AI visibility ↗</Link>
          <Link href="/testimonials/">Client video testimonials ↗</Link>
          <Link href="/editorial-policy/">How examples are presented</Link>
          <Link href="/plan/" data-site-event="planner_open">
            Prepare a project brief
          </Link>
        </div>
      </section>
      <ProjectCta />
    </ContentPage>
  );
}
