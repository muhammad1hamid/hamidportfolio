import { browserAiLanding } from "./referral-source";

export const analyticsPreferenceKey = "hamid-analytics-preferences";
export const analyticsConsentEvent = "hamid-google-consent";
export const googleTagManagerId = "GTM-KF5WH37L";
export const googleMeasurementId = "G-BXP2WE495G";

export const agencyCampaignTags = {
  utm_source: [
    "linkedin",
    "instagram",
    "email",
    "google",
    "partner",
    "referral",
    "newsletter",
  ],
  utm_medium: ["social", "email", "referral", "organic", "cpc", "paid-social"],
  utm_campaign: ["agency-partnerships", "white-label", "portfolio"],
};

export function isAgencyPage(pathname: string) {
  return pathname === "/for-agencies/" || pathname === "/for-agencies";
}

export function agencyMeasurementLocation(location: Location) {
  const measured = new URL(location.pathname, location.origin);
  const params = new URLSearchParams(location.search);
  for (const [key, choices] of Object.entries(agencyCampaignTags)) {
    const value = params.get(key);
    if (value && choices.includes(value)) measured.searchParams.set(key, value);
  }
  return measured.href;
}

export function trackGoogleEvent(
  event:
    | "page_view"
    | "ai_referral_landing"
    | "contact_click"
    | "contact_cta_click"
    | "lead_form_start"
    | "start_agency_enquiry"
    | "click_agency_cta"
    | "form_error"
    | "generate_lead"
    | "brief_download"
    | "demo_question"
    | "growth_engine_cta_click"
    | "growth_engine_section_view"
    | "growth_engine_scenario_select"
    | "project_open"
    | "open_live_preview"
    | "click_whatsapp",
  parameters: Record<string, string> = {},
) {
  if (!window.hamidGoogleAnalyticsAllowed) return;
  const current = window.location;
  const agencyPage = isAgencyPage(current.pathname);
  const privateAgencyContext =
    agencyPage ||
    event === "click_agency_cta" ||
    parameters.lead_type === "agency";
  const acceptedLead = event === "generate_lead";
  window.gtag?.("event", event, {
    ...(privateAgencyContext
      ? {
          page_location: agencyPage
            ? agencyMeasurementLocation(current)
            : current.origin + current.pathname,
          page_referrer: document.referrer
            ? new URL(document.referrer).origin + "/"
            : "",
        }
      : {}),
    ...(acceptedLead
      ? {
          page_location: agencyPage
            ? agencyMeasurementLocation(current)
            : current.origin + current.pathname,
          page_referrer: "",
          ...browserAiLanding()?.signal,
        }
      : {}),
    page_path: current.pathname,
    ...parameters,
  });
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    hamidGoogleAnalyticsAllowed?: boolean;
    hamidGoogleTagLoaded?: boolean;
    hamidSetGoogleAnalyticsConsent?: (allowed: boolean) => void;
  }
}
