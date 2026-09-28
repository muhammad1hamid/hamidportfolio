"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { categories, projects, type Project } from "@/data/projects";
import { Arrow } from "@/components/ui/Arrow";
import { ProjectVisual } from "./ProjectVisual";

export function Work({ archive = false }: { archive?: boolean }) {
  const [filter, setFilter] = useState<string>("All");
  const [selected, setSelected] = useState<Project | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const visible = projects.filter(
    (p) =>
      (archive || p.featured) && (filter === "All" || p.category === filter),
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
    dialog.current?.showModal();
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
            <span>02 / Selected work</span>
            <span>A few things worth a closer look</span>
          </div>
          <div className="section-heading work-heading" data-reveal>
            <h2 id="work-title">
              Built with care.
              <br />
              <em>Down to the detail.</em>
            </h2>
            <p>
              Web experiences. Connected systems.
              <br />A place for the work to speak.
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
          {categories.map((category) => (
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
      <div className={archive ? "archive-list" : "featured-grid"}>
        {visible.map((project, index) => (
          <article
            key={project.id}
            className={`project project-${project.visual}`}
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
                <ProjectVisual project={project} />
                <span className="preview-badge">
                  {project.status === "placeholder"
                    ? "Presentation preview"
                    : "View project"}{" "}
                  <Arrow diagonal />
                </span>
              </div>
              <div className="project-info">
                <div>
                  <span className="project-category">
                    {project.category}
                    {project.year ? ` / ${project.year}` : ""}
                  </span>
                  <h3>{project.title}</h3>
                </div>
                <Arrow diagonal />
              </div>
            </button>
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
          <span>More to discover.</span>
          <strong>
            Explore all work <Arrow diagonal />
          </strong>
          <span className="archive-link-note">The project archive</span>
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
            <div className="dialog-art">
              <ProjectVisual project={selected} />
            </div>
            <div className="project-dialog-copy">
              <span className="eyebrow">
                {selected.category} /{" "}
                {selected.status === "placeholder"
                  ? "Presentation preview"
                  : selected.year}
              </span>
              <h2 id="project-dialog-title">{selected.title}</h2>
              <p>{selected.description}</p>
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
