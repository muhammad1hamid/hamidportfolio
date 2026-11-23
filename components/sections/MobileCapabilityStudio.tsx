"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { capabilityShowcase } from "@/data/capability-showcase";
import { Arrow } from "@/components/ui/Arrow";
import { CapabilityIcon, CapabilityMedia } from "./CapabilityMedia";
import styles from "./MobileCapabilityStudio.module.css";

export function MobileCapabilityStudio() {
  const [active, setActive] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = useRef(true);
  const pending = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frame = useRef(0);

  const goTo = useCallback((index: number) => {
    const element = track.current;
    const slides = element?.querySelectorAll<HTMLElement>(
      "[data-capability-slide]",
    );
    if (!element || !slides?.[index]) return;
    pending.current = index;
    setActive(index);
    element.scrollTo({
      left: slides[index].offsetLeft - slides[0].offsetLeft,
      behavior: reduced.current ? "instant" : "smooth",
    });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      pending.current = null;
    }, 650);
  }, []);

  useEffect(() => {
    setEnhanced(true);
    const element = track.current;
    if (!element) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = matchMedia("(max-width: 767px)");
    const updateMotion = () => {
      reduced.current = motion.matches;
    };
    updateMotion();
    motion.addEventListener("change", updateMotion);
    const sync = () => {
      if (pending.current !== null) return;
      const slides = [
        ...element.querySelectorAll<HTMLElement>("[data-capability-slide]"),
      ];
      const first = slides[0]?.offsetLeft || 0;
      const closest = slides.reduce(
        (best, slide, index) =>
          Math.abs(slide.offsetLeft - first - element.scrollLeft) <
          Math.abs(slides[best].offsetLeft - first - element.scrollLeft)
            ? index
            : best,
        0,
      );
      setActive(closest);
    };
    const scroll = () => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(sync);
    };
    const settled = () => {
      pending.current = null;
      sync();
    };
    const interrupt = () => {
      pending.current = null;
      if (timer.current) clearTimeout(timer.current);
    };
    element.addEventListener("scroll", scroll, { passive: true });
    element.addEventListener("scrollend", settled);
    element.addEventListener("pointerdown", interrupt, { passive: true });
    element.addEventListener("touchstart", interrupt, { passive: true });
    const resize = new ResizeObserver(() => {
      if (!mobile.matches) return;
      const slides = [
        ...element.querySelectorAll<HTMLElement>("[data-capability-slide]"),
      ];
      const selected = Number(element.dataset.active || 0);
      if (slides[selected])
        element.scrollTo({
          left: slides[selected].offsetLeft - slides[0].offsetLeft,
          behavior: "instant",
        });
    });
    resize.observe(element);
    return () => {
      resize.disconnect();
      cancelAnimationFrame(frame.current);
      if (timer.current) clearTimeout(timer.current);
      motion.removeEventListener("change", updateMotion);
      element.removeEventListener("scroll", scroll);
      element.removeEventListener("scrollend", settled);
      element.removeEventListener("pointerdown", interrupt);
      element.removeEventListener("touchstart", interrupt);
    };
  }, []);

  const key = (event: KeyboardEvent, from: number, focusSelector: boolean) => {
    let next: number;
    if (event.key === "ArrowRight")
      next = Math.min(capabilityShowcase.length - 1, from + 1);
    else if (event.key === "ArrowLeft") next = Math.max(0, from - 1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = capabilityShowcase.length - 1;
    else return;
    event.preventDefault();
    goTo(next);
    if (focusSelector) buttons.current[next]?.focus({ preventScroll: true });
    else track.current?.focus({ preventScroll: true });
  };

  return (
    <div
      className={styles.studio}
      data-capability-studio
      data-enhanced={enhanced}
    >
      <div
        className={styles.selectors}
        role="group"
        aria-label="Choose a capability"
      >
        {capabilityShowcase.map((item, index) => (
          <button
            key={item.id}
            type="button"
            ref={(el) => {
              buttons.current[index] = el;
            }}
            className={styles.selector}
            aria-pressed={active === index}
            aria-controls="capability-showcase"
            disabled={!enhanced}
            onClick={() => goTo(index)}
            onKeyDown={(event) => key(event, index, true)}
          >
            <CapabilityIcon id={item.id} />
            <span>
              {item.title.split(" ")[0]}
              <br /> {item.title.split(" ").slice(1).join(" ")}
            </span>
            <span className={styles.selectedMark} aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none">
                <path
                  d="m4 8 3 3 5-6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
        ))}
      </div>
      <div
        className={styles.showcase}
        role="region"
        aria-roledescription="carousel"
        aria-label="Capability showcase"
      >
        <div
          id="capability-showcase"
          ref={track}
          className={styles.track}
          data-active={active}
          tabIndex={0}
          onKeyDown={(event) => key(event, active, false)}
        >
          {capabilityShowcase.map((item, index) => (
            <article
              key={item.id}
              className={styles.slide}
              data-capability-slide={item.id}
              inert={enhanced && active !== index}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${capabilityShowcase.length}: ${item.title}`}
            >
              <h3 className={styles.slideTitle}>
                <CapabilityIcon id={item.id} />
                {item.title}
              </h3>
              <div className={styles.media}>
                <CapabilityMedia id={item.id} />
              </div>
              <div className={styles.slideCopy}>
                <p>{item.description}</p>
                <ul
                  className={styles.tags}
                  aria-label={`${item.title} focus areas`}
                >
                  {item.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <div className={styles.actions}>
                  <Link
                    href={item.primary.href}
                    prefetch={false}
                    className={styles.primary}
                    data-site-event="service_pillar_click"
                    data-site-pillar={item.id}
                  >
                    {item.primary.label}
                    <Arrow />
                  </Link>
                  {item.secondary && (
                    <Link
                      href={item.secondary.href}
                      prefetch={false}
                      className={styles.secondary}
                      data-site-event="service_pillar_click"
                      data-site-pillar={item.id}
                    >
                      {item.secondary.label}
                      <Arrow diagonal />
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}
          <span className={styles.endSpace} aria-hidden="true" />
        </div>
        <div className={styles.pagination} aria-hidden="true">
          {capabilityShowcase.map((item, index) => (
            <span key={item.id} data-active={active === index} />
          ))}
        </div>
        <p
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {enhanced
            ? `${capabilityShowcase[active].title}, ${active + 1} of 4`
            : "Swipe through four capabilities and their service links."}
        </p>
      </div>
    </div>
  );
}
