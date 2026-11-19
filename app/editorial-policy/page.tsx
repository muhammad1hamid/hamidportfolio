import Link from "next/link";
import { ContentPage } from "@/components/seo/ContentPage";
import { experienceMeta } from "@/data/experience";
export const metadata = experienceMeta("/editorial-policy/");
export default function EditorialPage() {
  return (
    <ContentPage
      path="/editorial-policy/"
      title="Clear about the work."
      intro="A portfolio should make it easy to distinguish a demonstration, a client's perspective and a result that has actually been measured."
      label="Content standards"
    >
      <section className="content-section">
        <h2>Project examples</h2>
        <p>
          Bridal House, Editing Julian and Qadeer Jewellers are self-directed
          demo websites built by Hamid. They are labelled as demos on their
          project pages and portfolio cards. Showing a named business or its
          media in a demo does not imply a commission or endorsement.
        </p>
        <p>
          Project walkthroughs describe the visible interface and supplied
          screenshots. Development contributions are included when confirmed by
          Hamid. A live link shows the current destination; it does not
          establish ownership of every asset or a measured commercial result.
        </p>
        <Link href="/case-studies/" className="text-link">
          Explore project walkthroughs
        </Link>
      </section>
      <section className="content-section">
        <h2>Client perspectives</h2>
        <p>
          The two video testimonials were supplied with the speakers' names and
          companies: Abdullah Abbasii of Nexus Growth and Usman of Prestige
          Media. The recordings are presented separately from the demo websites.
          Quotes, translations and transcripts are published only when checked
          against the actual recordings.
        </p>
        <Link href="/testimonials/" className="text-link">
          Watch the recordings
        </Link>
      </section>
      <section className="content-section">
        <h2>Guides, tools and demonstrations</h2>
        <p>
          Guides explain project-planning choices and link to supporting
          references where relevant. AI-assisted drafting and coding may be used
          in preparing the website. Planning examples are illustrative unless
          explicitly linked to an identified project.
        </p>
        <p>
          The website planner suggests a scope, not a price or commitment. The
          enquiry demonstration uses a published rules-based answer set; it is
          not a live AI service. No tool on these pages sends an enquiry without
          a separate action from the visitor.
        </p>
      </section>
      <section className="content-section">
        <h2>Results and updates</h2>
        <p>
          Numerical project outcomes need a source, measurement period and
          relevant baseline. Demo pages make no revenue, conversion or
          client-satisfaction claims. Dates describe actual content preparation
          or updates, rather than changing automatically on every visit.
        </p>
        <p>
          If a name, description or example needs correcting, contact Hamid with
          the page and the detail to review.
        </p>
        <div className="related-links">
          <Link href="/contact/">Request a correction</Link>
          <Link href="/about/">About Hamid</Link>
        </div>
      </section>
    </ContentPage>
  );
}
