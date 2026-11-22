"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { site } from "@/data/site";
import { growthGoal } from "@/data/planner";
import { Arrow } from "@/components/ui/Arrow";

function fitBriefToViewport(modal: HTMLDialogElement | null) {
  const viewport = window.visualViewport;
  if (!modal?.open || !viewport) return;
  modal.style.setProperty("--brief-view-height", `${viewport.height}px`);
  modal.style.setProperty("--brief-view-top", `${viewport.offsetTop}px`);
}

export function Contact() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [saved, setSaved] = useState(false);

  const openBrief = () => {
    setSaved(false);
    const modal = dialog.current;
    if (!modal) return;
    modal.showModal();
    fitBriefToViewport(modal);
    modal.scrollTop = 0;
    closeButton.current?.focus({ preventScroll: true });
  };
  useEffect(() => {
    const viewport = window.visualViewport;
    const resize = () => fitBriefToViewport(dialog.current);
    viewport?.addEventListener("resize", resize);
    viewport?.addEventListener("scroll", resize);
    return () => {
      viewport?.removeEventListener("resize", resize);
      viewport?.removeEventListener("scroll", resize);
    };
  }, []);
  const close = () => {
    dialog.current?.close();
    trigger.current?.focus({ preventScroll: true });
  };
  const contacts = [
    { title: "Email", url: site.email ? `mailto:${site.email}` : "" },
    { title: "WhatsApp", url: site.whatsapp },
    { title: "LinkedIn", url: site.linkedin },
    { title: "Instagram", url: site.instagram },
  ].filter((c) => c.url);
  const prepare = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const text = `PROJECT BRIEF FOR HAMID\n\nName / business: ${data.get("name")}\nProject: ${data.get("service")}\n\nWhat I have in mind:\n${data.get("idea")}\n\nTiming: ${data.get("timing") || "To discuss"}\n\nThis brief was prepared locally. It has not been sent.\n`;
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "project-brief-for-hamid.txt";
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    setSaved(true);
  };
  return (
    <section
      id="contact"
      className="contact-section"
      aria-labelledby="contact-title"
    >
      <div className="wrap">
        <div className="section-marker" data-reveal>
          <span>A good next step</span>
        </div>
        <div className="contact-composition" data-reveal>
          <h2 id="contact-title">
            Tell me what you’re building. <em>Or what’s getting in the way.</em>
          </h2>
          <div className="contact-aside">
            <p>
              Share the goal, the current setup or the problem you want to
              solve. I’ll help shape a practical starting scope.
            </p>
            <div className="contact-actions">
              <Link
                href="/contact/?source=home"
                className="button button-light"
              >
                Discuss your project <Arrow diagonal />
              </Link>
              <button
                ref={trigger}
                type="button"
                className="contact-brief-link"
                data-site-event="planner_open"
                onClick={openBrief}
              >
                Prepare a project brief <Arrow diagonal />
              </button>
            </div>
          </div>
        </div>
        <div className="contact-bottom">
          {contacts.length ? (
            <div className="contact-links">
              {contacts.map((c) => (
                <a
                  key={c.title}
                  href={c.url}
                  target={c.title === "Email" ? undefined : "_blank"}
                  rel="noopener noreferrer"
                >
                  {c.title} ↗
                </a>
              ))}
            </div>
          ) : (
            <span className="contact-pending">
              Direct contact details are being added.
            </span>
          )}
        </div>
      </div>
      <dialog
        ref={dialog}
        data-lenis-prevent
        className="brief-dialog"
        aria-labelledby="brief-title"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <button
          ref={closeButton}
          type="button"
          className="dialog-close"
          onClick={close}
          aria-label="Close project brief"
        >
          Close ×
        </button>
        <span className="eyebrow">A good place to start</span>
        <h2 id="brief-title">
          What’s on
          <br />
          <em>your mind?</em>
        </h2>
        <p className="brief-intro">
          Put your idea into a short brief, then share the downloaded file with
          me on WhatsApp. Your brief stays on your device until you share it.
        </p>
        <form
          data-clarity-mask="true"
          onSubmit={prepare}
          onChange={() => setSaved(false)}
        >
          <label>
            Your name or business
            <input
              name="name"
              autoComplete="organization"
              required
              maxLength={160}
              placeholder="Who are we building for?"
            />
          </label>
          <label>
            What do you need?
            <select name="service" defaultValue="Web development">
              <option>Web development</option>
              <option>{growthGoal}</option>
              <option>AI automation</option>
              <option>Chatbot development</option>
              <option>Agency partnership</option>
              <option>Let’s figure it out</option>
            </select>
          </label>
          <label>
            A little about your idea
            <textarea
              name="idea"
              required
              minLength={10}
              maxLength={5000}
              rows={4}
              placeholder="What would you like to build or improve?"
            />
          </label>
          <label>
            Timing <span>(optional)</span>
            <input
              name="timing"
              maxLength={200}
              placeholder="A date, a timeframe, or no rush"
            />
          </label>
          <button className="button button-light" type="submit">
            Download my brief <Arrow diagonal />
          </button>
          <p className="brief-status" role="status">
            {saved
              ? "Your download is ready. Share the file with Hamid on WhatsApp when you’re ready."
              : "Private to you. Nothing is submitted or stored on a server."}
          </p>
          {saved && site.whatsapp && (
            <a
              className="project-live-link"
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open WhatsApp <Arrow diagonal />
            </a>
          )}
        </form>
      </dialog>
    </section>
  );
}
