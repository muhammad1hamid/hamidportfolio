import Link from "next/link";
import { ResponsiveImage } from "@/components/seo/ResponsiveImage";
import { Arrow } from "@/components/ui/Arrow";
import { servicePillars } from "@/data/services";
import "@/app/hero-cards.css";

function WebsitePreview() {
  return (
    <>
      <ResponsiveImage
        className="hero-card-art hero-laptop"
        src="/images/hero-cards/architecture-laptop.webp"
        srcSet="/images/hero-cards/architecture-laptop-small.webp 336w, /images/hero-cards/architecture-laptop.webp 672w"
        sizes="(max-width: 1023px) 180px, 210px"
        alt=""
        width={672}
        height={378}
      />
    </>
  );
}

function SearchPreview() {
  return (
    <>
      <ResponsiveImage
        className="hero-card-art hero-search-preview"
        src="/images/hero-cards/google-search-panel.webp"
        srcSet="/images/hero-cards/google-search-panel-small.webp 288w, /images/hero-cards/google-search-panel.webp 573w"
        sizes="(max-width: 1023px) 160px, 205px"
        alt=""
        width={573}
        height={484}
      />
    </>
  );
}

function WorkflowPreview() {
  return (
    <>
      <ResponsiveImage
        className="hero-card-art hero-workflow-preview"
        src="/images/hero-cards/workflow-panel.svg"
        alt=""
        width={546}
        height={234}
      />
    </>
  );
}

const cards = [
  {
    id: "web-experiences",
    design: "web",
    description: "Purposeful websites & interfaces",
    path: "m8 6-6 6 6 6m8-12 6 6-6 6m-2-14-4 16",
    preview: <WebsitePreview />,
    previewLabel:
      "Illustrative laptop mockup with an architectural website concept.",
  },
  {
    id: "growth-engine",
    design: "growth",
    description: "Search visibility · SEO / AEO",
    path: "M16.5 16.5 21 21m-2-10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z",
    preview: <SearchPreview />,
    previewLabel: "Illustrative Google search interface for a sample business.",
  },
  {
    id: "smart-systems",
    design: "systems",
    description: "Useful automation & workflows",
    path: "M9 2h6v5H9V2ZM2 17h6v5H2v-5Zm14 0h6v5h-6v-5ZM12 7v5m-7 5v-5h14v5",
    preview: <WorkflowPreview />,
    previewLabel:
      "Illustrative tool workflow connecting Notion, ChatGPT and Slack.",
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
