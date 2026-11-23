import { type ReactNode } from "react";
import { enquiryLimits, type EnquiryErrors } from "@/data/project-enquiry.mjs";
import { ContactIcon, type ContactIconName } from "./ContactIcon";

function ContactField({
  id,
  label,
  error,
  icon,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  icon: ContactIconName;
  children: ReactNode;
}) {
  return (
    <div className="letter-field">
      <label className="enquiry-sr-only" htmlFor={id}>
        {label}
      </label>
      <div className="conversation-control">
        <ContactIcon name={icon} />
        {children}
      </div>
      {error && (
        <p className="letter-field-error" id={id + "-error"}>
          {error}
        </p>
      )}
    </div>
  );
}

export function ContactFormFields({
  id,
  errors,
}: {
  id: string;
  errors: EnquiryErrors;
}) {
  const props = (field: "name" | "email" | "message") => ({
    id: id + field,
    name: field,
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? id + field + "-error" : undefined,
  });
  return (
    <div className="contact-form-fields">
      <div className="letter-pair">
        <ContactField
          id={id + "name"}
          label="Your name"
          icon="person"
          error={errors.name}
        >
          <input
            {...props("name")}
            autoComplete="name"
            required
            maxLength={enquiryLimits.name}
            placeholder="Your name"
          />
        </ContactField>
        <ContactField
          id={id + "email"}
          label="Email address"
          icon="email"
          error={errors.email}
        >
          <input
            {...props("email")}
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={enquiryLimits.email}
            placeholder="Email address"
          />
        </ContactField>
      </div>
      <ContactField
        id={id + "message"}
        label="What are you building?"
        icon="pencil"
        error={errors.message}
      >
        <textarea
          {...props("message")}
          required
          rows={3}
          minLength={10}
          maxLength={enquiryLimits.message}
          placeholder="What are you building?"
        />
      </ContactField>
    </div>
  );
}
