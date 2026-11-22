import type { ReactNode } from "react";
import { processMilestones } from "@/data/content";
import ScrollTimeline from "@/components/ui/scroll-timeline";

type Stage = (typeof processMilestones)[number]["id"];

const artifacts: Record<Stage, ReactNode> = {
  discover: (
    <>
      <rect x="19" y="13" width="73" height="57" rx="6" />
      <path d="M31 25h28M31 36h44M31 45h34M31 54h17" />
      <circle cx="84" cy="53" r="13" className="artifact-surface" />
      <path d="m94 63 10 9M79 53h10m-5-5v10" className="artifact-accent" />
    </>
  ),
  define: (
    <>
      <rect x="15" y="16" width="68" height="52" rx="6" />
      <path d="M27 28h29M40 42h28M40 54h22M83 42h18m-10 0v18h10m-10-18V24h10" />
      <path d="m26 42 3 3 5-6m-8 15 3 3 5-6" className="artifact-accent" />
      <circle cx="102" cy="24" r="2.5" />
      <circle cx="102" cy="42" r="2.5" className="artifact-accent" />
      <circle cx="102" cy="60" r="2.5" />
    </>
  ),
  build: (
    <>
      <rect x="12" y="15" width="96" height="56" rx="6" />
      <path d="M12 28h96M18 22h1m6 0h1m6 0h1M57 28v43" />
      <path
        d="m31 41-6 6 6 6m10-12 6 6-6 6m-6 5 4-22"
        className="artifact-accent"
      />
      <rect x="65" y="35" width="34" height="16" rx="2" />
      <path d="M65 58h14m5 0h15m-34 5h27" />
    </>
  ),
  check: (
    <>
      <rect x="14" y="18" width="71" height="44" rx="5" />
      <path d="M14 51h71M47 62v8m-14 0h28" />
      <rect
        x="77"
        y="33"
        width="27"
        height="41"
        rx="5"
        className="artifact-surface"
      />
      <path d="M88 66h5" />
      <path d="m27 35 4 4 7-8m9 4 4 4 7-8" className="artifact-accent" />
      <path d="m84 51 4 4 7-8" className="artifact-cyan" />
    </>
  ),
  launch: (
    <>
      <path d="M24 37V14h39l11 11v12m-11-23v12h11M34 27h17m-17 7h29" />
      <rect
        x="16"
        y="38"
        width="72"
        height="32"
        rx="5"
        className="artifact-surface"
      />
      <path d="M17 48h70M44 57h15" />
      <path d="m90 38 15-15m-11 0h11v11" className="artifact-accent" />
      <circle cx="51" cy="57" r="2.5" className="artifact-accent" />
    </>
  ),
};

export function Process() {
  return (
    <section className="process wrap" aria-labelledby="process-title">
      <div className="section-marker">
        <span>How we work</span>
      </div>
      <header className="process-heading">
        <h2 id="process-title">
          From idea to launch.
          <br />
          <em>Without the guesswork.</em>
        </h2>
        <p>
          A focused process, clear checkpoints, and direct collaboration from
          the first conversation to handover.
        </p>
      </header>
      <ScrollTimeline
        milestones={processMilestones.map((step) => ({
          ...step,
          visual: (
            <svg
              className="process-artifact"
              viewBox="0 0 120 84"
              focusable="false"
            >
              {artifacts[step.id]}
            </svg>
          ),
        }))}
      />
    </section>
  );
}
