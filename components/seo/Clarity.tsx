"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const preferenceKey = "hamid-clarity-consent";
type Preference = "allowed" | "declined";
type ConsentSignal = {
  ad_Storage: "denied";
  analytics_Storage: "granted" | "denied";
};

declare global {
  interface Window {
    clarity?: (command: "consentv2", signal: ConsentSignal) => void;
  }
}

const trackingTag = `
  (function (w, d) {
    w.clarity = w.clarity || function () {
      (w.clarity.q = w.clarity.q || []).push(arguments);
    };
    w.clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "granted" });
    const tag = d.createElement("script");
    tag.async = true;
    tag.src = "https://www.clarity.ms/tag/zg7lo4zxy4";
    d.head.appendChild(tag);
  })(window, document);
`;

export function Clarity({ origin }: { origin: string }) {
  const [preference, setPreference] = useState<Preference | "ask" | null>(null);
  const [open, setOpen] = useState(false);
  const settings = useRef<HTMLButtonElement>(null);
  const decline = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (window.location.origin !== origin) return;
    try {
      const saved = window.localStorage.getItem(preferenceKey);
      setPreference(
        saved === "allowed" || saved === "declined" ? saved : "ask",
      );
    } catch {
      setPreference("ask");
    }
  }, [origin]);

  if (preference === null) return null;

  const choose = (next: Preference) => {
    try {
      window.localStorage.setItem(preferenceKey, next);
    } catch {
      // The choice still applies to the current page if storage is unavailable.
    }
    setOpen(false);
    setPreference(next);
    if (open) settings.current?.focus({ preventScroll: true });
    if (preference === "allowed" && next === "declined") {
      window.clarity?.("consentv2", {
        ad_Storage: "denied",
        analytics_Storage: "denied",
      });
      // Reload without the tag so recording stops for this visitor.
      window.location.reload();
    }
  };

  const showChoice = preference === "ask" || open;
  return (
    <>
      <button
        ref={settings}
        type="button"
        className="analytics-settings"
        aria-expanded={showChoice}
        onClick={() => {
          setOpen(true);
          if (showChoice) decline.current?.focus();
          else requestAnimationFrame(() => decline.current?.focus());
        }}
      >
        Clarity settings
      </button>
      {showChoice && (
        <section
          className="analytics-choice"
          aria-labelledby="analytics-choice-title"
        >
          <h2 id="analytics-choice-title">Optional Clarity analytics</h2>
          <p>
            Allow Microsoft Clarity to measure clicks and record how you use the
            site. Project form inputs are masked. You can change your choice in
            Clarity settings.{" "}
            <a href="https://privacy.microsoft.com/privacystatement">
              Microsoft Privacy Statement
            </a>
          </p>
          <div className="analytics-choice-actions">
            <button
              ref={decline}
              type="button"
              className="button button-outline"
              onClick={() => choose("declined")}
            >
              Decline
            </button>
            <button
              type="button"
              className="button button-accent"
              onClick={() => choose("allowed")}
            >
              Allow analytics
            </button>
          </div>
        </section>
      )}
      {preference === "allowed" && (
        <Script id="hamid-microsoft-clarity" strategy="afterInteractive">
          {trackingTag}
        </Script>
      )}
    </>
  );
}
