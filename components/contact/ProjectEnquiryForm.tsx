"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Arrow } from "@/components/ui/Arrow";
import { site } from "@/data/site";
import { trackGoogleEvent } from "@/data/google-analytics";
import {
  agencyEnquiryOptions,
  enquiryBudgets,
  enquiryEndpoint,
  enquiryLimits,
  enquiryServices,
  enquirySource,
  enquiryTimelines,
  isEnquiryService,
  validateEnquiry,
  type AgencyOption,
  type EnquiryErrors,
  type EnquiryFields,
  type EnquiryService,
} from "@/data/project-enquiry.mjs";
import { TurnstileCheck, type Verification } from "./TurnstileCheck";

const fields = [
  "name",
  "email",
  "service",
  "message",
  "company",
  "website",
  "budget",
  "timeline",
  "agency",
  ...(Object.keys(agencyEnquiryOptions) as AgencyOption[]),
] as const;
type FieldName = (typeof fields)[number];

const failureMessages: Record<string, string> = {
  unavailable:
    "Website enquiries are temporarily unavailable. You can still send your brief on WhatsApp.",
  unconfirmed:
    "Delivery couldn’t be confirmed. Try again with the same details to avoid a duplicate.",
  network:
    "The connection ended before I could confirm delivery. Check your connection and try again.",
  rate_limit:
    "Too many attempts in a short time. Wait before trying again or use WhatsApp.",
  pending:
    "Your enquiry is already being processed. Wait a few seconds before you retry.",
  conflict:
    "That reference is already in use. Try again to create a fresh reference.",
  spam: "The security check couldn’t be verified. Complete the new check and try again.",
  origin: "Please open the form directly on this website, or use WhatsApp.",
  too_large:
    "This brief is too large to send. Shorten the project details and try again.",
};

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="tool-field enquiry-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && (
        <span className="enquiry-field-error" id={id + "-error"}>
          {error}
        </span>
      )}
    </div>
  );
}

