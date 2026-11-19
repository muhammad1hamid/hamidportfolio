import Link from "next/link";
import { ContentPage, ProjectCta } from "@/components/seo/ContentPage";
import { experienceMeta } from "@/data/experience";
import { testimonialPages } from "@/data/testimonial-pages";
import { testimonials } from "@/data/testimonials";
export const metadata = experienceMeta("/testimonials/");
export default function TestimonialIndex() {
  return (
    <ContentPage
      path="/testimonials/"
      title="The people behind the feedback."
      intro="Two founder perspectives on working with Hamid. Choose a recording to hear the feedback in the speaker's own voice."
      label="Client perspectives"
      type="CollectionPage"
    >
      <div className="content-card-grid">
        {testimonialPages.map((item) => {
          const person = testimonials.find((t) => t.id === item.testimonialId)!;
          return (
            <article
              className="content-card testimonial-index-card"
              key={item.slug}
            >
              <span className="story-initials" aria-hidden="true">
                {person.name
                  .split(" ")
                  .map((word) => word[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <span className="eyebrow">
                {person.video?.durationLabel} · Video testimonial
              </span>
              <h2>
                <Link href={`/testimonials/${item.slug}/`}>{person.name}</Link>
              </h2>
              <p>
                {person.role} · {person.company}
              </p>
              <Link
                href={`/testimonials/${item.slug}/`}
                className="button button-outline"
              >
                Watch the recording
              </Link>
            </article>
          );
        })}
      </div>
      <section className="content-section">
        <h2>Hear the perspective. Explore the work.</h2>
        <p>
          The recordings and speaker details were supplied by Hamid. The
          self-directed demo websites in the portfolio are separate examples;
          these testimonials are not attributed to those demo brands.
        </p>
        <div className="related-links">
          <Link href="/work/">Explore website examples</Link>
          <Link href="/editorial-policy/">How feedback is presented</Link>
        </div>
      </section>
      <ProjectCta />
    </ContentPage>
  );
}
