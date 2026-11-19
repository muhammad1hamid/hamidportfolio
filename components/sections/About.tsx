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
        <span>03 / The person behind the pixels</span>
        <span>A little about me</span>
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
          <span className="eyebrow">A sharp eye. A builder’s mind.</span>
          <h2 id="about-title">
            I care about
            <br />
            how it feels.
            <br />
            <em>And how it works.</em>
          </h2>
          <p>
            I’m Hamid — a developer and builder working at the intersection of
            design, development, and AI. I build websites people want to use and
            systems that make work a little easier.
          </p>
          <p>
            I work directly with businesses and alongside agencies that need a
            dependable technical partner. I’m also the founder of{" "}
            <span className="text-light">ElevateX.</span>
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
      <div className="stats">
        <div data-reveal>
          <span className="stat-number">
            30<span>+</span>
          </span>
          <span className="eyebrow">Projects built</span>
        </div>
        <div data-reveal>
          <span className="stat-number">
            10<span>+</span>
          </span>
          <span className="eyebrow">Satisfied clients</span>
        </div>
        <p data-reveal>
          Different challenges.
          <br />
          The same attention
          <br />
          to getting it right.
        </p>
      </div>
      <div className="tools-line" data-reveal>
        <h3>
          Tools change.
          <br />
          <em>The ability to build doesn’t.</em>
        </h3>
        <div>
          <p>Whatever the work calls for.</p>
          <span>
            Lovable · Claude · Make · Vercel · GitHub · Gemini · AI APIs
          </span>
        </div>
      </div>
    </section>
  );
}
