"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { categories, projects, type Project } from "@/data/projects";
import { Arrow } from "@/components/ui/Arrow";
import { ProjectVisual } from "./ProjectVisual";
import { projectDetails } from "@/data/project-details";

const homepageProjects = ["bridal-house", "ink-grail", "editing-julian", "elevate-x"]
  .map((id) => projects.find((project) => project.id === id))
  .filter((project) => project !== undefined);

export function Work({ archive = false }: { archive?: boolean }) {
  const [filter, setFilter] = useState<string>("All");
  const [selected, setSelected] = useState<Project | null>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const availableCategories = categories.filter(
    (category) =>
      category === "All" || projects.some((p) => p.category === category),
  );
  const details = selected ? projectDetails[selected.id] : undefined;
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const visible = (archive ? projects : homepageProjects).filter(
    (project) => filter === "All" || project.category === filter,
  );
  const placeholderCount = visible.filter(
    (p) => p.status === "placeholder",
  ).length;
  const hasPublished = projects.some((p) => p.status === "published");
  useEffect(() => {
    const previous = document.body.style.overflow;
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);
  const open = (project: Project, button: HTMLButtonElement) => {
    trigger.current = button;
    setSelected(project);
    setDevice(matchMedia("(max-width: 700px)").matches ? "mobile" : "desktop");
    dialog.current?.showModal();
    if (dialog.current) dialog.current.scrollTop = 0;
    document.body.style.overflow = "hidden";
  };
  const close = () => {
    dialog.current?.close();
    document.body.style.overflow = "";
    trigger.current?.focus();
  };
  return (
    <section
      id="work"
      className={`work-section wrap ${archive ? "archive-work" : ""}`}
      aria-label={archive ? "Project archive" : undefined}
      aria-labelledby={archive ? undefined : "work-title"}
    >
      {!archive && (
        <>
          <div className="section-marker" data-reveal>
            <span>Selected work</span>
          </div>
          <div className="section-heading work-heading" data-reveal>
            <h2 id="work-title">
              Different worlds.
              <br />
              <em>The same attention.</em>
            </h2>
            <p>
              Explore websites I’ve built and the decisions behind each
              experience.
            </p>
          </div>
        </>
      )}
      {archive && (
        <div
          className="filter-bar"
          role="group"
          aria-label="Filter projects by category"
        >
          {availableCategories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              aria-pressed={filter === category}
            >
              {category}
              <span>
                {category === "All"
                  ? projects.length
                  : projects.filter((p) => p.category === category).length}
              </span>
            </button>
          ))}
        </div>
      )}
      {(archive || placeholderCount > 0) && (
        <div className="work-notice">
          {placeholderCount > 0 && (
            <>
              <span className="notice-mark">↳</span>
              <p>
                {hasPublished
                  ? "More project stories are being prepared. Unpublished entries are marked as presentation previews."
                  : "Project stories are on their way. These are presentation previews, ready for the real work."}
              </p>
            </>
          )}
          {archive && (
            <span className="filter-count" role="status">
              {visible.length} {visible.length === 1 ? "entry" : "entries"}
            </span>
          )}
        </div>
      )}
      <div className={archive ? "archive-list" : "featured-grid"}>
        {visible.map((project, index) => (
          <article
            key={project.id}
            className={`project project-${project.visual} ${project.status === "published" ? "project-published" : ""}`}
          >
            <button
              className="project-trigger"
              data-cursor
              onClick={(e) => open(project, e.currentTarget)}
              aria-label={`View ${project.title} — ${project.status === "placeholder" ? "presentation preview" : project.category}`}
            >
              {archive && (
                <span className="archive-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
              )}
              <div className="project-media">
                <ProjectVisual project={project} animate={!archive} />
                <span className="preview-badge">
                  {project.status === "placeholder"
                    ? "Presentation preview"
                    : "Explore project"}{" "}
                  <Arrow diagonal />
                </span>
              </div>
              <div className="project-info">
                <div>
                  <span className="project-category">
                    {project.industry || project.category}
                    {project.year ? ` / ${project.year}` : ""}
                  </span>
                  {project.projectType && (
                    <span className="project-type">{project.projectType}</span>
                  )}
                  <h3>{project.title}</h3>
                </div>
                <Arrow diagonal />
              </div>
            </button>
            {project.status === "published" && (
              <div className="project-caption">
                {!archive && <p>{project.description}</p>}
                {projectDetails[project.id] && (
                  <Link
                    className="project-overview-link"
                    href={`/work/${project.slug}/`}
                  >
                    Experience notes ↗
                  </Link>
                )}
                {project.liveUrl && (
                  <a
                    className="project-live-link"
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${project.title} live website (new tab)`}
                  >
                    Live project <Arrow diagonal />
                  </a>
                )}
              </div>
            )}
          </article>
        ))}
        {visible.length === 0 && (
          <p className="empty-work">
            New work in this category is being prepared.
          </p>
        )}
      </div>
      {!archive && (
        <Link href="/work/" className="archive-link" data-reveal>
          <strong>
            View all website work <Arrow diagonal />
          </strong>
          <span className="archive-link-note">
            {projects.length} projects in the archive
          </span>
        </Link>
      )}
      <dialog
        ref={dialog}
        data-lenis-prevent
        className="project-dialog"
        aria-labelledby="project-dialog-title"
        onCancel={close}
        onClose={() => {
          document.body.style.overflow = "";
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {selected && (
          <div className="project-dialog-inner">
            <button
              className="dialog-close"
              autoFocus
              onClick={close}
              aria-label="Close project details"
            >
              Close ×
            </button>
            <div className="project-dialog-header">
              <span className="eyebrow">
                {selected.category}
                {selected.industry ? ` / ${selected.industry}` : ""}
                {selected.status === "placeholder"
                  ? " / Presentation preview"
                  : selected.year
                    ? ` / ${selected.year}`
                    : ""}
              </span>
              <h2 id="project-dialog-title">{selected.title}</h2>
            </div>
            {selected.mobileThumbnail && (
              <div
                className="preview-controls"
                role="group"
                aria-label="Website preview device"
              >
                <button
                  aria-pressed={device === "desktop"}
                  onClick={() => setDevice("desktop")}
                >
                  Desktop
                </button>
                <button
                  aria-pressed={device === "mobile"}
                  onClick={() => setDevice("mobile")}
                >
                  Mobile
                </button>
                <span>Website preview</span>
              </div>
            )}
            <div
              className={`dialog-art ${selected.status === "published" ? "dialog-site-preview" : ""}`}
            >
              <ProjectVisual project={selected} device={device} />
            </div>
            <div className="project-dialog-copy">
              <p>{selected.description}</p>
              {details && (
                <div className="project-story">
                  <div>
                    <h3>Inside the experience</h3>
                    <p>{details.idea}</p>
                  </div>
                  <div>
                    <h3>Details to explore</h3>
                    <ul>
                      {details.highlights.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <ol className="project-journey" aria-label="Visitor journey">
                    {details.journey.map((step, i) => (
                      <li key={step}>
                        <span>0{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {selected.status === "placeholder" && (
                <p className="placeholder-explanation">
                  This is an illustrative layout, not a published client
                  project. The real project name, imagery, and details will be
                  added here.
                </p>
              )}
              {selected.technologies.length > 0 && (
                <div className="project-tags">
                  {selected.technologies.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              )}
              {selected.liveUrl && (
                <a
                  href={selected.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button-light"
                >
                  Live project <Arrow diagonal />
                </a>
              )}
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
