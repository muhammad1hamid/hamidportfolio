import { process } from "@/data/content";

export function Process() {
  return (
    <section className="process wrap" aria-labelledby="process-title">
      <div className="section-marker" data-reveal>
        <span>How we work</span>
      </div>
      <h2 id="process-title" data-reveal>
        A clear process.
        <br />
        <em>No guesswork about the scope.</em>
      </h2>
      <div className="process-track">
        <span className="process-progress" aria-hidden="true" />
        {process.map((step, i) => (
          <div className="process-step" key={step.title}>
            <span className="process-dot" aria-hidden="true" />
            <span className="eyebrow">0{i + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
