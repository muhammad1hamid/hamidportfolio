import Link from "next/link";
import { ResponsiveImage } from "@/components/seo/ResponsiveImage";
import { Arrow } from "@/components/ui/Arrow";
import { CapabilityCards } from "./CapabilityCards";
import { HeroDoodles, PortraitEyeBrush } from "./HeroArt";
import { PortraitMotion } from "./PortraitMotion";
import "@/app/hero.css";

const portrait = "/images/hamid-hero-warm.webp";

export function Hero() {
  return (
    <section className="hero signature-hero" aria-labelledby="hero-title">
      <HeroDoodles />
      <div className="hero-copy wrap">
        <p className="hero-eyebrow">
          Independent web developer · Digital growth builder
        </p>
        <h1 id="hero-title">
          <span className="hero-headline hero-title-line">Build. Grow.</span>{" "}
          <em className="hero-emphasis hero-title-line">Automate.</em>
        </h1>
        <p className="hero-description">
          I’m Hamid. I build distinctive websites, improve search visibility,
          and create practical AI systems for growing businesses.
        </p>
        <div className="hero-actions">
          <Link
            href="/contact/?source=home"
            className="button button-accent hero-primary"
            data-site-event="hero_primary_cta_click"
          >
            Discuss a project
            <span className="hero-primary-icon">
              <Arrow diagonal />
            </span>
          </Link>
          <Link
            href="/work/"
            prefetch={false}
            className="hero-secondary"
            data-site-event="hero_portfolio_cta_click"
          >
            Explore work <Arrow diagonal />
          </Link>
        </div>
      </div>

      <PortraitMotion>
        <HeroDoodles portrait />
        <div className="hero-scenery" aria-hidden="true">
          <span className="hero-watermark">HAMID</span>
          <svg className="hero-traces" viewBox="0 0 1165 453" fill="none">
            <path
              d="M293 122C425 148 387 246 589 267S790 254 836 193"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
        <div className="hero-portrait">
          <div className="hero-portrait-photo">
            <ResponsiveImage
              src={portrait}
              srcSet={`/images/responsive/hamid-hero-warm-320.webp 320w, /images/responsive/hamid-hero-warm-480.webp 480w, /images/responsive/hamid-hero-warm-640.webp 640w, /images/responsive/hamid-hero-warm-768.webp 768w, ${portrait} 1100w`}
              alt="Portrait of Hamid, independent web developer"
              width={1100}
              height={1100}
              sizes="(max-width: 767px) min(calc(118vw - 38px), 440px), (max-width: 1023px) 385px, clamp(390px, min(40vw, 70svh), 660px)"
              loading="eager"
              fetchPriority="high"
            />
            <PortraitEyeBrush />
          </div>
        </div>
        <CapabilityCards />
      </PortraitMotion>
    </section>
  );
}
