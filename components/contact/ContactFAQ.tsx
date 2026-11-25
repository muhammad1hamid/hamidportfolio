"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { site } from "@/data/site";
import styles from "./ContactFAQ.module.css";

const questions = [
  {
    question: "Do I need a finished project brief?",
    answer:
      "Not at all. A rough idea, a few goals, or even just a problem you want to solve is enough. I’ll help you shape it into a clear and actionable plan.",
  },
  {
    question: "Can you improve an existing website?",
    answer:
      "Yes. I can review your existing website and help identify practical improvements to its design, performance, usability, search visibility, or functionality.",
  },
  {
    question: "Can we work together internationally?",
    answer:
      "Yes. I’m based in Pakistan and available for remote work worldwide. Communication, project planning and delivery can all be managed online.",
  },
  {
    question: "What happens after I send an enquiry?",
    answer:
      "I’ll review the information you share and discuss your goals, requirements and possible next steps. We’ll agree on a clear scope before starting any work.",
  },
] as const;

function EditorialCurve({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 480 220"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M-20 50H240C358 50 367 112 430 236"
        stroke="currentColor"
        strokeWidth="3"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function ContactFAQ() {
  const id = useId();
  const [active, setActive] = useState<number | null>(0);
  const [enhanced, setEnhanced] = useState(false);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => setEnhanced(true), []);

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next =
      event.key === "ArrowDown"
        ? (index + 1) % questions.length
        : event.key === "ArrowUp"
          ? (index + questions.length - 1) % questions.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? questions.length - 1
              : null;
    if (next !== null) {
      event.preventDefault();
      triggers.current[next]?.focus();
    }
  }

  return (
    <section
      className={styles.section}
      aria-labelledby={`${id}-title`}
      data-contact-faq=""
    >
      <div className={styles.darkPanel} aria-hidden="true">
        <EditorialCurve className={styles.curve} />
      </div>
      <div className={styles.inner}>
        <header className={styles.intro}>
          <div className={styles.mobileInk} aria-hidden="true">
            <EditorialCurve className={styles.curve} />
          </div>
          <span className={styles.eyebrow}>FAQ</span>
          <h2 className={styles.heading} id={`${id}-title`}>
            <span className={styles.headlineSans}>
              Everything <span>you need to</span>
            </span>{" "}
            <em>know.</em>
          </h2>
          <p className={styles.subtitle}>
            A few common questions
            <br />
            before you reach out.
          </p>
        </header>
        <div className={styles.list}>
          {questions.map(({ question, answer }, index) => {
            const open = active === index;
            const triggerId = `${id}-question-${index}`;
            const answerId = `${id}-answer-${index}`;
            return (
              <div className={styles.item} data-open={open} key={question}>
                <h3 className={styles.question}>
                  <button
                    className={styles.trigger}
                    id={triggerId}
                    type="button"
                    ref={(element) => {
                      triggers.current[index] = element;
                    }}
                    aria-expanded={enhanced ? open : undefined}
                    aria-controls={answerId}
                    disabled={!enhanced}
                    onClick={() =>
                      setActive((current) => (current === index ? null : index))
                    }
                    onKeyDown={(event) => moveFocus(event, index)}
                  >
                    <span className={styles.number} aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.separator} aria-hidden="true" />
                    <span className={styles.questionText}>{question}</span>
                    <svg
                      className={styles.control}
                      viewBox="0 0 28 28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d="M3 14H25" />
                      <path className={styles.plusStem} d="M14 3V25" />
                    </svg>
                  </button>
                </h3>
                <div
                  className={styles.panel}
                  id={answerId}
                  role="region"
                  aria-labelledby={triggerId}
                  aria-hidden={enhanced ? !open : undefined}
                  inert={enhanced && !open}
                >
                  <div className={styles.answerClip}>
                    <p className={styles.answer}>
                      {answer}
                      {index === 3 && (
                        <>
                          {" "}
                          You can also{" "}
                          <a href={`mailto:${site.email}`}>email me directly</a>
                          .
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <noscript>
        <style>{`.${styles.panel}{grid-template-rows:1fr!important;opacity:1!important}.${styles.answer}{transform:none!important}.${styles.control}{display:none!important}`}</style>
      </noscript>
    </section>
  );
}
