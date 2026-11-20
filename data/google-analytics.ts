export const analyticsPreferenceKey = "hamid-analytics-preferences";
export const googleTagManagerId = "GTM-KF5WH37L";
export const googleMeasurementId = "G-BXP2WE495G";

export function trackGoogleEvent(
  event: "page_view" | "contact_click" | "brief_download" | "demo_question",
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
