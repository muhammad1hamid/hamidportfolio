"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Arrow } from "@/components/ui/Arrow";
import { ExploreIcon } from "./ExploreIcon";
import { WorkflowPreview } from "./WorkflowPreview";
import styles from "./ExploreFurther.module.css";

const modes = [
  {
    id: "work",
    name: "Explore the work",
    description: "See real projects and how they come together.",
    icon: "layers",
  },
  {
    id: "brief",
    name: "Shape your brief",
    description: "Answer a few questions to define a clear scope.",
    icon: "brief",
  },
  {
    id: "enquiry",
    name: "Try an enquiry flow",
    description:
      "See how an enquiry can be captured, organised and responded to.",
    icon: "bolt",
  },
] as const;

export function ExploreWorkbench({
  work,
  brief,
}: {
  work: ReactNode;
  brief: ReactNode;
}) {
  const [active, setActive] = useState<(typeof modes)[number]["id"]>("enquiry");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const preview = useRef<HTMLDivElement>(null);
  const panels = [work, brief, <WorkflowPreview key="enquiry" />];

  useEffect(() => {
    const container = preview.current;
    if (!container || !window.IntersectionObserver) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          container.dataset.entered = "";
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case "ArrowDown":
        next = (index + 1) % modes.length;
        break;
      case "ArrowUp":
        next = (index + modes.length - 1) % modes.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = modes.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    setActive(modes[next].id);
    tabs.current[next]?.focus();
  }

  return (
    <div className={styles.workbench}>
      <div
        className={styles.tabs}
        role="tablist"
        aria-label="Before we build options"
        aria-orientation="vertical"
      >
        {modes.map(({ id, name, description, icon }, index) => {
          const tabId = `before-we-build-tab-${id}`;
          return (
            <button
              type="button"
              role="tab"
              key={id}
              id={tabId}
              className={styles.tab}
              ref={(element) => {
                tabs.current[index] = element;
              }}
              aria-selected={active === id}
              aria-controls={`before-we-build-panel-${id}`}
              aria-labelledby={`${tabId}-name`}
              aria-describedby={`${tabId}-description`}
              tabIndex={active === id ? 0 : -1}
              onClick={() => setActive(id)}
              onKeyDown={(event) => moveTab(event, index)}
            >
              <span className={styles.tabIcon}>
                <ExploreIcon name={icon} />
              </span>
              <span className={styles.tabCopy}>
                <span id={`${tabId}-name`} className={styles.tabName}>
                  {name}
                </span>
                <span
                  id={`${tabId}-description`}
                  className={styles.tabDescription}
                >
                  {description}
                </span>
              </span>
              <Arrow diagonal className={styles.tabArrow} />
            </button>
          );
        })}
      </div>

      <div className={styles.previews} ref={preview}>
        {modes.map(({ id }, index) => (
          <div
            role="tabpanel"
            key={id}
            id={`before-we-build-panel-${id}`}
            className={styles.panel}
            aria-labelledby={`before-we-build-tab-${id}`}
            hidden={active !== id}
            tabIndex={0}
          >
            {panels[index]}
          </div>
        ))}
      </div>

      <noscript>
        <div className={`related-links ${styles.related}`}>
          <a href="/case-studies/">Explore project walkthroughs</a>
          <a href="/plan/">Build your brief</a>
        </div>
      </noscript>
    </div>
  );
}
