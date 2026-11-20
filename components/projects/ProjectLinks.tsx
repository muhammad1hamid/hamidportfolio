import Link from "next/link";
import { projectProofLabels, type Project } from "@/data/projects";
import { projectLinkData, type ProjectEntry } from "@/data/project-events";
import { Arrow } from "@/components/ui/Arrow";

export function ProjectMeta({ project }: { project: Project }) {
  return (
    <div className="project-meta">
      <span className="project-category">{project.industry}</span>
      <span className="project-type" data-proof={project.proofType}>
        {projectProofLabels[project.proofType]}
      </span>
    </div>
  );
}

export function ProjectStoryLink({
  project,
  entry,
}: {
  project: Project;
  entry: ProjectEntry;
}) {
  if (!project.detailUrl) return null;
  const label =
    project.proofType === "self-directed-demo"
      ? "Explore demo story"
      : "Read experience notes";
  return (
    <Link
      href={project.detailUrl}
      className="project-overview-link"
      aria-label={`${label} for ${project.title}`}
      {...projectLinkData(project.slug, entry, "story")}
    >
      {label} <Arrow diagonal />
    </Link>
  );
}

export function ProjectLiveLink({
  project,
  entry,
  className = "project-live-link",
}: {
  project: Project;
  entry: ProjectEntry;
  className?: string;
}) {
  const available = project.liveStatus !== "unavailable";
  return (
    <a
      className={className}
      href={project.liveUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${project.title} ${available ? "live website" : "original URL, currently unavailable"} (new tab)`}
      {...projectLinkData(project.slug, entry, available ? "live" : "source")}
    >
      {available ? "Live preview" : "Original URL"} <Arrow diagonal />
    </a>
  );
}
