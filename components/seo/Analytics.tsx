"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { identifyReferral } from "@/data/referral-source";
import { isActionEvent, trackSiteEvent } from "@/data/site-events";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    hamidAnalyticsConfigured?: boolean;
  }
}
const candidate = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";
const measurementId = /^G-[A-Z0-9]+$/.test(candidate) ? candidate : "";
export function Analytics() {
  const pathname = usePathname();
  useEffect(() => {
    if (!measurementId) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function () {
        window.dataLayer!.push(arguments);
      };
    if (!window.hamidAnalyticsConfigured) {
      window.gtag("js", new Date());
      window.gtag("config", measurementId, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });
      window.hamidAnalyticsConfigured = true;
    }
    window.gtag("event", "page_view", {
      page_location: `${window.location.origin}${pathname}`,
      page_title: document.title,
      discovery_source: identifyReferral(document.referrer),
    });
  }, [pathname]);
  useEffect(() => {
    const click = (event: MouseEvent) => {
      const target =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("[data-site-event], a")
          : null;
      const action = target?.dataset.siteEvent;
      if (isActionEvent(action)) {
        trackSiteEvent(action, target?.dataset.sitePillar);
      }
      if (!(target instanceof HTMLAnchorElement) || target.hostname !== "wa.me")
        return;
      trackSiteEvent("contact_whatsapp_click");
      if (measurementId) {
        window.gtag?.("event", "contact_click", {
          method: "whatsapp",
          page_path: window.location.pathname,
          context: target.dataset.contactContext || "contact_link",
          discovery_source: identifyReferral(document.referrer),
        });
      }
    };
    document.addEventListener("click", click, true);
    return () => document.removeEventListener("click", click, true);
  }, []);
  if (!measurementId) return null;
  return (
    <Script
      id="hamid-ga"
      src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      strategy="afterInteractive"
    />
  );
}
