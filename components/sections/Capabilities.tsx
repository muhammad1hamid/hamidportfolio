"use client";

import { useState } from "react";
import Link from "next/link";
import { services } from "@/data/content";
import { Arrow } from "@/components/ui/Arrow";
import { ChromeMark } from "@/components/hero/ChromeMark";
import { WorkflowPreview } from "./WorkflowPreview";

export function Capabilities() {
  const [active, setActive] = useState(-1);
  return (
    <section
      id="services"
      className="capabilities wrap"
      aria-labelledby="services-title"
    >
      <div className="section-marker" data-reveal>
        <span>02 / What I bring</span>
        <span>One builder. A connected skill set.</span>
      </div>
      <div className="capability-heading" data-reveal>
        <h2 id="services-title">
          Good on the surface.
          <br />
          <em>Smart underneath.</em>
        </h2>
        <div className="capability-signature">
          <ChromeMark />
          <p>
            Design you can feel.
            <br />
            Technology you can put to work.
          </p>
        </div>
      </div>
      <div className="service-list">
        {services.map((service, index) => (
          <div
            key={service.number}
            className={`service-row ${active === index ? "active" : ""}`}
          >
            <button
              className="service-trigger"
              aria-expanded={active === index}
              aria-controls={`service-panel-${index}`}
              onClick={() => setActive(active === index ? -1 : index)}
            >
              <span className="service-number">{service.number}</span>
              <h3>{service.title}</h3>
              <span className="service-teaser">{service.note}</span>
              <span className="service-toggle">
                {active === index ? "−" : "+"}
              </span>
            </button>
            <div
              className="service-panel"
              id={`service-panel-${index}`}
              hidden={active !== index}
            >
              <span className="service-word" aria-hidden="true">
                {service.word}
              </span>
              <div className="service-detail">
                <p>{service.description}</p>
                <ul>
                  {service.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <a href="#contact">
                  Let’s discuss your project <Arrow diagonal />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Link href="/services/" className="service-directory-link">Explore services, process & FAQs <Arrow diagonal /></Link>
      <WorkflowPreview />
    </section>
  );
}
