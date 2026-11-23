import type { CapabilityId } from "@/data/capability-showcase";
import { ResponsiveImage } from "@/components/seo/ResponsiveImage";
import styles from "./MobileCapabilityStudio.module.css";

export function CapabilityIcon({ id }: { id: CapabilityId }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {id === "web-experiences" && (
        <>
          <rect x="3" y="5" width="26" height="22" rx="4" />
          <path d="M3 12h26M8 8.5h.01M12 8.5h.01M16 8.5h.01" />
        </>
      )}
      {id === "growth-engine" && <path d="M5 27v-6m7 6V15m8 12V9m7 18V3" />}
      {id === "smart-systems" && (
        <path d="m16 3 13 7-13 7L3 10l13-7ZM3 17l13 7 13-7M3 24l13 7 13-7" />
      )}
      {id === "ai-conversations" && (
        <>
          <path d="M10 25 4 29v-8a9 9 0 0 1-2-6v-3a8 8 0 0 1 8-8h12a8 8 0 0 1 8 8v5a8 8 0 0 1-8 8H10Z" />
          <path d="M10 14h.01M16 14h.01M22 14h.01" />
        </>
      )}
    </svg>
  );
}

function ProjectPreview() {
  return (
    <figure className={styles.webFigure}>
      <div className={styles.laptop}>
        <div className={styles.laptopScreen}>
          <ResponsiveImage
            src="/images/curve/bridal-house-960.webp"
            alt="Bridal House self-directed website demo by Hamid"
            width="960"
            height="640"
            sizes="(max-width: 767px) 90vw, 1px"
          />
        </div>
        <span className={styles.laptopBase} aria-hidden="true" />
      </div>
      <figcaption>Bridal House · Self-directed demo</figcaption>
    </figure>
  );
}

const artwork = {
  "growth-engine": {
    file: "growth",
    alt: "3D concept illustration of a magnifying glass and browser pages for search visibility",
  },
  "smart-systems": {
    file: "systems",
    alt: "3D concept illustration of connected enquiry, document and approval modules",
  },
  "ai-conversations": {
    file: "conversations",
    alt: "3D concept illustration of a graphite phone with ivory and orange conversation bubbles",
  },
} as const;

export function CapabilityMedia({ id }: { id: CapabilityId }) {
  if (id === "web-experiences") return <ProjectPreview />;
  const image = artwork[id];
  return (
    <figure className={styles.graphicFigure}>
      <ResponsiveImage
        src={`/images/capability-art/${image.file}-960.webp`}
        srcSet={`/images/capability-art/${image.file}-480.webp 480w, /images/capability-art/${image.file}-960.webp 960w`}
        sizes="(max-width: 767px) 90vw, 1px"
        alt={image.alt}
        width={960}
        height={640}
      />
    </figure>
  );
}
