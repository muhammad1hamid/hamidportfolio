"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export function Experience() {
  const [intro, setIntro] = useState(false);
  const cursor = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (!sessionStorage.getItem("hamid-intro")) {
        setIntro(true);
        sessionStorage.setItem("hamid-intro", "seen");
      }
    } catch {
      /* Content works without storage. */
    }
    const timer = window.setTimeout(() => setIntro(false), 2450);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const lenis = new Lenis({
        duration: 0.9,
        smoothWheel: true,
        anchors: { offset: -88 },
        prevent: (node) => Boolean(node.closest("dialog")),
      });
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      const context = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.from(el, {
            y: 36,
            autoAlpha: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 94%", once: true },
          });
        });
        gsap.utils.toArray<HTMLElement>(".story-line").forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0.22 },
            {
              opacity: 1,
              scrollTrigger: {
                trigger: el,
                start: "top 80%",
                end: "top 44%",
                scrub: true,
              },
            },
          );
        });
        if (document.querySelector(".process-progress"))
          gsap.fromTo(
            ".process-progress",
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: "none",
              scrollTrigger: {
                trigger: ".process",
                start: "top 80%",
                end: "bottom 55%",
                scrub: true,
              },
            },
          );
      });
      const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 500);
      return () => {
        clearTimeout(refresh);
        context.revert();
        lenis.destroy();
        gsap.ticker.remove(tick);
      };
    });
    return () => media.revert();
  }, [pathname]);

  useEffect(() => {
    const query = matchMedia(
      "(pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    if (!query.matches) return;
    let x = -100,
      y = -100,
      cx = -100,
      cy = -100,
      frame = 0;
    const move = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
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
    };
    const render = () => {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      if (cursor.current)
        cursor.current.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      frame = requestAnimationFrame(render);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", leave);
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <>
      {intro && (
        <div className="signature-intro" aria-hidden="true">
          <div className="intro-kicker">An independent point of view.</div>
          <div className="intro-name">
            {"HAMID".split("").map((letter, i) => (
              <span style={{ animationDelay: `${i * 70}ms` }} key={letter}>
                {letter}
              </span>
            ))}
          </div>
          <div className="intro-line" />
          <div className="intro-bottom">
            <span>Craft × Code × Intelligence</span>
            <span>01 — Ready to build</span>
          </div>
        </div>
      )}
      <div ref={cursor} className="cursor" aria-hidden="true">
        <span>VIEW ↗</span>
      </div>
    </>
  );
}