export function ProjectEnquiryForm({
  siteKey,
  source,
  initialService = "",
  initialMessage = "",
  agencyOnly = false,
}: {
  siteKey: string;
  source: string;
  initialService?: EnquiryService | "";
  initialMessage?: string;
  agencyOnly?: boolean;
}) {
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const optional = useRef<HTMLDetailsElement>(null);
  const banner = useRef<HTMLDivElement>(null);
  const status = useRef<HTMLDivElement>(null);
  const confirmation = useRef<HTMLHeadingElement>(null);
  const controller = useRef<AbortController | null>(null);
  const submission = useRef<{ signature: string; id: string } | null>(null);
  const started = useRef(new Set<"lead_form_start" | "start_agency_enquiry">());
  const serviceChanged = useRef(false);
  const defaultService = agencyOnly ? "agency" : initialService;
  const [mounted, setMounted] = useState(false);
  const [service, setService] = useState(defaultService);
  const [company, setCompany] = useState("");
  const [checking, setChecking] = useState(false);
  const [verification, setVerification] = useState<Verification>({
    state: "idle",
  });
  const [revision, setRevision] = useState(0);
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState("");

  useEffect(() => {
    setMounted(true);
    return () => controller.current?.abort();
  }, []);
  useEffect(() => {
    if (!serviceChanged.current) setService(defaultService);
  }, [defaultService]);
  useEffect(() => {
    if (receipt) confirmation.current?.focus();
  }, [receipt]);

  const sourcePage = enquirySource(source);
  const isAgency = service === "agency";
  const eventDetails = (category: string): Record<string, string> => {
    const details = {
      source_page: sourcePage,
      service_category: isEnquiryService(category) ? category : "unselected",
      intent: "project_enquiry",
    };
    return category === "agency"
      ? { ...details, lead_type: "agency" }
      : details;
  };
  const fieldProps = (name: keyof EnquiryFields) => ({
    id: id + name,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? id + name + "-error" : undefined,
  });
  const start = (category: string = service) => {
    setChecking(true);
    const event =
      category === "agency" ? "start_agency_enquiry" : "lead_form_start";
    if (started.current.has(event)) return;
    started.current.add(event);
    trackGoogleEvent(event, eventDetails(category));
  };
  const refreshCheck = () => {
    setVerification({ state: "loading" });
    setRevision((value) => value + 1);
  };
  const fieldErrors = (next: EnquiryErrors) => {
    setErrors(next);
    setError("");
    const firstRequired = (
      isAgency
        ? (["name", "email", "service", "company", "message"] as const)
        : (["name", "email", "service", "message"] as const)
    ).find((field) => next[field]);
    if (!firstRequired && optional.current) optional.current.open = true;
    const first = firstRequired ?? fields.find((field) => next[field]);
    requestAnimationFrame(() => {
      if (first) document.getElementById(id + first)?.focus();
    });
  };
  const failed = (reason: string) => {
    const code = Object.hasOwn(failureMessages, reason)
      ? reason
      : "unconfirmed";
    setError(failureMessages[code]);
    trackGoogleEvent("form_error", { ...eventDetails(service), reason: code });
    requestAnimationFrame(() => banner.current?.focus());
  };

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mounted || controller.current) return;
    const draft = Object.fromEntries(new FormData(event.currentTarget));
    const validated = validateEnquiry(draft);
    if (!validated.ok) {
      fieldErrors(validated.errors);
      trackGoogleEvent("form_error", {
        ...eventDetails(service),
        reason: "validation",
      });
      return;
    }
    start(validated.fields.service);
    if (verification.state !== "ready") {
      setError("");
      requestAnimationFrame(() => status.current?.focus());
      return;
    }

    const signature = JSON.stringify({
      fields: validated.fields,
      source: sourcePage,
    });
    if (submission.current?.signature !== signature) {
      submission.current = { signature, id: window.crypto.randomUUID() };
    }
    const requestId = submission.current.id;
    const request = new AbortController();
    controller.current = request;
    setPending(true);
    setErrors({});
    setError("");
    const timeout = window.setTimeout(() => request.abort(), 38000);
    try {
      const response = await fetch(enquiryEndpoint, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: validated.fields,
          source: sourcePage,
          submissionId: requestId,
          companyFax: draft.companyFax,
          token: verification.token,
        }),
        signal: request.signal,
      });
      const result = await response.json();
      if (
        ((response.status === 201 && result?.replayed === false) ||
          (response.status === 200 && result?.replayed === true)) &&
        result.status === "accepted" &&
        result.receipt === requestId
      ) {
        if (!result.replayed)
          trackGoogleEvent("generate_lead", {
            ...eventDetails(validated.fields.service),
            ...(validated.fields.audience === "agency"
              ? {
                  service_interest:
                    validated.fields.capability ?? "unspecified",
                }
              : {}),
          });
        setReceipt(requestId);
        return;
      }
      if (response.status === 422 && result?.error === "validation") {
        const next: EnquiryErrors = {};
        for (const field of fields) {
          if (typeof result?.fields?.[field] === "string")
            next[field] = result.fields[field];
        }
        if (Object.keys(next).length) {
          fieldErrors(next);
          trackGoogleEvent("form_error", {
            ...eventDetails(service),
            reason: "validation",
          });
          return;
        }
      }
      if (result?.error === "conflict") submission.current = null;
      failed(typeof result?.error === "string" ? result.error : "unconfirmed");
    } catch {
      if (form.current) failed("network");
    } finally {
      window.clearTimeout(timeout);
      controller.current = null;
      if (form.current) {
        setPending(false);
        refreshCheck();
      }
    }
  }

  if (receipt) {
    const ConfirmationHeading = agencyOnly ? "h3" : "h2";
    return (
      <div className="enquiry-confirmation">
        <span className="eyebrow">
          <i className="accent-dot" /> Brief received for delivery
        </span>
        <ConfirmationHeading tabIndex={-1} ref={confirmation}>
          {isAgency
            ? "Thank you for sharing your agency brief."
            : "Thank you for sharing your project."}
        </ConfirmationHeading>
        <p>
          The email service accepted your enquiry for delivery. I’ll use your
          email address to follow up after reviewing it.
        </p>
        <p className="enquiry-fine-print">
          Reference <code>{receipt}</code>
        </p>
        <Link href="/work/" className="button button-outline">
          Explore selected work <Arrow diagonal />
        </Link>
      </div>
    );
  }

  const companyField = (
    <Field
      id={id + "company"}
      label={isAgency ? "Agency or company name" : "Business name"}
      error={errors.company}
    >
      <input
        {...fieldProps("company")}
        value={company}
        onChange={(event) => setCompany(event.target.value)}
        required={isAgency}
        autoComplete="organization"
        maxLength={enquiryLimits.company}
      />
    </Field>
  );

  return (
    <>
      <form
        ref={form}
        className="enquiry-form"
        aria-label={agencyOnly ? "Agency enquiry" : "Project enquiry"}
        aria-busy={pending || undefined}
        data-clarity-mask="true"
        action={enquiryEndpoint}
        method="post"
        noValidate
        onSubmit={send}
        onChange={(event) => {
          const target: EventTarget = event.target;
          if (!(
            target instanceof HTMLInputElement ||
            target instanceof HTMLSelectElement ||
            target instanceof HTMLTextAreaElement
          ))
            return;
          const name = target.name as FieldName;
          if (!fields.includes(name)) return;
          start(name === "service" ? target.value : service);
          if (errors[name])
            setErrors((current) => ({ ...current, [name]: undefined }));
        }}
      >
        <div
          className="enquiry-error"
          ref={banner}
          role="alert"
          tabIndex={-1}
          hidden={!error}
        >
          <strong>Submission needs attention.</strong>
          <p>
            {error}{" "}
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              data-contact-context={isAgency ? "agency_enquiry" : sourcePage}
            >
              Open WhatsApp ↗
            </a>
          </p>
        </div>
        <div
          className="enquiry-error"
          role="alert"
          hidden={!Object.values(errors).some(Boolean)}
        >
          <strong>Check the highlighted fields before sending.</strong>
        </div>
        <fieldset disabled={!mounted || pending}>
          <legend className="enquiry-sr-only">Project details</legend>
          <div className="enquiry-field-pair">
            <Field
              id={id + "name"}
              label={isAgency ? "Contact name" : "Name"}
              error={errors.name}
            >
              <input
                {...fieldProps("name")}
                required
                autoComplete="name"
                maxLength={enquiryLimits.name}
              />
            </Field>
            <Field
              id={id + "email"}
              label={isAgency ? "Business email" : "Email address"}
              error={errors.email}
            >
              <input
                {...fieldProps("email")}
                required
                type="email"
                inputMode="email"
                autoComplete="email"
                maxLength={enquiryLimits.email}
              />
            </Field>
          </div>
          {agencyOnly ? (
            <input type="hidden" name="service" value="agency" />
          ) : (
            <Field
              id={id + "service"}
              label="What can I help with?"
              error={errors.service}
            >
              <select
                {...fieldProps("service")}
                required
                value={service}
                onChange={(event) => {
                  serviceChanged.current = true;
                  const value = event.currentTarget.value;
                  setService(isEnquiryService(value) ? value : "");
                }}
              >
                <option value="">Choose a service</option>
                {Object.entries(enquiryServices).map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {isAgency && companyField}
          <Field
            id={id + "message"}
            label={
              isAgency ? "Short project brief" : "Tell me a little about it"
            }
            error={errors.message}
          >
            <textarea
              {...fieldProps("message")}
              required
              rows={4}
              defaultValue={initialMessage}
              maxLength={enquiryLimits.message}
              placeholder={
                isAgency
                  ? "What needs building, what’s ready and any constraints"
                  : "Your goal, current setup, or an example you like"
              }
            />
          </Field>
          <details className="enquiry-extra" ref={optional}>
            <summary>
              Add project details{" "}
              <span className="tool-optional">(optional)</span>
            </summary>
            <div className="enquiry-extra-fields">
              <div className="enquiry-field-pair">
                {!isAgency && companyField}
                <Field
                  id={id + "website"}
                  label={isAgency ? "Agency website" : "Current website"}
                  error={errors.website}
                >
                  <input
                    {...fieldProps("website")}
                    inputMode="url"
                    autoComplete="url"
                    maxLength={enquiryLimits.website}
                    placeholder="example.com"
                  />
                </Field>
                {isAgency &&
                  (Object.keys(agencyEnquiryOptions) as AgencyOption[]).map(
                    (field) => {
                      const { label, options } = agencyEnquiryOptions[field];
                      return (
                        <Field
                          id={id + field}
                          label={label}
                          error={errors[field]}
                          key={field}
                        >
                          <select {...fieldProps(field)} defaultValue="">
                            <option value="">Leave open</option>
                            {Object.entries(options).map(([value, title]) => (
                              <option key={value} value={value}>
                                {title}
                              </option>
                            ))}
                          </select>
                        </Field>
                      );
                    },
                  )}
              </div>
              <div className="enquiry-field-pair">
                <Field
                  id={id + "budget"}
                  label={isAgency ? "Indicative budget" : "Approximate budget"}
                  error={errors.budget}
                >
                  <select {...fieldProps("budget")} defaultValue="">
                    <option value="">Select a range</option>
                    {enquiryBudgets.map((budget) => (
                      <option key={budget}>{budget}</option>
                    ))}
                  </select>
                </Field>
                <Field
                  id={id + "timeline"}
                  label="Target timeline"
                  error={errors.timeline}
                >
                  <select {...fieldProps("timeline")} defaultValue="">
                    <option value="">Select timing</option>
                    {enquiryTimelines.map((timeline) => (
                      <option key={timeline}>{timeline}</option>
                    ))}
                  </select>
                </Field>
              </div>
              {service === "agency" && (
                <Field
                  id={id + "agency"}
                  label="Partnership details"
                  error={errors.agency}
                >
                  <textarea
                    {...fieldProps("agency")}
                    rows={3}
                    maxLength={enquiryLimits.agency}
                    placeholder="What kind of collaboration are you looking for?"
                  />
                </Field>
              )}
            </div>
          </details>
          <div hidden aria-hidden="true">
            <label>
              Leave this field empty
              <input name="companyFax" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <p className="enquiry-fine-print" id={id + "-privacy"}>
            {isAgency
              ? "I’ll use this brief to assess fit and reply by email. Keep private client details out of the first message. "
              : "I’ll use these details to review and reply to your enquiry. "}
            <Link href="/privacy/">Read the privacy notice</Link>.
          </p>
          {checking && (
            <div
              className="enquiry-security"
              ref={status}
              tabIndex={-1}
              aria-label="Security check"
            >
              <TurnstileCheck
                siteKey={siteKey}
                revision={revision}
                onChange={setVerification}
              />
              <p
                className="enquiry-fine-print enquiry-check-status"
                role="status"
              >
                {verification.state === "loading" ||
                verification.state === "idle"
                  ? "Complete the security check before sending."
                  : verification.state === "ready"
                    ? "Security check complete."
                    : "The security check needs to be refreshed."}
              </p>
              {(verification.state === "expired" ||
                verification.state === "error") && (
                <button
                  type="button"
                  className="text-link"
                  onClick={refreshCheck}
                >
                  Retry security check
                </button>
              )}
            </div>
          )}
          <button
            className="button button-accent enquiry-submit"
            type="submit"
            aria-describedby={id + "-privacy"}
          >
            {pending
              ? "Sending your enquiry…"
              : isAgency
                ? "Send agency brief"
                : "Send my enquiry"}{" "}
            <Arrow diagonal />
          </button>
          <span className="enquiry-sr-only" role="status">
            {pending ? "Sending your enquiry." : ""}
          </span>
        </fieldset>
      </form>
      <noscript>
        <p className="enquiry-fine-print">
          The enquiry form needs JavaScript. You can{" "}
          <a href={site.whatsapp}>message Hamid on WhatsApp</a> instead.
        </p>
      </noscript>
    </>
  );
}
