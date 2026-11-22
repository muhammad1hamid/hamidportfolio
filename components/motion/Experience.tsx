"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useNavigationMotion } from "./useNavigationMotion";

export function Experience() {
  const cursor = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const routeVeil = useNavigationMotion(pathname);
  useEffect(() => {
    if (pathname.replace(/\/$/, "") === "/work") return;
    if (!document.querySelector("[data-reveal]")) return;
    const query = matchMedia(
      "(min-width: 901px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let disposed = false;
    let generation = 0;
    let cleanup: (() => void) | undefined;
    let idle: number | undefined;
    let timer: number | undefined;
    const originSignal = window.hamidOrigin?.signal;
    const cancel = () => {
      generation++;
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) window.clearTimeout(timer);
      cleanup?.();
      cleanup = undefined;
    };
    const schedule = () => {
      cancel();
      if (!query.matches || disposed || (originSignal && !originSignal.aborted))
        return;
      const current = generation;
      const start = () => {
        import("./scroll-experience")
          .then((module) => {
            if (!disposed && query.matches && current === generation)
              cleanup = module.startScrollExperience();
          })
          .catch(() => {
            /* Native scrolling and visible content remain available. */
          });
      };
      if ("requestIdleCallback" in window)
        idle = window.requestIdleCallback(start, { timeout: 1800 });
      else timer = setTimeout(start, 350) as unknown as number;
    };
    schedule();
    query.addEventListener("change", schedule);
    originSignal?.addEventListener("abort", schedule, { once: true });
    return () => {
      disposed = true;
      cancel();
      query.removeEventListener("change", schedule);
      originSignal?.removeEventListener("abort", schedule);
    };
  }, [pathname]);

  useEffect(() => {
    const query = matchMedia(
      "(pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let x = -100,
      y = -100,
      cx = -100,
      cy = -100,
      frame = 0;
    const move = (e: MouseEvent) => {
      if (!query.matches) return;
      x = e.clientX;
      y = e.clientY;
      if (!frame) frame = requestAnimationFrame(render);
      if (cursor.current) {
        cursor.current.style.opacity = "1";
        const target = (e.target as HTMLElement).closest(
          "[data-cursor], a, button, summary",
        );
        cursor.current.dataset.mode = target?.hasAttribute("data-cursor")
          ? "view"
          : target
            ? "link"
            : "default";
      }
    };
    const leave = () => {
      if (cursor.current) cursor.current.style.opacity = "0";
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const render = () => {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      if (cursor.current)
        cursor.current.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      frame =
        Math.abs(x - cx) + Math.abs(y - cy) > 0.1
          ? requestAnimationFrame(render)
          : 0;
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", leave);
    query.addEventListener("change", leave);
    document.addEventListener("visibilitychange", leave);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
      query.removeEventListener("change", leave);
      document.removeEventListener("visibilitychange", leave);
    };
  }, []);

  return (
    <>
      <div ref={routeVeil} className="origin-route-veil" aria-hidden="true" />
      <div ref={cursor} className="cursor" aria-hidden="true">
        <span>VIEW ↗</span>
      </div>
    </>
  );
}
