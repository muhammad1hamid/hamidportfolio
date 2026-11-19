"use client";

import { ResponsiveImage } from "@/components/seo/ResponsiveImage";
import { useRef } from "react";
import Link from "next/link";
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
      className="hero hero-v2"
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
        <span className="eyebrow">
          <i className="accent-dot" /> Hamid — Independent developer & digital
          growth builder
        </span>
      </div>
      <div className="hero-body wrap">
        <div className="hero-copy">
          <h1 id="hero-title">
            <span>Stand out online.</span> <em>Get found.</em>{" "}
            <span>Work smarter.</span>
          </h1>
          <p>
            I’m Hamid. I build distinctive websites, improve how businesses get
            discovered across search and AI, and create practical automations
            that make everyday work easier.
          </p>
          <div className="hero-actions">
            <Link
              href="/contact/"
              className="button button-accent"
              data-site-event="hero_primary_cta_click"
            >
              Discuss your project <Arrow diagonal />
            </Link>
            <Link
              href="/work/"
              className="hero-secondary"
              data-site-event="hero_portfolio_cta_click"
            >
              Explore selected work <Arrow diagonal />
            </Link>
          </div>
          <span className="hero-caption">
            Based in Pakistan · Working worldwide · Direct founder collaboration
          </span>
        </div>
        <div className="hero-portrait">
          <span className="portrait-orbit" aria-hidden="true" />
          <ResponsiveImage
            src="/images/hamid-hero.webp"
            alt="Portrait of Hamid"
            width={1000}
            height={1000}
            sizes="(max-width: 700px) 95vw, 55vw"
            loading="eager"
            fetchPriority="high"
          />
          <span className="portrait-cross cross-one" aria-hidden="true">
            +
          </span>
          <span className="portrait-cross cross-two" aria-hidden="true">
            +
          </span>
        </div>
      </div>
      <div className="hero-bottom wrap">
        <a href="#work" className="scroll-link">
          <span className="scroll-track">
            <i />
          </span>
          Selected work below
        </a>
      </div>
      <span className="hero-watermark" aria-hidden="true">
        HAMID
      </span>
    </section>
  );
}
