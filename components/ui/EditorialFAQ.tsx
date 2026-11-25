"use client";

import Link from "next/link";
import {
  Fragment,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import styles from "./EditorialFAQ.module.css";

export type EditorialFAQItem = {
  question: string;
  answer: ReactNode;
  id?: string;
  group?: string;
  groupId?: string;
  links?: readonly {
    href: string;
    label: string;
    ariaLabel?: string;
  }[];
};

type Props = {
  items: readonly EditorialFAQItem[];
  context: string;
  id?: string;
  titleId?: string;
  subtitle?: ReactNode;
};

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

export function EditorialFAQ({
  items,
  context,
  id: sectionId,
  titleId,
  subtitle,
}: Props) {
  const id = useId();
  const [active, setActive] = useState<number | null>(0);
  const [enhanced, setEnhanced] = useState(false);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const section = useRef<HTMLElement | null>(null);

  useEffect(() => setEnhanced(true), []);

  // Published answer/topic fragments remain meaningful after the shared redesign.
  useEffect(() => {
    if (!items.some((item) => item.id || item.groupId)) return;
    let cancelled = false;
    let frame = 0;
    function revealLinkedAnswer() {
      let targetId = "";
      try {
        targetId = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return;
      }
      if (!targetId) return;
      const index = items.findIndex(
        (item) => item.id === targetId || item.groupId === targetId,
      );
      if (index < 0) return;
      setActive(index);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(async () => {
        const animations =
          section.current?.getAnimations({ subtree: true }) ?? [];
        await Promise.all(
          animations.map((animation) => animation.finished.catch(() => {})),
        );
        if (cancelled) return;
        let currentId = "";
        try {
          currentId = decodeURIComponent(window.location.hash.slice(1));
        } catch {
          return;
        }
        if (currentId === targetId)
          document
            .getElementById(targetId)
            ?.scrollIntoView({ block: "start", behavior: "instant" });
      });
    }
    revealLinkedAnswer();
    window.addEventListener("hashchange", revealLinkedAnswer);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", revealLinkedAnswer);
    };
  }, [items]);

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next =
      event.key === "ArrowDown"
        ? (index + 1) % items.length
        : event.key === "ArrowUp"
          ? (index + items.length - 1) % items.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? items.length - 1
              : null;
    if (next !== null) {
      event.preventDefault();
      triggers.current[next]?.focus();
    }
  }

  if (!items.length) return null;

  return (
    <section
      ref={section}
      id={sectionId}
      className={styles.section}
      aria-labelledby={titleId ?? `${id}-title`}
      data-editorial-faq={context}
      data-contact-faq={context === "contact" ? "" : undefined}
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
          <h2 className={styles.heading} id={titleId ?? `${id}-title`}>
            <span className={styles.headlineSans}>
              Everything <span>you need to</span>
            </span>{" "}
            <em>know.</em>
          </h2>
          <p className={styles.subtitle}>
            {subtitle ?? (
              <>
                A few common questions
                <br />
                before you reach out.
              </>
            )}
          </p>
        </header>
        <div className={styles.list}>
          {items.map(
            (
              { question, answer, id: itemId, group, groupId, links },
              index,
            ) => {
              const open = active === index;
              const triggerId = `${id}-question-${index}`;
              const answerId = `${id}-answer-${index}`;
              const QuestionHeading = group ? "h4" : "h3";
              return (
                <Fragment key={itemId ?? question}>
                  {groupId && (
                    <h3 className={styles.groupTitle} id={groupId}>
                      {group}
                    </h3>
                  )}
                  <div
                    className={styles.item}
                    id={itemId}
                    data-faq-item=""
                    data-faq-group={group}
                    data-open={open}
                    data-links={Boolean(links?.length)}
                  >
                    <QuestionHeading className={styles.question}>
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
                          setActive((current) =>
                            current === index ? null : index,
                          )
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
                    </QuestionHeading>
                    <div
                      className={styles.panel}
                      id={answerId}
                      role="region"
                      aria-labelledby={triggerId}
                      aria-hidden={enhanced ? !open : undefined}
                      inert={enhanced && !open}
                    >
                      <div className={styles.answerClip}>
                        <p className={styles.answer}>{answer}</p>
                        {Boolean(links?.length) && (
                          <div className={styles.answerLinks}>
                            {links?.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                aria-label={link.ariaLabel}
                              >
                                {link.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Fragment>
              );
            },
          )}
        </div>
      </div>
      <noscript>
        <style>{`.${styles.panel}{grid-template-rows:1fr!important;opacity:1!important}.${styles.answer}{transform:none!important}.${styles.control}{display:none!important}`}</style>
      </noscript>
    </section>
  );
}
