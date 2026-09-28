"use client";

import Image from "next/image";
import { useRef } from "react";
import { Arrow } from "@/components/ui/Arrow";

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (
      e.pointerType !== "mouse" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const r = e.currentTarget.getBoundingClientRect();
    section.current?.style.setProperty(
      "--mx",
      `${((e.clientX - r.left) / r.width - 0.5) * 12}px`,
    );
    section.current?.style.setProperty(
      "--my",
      `${((e.clientY - r.top) / r.height - 0.5) * 8}px`,
    );
  };
  return (
    <section
      className="hero"
      ref={section}
      onPointerMove={onMove}
      onPointerLeave={() => {
        section.current?.style.setProperty("--mx", "0px");
        section.current?.style.setProperty("--my", "0px");
      }}
      aria-labelledby="hero-title"
    >
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-topline wrap">
        <span className="eyebrow">Independent developer & AI builder</span>
        <span className="eyebrow hero-coordinate">Pakistan ↗ Worldwide</span>
      </div>
      <div className="hero-body wrap">
        <div className="hero-copy">
          <h1 id="hero-title">
            I BUILD
            <br />
            WHAT’S <em>next.</em>
          </h1>
          <p>
            Distinctive web experiences.
            <br />
            Intelligent systems. Built with intent.
          </p>
          <a href="#contact" className="button button-light" data-magnetic>
            Let’s build something <Arrow diagonal />
          </a>
          <span className="hero-caption">
            For ambitious businesses & the agencies behind them.
          </span>
        </div>
        <div className="hero-portrait">
          <Image
            src="/images/hamid-hero.webp"
            alt="Hamid, web developer and AI automation builder"
            width={1000}
            height={1000}
            sizes="(max-width: 700px) 95vw, 55vw"
            priority
          />
          <span className="portrait-cross cross-one" aria-hidden="true">
            +
          </span>
          <span className="portrait-cross cross-two" aria-hidden="true">
            +
          </span>
          <div className="portrait-note">
            <span>HAMID</span>
            <span>Developer. Builder. Human.</span>
          </div>
        </div>
      </div>
      <div className="hero-bottom wrap">
        <a href="#story" className="scroll-link">
          <span className="scroll-track">
            <i />
          </span>
          Scroll to explore
        </a>
        <div className="hero-disciplines">
          <span>Web development</span>
          <span>AI automation</span>
          <span>Chatbot development</span>
        </div>
        <span className="hero-edition">
          PORTFOLIO — {new Date().getFullYear()}
        </span>
      </div>
      <span className="hero-watermark" aria-hidden="true">
        HAMID
      </span>
    </section>
  );
}
