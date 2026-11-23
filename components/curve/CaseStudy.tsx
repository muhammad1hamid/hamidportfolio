"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  ProjectLiveLink,
  ProjectStoryLink,
} from "@/components/projects/ProjectLinks";
import type { CorridorProject } from "./projects";
import type { CoverRect } from "./geometry";
import gsap from "gsap";

export type StoryHandle = { returnToCover: () => Promise<void> };
function CoverContent({
  project,
  rect,
  source,
  returning = false,
}: {
  project: CorridorProject;
  rect: CoverRect;
  source: string;
  returning?: boolean;
}) {
  return (
    <>
      <img
        className={returning ? "curve-return-cover" : "curve-shared-cover"}
        style={{
          left: `calc(${rect.x}px - var(--curve-story-inset) - 1px)`,
          top: `calc(${rect.y}px - var(--curve-story-inset) - 1px)`,
          width: rect.width,
          height: rect.height,
        }}
        src={source}
        alt={returning ? "" : project.thumbnailAlt}
        width={960}
        height={Math.round(960 / project.imageAspect)}
      />
      <div
        className="curve-cover-copy"
        style={{
          top: `calc(${rect.y + rect.height + 22}px - var(--curve-story-inset))`,
        }}
      >
        <p>
          {project.industry} · {project.typeLabel}
        </p>
        <h2>{project.title}</h2>
        <p>{project.description}</p>
      </div>
    </>
  );
}
export const CaseStudy = forwardRef<
  StoryHandle,
  {
    project: CorridorProject;
    rect: CoverRect;
    closing: boolean;
    close: () => void;
    listView: () => void;
    coverSource: string;
  }
