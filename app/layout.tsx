import type { Metadata } from "next";
import { site } from "@/data/site";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { RouteFooter } from "@/components/layout/RouteFooter";
import { Experience } from "@/components/motion/Experience";
import { SignatureIntro } from "@/components/motion/SignatureIntro";
import { originBootstrap } from "@/components/motion/origin-session";
import { curveBootstrap } from "@/components/curve/bootstrap";
import { entityGraph, pageMeta } from "@/data/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Analytics } from "@/components/seo/Analytics";
import {
  agencyCampaignTags,
  analyticsConsentEvent,
  analyticsPreferenceKey,
  googleMeasurementId,
  googleTagManagerId,
} from "@/data/google-analytics";
import "./globals.css";
import "./refinements.css";
import "./testimonials.css";
import "./content.css";
import "./discovery.css";
import "./analytics.css";
import "./insights.css";
import "./home-growth.css";
import "./origin.css";
import "./projects.css";

const tagManager = `
  (function (w, d) {
    if (w.location.origin !== ${JSON.stringify(site.url)}) return;

    w.dataLayer = w.dataLayer || [];
    w.gtag = w.gtag || function () { w.dataLayer.push(arguments); };
    var consent = {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    };
    var disabled = ${JSON.stringify(`ga-disable-${googleMeasurementId}`)};
    w[disabled] = true;
    w.hamidGoogleAnalyticsAllowed = false;
    w.gtag("consent", "default", consent);

    w.hamidSetGoogleAnalyticsConsent = function (allowed) {
      if (w.hamidGoogleAnalyticsAllowed === allowed) return;
      w.hamidGoogleAnalyticsAllowed = allowed;
      w[disabled] = !allowed;
      w.gtag("consent", "update", Object.assign({}, consent, {
        analytics_storage: allowed ? "granted" : "denied"
      }));
      if (!allowed) return;
      if (d.getElementById("hamid-gtm-container")) {
        w.dispatchEvent(new Event(${JSON.stringify(analyticsConsentEvent)}));
        return;
      }

      if (w.location.pathname === "/for-agencies/" || w.location.pathname === "/for-agencies") {
        var measured = new URL(w.location.pathname, w.location.origin);
        var requested = new URLSearchParams(w.location.search);
        for (var [key, choices] of Object.entries(${JSON.stringify(agencyCampaignTags)})) {
          var value = requested.get(key);
          if (value && choices.includes(value)) measured.searchParams.set(key, value);
        }
        w.gtag("set", {
          page_location: measured.href,
          page_referrer: d.referrer ? new URL(d.referrer).origin + "/" : ""
        });
      }
      w.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      var tag = d.createElement("script");
      tag.id = "hamid-gtm-container";
      tag.async = true;
      tag.src = "https://www.googletagmanager.com/gtm.js?id=${googleTagManagerId}";
      tag.addEventListener("load", function () { w.hamidGoogleTagLoaded = true; });
      d.head.appendChild(tag);
      w.dispatchEvent(new Event(${JSON.stringify(analyticsConsentEvent)}));
    };

    try {
      var saved = JSON.parse(w.localStorage.getItem(${JSON.stringify(analyticsPreferenceKey)}) || "null");
      if (saved && saved.google === true && typeof saved.clarity === "boolean")
        w.hamidSetGoogleAnalyticsConsent(true);
    } catch {
      // Analytics stays off until a visitor makes a choice on this page.
    }
  })(window, document);
`;

export const metadata: Metadata = {
  ...pageMeta(site.title, site.description, "/"),
  metadataBase: new URL(site.url),
  title: { default: site.title, template: "%s — Hamid" },
  icons: { icon: "/favicon.svg", apple: "/apple-touch-icon.png" },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="hamid-work-bootstrap"
          dangerouslySetInnerHTML={{ __html: curveBootstrap }}
        />
        <script
          id="hamid-origin-bootstrap"
          dangerouslySetInnerHTML={{ __html: originBootstrap }}
        />
        {!site.noindex && (
          <script
            id="hamid-google-tag-manager"
            dangerouslySetInnerHTML={{ __html: tagManager }}
          />
        )}
        {!site.noindex && (
          <script
            src="https://analytics.ahrefs.com/analytics.js"
            data-key="L1aEAAdlomx6G0yGbFaaUA"
            async
          />
        )}
      </head>
      <body suppressHydrationWarning>
        <SignatureIntro />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Navigation />
        <Experience />
        {children}
        <RouteFooter>
          <Footer />
        </RouteFooter>
        <JsonLd data={entityGraph} />
        {!site.noindex && <Analytics />}
      </body>
    </html>
  );
}
