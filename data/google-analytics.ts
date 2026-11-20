export const analyticsPreferenceKey = "hamid-analytics-preferences";
export const googleTagManagerId = "GTM-KF5WH37L";
export const googleMeasurementId = "G-BXP2WE495G";

export function trackGoogleEvent(
  event:
    | "page_view"
    | "contact_click"
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
  window.gtag?.("event", event, {
    ...parameters,
    page_path: window.location.pathname,
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
