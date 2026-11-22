import Link from "next/link";
import { ResponsiveImage } from "@/components/seo/ResponsiveImage";
import { Arrow } from "@/components/ui/Arrow";
import { CapabilityCards } from "./CapabilityCards";
import { PortraitMotion } from "./PortraitMotion";
import "@/app/hero.css";

const portrait = "/images/hamid-hero-warm.webp";

export function Hero() {
  return (
    <section className="hero signature-hero" aria-labelledby="hero-title">
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
        <div className="hero-scenery" aria-hidden="true">
          <span className="hero-watermark">HAMID</span>
          <svg className="hero-traces" viewBox="0 0 1000 420" fill="none">
            <path
              d="M164 134C251 161 218 252 372 257M805 154C744 182 762 270 632 277M312 340C389 332 407 288 465 283"
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
              sizes="(max-width: 479px) 88vw, (max-width: 767px) 416px, clamp(416px, 41vw, 704px)"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </div>
        <CapabilityCards />
      </PortraitMotion>

      <div className="hero-bottom wrap">
        <a href="#work" className="hero-work-cue">
          Selected work <Arrow />
        </a>
      </div>
    </section>
  );
}
