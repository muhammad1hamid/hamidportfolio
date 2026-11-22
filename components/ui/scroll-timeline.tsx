"use client";

import { useEffect, useRef, type ReactNode } from "react";
import "@/app/process-timeline.css";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  visual?: ReactNode;
}

interface TimelineProps {
  milestones: readonly Milestone[];
}

// Interaction reference: Scroll animated timeline by @ibrandify on 21st.dev.
export default function ScrollTimeline({ milestones }: TimelineProps) {
  const timeline = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = timeline.current;
    if (
      !root ||
      !("ResizeObserver" in window) ||
      !("IntersectionObserver" in window)
    )
      return;

    const steps = [...root.querySelectorAll<HTMLElement>(".timeline-step")];
    const nodes = [...root.querySelectorAll<HTMLElement>(".timeline-node")];
    if (!nodes.length) return;

    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const viewport = window.visualViewport;
    const revealed = new Set<Element>();
    let centers: number[] = [];
    let frame = 0;
    let needsMeasure = true;
    let lastProgress = -1;
    let lastActive = -2;

    const reveal = (step: Element) => {
      revealed.add(step);
      step.removeAttribute("data-entering");
      intersection.unobserve(step);
    };
    const intersection = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio >= 0.28) reveal(entry.target);
        }
      },
      { threshold: 0.28 },
    );

    const paint = () => {
      frame = 0;
      const top = root.getBoundingClientRect().top;
      const sightline =
        (viewport?.offsetTop ?? 0) +
        (viewport?.height ?? window.innerHeight) / 2;
      const position = sightline - top;
      if (needsMeasure) {
        centers = nodes.map((node) => {
          const box = node.getBoundingClientRect();
          return box.top + box.height / 2 - top;
        });
        root.style.setProperty("--timeline-start", `${centers[0]}px`);
        root.style.setProperty(
          "--timeline-length",
          `${centers[centers.length - 1] - centers[0]}px`,
        );
        needsMeasure = false;
      }

      const first = centers[0];
      const last = centers[centers.length - 1];
      const progress =
        last > first
          ? Math.min(1, Math.max(0, (position - first) / (last - first)))
          : 0;
      if (progress !== lastProgress) {
        root.style.setProperty("--timeline-progress", String(progress));
        lastProgress = progress;
      }

      // An index beyond the final node marks the complete rail.
      const next = centers.findIndex((center) => center > position);
      const current = next === -1 ? steps.length : next - 1;
      if (current !== lastActive) {
        steps.forEach((step, i) => {
          step.dataset.stage =
            i < current ? "complete" : i === current ? "active" : "upcoming";
          if (i <= current && !revealed.has(step)) reveal(step);
        });
        lastActive = current;
      }
    };

    const schedule = () => {
      if (motion.matches && !frame) frame = requestAnimationFrame(paint);
    };
    const refresh = () => {
      needsMeasure = true;
      schedule();
    };
    const resize = new ResizeObserver(refresh);
    resize.observe(root);
    steps.forEach((step) => resize.observe(step));

    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      intersection.disconnect();
      for (const step of steps) {
        step.removeAttribute("data-entering");
        step.removeAttribute("data-stage");
      }
      root.style.removeProperty("--timeline-start");
      root.style.removeProperty("--timeline-length");
      root.style.removeProperty("--timeline-progress");
      lastActive = -2;
      lastProgress = -1;
    };

    const syncMotion = () => {
      if (!motion.matches) {
        reset();
        return;
      }
      const viewportBottom =
        (viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight);
      for (const step of steps) {
        if (revealed.has(step)) continue;
        if (step.getBoundingClientRect().top < viewportBottom) {
          revealed.add(step);
        } else {
          step.setAttribute("data-entering", "");
          intersection.observe(step);
        }
      }
      refresh();
    };

    syncMotion();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", refresh);
    window.addEventListener("pageshow", refresh);
    viewport?.addEventListener("resize", refresh);
    motion.addEventListener("change", syncMotion);

    return () => {
      reset();
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("pageshow", refresh);
      viewport?.removeEventListener("resize", refresh);
      motion.removeEventListener("change", syncMotion);
    };
  }, [milestones]);

  return (
    <div className="scroll-timeline" ref={timeline}>
      <span className="timeline-fill" aria-hidden="true" />
      <ol className="timeline-steps" role="list">
        {milestones.map(({ id, title, description, visual }, index) => (
          <li className="timeline-step" key={id}>
            <span className="timeline-node" aria-hidden="true" />
            <div className="timeline-card">
              <div className="timeline-copy">
                <span className="timeline-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              {visual && (
                <div className="timeline-visual" aria-hidden="true">
                  {visual}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
