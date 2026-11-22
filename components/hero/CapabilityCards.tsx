import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";
import { servicePillars } from "@/data/services";

const cards = [
  {
    id: "web-experiences",
    design: "web",
    description: "Purposeful websites & interfaces",
    preview: (
      <div className="hero-browser" aria-hidden="true">
        <span className="hero-browser-bar">
          <i />
          <i />
          <i />
        </span>
        <span className="hero-browser-body">
          <i className="hero-browser-layout" />
          <i className="hero-browser-image" />
        </span>
      </div>
    ),
  },
  {
    id: "growth-engine",
    design: "growth",
    description: "Search visibility · SEO / AEO",
    preview: (
      <div className="hero-search" aria-hidden="true">
        <span className="hero-search-lens" />
        <span>Find a service</span>
      </div>
    ),
  },
  {
    id: "smart-systems",
    design: "systems",
    description: "Useful automation & workflows",
    preview: (
      <div className="hero-workflow" aria-hidden="true">
        <span>Input</span>
        <span>Route</span>
        <span>Review</span>
      </div>
    ),
  },
] as const;

export function CapabilityCards() {
  return (
    <ul className="hero-capabilities" aria-label="Explore Hamid’s capabilities">
      {cards.map(({ id, design, description, preview }) => {
        const pillar = servicePillars.find((service) => service.id === id)!;
        return (
          <li key={id} className={`hero-card-item hero-card-${design}`}>
            <Link href={pillar.href} prefetch={false} className="hero-card">
              <div className="hero-card-preview">{preview}</div>
              <span className="hero-card-copy">
                <strong>{pillar.name}</strong>
                <span>{description}</span>
              </span>
              <Arrow diagonal className="hero-card-arrow" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
