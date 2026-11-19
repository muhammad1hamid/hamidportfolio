"use client";

import { useState } from "react";

const steps = [
  {
    label: "Capture",
    title: "An enquiry comes in.",
    detail: "“We need a new website for our studio. Can we talk next week?”",
    note: "Website form → new enquiry",
  },
  {
    label: "Organise",
    title: "The right details, in one place.",
    detail:
      "Project: studio website · Next step: discovery call · Timing: next week",
    note: "Enquiry → organised lead",
  },
  {
    label: "Respond",
    title: "A useful reply, ready to review.",
    detail:
      "“Thanks for reaching out. I’d love to hear about your studio. What day works for a quick call?”",
    note: "Draft reply → human approval",
  },
];

export function WorkflowPreview() {
  const [active, setActive] = useState(0);
  return (
    <div className="workflow-preview" data-reveal>
      <div className="workflow-intro">
        <span className="eyebrow">A little less busywork</span>
        <h3>
          From first hello
          <br />
          to <em>what’s next.</em>
        </h3>
        <p>
          A simple example of how an enquiry workflow could work for your
          business.
        </p>
        <span className="workflow-disclaimer">
          Interactive illustration · no data is sent
        </span>
      </div>
      <div className="workflow-demo">
        <div
          className="workflow-steps"
          role="group"
          aria-label="Explore example workflow steps"
        >
          {steps.map((step, i) => (
            <button
              key={step.label}
              aria-pressed={active === i}
              aria-controls="workflow-example"
              onClick={() => setActive(i)}
            >
              <span>0{i + 1}</span>
              {step.label}
            </button>
          ))}
        </div>
        <div
          id="workflow-example"
          className="workflow-example"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="workflow-route">{steps[active].note}</span>
          <h4>{steps[active].title}</h4>
          <p>{steps[active].detail}</p>
        </div>
      </div>
    </div>
  );
}
