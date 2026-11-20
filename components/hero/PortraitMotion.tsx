"use client";

import { useEffect, useRef, type ReactNode } from "react";

const portraitMotionQuery =
  "(min-width: 901px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none) and (update: fast)";

export function PortraitMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = ref.current;
    const hero = stage?.closest<HTMLElement>(".signature-hero");
    if (!stage || !hero || !("IntersectionObserver" in window)) return;
    const preference = matchMedia(portraitMotionQuery);
    let visible = false;
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let active = false;

    const rest = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      stage.style.removeProperty("--portrait-x");
      stage.style.removeProperty("--portrait-y");
    };

    const updateMotion = () => {
      active = preference.matches && visible && !document.hidden;
      stage.toggleAttribute("data-portrait-motion", active);
      if (!active) rest();
    };

    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !active) return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const bounds = hero.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        const horizontal =
          Math.min(1, Math.max(0, (pointerX - bounds.left) / bounds.width)) -
          0.5;
        const vertical =
          Math.min(1, Math.max(0, (pointerY - bounds.top) / bounds.height)) -
          0.5;
        stage.style.setProperty("--portrait-x", `${horizontal * 12}px`);
        stage.style.setProperty("--portrait-y", `${vertical * 8}px`);
      });
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateMotion();
    });
    observer.observe(stage);
    hero.addEventListener("pointermove", move, { passive: true });
    hero.addEventListener("pointerleave", rest);
    preference.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateMotion);

    return () => {
      observer.disconnect();
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", rest);
      preference.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateMotion);
      stage.removeAttribute("data-portrait-motion");
      rest();
    };
  }, []);

  return (
    <div className="hero-portrait" ref={ref}>
      <span className="hero-orbit" aria-hidden="true" />
      <div className="hero-portrait-frame">
        <div className="hero-portrait-photo">{children}</div>
      </div>
      <span className="hero-portrait-cross" aria-hidden="true">
        +
      </span>
      <span
        className="hero-portrait-cross hero-portrait-cross-lower"
        aria-hidden="true"
      >
        +
      </span>
    </div>
  );
}
