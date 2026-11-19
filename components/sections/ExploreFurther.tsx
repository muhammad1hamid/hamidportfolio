import Link from "next/link";
import { WorkflowPreview } from "./WorkflowPreview";

export function ExploreFurther() {
  return (
    <section className="explore-further wrap" aria-labelledby="explore-title">
      <div className="section-marker">
        <span>Before we build</span>
      </div>
      <div className="explore-heading">
        <h2 id="explore-title">
          See the thinking.
          <br />
          <em>Find your direction.</em>
        </h2>
        <p>
          Explore a demo, work through your questions, or turn an idea into a
          useful brief.
        </p>
      </div>
      <div className="explore-grid">
        {[
          {
            title: "Inside the website demos",
            text: "Real screens, the visitor journey and what each self-directed example demonstrates.",
            href: "/case-studies/",
            cta: "Explore project walkthroughs",
          },
          {
            title: "Find a starting scope",
            text: "A few decisions. A practical scope. A brief you can keep or bring to our conversation.",
            href: "/plan/",
            cta: "Build your brief",
          },
          {
            title: "Answers with a handover",
            text: "Explore supported questions and a clear path to a person in the interactive enquiry demo.",
            href: "/demos/enquiry-assistant/",
            cta: "Try the demonstration",
          },
        ].map((item) => (
          <article key={item.href}>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
            <Link
              href={item.href}
              data-site-event={
                item.href === "/plan/" ? "planner_open" : undefined
              }
            >
              {item.cta}
            </Link>
          </article>
        ))}
      </div>
      <WorkflowPreview />
      <div className="related-links">
        <Link className="text-link" href="/insights/">
          Read website and automation insights
        </Link>
        <Link className="text-link" href="/answers/">
          Browse website and automation questions
        </Link>
      </div>
    </section>
  );
}
