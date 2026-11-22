"use client";

import Link from "next/link";
import { useState } from "react";
import { Arrow } from "@/components/ui/Arrow";
import { ExploreIcon } from "./ExploreIcon";
import styles from "./ExploreFurther.module.css";

const steps = [
  {
    label: "Capture",
    id: "capture",
    icon: "mail",
    summary: "An enquiry comes in.",
    detail: "“We need a new website for our studio. Can we talk next week?”",
    note: "Website form → new enquiry",
  },
  {
    label: "Organise",
    id: "organise",
    icon: "layers",
    summary: ["Website (business)", "Key requirements", "Proposed next steps"],
    detail:
      "Project: studio website · Next step: discovery call · Timing: next week",
    note: "Enquiry → organised lead",
  },
  {
    label: "Respond",
    id: "respond",
    icon: "bolt",
    summary: "A ready-to-send reply with a suggested approach and timeline.",
    detail:
      "“Thanks for reaching out. I’d love to hear about your studio. What day works for a quick call?”",
    note: "Draft reply → human approval",
  },
] as const;

export function WorkflowPreview() {
  const [active, setActive] = useState(0);
  return (
    <>
      <header className={styles.previewHeading}>
        <p className="eyebrow">A little less busywork</p>
        <h3>
          From an enquiry to a <em>clear handover.</em>
        </h3>
      </header>
      <div className={styles.workflow}>
        <ol
          className={styles.stages}
          role="list"
          aria-label="Explore example workflow steps"
        >
          {steps.map(({ id, label, icon, summary }, index) => (
            <li key={id} className={styles.stageItem} data-stage={id}>
              <button
                type="button"
                className={styles.stage}
                aria-pressed={active === index}
                aria-controls="workflow-example"
                aria-labelledby={`workflow-label-${id}`}
                aria-describedby={`workflow-summary-${id}`}
                onClick={() => setActive(index)}
              >
                <ExploreIcon name={icon} />
                <span id={`workflow-label-${id}`} className={styles.stageName}>
                  {label}
                </span>
                <span
                  id={`workflow-summary-${id}`}
                  className={styles.stageSummary}
                >
                  {typeof summary === "string"
                    ? summary
                    : summary.map((item) => (
                        <span className={styles.check} key={item}>
                          <ExploreIcon name="check" /> {item}
                        </span>
                      ))}
                </span>
              </button>
              {index < steps.length - 1 && (
                <span className={styles.connector} aria-hidden="true">
                  <Arrow />
                </span>
              )}
            </li>
          ))}
        </ol>
        <div
          id="workflow-example"
          className={styles.example}
          aria-live="polite"
          aria-atomic="true"
        >
          <span>{steps[active].note}</span>
          <p>{steps[active].detail}</p>
        </div>
      </div>
      <div className={styles.actions}>
        <p className={styles.disclaimer}>
          <ExploreIcon name="info" /> Interactive illustration · No data sent
        </p>
        <Link
          className={`button button-accent ${styles.cta}`}
          href="/demos/enquiry-assistant/"
          data-site-event="enquiry_demo_open"
        >
          Try the demonstration <Arrow diagonal />
        </Link>
      </div>
    </>
  );
}
