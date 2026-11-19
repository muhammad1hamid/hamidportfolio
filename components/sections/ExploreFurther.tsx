import Link from "next/link";
export function ExploreFurther() {
  return (
    <section className="explore-further wrap" aria-labelledby="explore-title">
      <div className="section-marker">
        <span>Before we build</span>
        <span>A clearer starting point</span>
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
            label: "01 / A closer look",
            title: "Inside the website demos",
            text: "Real screens, the visitor journey and what each self-directed example demonstrates.",
            href: "/case-studies/",
            cta: "Explore project walkthroughs",
          },
          {
            label: "02 / Make it yours",
            title: "Plan your next website",
            text: "A few decisions. A practical scope. A brief you can keep or bring to our conversation.",
            href: "/plan/",
            cta: "Build your brief",
          },
          {
            label: "03 / Try the flow",
            title: "Answers with a handover",
            text: "Explore supported questions and a clear path to a person in the interactive enquiry demo.",
            href: "/demos/enquiry-assistant/",
            cta: "Try the demonstration",
          },
        ].map((item) => (
          <article key={item.href}>
            <span className="eyebrow">{item.label}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
            <Link href={item.href}>{item.cta}</Link>
          </article>
        ))}
      </div>
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
