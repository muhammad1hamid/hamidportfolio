import { enquiryServices, validateEnquiry } from "./project-enquiry.mjs";

export const conversationTopics = Object.freeze({
  website: {
    label: "Website",
    service: "website",
    prompt:
      "A new website, a landing page, or a first idea — where would you like to begin?",
  },
  growth: {
    label: "Growth",
    service: "growth-engine",
    prompt: "Do you have a website URL or a search visibility goal in mind?",
  },
  automation: {
    label: "Automation",
    service: "ai-automation",
    prompt: "Which repetitive task would you like to simplify?",
  },
  other: {
    label: "Other",
    service: "unsure",
    prompt: "Still taking shape is a perfectly good place to start.",
  },
});

/** @typedef {keyof typeof conversationTopics} ConversationTopic */
/** @param {unknown} value @returns {value is ConversationTopic} */
export function isConversationTopic(value) {
  return typeof value === "string" && Object.hasOwn(conversationTopics, value);
}

/** @param {string} service @returns {ConversationTopic | ""} */
export function conversationTopicFor(service) {
  if (service === "agency" || service === "ai-assistant") return "other";
  return (
    /** @type {ConversationTopic[]} */ (Object.keys(conversationTopics)).find(
      (key) =>
        conversationTopics[key].service ===
        (service === "landing-page" ? "website" : service),
    ) ?? "website"
  );
}

/** @param {unknown} input */
export function validateConversation(input) {
  const draft =
    input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const topic = isConversationTopic(draft.topic) ? draft.topic : "";
  const result = validateEnquiry(
    { ...draft, service: topic ? conversationTopics[topic].service : "" },
    { requireAgencyCompany: false },
  );
  if (!result.ok) {
    if (!topic)
      result.errors.service = "Choose a project type, or select Other.";
    return result;
  }
  return { ...result, topic: /** @type {ConversationTopic} */ (topic) };
}

/** @param {import('./project-enquiry.mjs').EnquiryFields} fields @param {ConversationTopic} topic */
export function conversationDraft(fields, topic) {
  return [
    "Hi Hamid, here’s what I have in mind.",
    "",
    `Project: ${conversationTopics[topic].label}`,
    `Name: ${fields.name}`,
    `Email: ${fields.email}`,
    ...(fields.company ? [`Company: ${fields.company}`] : []),
    ...(fields.website ? [`Website: ${fields.website}`] : []),
    ...(fields.timeline ? [`Timeline: ${fields.timeline}`] : []),
    "",
    fields.message,
  ].join("\n");
}

export const web3FormsEndpoint = "https://api.web3forms.com/submit";
// The public free-plan key is documented by Web3Forms; it is not a secret.
export const web3FormsCaptchaKey = "50b2fe65-b00b-4b9e-ad62-3ba471098be2";

/** @param {string | undefined | null} key */
export function configuredWeb3FormsKey(key) {
  const value = key?.trim();
  return value &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    ) &&
    !/^0{8}-/.test(value)
    ? value
    : null;
}

/** @param {import('./project-enquiry.mjs').EnquiryFields} fields @param {ConversationTopic} topic @param {string} accessKey @param {string} token @param {string} source @param {string} reference */
export function conversationPayload(
  fields,
  topic,
  accessKey,
  token,
  source,
  reference,
) {
  return {
    access_key: accessKey,
    subject: "New project enquiry — itshamid.com",
    from_name: "HAMID / The first conversation",
    name: fields.name,
    email: fields.email,
    replyto: fields.email,
    project_type: conversationTopics[topic].label,
    service: enquiryServices[fields.service],
    message: fields.message,
    ...(fields.company ? { company: fields.company } : {}),
    ...(fields.website ? { website: fields.website } : {}),
    ...(fields.timeline ? { timeline: fields.timeline } : {}),
    entry_point: source,
    enquiry_reference: reference,
    "h-captcha-response": token,
    botcheck: false,
  };
}
