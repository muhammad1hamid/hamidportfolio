import Link from "next/link";
import { ResponsiveImage } from "@/components/seo/ResponsiveImage";
import { Arrow } from "@/components/ui/Arrow";
import { servicePillars } from "@/data/services";
import "@/app/hero-cards.css";

function WebsitePreview() {
  return (
    <>
      <div className="hero-laptop">
        <div className="hero-laptop-display">
          <ResponsiveImage
            src="/images/curve/fortress-events-160.webp"
            srcSet="/images/curve/fortress-events-160.webp 160w, /images/responsive/fortress-events-640.webp 640w"
            sizes="(min-width: 1440px) 180px, 160px"
            alt=""
            width={160}
            height={107}
          />
        </div>
        <span className="hero-laptop-base" />
      </div>
      <span className="hero-preview-caption">
        <span>Fortress Events</span>
        <span>Portfolio preview</span>
      </span>
    </>
  );
}

function SearchPreview() {
  return (
    <div className="hero-search-preview">
      <span className="hero-search-caption">Example search</span>
      <span className="hero-search-field">
        <span>Event venue</span>
        <svg viewBox="0 0 20 20" fill="none">
          <circle cx="8" cy="8" r="4.5" />
          <path d="m11.4 11.4 3.3 3.3" />
        </svg>
      </span>
      <span className="hero-search-result">
        <strong>Venue website</strong>
        <span>View spaces &amp; enquire</span>
      </span>
    </div>
  );
}

const workflowSteps = [
  { title: "New enquiry", icon: "M3 3h10v7H7l-4 3V3Z" },
  { title: "Organise details", icon: "M3 5h10M3 8h10M3 11h6" },
  { title: "Prepare reply", icon: "M3 4h10v8H3V4Zm0 1 5 4 5-4" },
] as const;

function WorkflowPreview() {
  return (
    <div className="hero-workflow-preview">
      <span className="hero-workflow-caption">Example workflow</span>
      <ol>
        {workflowSteps.map(({ title, icon }) => (
          <li key={title}>
            <svg viewBox="0 0 16 16" fill="none">
              <path d={icon} />
            </svg>
            <span>{title}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

const cards = [
  {
    id: "web-experiences",
    design: "web",
    description: "Purposeful websites & interfaces",
    path: "m8 6-6 6 6 6m8-12 6 6-6 6m-2-14-4 16",
    preview: <WebsitePreview />,
    previewLabel: "Portfolio preview of the Fortress Events Complex website.",
  },
  {
    id: "growth-engine",
    design: "growth",
    description: "Search visibility · SEO / AEO",
    path: "M16.5 16.5 21 21m-2-10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z",
    preview: <SearchPreview />,
    previewLabel: "Illustrative search result for an event venue.",
  },
  {
    id: "smart-systems",
    design: "systems",
    description: "Useful automation & workflows",
    path: "M9 2h6v5H9V2ZM2 17h6v5H2v-5Zm14 0h6v5h-6v-5ZM12 7v5m-7 5v-5h14v5",
    preview: <WorkflowPreview />,
    previewLabel:
      "Example workflow: receive an enquiry, organise details and prepare a reply.",
  },
] as const;

export function CapabilityCards() {
  return (
    <ul
      className="hero-capabilities"
      role="list"
      aria-label="Explore Hamid’s capabilities"
    >
      {cards.map(({ id, design, description, path, preview, previewLabel }) => {
        const pillar = servicePillars.find((service) => service.id === id)!;
        return (
          <li key={id} className={`hero-card-item hero-card-${design}`}>
            <Link
              href={pillar.href}
              prefetch={false}
              className="hero-card"
              aria-describedby={`hero-${design}-preview-info`}
            >
              <div className="hero-card-preview" aria-hidden="true">
                {preview}
              </div>
              <span className="hero-card-copy">
                <svg
                  className="hero-card-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d={path}
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <strong>{pillar.name}</strong>
                <span>{description}</span>
              </span>
              <span className="hero-card-action" aria-hidden="true">
                <Arrow diagonal className="hero-card-arrow" />
              </span>
              <span id={`hero-${design}-preview-info`} hidden>
                {previewLabel}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
