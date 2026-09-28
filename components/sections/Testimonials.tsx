import { testimonials } from "@/data/testimonials";

export function Testimonials() {
  if (!testimonials.length) return null;
  return (
    <section className="testimonials wrap" aria-label="Client testimonials">
      <span className="eyebrow">In their words</span>
      {testimonials.map((t) => (
        <figure key={t.id} data-reveal>
          <blockquote>“{t.quote}”</blockquote>
          <figcaption>
            {t.name}
            <span>{[t.role, t.company].filter(Boolean).join(" · ")}</span>
          </figcaption>
        </figure>
      ))}
    </section>
  );
}
