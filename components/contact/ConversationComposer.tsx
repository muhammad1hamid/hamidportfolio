"use client";

import Link from "next/link";
import { ContactFormFields } from "./ContactFormFields";
import { ContactIcon } from "./ContactIcon";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Arrow } from "@/components/ui/Arrow";
import { site } from "@/data/site";
import { trackGoogleEvent } from "@/data/google-analytics";
import { enquirySource, type EnquiryErrors } from "@/data/project-enquiry.mjs";
import {
  conversationDraft,
  conversationPayload,
  conversationTopicFor,
  conversationTopics,
  isConversationTopic,
  validateConversation,
  web3FormsEndpoint,
  type ConversationTopic,
} from "@/data/conversation.mjs";
import {
  Web3FormsCheck,
  type ConversationVerification,
} from "./Web3FormsCheck";

const topicKeys = Object.keys(conversationTopics) as ConversationTopic[];
const inputOrder = ["name", "email", "service", "message"] as const;

export function ConversationComposer({
  accessKey,
  initialService,
  source,
}: {
  accessKey: string | null;
  initialService: string;
  source: string;
}) {
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const banner = useRef<HTMLDivElement>(null);
  const security = useRef<HTMLDivElement>(null);
  const successHeading = useRef<HTMLHeadingElement>(null);
  const review = useRef<HTMLDivElement>(null);
  const controller = useRef<AbortController | null>(null);
  const alive = useRef(false);
  const touchedTopic = useRef(false);
  const started = useRef(new Set<string>());
  const reference = useRef("");
  const [mounted, setMounted] = useState(false);
  const [topic, setTopic] = useState<ConversationTopic | "">(
    conversationTopicFor(initialService),
  );
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [checking, setChecking] = useState(false);
  const [revision, setRevision] = useState(0);
  const [verification, setVerification] = useState<ConversationVerification>({
    state: "idle",
  });
  const [whatsappDraft, setWhatsappDraft] = useState("");
  const sourcePage = enquirySource(source);
  const eventDetails = (selected: ConversationTopic | "" = topic) => ({
    source_page: sourcePage,
    service_category: selected
      ? conversationTopics[selected].service
      : "unselected",
    intent: "project_enquiry",
    ...(sourcePage === "agency" ? { lead_type: "agency" } : {}),
  });

  useEffect(() => {
    alive.current = true;
    setMounted(true);
    return () => {
      alive.current = false;
      controller.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (!touchedTopic.current) setTopic(conversationTopicFor(initialService));
  }, [initialService]);
  useEffect(() => {
    if (accepted) successHeading.current?.focus();
  }, [accepted]);

  const start = (selected: ConversationTopic | "" = topic) => {
    if (accessKey) setChecking(true);
    const event =
      sourcePage === "agency" ? "start_agency_enquiry" : "lead_form_start";
    if (!started.current.has(event)) {
      started.current.add(event);
      trackGoogleEvent(event, eventDetails(selected));
    }
  };
  const showErrors = (next: EnquiryErrors) => {
    setErrors(next);
    setError("");
    const first = inputOrder.find((key) => next[key]);
    requestAnimationFrame(() => {
      if (first) document.getElementById(id + first)?.focus();
    });
  };
  const fail = (message: string, reason: string) => {
    setError(message);
    trackGoogleEvent("form_error", { ...eventDetails(), reason });
    requestAnimationFrame(() => banner.current?.focus());
  };
  const validatedDraft = () => {
    if (!form.current) return null;
    const draft = Object.fromEntries(new FormData(form.current));
    if (draft.companyFax) {
      fail(
        "The security check couldn’t be completed. Please use another contact option.",
        "spam",
      );
      return null;
    }
    const result = validateConversation(draft);
    if (!result.ok) {
      showErrors(result.errors);
      trackGoogleEvent("form_error", {
        ...eventDetails(),
        reason: "validation",
      });
      return null;
    }
    return result;
  };
  const prepareWhatsApp = () => {
    const result = validatedDraft();
    if (!result) return;
    setError("");
    setErrors({});
    setWhatsappDraft(conversationDraft(result.fields, result.topic));
    requestAnimationFrame(() => review.current?.focus());
  };

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mounted || controller.current || accepted) return;
    if (!accessKey) {
      prepareWhatsApp();
      return;
    }
    const result = validatedDraft();
    if (!result) return;
    start();
    if (verification.state !== "ready") {
      requestAnimationFrame(() => security.current?.focus());
      return;
    }
    const request = new AbortController();
    controller.current = request;
    reference.current ||= window.crypto.randomUUID();
    setPending(true);
    setErrors({});
    setError("");
    const timeout = setTimeout(() => request.abort(), 25000);
    try {
      const response = await fetch(web3FormsEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "omit",
        redirect: "error",
        signal: request.signal,
        body: JSON.stringify(
          conversationPayload(
            result.fields,
            result.topic,
            accessKey,
            verification.token,
            sourcePage,
            reference.current,
          ),
        ),
      });
      const body = await response.json();
      if (!alive.current) return;
      if (response.status === 200 && body?.success === true) {
        trackGoogleEvent("generate_lead", {
          ...eventDetails(),
          delivery_provider: "web3forms",
        });
        setAccepted(true);
      } else if (response.status === 429) {
        fail(
          "Too many attempts in a short time. Please wait before trying again, or message me on WhatsApp.",
          "rate_limit",
        );
      } else {
        fail(
          "The email service couldn’t accept this enquiry. Your note is still here. Try again, or review it for WhatsApp.",
          "provider",
        );
      }
    } catch {
      if (alive.current)
        fail(
          "I couldn’t confirm whether your enquiry was accepted. It may have gone through. Your note is still here; you can check by email or WhatsApp before trying again.",
          "unconfirmed",
        );
    } finally {
      clearTimeout(timeout);
      controller.current = null;
      if (alive.current) {
        setPending(false);
        setVerification({ state: "loading" });
        setRevision((value) => value + 1);
      }
    }
  }

  if (accepted)
    return (
      <div className="conversation-success" data-delivery-accepted>
        <svg viewBox="0 0 180 70" fill="none" aria-hidden="true">
          <path d="M4 50h39c39 0 20-40 58-40s18 40 56 40h15m-12-11 12 11-12 11" />
        </svg>
        <span className="letter-kicker">A NOTE TO HAMID / SENT</span>
        <h2 id="project-enquiry-title" ref={successHeading} tabIndex={-1}>
          The conversation <em>starts here.</em>
        </h2>
        <p>
          Web3Forms accepted your enquiry for email delivery. I’ll use your
          email to follow up after reviewing it.
        </p>
        <p className="conversation-small">
          Acceptance confirms the service received it; it does not confirm inbox
          arrival.
        </p>
        <Link href="/work/" className="text-link">
          Explore the work <Arrow diagonal />
        </Link>
      </div>
    );

  return (
    <>
      <header className="letter-heading">
        <span className="letter-kicker">A note to Hamid</span>
        <h2 id="project-enquiry-title">
          Let’s <span>talk.</span>
        </h2>
        <p>Tell me about your idea.</p>
      </header>
      <form
        ref={form}
        className="conversation-form"
        aria-label="Project enquiry"
        aria-busy={pending || undefined}
        data-clarity-mask="true"
        action={web3FormsEndpoint}
        method="post"
        noValidate
        onSubmit={send}
        onChange={(event) => {
          setWhatsappDraft("");
          const element = event.target;
          start(
            element instanceof HTMLInputElement &&
              element.name === "topic" &&
              isConversationTopic(element.value)
              ? element.value
              : topic,
          );
        }}
      >
        <div
          className="conversation-errors"
          ref={banner}
          role="alert"
          tabIndex={-1}
          hidden={!error && !Object.values(errors).some(Boolean)}
        >
          <strong>
            {error
              ? "Your note is still here."
              : "A few details need attention."}
          </strong>
          {error ? (
            <p>{error}</p>
          ) : (
            <ul>
              {inputOrder
                .filter((field) => errors[field])
                .map((field) => (
                  <li key={field}>
                    <a href={"#" + id + field}>{errors[field]}</a>
                  </li>
                ))}
            </ul>
          )}
        </div>
        {!accessKey && (
          <p className="conversation-unavailable" role="note">
            Email sending is currently unavailable. You can write your note
            here, then review it before opening WhatsApp.
          </p>
        )}
        <fieldset className="letter-controls" disabled={!mounted || pending}>
          <legend className="enquiry-sr-only">Your project enquiry</legend>
          <fieldset className="conversation-topics">
            <legend className="enquiry-sr-only">
              What would you like to work on? Required
            </legend>
            <div className="topic-options">
              {topicKeys.map((value, index) => (
                <label className="topic-choice" key={value}>
                  <input
                    id={index === 0 ? id + "service" : id + "topic-" + index}
                    type="radio"
                    name="topic"
                    value={value}
                    required
                    checked={topic === value}
                    aria-invalid={errors.service ? true : undefined}
                    aria-describedby={
                      errors.service ? id + "service-error" : undefined
                    }
                    onChange={() => {
                      touchedTopic.current = true;
                      setTopic(value);
                      if (errors.service)
                        setErrors((current) => ({
                          ...current,
                          service: undefined,
                        }));
                    }}
                  />
                  <span>
                    <ContactIcon name={value} />
                    {conversationTopics[value].label}
                    <svg
                      className="topic-selected-mark"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path d="m2 6 3 3 5-6" />
                    </svg>
                  </span>
                </label>
              ))}
            </div>
            {errors.service && (
              <p className="letter-field-error" id={id + "service-error"}>
                {errors.service}
              </p>
            )}
          </fieldset>
          <p className="enquiry-sr-only" aria-live="polite">
            {topic
              ? conversationTopics[topic].prompt
              : "Choose the closest project type."}
          </p>
          <ContactFormFields id={id} errors={errors} />
          <div hidden aria-hidden="true">
            <label>
              Leave empty
              <input name="companyFax" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          {accessKey && checking && (
            <div
              className="conversation-security"
              ref={security}
              tabIndex={-1}
              aria-label="Security check"
            >
              <Web3FormsCheck revision={revision} onChange={setVerification} />
              <p role="status">
                {verification.state === "ready"
                  ? "Security check complete."
                  : verification.state === "expired" ||
                      verification.state === "error"
                    ? "The security check needs to be refreshed."
                    : "Complete the security check before sending."}
              </p>
              {(verification.state === "error" ||
                verification.state === "expired") && (
                <button
                  className="text-link"
                  type="button"
                  onClick={() => setRevision((value) => value + 1)}
                >
                  Retry security check
                </button>
              )}
            </div>
          )}
          <div className="conversation-submit-row">
            <button
              type="submit"
              className="button button-accent conversation-send"
              aria-describedby={id + "privacy"}
            >
              {pending
                ? "Sending your enquiry…"
                : accessKey
                  ? "Send enquiry"
                  : "Review for WhatsApp"}
              <Arrow />
            </button>
            <span className="enquiry-sr-only" role="status">
              {pending ? "Sending your enquiry." : ""}
            </span>
          </div>
          <p className="conversation-privacy" id={id + "privacy"}>
            Details used to reply, sent through Web3Forms.{" "}
            <Link href="/privacy/">Privacy</Link>.
            <span className="enquiry-sr-only">All fields are required.</span>
          </p>
          <div className="conversation-whatsapp">
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              data-contact-context="contact_composer"
            >
              <ContactIcon name="whatsapp" />
              Prefer WhatsApp?
            </a>
            {error && (
              <button
                type="button"
                className="conversation-review-link"
                onClick={prepareWhatsApp}
              >
                Review your note for WhatsApp
              </button>
            )}
          </div>
          {whatsappDraft && (
            <div
              className="conversation-review"
              ref={review}
              tabIndex={-1}
              aria-label="Review WhatsApp draft"
            >
              <h3>Your WhatsApp draft</h3>
              <p>
                Review your note below. Opening WhatsApp does not send it; you
                choose whether to send there.
              </p>
              <pre>{whatsappDraft}</pre>
              <a
                className="button button-outline"
                href={
                  site.whatsapp + "?text=" + encodeURIComponent(whatsappDraft)
                }
                target="_blank"
                rel="noopener noreferrer"
                data-contact-context="contact_composer"
              >
                Open WhatsApp <Arrow diagonal />
              </a>
              <button
                type="button"
                className="text-link"
                onClick={() => {
                  setWhatsappDraft("");
                  document.getElementById(id + "message")?.focus();
                }}
              >
                Keep editing
              </button>
            </div>
          )}
        </fieldset>
      </form>
      <noscript>
        <p className="conversation-small">
          This composer needs JavaScript. You can{" "}
          <a href={site.whatsapp}>message Hamid on WhatsApp</a> or{" "}
          <a href={"mailto:" + site.email}>send an email</a>.
        </p>
      </noscript>
    </>
  );
}
