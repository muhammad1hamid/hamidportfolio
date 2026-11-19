import Link from "next/link";
import { servicePillars } from "@/data/services";
import { Arrow } from "@/components/ui/Arrow";
import { ChromeMark } from "@/components/hero/ChromeMark";

export function Capabilities() {
  return (
    <section
      id="services"
      className="capabilities wrap"
      aria-labelledby="services-title"
    >
      <div className="section-marker" data-reveal>
        <span>What I build & improve</span>
      </div>
      <div className="capability-heading" data-reveal>
        <div>
          <h2 id="services-title">
            The right pieces.
            <br />
            <em>Working together.</em>
          </h2>
          <p className="capability-intro">
            Start with a website, improve how people discover it, or make the
            processes around it easier to run. Each project starts with a clear
            scope.
          </p>
        </div>
        <div className="capability-signature">
          <ChromeMark />
        </div>
      </div>
      <ul className="pillar-grid">
        {servicePillars.map((pillar) => (
          <li
            key={pillar.id}
            className={`pillar-card pillar-card-${pillar.id}`}
          >
            <Link
              href={pillar.href}
              data-site-event="service_pillar_click"
              data-site-pillar={pillar.id}
            >
              <span className="eyebrow">{pillar.action}</span>
              <h3>{pillar.name}</h3>
              <p>{pillar.summary}</p>
              <span className="pillar-arrow">
                <Arrow diagonal />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/services/" className="service-directory-link">
        Explore all services <Arrow diagonal />
      </Link>
    </section>
  );
}
