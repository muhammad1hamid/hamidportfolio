"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackGoogleEvent } from "@/data/google-analytics";
import { identifyReferral } from "@/data/referral-source";
import { isActionEvent, trackSiteEvent } from "@/data/site-events";

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
          ? event.target.closest<HTMLElement>("[data-site-event], a")
          : null;
      const action = target?.dataset.siteEvent;
      if (isActionEvent(action)) {
        trackSiteEvent(action, target?.dataset.sitePillar);
      }
      if (!(target instanceof HTMLAnchorElement) || target.hostname !== "wa.me")
        return;
      trackSiteEvent("contact_whatsapp_click");
      trackGoogleEvent("contact_click", {
        method: "whatsapp",
        context: target.dataset.contactContext || "contact_link",
        discovery_source: identifyReferral(document.referrer),
      });
    };
    document.addEventListener("click", click, true);
    return () => document.removeEventListener("click", click, true);
  }, []);
  return null;
}