>(function CaseStudy(
  { project, rect, closing, close, listView, coverSource },
  ref,
) {
  const track = useRef<HTMLDivElement>(null);
  const returnLayer = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState(0);
  const chapterRef = useRef(0);
  const animation = useRef<gsap.core.Tween | null>(null);
  const notes = project.notes;
  const count = notes ? notes.decisions.length + 4 : 3;
  const cover = `/images/curve/${project.id}-960.webp`;

  useImperativeHandle(
    ref,
    () => ({
      returnToCover: async () => {
        const el = track.current;
        if (!el) return;
        animation.current?.kill();
        if (el.scrollLeft < 1) return;
        const layer = returnLayer.current;
        if (!layer) return;
        el.style.scrollSnapType = "none";
        // Bring the cover back in one chapter-length movement, independent of
        // how many chapters the visitor has explored. The scene then contracts it.
        layer.style.visibility = "visible";
        await new Promise<void>((resolve) => {
          animation.current = gsap.fromTo(
            layer,
            { xPercent: 100 },
            {
              xPercent: 0,
              duration: 0.5,
              ease: "power3.inOut",
              onComplete: resolve,
              onInterrupt: resolve,
            },
          );
        });
      },
    }),
    [],
  );

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || closing) return;
      const copy = (event.target as Element).closest<HTMLElement>(
        ".curve-chapter-copy",
      );
      if (
        copy &&
        copy.scrollHeight > copy.clientHeight + 1 &&
        ((event.deltaY > 0 &&
          copy.scrollTop + copy.clientHeight < copy.scrollHeight - 1) ||
          (event.deltaY < 0 && copy.scrollTop > 0))
      )
        return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      const unit =
        event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? el.clientWidth : 1;
      el.scrollLeft += Math.max(-600, Math.min(600, event.deltaY * unit));
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", wheel);
    };
  }, [closing]);
  useEffect(
    () => () => {
      animation.current?.kill();
    },
    [],
  );
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const resize = new ResizeObserver(() => {
      el.scrollTo({
        left: chapterRef.current * el.clientWidth,
        behavior: "instant",
      });
    });
    resize.observe(el);
    return () => resize.disconnect();
  }, []);

  function go(index: number) {
    if (closing) return;
    track.current?.scrollTo({
      left:
        Math.max(0, Math.min(count - 1, index)) *
        (track.current?.clientWidth ?? 0),
      behavior: "smooth",
    });
  }
  return (
    <div
      className="curve-story"
      data-closing={closing}
      onKeyDown={(event) => {
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement ||
          event.ctrlKey ||
          event.metaKey
        )
          return;
        if (
          ["ArrowRight", "ArrowLeft", "PageDown", "PageUp"].includes(event.key)
        ) {
          event.preventDefault();
          go(
            chapter + (["ArrowRight", "PageDown"].includes(event.key) ? 1 : -1),
          );
        }
      }}
    >
      <header className="curve-story-header">
        <span>{project.title}</span>
        <button className="curve-story-list" onClick={listView}>
          List view
        </button>
        <button
          className="curve-story-close"
          onClick={close}
          disabled={closing}
        >
          Close project <span aria-hidden="true">×</span>
        </button>
      </header>
      <div
        className="curve-story-track"
        ref={track}
        tabIndex={0}
        aria-label={`${project.title} project chapters`}
        onScroll={(event) => {
          const index = Math.round(
            event.currentTarget.scrollLeft / event.currentTarget.clientWidth,
          );
          chapterRef.current = index;
          setChapter(index);
        }}
      >
        <section
          className="curve-chapter curve-cover-chapter"
          aria-label="Project identity"
        >
          <CoverContent project={project} rect={rect} source={coverSource} />
        </section>
        {notes && (
          <section className="curve-chapter">
            <div className="curve-chapter-media">
              <img src={cover} alt={project.thumbnailAlt} loading="lazy" />
            </div>
            <div className="curve-chapter-copy">
              <span className="curve-eyebrow">Context</span>
              <h2>Inside the experience.</h2>
              <p>{notes.idea}</p>
              <ul>
                {notes.highlights.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </div>
          </section>
        )}
        {notes?.decisions.map((decision) => (
          <section className="curve-chapter" key={decision.title}>
            <div className="curve-chapter-media">
              <img src={cover} alt={project.thumbnailAlt} loading="lazy" />
            </div>
            <div className="curve-chapter-copy">
              <span className="curve-eyebrow">Design decision</span>
              <h2>{decision.title}</h2>
              <p>{decision.reason}</p>
              <p>{decision.implementation}</p>
              <p className="curve-inspect">{decision.inspect}</p>
            </div>
          </section>
        ))}
        <section className="curve-chapter">
          <div className="curve-chapter-media curve-device-pair">
            <img src={cover} alt={project.thumbnailAlt} loading="lazy" />
            <img
              className="curve-phone-capture"
              src={project.mobileThumbnail}
              alt={`Mobile screenshot of ${project.title}`}
              loading="lazy"
            />
          </div>
          <div className="curve-chapter-copy">
            <span className="curve-eyebrow">Desktop & mobile</span>
            <h2>Across screens.</h2>
            {notes ? (
              <>
                <p>{notes.desktop}</p>
                <p>{notes.mobile}</p>
              </>
            ) : (
              <p>
                Explore the saved desktop and mobile captures of {project.title}
                .
              </p>
            )}
          </div>
        </section>
        <section className="curve-chapter curve-final-chapter">
          <div className="curve-chapter-copy">
            <span className="curve-eyebrow">{project.typeLabel}</span>
            <h2>Take a closer look.</h2>
            <p>{notes?.evidence ?? project.description}</p>
            {project.liveStatus === "unavailable" && (
              <p>
                The live website is currently unavailable. These are the saved
                interface captures.
              </p>
            )}
            <div className="curve-story-links">
              <ProjectStoryLink project={project} entry="work_archive" />
              <ProjectLiveLink project={project} entry="work_archive" />
              <a href={`/contact/?source=project&project=${project.slug}`}>
                Discuss a similar project
              </a>
            </div>
            <button className="button button-light" onClick={close}>
              Return to the corridor
            </button>
          </div>
        </section>
      </div>
      <div className="curve-return-layer" ref={returnLayer} aria-hidden="true">
        <CoverContent
          project={project}
          rect={rect}
          source={coverSource}
          returning
        />
      </div>
      <footer className="curve-story-controls">
        <button
          onClick={() => go(chapter - 1)}
          disabled={chapter === 0 || closing}
          aria-label="Previous chapter"
        >
          ←
        </button>
        <span aria-live="polite">
          {String(chapter + 1).padStart(2, "0")} /{" "}
          {String(count).padStart(2, "0")}
        </span>
        <div className="curve-chapter-progress" aria-hidden="true">
          <i style={{ width: `${((chapter + 1) / count) * 100}%` }} />
        </div>
        <button
          onClick={() => go(chapter + 1)}
          disabled={chapter === count - 1 || closing}
          aria-label="Next chapter"
        >
          →
        </button>
      </footer>
    </div>
  );
});
