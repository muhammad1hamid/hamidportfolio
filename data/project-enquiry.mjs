export const enquiryAction = "project_enquiry";
export const enquiryEndpoint = "/api/enquiry/";
export const maxEnquiryBytes = 16384;

export const enquiryServices = Object.freeze({
  website: "Website",
  "landing-page": "Landing page",
  "growth-engine": "Growth Engine (SEO, AEO & GEO)",
  "ai-automation": "AI automation",
  "ai-assistant": "AI assistant",
  agency: "Agency or white-label partnership",
  unsure: "Not sure yet",
});

export const enquiryBudgets = Object.freeze([
  "Under USD 1,000",
  "USD 1,000–3,000",
  "USD 3,000–8,000",
  "Over USD 8,000",
  "Not sure yet",
  "Prefer to discuss",
]);
export const enquiryTimelines = Object.freeze([
  "Within a month",
  "In 1–3 months",
  "Later this year",
  "Flexible",
  "Not sure yet",
]);

export const agencyEnquiryOptions = Object.freeze({
  capability: {
    label: "Capability needed",
    options: {
      website: "Website or redesign",
      "landing-page": "Campaign landing page",
      "design-implementation": "Implementation from approved designs",
      "web-tool": "Web tool, dashboard or integration",
      "ai-automation": "AI assistant or automation",
      "growth-engine": "Growth Engine support",
      other: "Other or still deciding",
    },
  },
  stage: {
    label: "Project stage",
    options: {
      planning: "Planning the brief",
      "design-in-progress": "Design in progress",
      "design-approved": "Approved designs ready",
      "existing-build": "An existing build needs support",
    },
  },
  collaboration: {
    label: "Preferred collaboration",
    options: {
      pilot: "Small paid pilot",
      project: "Project-based build",
      ongoing: "Ongoing support",
      undecided: "Prefer to discuss",
    },
  },
  channel: {
    label: "Preferred contact channel",
    options: {
      email: "Email",
      whatsapp: "WhatsApp after an email introduction",
      "agency-tool": "Agency’s tool after an email introduction",
    },
  },
});

export const enquiryLimits = Object.freeze({
  name: 100,
  email: 254,
  message: 2400,
  company: 120,
  website: 300,
  agency: 400,
});

