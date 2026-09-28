import { Hero } from "@/components/hero/Hero";
import { ChromeMark } from "@/components/hero/ChromeMark";
import { Capabilities } from "@/components/sections/Capabilities";
import { Work } from "@/components/projects/Work";
import { About } from "@/components/sections/About";
import { Process } from "@/components/sections/Process";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faq } from "@/components/sections/Faq";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <main id="main">
      <Hero year={new Date().getFullYear()} />
      <section id="story" className="story wrap" aria-labelledby="story-title">
        <span className="eyebrow">Beyond the first impression</span>
        <div className="story-composition">
          <h2 id="story-title">
            <span className="story-line">A website gets</span>
            <span className="story-line">you noticed.</span>
            <span className="story-line">
              <em>A good system</em>
            </span>
            <span className="story-line">
              <em>keeps you moving.</em>
            </span>
          </h2>
          <div className="story-side">
            <ChromeMark />
            <p>
              I bring both together.
              <br />
              Design you can feel.
              <br />
              Technology you can put to work.
            </p>
            <span className="eyebrow">Craft × Code × Intelligence</span>
          </div>
        </div>
        <div className="story-disciplines">
          <span>Web development</span>
          <i>×</i>
          <span>AI automation</span>
          <i>×</i>
          <span>Chatbot development</span>
        </div>
      </section>
      <Capabilities />
      <Work />
      <About />
      <Process />
      <Testimonials />
      <Faq />
      <Contact />
    </main>
  );
}
