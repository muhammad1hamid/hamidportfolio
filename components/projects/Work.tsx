"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  homepageProjects,
  projects,
  storyProjects,
  type Project,
} from "@/data/projects";
import { Arrow } from "@/components/ui/Arrow";
import { ProjectVisual } from "./ProjectVisual";
import { ProjectLiveLink, ProjectMeta, ProjectStoryLink } from "./ProjectLinks";
import { projectDetails } from "@/data/project-details";
import { projectLinkData } from "@/data/project-events";

const archiveFilters = [
  { label: "All work", projects },
  { label: "With stories", projects: storyProjects },
  {
    label: "Self-directed demos",
    projects: projects.filter(
      (project) => project.proofType === "self-directed-demo",
    ),
  },
  {
    label: "Portfolio previews",
    projects: projects.filter(
      (project) => project.proofType === "portfolio-preview",
    ),
  },
].filter((filter) => filter.projects.length > 0);

export function Work({ archive = false }: { archive?: boolean }) {
  const [filter, setFilter] = useState(archiveFilters[0]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const visible = archive ? filter.projects : homepageProjects;
  const entry = archive ? "work_archive" : "home_selected";
  const details = selected ? projectDetails[selected.id] : undefined;

  useEffect(() => {
    const preview = dialog.current;
    if (!selected || !preview || preview.open) return;
    preview.showModal();
    preview.scrollTop = 0;
    closeButton.current?.focus();
  }, [selected]);

  function open(project: Project, button: HTMLButtonElement) {
    trigger.current = button;
    setDevice(matchMedia("(max-width: 700px)").matches ? "mobile" : "desktop");
    setSelected(project);
  }

  return (
    <section
      id="work"
      className={`work-section wrap ${archive ? "archive-work" : "selected-work"}`}
      aria-label={archive ? "Project archive" : undefined}
      aria-labelledby={archive ? undefined : "work-title"}
    >
      {archive ? (
        <div className="archive-filter-row">
          <div
            className="filter-bar project-filters"
            role="group"
            aria-label="Filter projects by type"
          >
            {archiveFilters.map((item) => (
              <button
                type="button"
                key={item.label}
                onClick={() => setFilter(item)}
                aria-pressed={filter === item}
              >
                {item.label}
                <span>{item.projects.length}</span>
              </button>
            ))}
          </div>
          <span className="filter-count" role="status">
            {visible.length} projects
          </span>
        </div>
      ) : (
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
            <div className="selected-intro">
              <p>
                A closer look at the websites, digital experiences and decisions
                behind my work.
              </p>
              <Link className="project-overview-link" href="/work/">
                Explore all work <Arrow diagonal />
              </Link>
            </div>
          </div>
        </>
      )}

      <div
        className={archive ? "project-archive-grid" : "selected-project-grid"}
      >
        {visible.map((project, index) => (
          <article
            className="project project-entry"
            key={project.id}
            data-project={project.slug}
          >
            <button
              type="button"
              className="project-trigger"
              onClick={(event) => open(project, event.currentTarget)}
              aria-label={`View ${project.title} screenshots`}
              aria-haspopup="dialog"
              {...projectLinkData(project.slug, entry, "screens")}
            >
              <ProjectVisual
                project={project}
                eager={archive && index === 0}
                sizes={
                  archive
                    ? "(max-width: 560px) 88vw, (max-width: 1080px) 42vw, 400px"
                    : index === 0
                      ? "(max-width: 760px) 88vw, (max-width: 1440px) 59vw, 850px"
                      : undefined
                }
              />
              <span className="preview-badge">
                View screens <Arrow diagonal />
              </span>
            </button>
            <div className="project-entry-copy">
              <ProjectMeta project={project} />
              {archive ? <h2>{project.title}</h2> : <h3>{project.title}</h3>}
              <p className="project-hook">{project.description}</p>
              {!archive && project.proofType === "self-directed-demo" && (
                <p className="project-role">Website development by Hamid</p>
              )}
              {project.liveStatus === "unavailable" && (
                <p className="project-source-note">
                  Saved screenshots · Live website unavailable
                </p>
              )}
              <div className="project-entry-actions">
                <ProjectStoryLink project={project} entry={entry} />
                <ProjectLiveLink project={project} entry={entry} />
              </div>
            </div>
          </article>
        ))}
      </div>

      {!archive && (
        <Link href="/work/" className="archive-link" data-reveal>
          <strong>
            Explore all {projects.length} projects <Arrow diagonal />
          </strong>
          <span className="archive-link-note">The work archive</span>
        </Link>
      )}

      <dialog
        ref={dialog}
        data-lenis-prevent
        className="project-dialog"
        aria-labelledby="project-dialog-title"
        onClose={() => {
          setSelected(null);
          trigger.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        {selected && (
          <div className="project-dialog-inner">
            <button
              ref={closeButton}
              type="button"
              className="dialog-close"
              onClick={() => dialog.current?.close()}
              aria-label="Close project details"
            >
              Close ×
            </button>
            <div className="project-dialog-header">
              <ProjectMeta project={selected} />
              <h2 id="project-dialog-title">{selected.title}</h2>
            </div>
            <div
              className="preview-controls"
              role="group"
              aria-label="Website preview device"
            >
              <button
                type="button"
                aria-pressed={device === "desktop"}
                onClick={() => setDevice("desktop")}
              >
                Desktop
              </button>
              <button
                type="button"
                aria-pressed={device === "mobile"}
                onClick={() => setDevice("mobile")}
              >
                Mobile
              </button>
            </div>
            <div className="dialog-art dialog-site-preview">
              <ProjectVisual
                project={selected}
                device={device}
                sizes="(max-width: 640px) 86vw, 960px"
              />
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
                    {details.journey.map((step, index) => (
                      <li key={step}>
                        <span aria-hidden="true">{index + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {selected.liveStatus === "unavailable" && (
                <p className="project-source-note">
                  Live website unavailable. The captures show the saved design.
                </p>
              )}
              <div className="project-entry-actions">
                <ProjectStoryLink project={selected} entry={entry} />
                <ProjectLiveLink
                  project={selected}
                  entry={entry}
                  className="button button-light"
                />
              </div>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
