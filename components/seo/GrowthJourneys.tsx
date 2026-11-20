"use client";

import { useEffect, useState } from "react";
import { trackGoogleEvent } from "@/data/google-analytics";

const steps = ["Intent", "Useful page", "Trust signal", "Next action"];
const scenarios = [
  {
    id: "founder",
    label: "Launching a website",
    question: "A founder searches for a reliable website developer.",
    path: [
      "Find a developer who can turn a new offer into a clear website.",
      "A service page explains what goes into the build and what the owner will need to provide.",
      "Working website examples show the experience a visitor can actually use.",
      "Share your offer, launch target and priority pages in a project brief.",
    ],
  },
  {
    id: "business",
    label: "Improving enquiries",
    question:
      "A business owner asks an AI assistant how to improve local enquiries.",
    path: [
      "Understand why visits to a local service page rarely become conversations.",
      "A guide compares the information buyers need with the actions the mobile page offers.",
      "An example shows the difference between a recorded WhatsApp click and a message received.",
      "Share the priority page and one common reason people hesitate before getting in touch.",
    ],
  },
  {
    id: "agency",
    label: "Implementing a roadmap",
    question:
      "An agency needs a technical partner to implement a visibility roadmap.",
    path: [
      "Find a developer who can implement agreed fixes on an existing client site.",
      "A scope page shows the work involved, how it is checked and what the handover includes.",
      "A sample audit connects an issue to a fix and a published verification step.",
      "Share the roadmap, the priority URLs and how your team approves changes.",
    ],
  },
] as const;

export function GrowthJourneys() {
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          !window.hamidGoogleAnalyticsAllowed ||
          document.visibilityState !== "visible"
        )
          return;
        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.65) continue;
          const section = (entry.target as HTMLElement).dataset.growthSection;
          if (!section) continue;
          trackGoogleEvent("growth_engine_section_view", {
            section,
            service: "growth_engine",
          });
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.65 },
    );
    document
      .querySelectorAll("[data-growth-section]")
      .forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="growth-journey-demo">
      <div className="growth-journey-controls">
        <fieldset>
          <legend>Choose a buyer scenario</legend>
          <div className="growth-journey-options">
            {scenarios.map((scenario, index) => (
              <label key={scenario.id}>
                <input
                  type="radio"
                  name="growth-scenario"
                  value={scenario.id}
                  defaultChecked={index === 0}
                  aria-controls={`journey-${scenario.id}`}
                  onChange={() => {
                    setAnnouncement(`${scenario.label}. ${scenario.question}`);
                    trackGoogleEvent("growth_engine_scenario_select", {
                      scenario: scenario.id,
                      service: "growth_engine",
                    });
                  }}
                />
                <span>{scenario.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <p className="growth-sample-label">
          Illustrative journey · Sample data
        </p>
      </div>
      <span className="sr-only" role="status">
        {announcement}
      </span>
      {scenarios.map((scenario) => (
        <div
          className="growth-scenario"
          data-growth-scenario={scenario.id}
          key={scenario.id}
          id={`journey-${scenario.id}`}
        >
          <h3>{scenario.question}</h3>
          <ol>
            {scenario.path.map((text, index) => (
              <li key={steps[index]}>
                <strong>{steps[index]}</strong>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
