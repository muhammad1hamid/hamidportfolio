"use client";

import { useEffect, useRef, type ReactNode } from "react";

const portraitMotionQuery =
  "(min-width: 901px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)";

const pointerPosition = (value: number, start: number, size: number) =>
  Math.max(-1, Math.min(1, ((value - start) / size) * 2 - 1)).toFixed(3);

export function PortraitMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = ref.current;
    const hero = stage?.closest<HTMLElement>(".signature-hero");
    if (!stage || !hero || !("IntersectionObserver" in window)) return;
    const preference = matchMedia(portraitMotionQuery);
    let visible = false;
    let frame = 0;
    let pointer: { x: number; y: number; card: HTMLElement | null } | null =
      null;
    let tiltedCard: HTMLElement | null = null;
    let active = false;
    const resetCard = () => {
      tiltedCard?.style.removeProperty("--card-pointer-x");
      tiltedCard?.style.removeProperty("--card-pointer-y");
      tiltedCard = null;
    };
    const removePointer = () => {
      stage.style.removeProperty("--hero-pointer-x");
      stage.style.removeProperty("--hero-pointer-y");
      resetCard();
    };

    const render = () => {
      frame = 0;
      if (!active) return;
      const bounds = hero.getBoundingClientRect();
      if (pointer && !window.hamidOrigin && bounds.width && bounds.height) {
        stage.style.setProperty(
          "--hero-pointer-x",
          pointerPosition(pointer.x, bounds.left, bounds.width),
        );
        stage.style.setProperty(
          "--hero-pointer-y",
          pointerPosition(pointer.y, bounds.top, bounds.height),
        );
        const card = pointer.card?.matches(":hover") ? pointer.card : null;
        if (tiltedCard !== card) resetCard();
        const slot = card?.parentElement?.getBoundingClientRect();
        if (card && slot?.width && slot.height) {
          tiltedCard = card;
          card.style.setProperty(
            "--card-pointer-x",
            pointerPosition(pointer.x, slot.left, slot.width),
          );
          card.style.setProperty(
            "--card-pointer-y",
            pointerPosition(pointer.y, slot.top, slot.height),
          );
        }
      } else {
        removePointer();
      }
      const progress = Math.max(
        0,
        Math.min(1, -bounds.top / (bounds.height * 0.8)),
      );
      stage.style.setProperty("--hero-exit", progress.toFixed(3));
    };

    const schedule = () => {
      if (active && !frame) frame = requestAnimationFrame(render);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !active) return;
      pointer = {
        x: event.clientX,
        y: event.clientY,
        card:
          event.target instanceof Element
            ? event.target.closest<HTMLElement>(".hero-card")
            : null,
      };
      schedule();
    };
    const leave = () => {
      pointer = null;
      schedule();
    };
    const rest = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      pointer = null;
      removePointer();
      stage.style.removeProperty("--hero-exit");
    };
    const updateMotion = () => {
      active = preference.matches && visible && !document.hidden;
      stage.toggleAttribute("data-portrait-motion", active);
      if (active) schedule();
      else rest();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateMotion();
    });
    observer.observe(hero);
    hero.addEventListener("pointermove", move, { passive: true });
    hero.addEventListener("pointerleave", leave);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    preference.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateMotion);

    return () => {
      observer.disconnect();
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", leave);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      preference.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateMotion);
      stage.removeAttribute("data-portrait-motion");
      rest();
    };
  }, []);

  return (
    <div className="hero-composition wrap" ref={ref}>
      {children}
    </div>
  );
}
