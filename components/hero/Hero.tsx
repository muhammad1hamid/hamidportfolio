import Link from "next/link";
import { ResponsiveImage } from "@/components/seo/ResponsiveImage";
import { Arrow } from "@/components/ui/Arrow";
import { PortraitMotion } from "./PortraitMotion";
import "@/app/hero.css";

const portrait = "/images/hamid-hero-warm.webp";

export function Hero() {
  return (
    <section className="hero signature-hero" aria-labelledby="hero-title">
      <div className="hero-backdrop" aria-hidden="true">
        <span className="hero-watermark">HAMID</span>
      </div>
      <div className="hero-body wrap">
        <div className="hero-copy">
          <p className="hero-eyebrow">
            <span className="hero-desktop">
              Hamid — Independent developer &amp; digital growth builder
            </span>
            <span className="hero-mobile">
              <span className="hero-eyebrow-prefix">Independent </span>
              developer &amp; digital growth builder
            </span>
          </p>
          <h1 id="hero-title">
            <span className="hero-desktop">
              <span className="hero-headline hero-title-line">
                Stand out online.
              </span>{" "}
              <em className="hero-emphasis hero-title-line">Get found.</em>{" "}
              <span className="hero-headline-end hero-title-line">
                Work smarter.
              </span>
            </span>{" "}
            <span className="hero-mobile">
              <span className="hero-headline hero-title-line">
                Build. Grow.
              </span>{" "}
              <em className="hero-emphasis hero-title-line">Automate.</em>
            </span>
          </h1>
          <p className="hero-description">
            <span className="hero-desktop">
              I’m Hamid. I build distinctive websites, improve how businesses
              get discovered across search and AI, and create practical
              automations that make everyday work easier.
            </span>
            <span className="hero-mobile">
              Distinctive websites, stronger search visibility, and practical AI
              automation for growing businesses.
            </span>
          </p>
          <div className="hero-actions">
            <Link
              href="/contact/?source=home"
              className="button button-accent hero-primary"
              data-site-event="hero_primary_cta_click"
            >
              Discuss your project
              <span className="hero-primary-icon">
                <Arrow diagonal />
              </span>
            </Link>
            <Link
              href="/work/"
              className="hero-secondary"
              data-site-event="hero_portfolio_cta_click"
            >
              <span className="hero-desktop">Explore selected work</span>
              <span className="hero-mobile">Explore work</span>
              <Arrow diagonal />
            </Link>
          </div>
          <p className="hero-caption">
            Based in Pakistan · Working worldwide · Direct founder collaboration
          </p>
        </div>

        <PortraitMotion>
          <ResponsiveImage
            src={portrait}
            srcSet={`/images/responsive/hamid-hero-warm-320.webp 320w, /images/responsive/hamid-hero-warm-480.webp 480w, /images/responsive/hamid-hero-warm-640.webp 640w, /images/responsive/hamid-hero-warm-768.webp 768w, ${portrait} 1100w`}
            alt="Portrait of Hamid"
            width={1100}
            height={1100}
            sizes="(max-width: 719px) min(88vw, 368px), (max-width: 1454px) 47vw, 680px"
            loading="eager"
            fetchPriority="high"
          />
        </PortraitMotion>
      </div>

      <div className="hero-bottom wrap">
        <a href="#work" className="hero-work-cue">
          <span className="hero-desktop hero-scroll-track" aria-hidden="true" />
          <span className="hero-mobile hero-cue-icon" aria-hidden="true">
            <Arrow />
          </span>
          <span className="hero-desktop">Selected work below</span>
          <span className="hero-mobile">Selected work</span>
        </a>
      </div>
    </section>
  );
}
