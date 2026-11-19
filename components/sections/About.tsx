import { ResponsiveImage } from "@/components/seo/ResponsiveImage";
import Link from "next/link";

export function About() {
  return (
    <section
      id="about"
      className="about-section wrap"
      aria-labelledby="about-title"
    >
      <div className="section-marker" data-reveal>
        <span>Direct by design</span>
      </div>
      <div className="about-grid">
        <div className="about-photo" data-reveal>
          <ResponsiveImage
            src="/images/hamid-hero.webp"
            alt="Hamid, web developer and AI automation builder"
            width={1000}
            height={1000}
            sizes="(max-width: 700px) 90vw, 40vw"
          />
          <span className="photo-caption">HAMID / PAKISTAN</span>
          <span className="about-photo-mark" aria-hidden="true">
            h.
          </span>
        </div>
        <div className="about-copy" data-reveal>
          <h2 id="about-title">
            One person accountable <em>for the details.</em>
          </h2>
          <p>
            I’m the person you speak with and the builder shaping the work. I
            collaborate directly with businesses and alongside agencies that
            need a dependable technical partner.
          </p>
          <Link href="/about/" className="text-link">More about Hamid ↗</Link>
          <div className="about-location">
            <span aria-hidden="true">↗</span>
            <span>
              Based in Pakistan.
              <br />
              Working worldwide.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