const sources = Object.freeze([
  "contact",
  "home",
  "navigation",
  "footer",
  "services",
  "work",
  "growth",
  "planner",
  "agency",
]);
const control = /[\x00-\x1f\x7f]/;
const illegalMessage = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/;
const emailPattern =
  /^[a-z0-9.!#$%&'*+/=?^_\x60{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i;

/** @typedef {keyof typeof enquiryServices} EnquiryService */
/** @typedef {keyof typeof agencyEnquiryOptions} AgencyOption */
/** @typedef {keyof typeof agencyEnquiryOptions.capability.options} AgencyCapability */
/** @typedef {{name:string,email:string,service:EnquiryService,message:string,company:string,website:string,budget:string,timeline:string,agency:string,audience?:"agency",capability?:AgencyCapability} & Partial<Record<Exclude<AgencyOption,"capability">,string>>} EnquiryFields */
/** @typedef {Partial<Record<keyof EnquiryFields, string>>} EnquiryErrors */

/** @param {unknown} value @returns {value is EnquiryService} */
export function isEnquiryService(value) {
  return typeof value === "string" && Object.hasOwn(enquiryServices, value);
}

/** @param {unknown} value */
export function enquirySource(value) {
  return typeof value === "string" && sources.includes(value)
    ? value
    : "contact";
}

/** @param {enquiryServiceArg} service @param {string} source */
export function enquiryHref(service, source) {
  const query = new URLSearchParams();
  if (isEnquiryService(service)) query.set("service", service);
  query.set("source", enquirySource(source));
  return "/contact/?" + query;
}

export const agencyContactHref = enquiryHref("agency", "agency");

/** @typedef {EnquiryService | ""} enquiryServiceArg */

/** @param {string} pathname */
export function serviceForPath(pathname) {
  if (pathname === "/growth/") return "growth-engine";
  if (pathname === "/web-development/") return "website";
  if (pathname === "/landing-page-development/") return "landing-page";
  if (["/ai-automation/", "/workflow-automation/"].includes(pathname))
    return "ai-automation";
  if (
    [
      "/ai-agents/",
      "/ai-receptionist/",
      "/website-chatbot/",
      "/whatsapp-ai-chatbot/",
      "/restaurant-whatsapp-automation/",
    ].includes(pathname)
  )
    return "ai-assistant";
  return "";
}

/** @param {string} value */
export function validEnquiryEmail(value) {
  if (
    value.length > enquiryLimits.email ||
    control.test(value) ||
    !emailPattern.test(value)
  )
    return false;
  const [local, domain] = value.split("@");
  return (
    local.length <= 64 &&
    !local.startsWith(".") &&
    !local.endsWith(".") &&
    !local.includes("..") &&
    domain.split(".").every((part) => part.length <= 63)
  );
}

/** @param {string} value */
function normalizeWebsite(value) {
  if (!value) return "";
  if (control.test(value) || /\s/.test(value)) return null;
  try {
    const url = new URL(
      /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : "https://" + value,
    );
    return ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      url.hostname.includes(".") &&
      url.href.length <= enquiryLimits.website
      ? url.href
      : null;
  } catch {
    return null;
  }
}

/** @param {unknown} input @returns {{ok:false,errors:EnquiryErrors}|{ok:true,fields:EnquiryFields}} */
export function validateEnquiry(input) {
  const object =
    input && typeof input === "object" && !Array.isArray(input) ? input : {};
  /** @param {keyof EnquiryFields} field */
  const read = (field) =>
    typeof object[field] === "string" ? object[field].trim() : "";
  const name = read("name");
  const email = read("email");
  const service = read("service");
  const message = read("message").replace(/\r\n?/g, "\n");
  const company = read("company");
  const website = normalizeWebsite(read("website"));
  const budget = read("budget");
  const timeline = read("timeline");
  const agency =
    service === "agency" ? read("agency").replace(/\r\n?/g, "\n") : "";
  /** @type {Partial<EnquiryFields>} */
  const agencyDetails = {};
  /** @type {EnquiryErrors} */
  const errors = {};
  if (name.length < 2 || name.length > enquiryLimits.name || control.test(name))
    errors.name = "Enter a name between 2 and 100 characters.";
  if (!validEnquiryEmail(email)) errors.email = "Enter a valid email address.";
  if (!isEnquiryService(service))
    errors.service = "Choose the closest option, or select Not sure yet.";
  if (
    message.length < 10 ||
    message.length > enquiryLimits.message ||
    illegalMessage.test(message)
  )
    errors.message =
      "Tell me a little about your project in 10 to 2,400 characters.";
  if (company.length > enquiryLimits.company || control.test(company))
    errors.company = "Use up to 120 characters for the business name.";
  if (service === "agency") {
    if (!company) errors.company = "Enter your agency or company name.";
    agencyDetails.audience = "agency";
    for (const field of /** @type {AgencyOption[]} */ (
      Object.keys(agencyEnquiryOptions)
    )) {
      const value = read(field);
      if (!value) continue;
      const { label, options } = agencyEnquiryOptions[field];
      if (!Object.hasOwn(options, value)) {
        errors[field] = `Choose a listed option for ${label.toLowerCase()}.`;
        continue;
      }
      Object.assign(agencyDetails, { [field]: value });
    }
  }
  if (website === null)
    errors.website = "Enter a valid website URL, such as https://example.com.";
  if (budget && !enquiryBudgets.includes(budget))
    errors.budget = "Choose one of the listed budget options.";
  if (timeline && !enquiryTimelines.includes(timeline))
    errors.timeline = "Choose one of the listed timing options.";
  if (agency.length > enquiryLimits.agency || illegalMessage.test(agency))
    errors.agency = "Use up to 400 characters for the partnership details.";
  if (
    Object.keys(errors).length ||
    !isEnquiryService(service) ||
    website === null
  )
    return { ok: false, errors };
  return {
    ok: true,
    fields: {
      name,
      email,
      service,
      message,
      company,
      website,
      budget,
      timeline,
      agency,
      ...agencyDetails,
    },
  };
}
