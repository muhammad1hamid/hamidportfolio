import Link from "next/link";
import { About } from "@/components/sections/About";
import { site } from "@/data/site";
import { pageMeta } from "@/data/seo";
import { ContentPage, ProjectCta } from "@/components/seo/ContentPage";
export const metadata = pageMeta(
  "About Hamid — Independent Developer & ElevateX Founder",
  "Meet Muhammad Hamid, a Pakistan-based web developer, AI automation builder and founder of ElevateX. Explore his work, approach and social profiles.",
  "/about/",
);
export default function AboutPage() {
  return (
    <ContentPage
      path="/about/"
      title="The person behind the work."
      intro="I’m Hamid — an independent web developer and AI automation builder based in Pakistan. I work directly with businesses and alongside agencies, and I’m the founder of ElevateX."
      label="About"
      type="AboutPage"
    >
      <About />
      <section className="content-section">
        <h2>Work with a builder, directly.</h2>
        <p>
          My work connects visual direction with practical implementation:
          websites that explain an offer, enquiry journeys that make the next
          step clear, and automation scopes grounded in the way a team operates.
          I collaborate remotely with clients across Pakistan and
          internationally.
        </p>
        <div className="related-links">
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
            Muhammad Hamid on LinkedIn ↗
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
          <Link href="/testimonials/">Client video testimonials ↗</Link>
          <Link href="/editorial-policy/">How examples are presented</Link>
          <Link href="/plan/">Prepare a project brief</Link>
        </div>
      </section>
      <ProjectCta />
    </ContentPage>
  );
}
