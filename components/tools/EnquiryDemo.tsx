"use client";
import Link from "next/link";
import { useState } from "react";
import { answerDemo, demoKnowledge } from "@/data/enquiry-demo";
import { site } from "@/data/site";
export function EnquiryDemo() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<ReturnType<typeof answerDemo>>(null);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState("");
  const ask = (value: string) => {
    setQuestion(value);
    setSubmitted(value);
    setResult(answerDemo(value));
    window.gtag?.("event", "demo_question", {
      page_path: "/demos/enquiry-assistant/",
    });
  };
  return (
    <div className="demo-layout">
      <section className="tool-panel" aria-labelledby="try-demo-title">
        <span className="eyebrow">Try a conversation</span>
        <h2 id="try-demo-title">A useful answer. A clear next step.</h2>
        <p className="tool-notice">
          Rules-based demonstration. No live AI model, WhatsApp integration or
          message delivery.
        </p>
        <div className="demo-suggestions">
          {[
            ...demoKnowledge.map((item) => item.question),
            "Can you guarantee a booking tomorrow?",
          ].map((item) => (
            <button key={item} type="button" onClick={() => ask(item)}>
              {item}
            </button>
          ))}
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            ask(question);
          }}
        >
          <label className="tool-field">
            Or try your own question
            <input
              required
              maxLength={280}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
            />
          </label>
          <button
            className="button button-accent"
            type="submit"
            disabled={!question.trim()}
          >
            Try question
          </button>
        </form>
        <div className="demo-reply" role="status" aria-live="polite">
          {result ? (
            <>
              <span className="eyebrow">{result.title}</span>
              <p>{result.answer}</p>
              <Link className="text-link" href={result.href}>
                Read the supporting page
              </Link>
            </>
          ) : (
            <p>Choose a sample question to see an answer and its source.</p>
          )}
        </div>
      </section>
      <section className="tool-panel" aria-labelledby="handover-title">
        <span className="eyebrow">Keep a person in the loop</span>
        <h2 id="handover-title">Prepare a handover.</h2>
        <p>
          Carry the question into a conversation with Hamid. Add project context
          if it helps.
        </p>
        <label className="tool-field">
          Project context <span className="tool-optional">Optional</span>
          <textarea
            rows={4}
            maxLength={600}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="What are you trying to build?"
          />
        </label>
        <div className="handover-draft">
          <h3>Draft preview</h3>
          <p>
            {submitted ||
              "I’d like to discuss a website or automation project."}
          </p>
          {notes.trim() && <p>{notes.trim()}</p>}
        </div>
        <a
          className="button button-outline"
          target="_blank"
          rel="noopener noreferrer"
          data-contact-context="demo"
          href={`${site.whatsapp}?text=${encodeURIComponent(`Hi Hamid, ${submitted || "I’d like to discuss a website or automation project."}${notes.trim() ? `\n\n${notes.trim()}` : ""}`)}`}
        >
          Review in WhatsApp
        </a>
        <p className="tool-small">
          Nothing has been sent. This draft stays in your page until you open
          WhatsApp and choose to send it.
        </p>
        <button
          className="text-link tool-reset"
          type="button"
          onClick={() => {
            setQuestion("");
            setSubmitted("");
            setResult(null);
            setNotes("");
          }}
        >
          Reset demonstration
        </button>
      </section>
    </div>
  );
}
