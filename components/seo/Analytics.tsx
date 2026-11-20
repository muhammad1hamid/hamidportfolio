"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackGoogleEvent } from "@/data/google-analytics";
import { identifyReferral } from "@/data/referral-source";
import { isActionEvent, trackSiteEvent } from "@/data/site-events";
import { projectClickData } from "@/data/project-events";

export function Analytics() {
  const pathname = usePathname();
  const lastPathname = useRef(pathname);

  useEffect(() => {
    const previous = lastPathname.current;
    lastPathname.current = pathname;
    // The Google tag records the initial load. Report later client navigations.
    if (previous === pathname || !window.hamidGoogleTagLoaded) return;
    const origin = window.location.origin;
    trackGoogleEvent("page_view", {
      page_location: `${origin}${pathname}`,
      page_referrer: `${origin}${previous}`,
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
      if (!(target instanceof HTMLAnchorElement) || target.hostname !== "wa.me")
        return;
      trackSiteEvent("contact_whatsapp_click");
      trackGoogleEvent("contact_click", {
        method: "whatsapp",
        context: target.dataset.contactContext || "contact_link",
        discovery_source: identifyReferral(document.referrer),
      });
      if (target.dataset.contactContext === "growth_engine") {
        trackGoogleEvent("click_whatsapp", {
          destination: "whatsapp",
          service: "growth_engine",
        });
      }
    };
    document.addEventListener("click", click, true);
    return () => document.removeEventListener("click", click, true);
  }, []);
  return null;
}
