"use client";
import { useState } from "react";
import { faqs } from "@/data/content";

export function Faq() {
  const [active, setActive] = useState<number | null>(null);
  return (
    <section className="faq-section wrap" aria-labelledby="faq-title">
      <div data-reveal>
        <span className="eyebrow">05 / A few things to know</span>
        <h2 id="faq-title">
          Before we
          <br />
          <em>say hello.</em>
        </h2>
      </div>
      <div className="faq-list">
        {faqs.map((faq, i) => (
          <div
            className={`faq-item ${active === i ? "active" : ""}`}
            key={faq.question}
          >
            <h3>
              <button
                aria-expanded={active === i}
                aria-controls={`faq-answer-${i}`}
                onClick={() => setActive(active === i ? null : i)}
              >
                {faq.question}
                <span aria-hidden="true">{active === i ? "−" : "+"}</span>
              </button>
            </h3>
            <div
              className="faq-answer"
              id={`faq-answer-${i}`}
              hidden={active !== i}
            >
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
