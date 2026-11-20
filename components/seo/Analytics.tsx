"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  agencyMeasurementLocation,
  analyticsConsentEvent,
  isAgencyPage,
  trackGoogleEvent,
} from "@/data/google-analytics";
import { browserAiLanding, identifyReferral } from "@/data/referral-source";
import { isActionEvent, trackSiteEvent } from "@/data/site-events";
import { projectClickData } from "@/data/project-events";
import { enquirySource, isEnquiryService } from "@/data/project-enquiry.mjs";

export function Analytics() {
  const pathname = usePathname();
  const lastPathname = useRef(pathname);
  const reportedAiLanding = useRef(false);

  useEffect(() => {
    const reportLanding = () => {
      if (
        !window.hamidGoogleAnalyticsAllowed ||
        reportedAiLanding.current
      ) return;
      const landing = browserAiLanding();
      if (!landing) return;
      trackGoogleEvent("ai_referral_landing", {
        ...landing.signal,
        page_path: landing.path,
        page_location: landing.origin + landing.path,
        page_referrer: "",
      });
      reportedAiLanding.current = true;
    };
    reportLanding();
    window.addEventListener(analyticsConsentEvent, reportLanding);
    return () => window.removeEventListener(analyticsConsentEvent, reportLanding);
  }, []);

  useEffect(() => {
    const previous = lastPathname.current;
    lastPathname.current = pathname;
    // The Google tag records the initial load. Report later client navigations.
    if (previous === pathname) return;
    const origin = window.location.origin;
    const pageLocation = isAgencyPage(pathname)
      ? agencyMeasurementLocation(window.location)
      : `${origin}${pathname}`;
    const pageReferrer = `${origin}${previous}`;
    if (
      window.hamidGoogleAnalyticsAllowed &&
      (isAgencyPage(previous) || isAgencyPage(pathname))
    ) {
      window.gtag?.("set", {
        page_location: pageLocation,
        page_referrer: pageReferrer,
      });
    }
    if (!window.hamidGoogleTagLoaded) return;
    trackGoogleEvent("page_view", {
      page_location: pageLocation,
      page_referrer: pageReferrer,
      page_title: document.title,
      discovery_source: identifyReferral(document.referrer),
    });
  }, [pathname]);

  useEffect(() => {
    const click = (event: MouseEvent) => {
      const target =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>(
              "[data-site-event], [data-project-entry], a",
            )
          : null;
      const action = target?.dataset.siteEvent;
      if (isActionEvent(action)) {
        trackSiteEvent(action, target?.dataset.sitePillar);
      }
      const agencyPlacement = target?.dataset.agencyPlacement;
      const agencyDestination = target?.dataset.agencyDestination;
      if (
        agencyPlacement &&
        agencyDestination &&
        [
          "hero",
          "proof",
          "enquiry",
          "footer",
          "founder",
          "services",
          "case_study",
          "contact",
        ].includes(agencyPlacement) &&
        ["agency_page", "enquiry", "proof", "whatsapp", "contact"].includes(
          agencyDestination,
        )
      ) {
        trackGoogleEvent("click_agency_cta", {
          cta_location: agencyPlacement,
          destination: agencyDestination,
        });
      }
      const project = projectClickData(target?.dataset);
      if (project) {
        const name =
          project.destination === "live"
            ? "open_live_preview"
            : project.destination === "contact"
              ? "contact_click"
              : "project_open";
        trackGoogleEvent(name, project);
      }
      const placement = target?.dataset.growthPlacement;
      if (placement) {
        trackGoogleEvent("growth_engine_cta_click", {
          placement,
          destination: "growth_contact",
          service: "growth_engine",
        });
      }
      if (
        target instanceof HTMLAnchorElement &&
        target.origin === window.location.origin &&
        target.pathname === "/contact/" &&
        (target.search || target.hash === "#growth-enquiry")
      ) {
        const params = new URLSearchParams(target.search);
        const growth = target.hash === "#growth-enquiry";
        const service = params.get("service");
        trackGoogleEvent("contact_cta_click", {
          source_page: enquirySource(
            params.get("source") ?? (growth ? "growth" : "contact"),
          ),
          service_category: isEnquiryService(service)
            ? service
            : growth
              ? "growth-engine"
              : "unselected",
          intent: "project_enquiry",
        });
      }
      if (!(target instanceof HTMLAnchorElement) || target.hostname !== "wa.me")
        return;
      trackSiteEvent("contact_whatsapp_click");
      trackGoogleEvent("contact_click", {
        method: "whatsapp",
        context: target.dataset.contactContext || "contact_link",
        discovery_source: identifyReferral(document.referrer),
      });
      if (
        ["growth_engine", "agency_enquiry"].includes(
          target.dataset.contactContext ?? "",
        )
      ) {
        trackGoogleEvent("click_whatsapp", {
          destination: "whatsapp",
          service:
            target.dataset.contactContext === "growth_engine"
              ? "growth_engine"
              : "agency",
          ...(target.dataset.contactContext === "agency_enquiry"
            ? { lead_type: "agency" }
            : {}),
        });
      }
    };
    document.addEventListener("click", click, true);
    return () => document.removeEventListener("click", click, true);
  }, []);
  return null;
}
