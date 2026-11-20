"use client";
import Link from "next/link";
import { useState } from "react";
import {
  goals,
  growthGoal,
  businessTypes,
  pageOptions,
  integrationOptions,
  defaultPlan,
  buildPlan,
  type PlanInput,
} from "@/data/planner";
import { site } from "@/data/site";
import { trackSiteEvent } from "@/data/site-events";
import { trackGoogleEvent } from "@/data/google-analytics";

export function WebsitePlanner() {
  const [input, setInput] = useState<PlanInput>(defaultPlan);
  const [message, setMessage] = useState("");
  const plan = buildPlan(input);
  const update = <K extends keyof PlanInput>(key: K, value: PlanInput[K]) => {
    setInput((previous) => ({ ...previous, [key]: value }));
    setMessage("");
  };
  const toggle = (key: "pages" | "integrations", value: string) =>
    update(
      key,
      input[key].includes(value)
        ? input[key].filter((item) => item !== value)
        : [...input[key], value],
    );
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([plan.text], { type: "text/plain;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "website-project-brief.txt";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage(
      "Your brief download has started. Nothing has been sent to Hamid.",
    );
    trackGoogleEvent("brief_download");
  };
  return (
    <div className="planner-layout">
      <form
        className="tool-panel"
        data-clarity-mask="true"
        onSubmit={(event) => event.preventDefault()}
        aria-label="Website project planner"
      >
        <div className="tool-heading">
          <span className="eyebrow">Your starting point</span>
          <h2>A few useful decisions.</h2>
        </div>
        <label className="tool-field">
          Business type
          <select
            value={input.business}
            onChange={(event) => update("business", event.target.value)}
          >
            {businessTypes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="tool-field">
          Main goal
          <select
            value={input.goal}
            onChange={(event) => {
              const goal = event.currentTarget.value;
              update("goal", goal);
              if (goal === growthGoal)
                trackSiteEvent("planner_growth_option_select");
            }}
          >
            {goals.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <fieldset className="tool-options">
          <legend>
            {input.goal === growthGoal
              ? "Pages you want to review"
              : "Pages you have in mind"}
          </legend>
          {pageOptions.map((item) => (
            <label key={item}>
              <input
                type="checkbox"
                checked={input.pages.includes(item)}
                onChange={() => toggle("pages", item)}
              />
              <span>{item}</span>
            </label>
          ))}
        </fieldset>
        <fieldset className="tool-options">
          <legend>Connections and editing</legend>
          {integrationOptions.map((item) => (
            <label key={item}>
              <input
                type="checkbox"
                checked={input.integrations.includes(item)}
                onChange={() => toggle("integrations", item)}
              />
              <span>{item}</span>
            </label>
          ))}
        </fieldset>
        <label className="tool-field">
          Content readiness
          <select
            value={input.content}
            onChange={(event) => update("content", event.target.value)}
          >
            {[
              "Starting from scratch",
              "Some content ready",
              "Content ready",
            ].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="tool-field">
          Anything else?{" "}
          <span className="tool-optional">Optional · 600 characters</span>
          <textarea
            rows={3}
            maxLength={600}
            value={input.notes}
            onChange={(event) => update("notes", event.target.value)}
            placeholder="Your audience, a reference, or a question to resolve"
          />
        </label>
        <button
          className="text-link tool-reset"
          type="button"
          onClick={() => {
            setInput(defaultPlan);
            setMessage("Planner reset to the starting example.");
          }}
        >
          Reset planner
        </button>
        <a
          href="#plan-result-title"
          className="button button-outline planner-jump"
        >
          Review my outline
        </a>
      </form>
      <section
        className="tool-panel planner-result"
        aria-labelledby="plan-result-title"
      >
        <span className="eyebrow">Your project outline</span>
        <h2 id="plan-result-title" aria-live="polite" aria-atomic="true">
          {plan.type}
        </h2>
        <p>{plan.reason}</p>
        <p className="tool-notice">
          A starting direction, not a quote. Scope, price and timing are agreed
          after a conversation.
        </p>
        <h3>What to work through</h3>
        <ul className="plain-list">
          {plan.checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="related-links">
          <Link href={plan.related}>Explore the relevant service</Link>
          <Link href={plan.example}>{plan.exampleLabel}</Link>
        </div>
        <div className="tool-actions">
          <button
            type="button"
            className="button button-accent"
            onClick={download}
          >
            Download my brief
          </button>
          <a
            className="button button-outline"
            href={site.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            data-contact-context="planner"
            onClick={(event) => {
              event.preventDefault();
              const draft = `Hi Hamid, I'd like to discuss this project brief.\n\n${plan.text}`;
              window.open(
                `${site.whatsapp}?text=${encodeURIComponent(draft)}`,
                "_blank",
                "noopener,noreferrer",
              );
            }}
          >
            Open draft in WhatsApp
          </a>
        </div>
        <p className="tool-small">
          Your choices stay in this page. WhatsApp opens only when you choose
          it; review the message there before sending.
        </p>
        <p role="status" className="tool-status">
          {message}
        </p>
      </section>
    </div>
  );
}
