import type { Project } from "@/data/projects";
import { ResponsiveImage } from "@/components/seo/ResponsiveImage";

export function ProjectVisual({
  project,
  device = "desktop",
  sizes = "(max-width: 760px) 88vw, (max-width: 1440px) 50vw, 700px",
  eager = false,
}: {
  project: Project;
  device?: "desktop" | "mobile";
  sizes?: string;
  eager?: boolean;
}) {
  const mobile = device === "mobile";
  const width = mobile ? 390 : 1440;
  const height = mobile ? 844 : 960;
  const frameHeight = project.crop?.[device] ?? height;
  const subject = project.screenSubject
    ? `, showing ${project.screenSubject}`
    : "";
  return (
    <div className={`project-capture device-${device}`}>
      <div className="capture-bar" aria-hidden="true">
        <span className="preview-dots">
          <i />
          <i />
          <i />
        </span>
        <span>{new URL(project.liveUrl).hostname}</span>
      </div>
      <div
        className="capture-screen"
        style={{ aspectRatio: `${width} / ${frameHeight}` }}
      >
        <ResponsiveImage
          className="project-image"
          src={mobile ? project.mobileThumbnail : project.thumbnail}
          alt={`${mobile ? "Mobile" : "Desktop"} screenshot of ${project.title}${subject}`}
          width={width}
          height={height}
          sizes={mobile ? "(max-width: 420px) 80vw, 330px" : sizes}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : undefined}
        />
      </div>
    </div>
  );
}
