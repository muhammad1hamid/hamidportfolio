import Link from "next/link";
import { servicePillars } from "@/data/services";
import { Arrow } from "@/components/ui/Arrow";
import { ChromeMark } from "@/components/hero/ChromeMark";
import { MobileCapabilityStudio } from "./MobileCapabilityStudio";
import styles from "./MobileCapabilityStudio.module.css";

export function Capabilities() {
  return (
    <section
      id="services"
      className={`capabilities wrap ${styles.section}`}
      aria-labelledby="services-title"
    >
      <div className="section-marker" data-reveal>
        <span>What I build & improve</span>
      </div>
      <div className="capability-heading" data-reveal>
        <div>
          <h2 id="services-title">
            <span className={styles.desktopTitle}>
              The right pieces.
              <br />
              <em>Working together.</em>
            </span>
            <span className={styles.mobileTitle}>
              <span>Different disciplines.</span>
              <em>One way of thinking.</em>
            </span>
          </h2>
          <p className="capability-intro">
            <span className={styles.desktopDescription}>
              Start with a website, improve how people discover it, or make the
              processes around it easier to run. Each project starts with a
              clear scope.
            </span>
            <span className={styles.mobileDescription}>
              I build, refine, and connect digital experiences through web
              development, search visibility, automation, and AI.
            </span>
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
      <MobileCapabilityStudio />
      <Link href="/services/" className="service-directory-link">
        Explore all services <Arrow diagonal />
      </Link>
    </section>
  );
}
