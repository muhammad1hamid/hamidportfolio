"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { analyticsPreferenceKey } from "@/data/google-analytics";

type Choices = { google: boolean; clarity: boolean };
type SavedChoices = { google: boolean | null; clarity: boolean | null };
type ConsentSignal = {
  ad_Storage: "denied";
  analytics_Storage: "granted" | "denied";
};

declare global {
  interface Window {
    clarity?: (command: "consentv2", signal: ConsentSignal) => void;
  }
}

const clarityTag = `
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

function readChoices(): SavedChoices {
  try {
    const saved = JSON.parse(
      localStorage.getItem(analyticsPreferenceKey) || "null",
    );
    if (
      typeof saved?.google === "boolean" &&
      typeof saved.clarity === "boolean"
    ) {
      return { google: saved.google, clarity: saved.clarity };
    }
    const legacy = localStorage.getItem("hamid-clarity-consent");
    if (legacy === "allowed" || legacy === "declined") {
      return { google: null, clarity: legacy === "allowed" };
    }
  } catch {
    // The visitor can still choose for the current page.
  }
  return { google: null, clarity: null };
}

export function AnalyticsPreferences({ origin }: { origin: string }) {
  const [saved, setSaved] = useState<SavedChoices | null>(null);
  const [draft, setDraft] = useState<Choices>({
    google: false,
    clarity: false,
  });
  const [open, setOpen] = useState(false);
  const settings = useRef<HTMLButtonElement>(null);
  const googleChoice = useRef<HTMLInputElement>(null);
  const fromFooter = useRef(false);

  useEffect(() => {
    if (window.location.origin === origin) setSaved(readChoices());
  }, [origin]);

  if (!saved) return null;

  const needsChoice = saved.google === null || saved.clarity === null;
  const showPanel = open || needsChoice;
  const edit = (footer: boolean) => {
    fromFooter.current = footer;
    setDraft({
      google: saved.google === true,
      clarity: saved.clarity === true,
    });
    setOpen(true);
    requestAnimationFrame(() => googleChoice.current?.focus());
  };
  const closeSettings = () => {
    setOpen(false);
    if (fromFooter.current) settings.current?.focus({ preventScroll: true });
  };
  const save = (choices: Choices) => {
    let persisted = false;
    try {
      localStorage.setItem(analyticsPreferenceKey, JSON.stringify(choices));
      persisted = true;
    } catch {
      // Consent changes still apply in this document.
    }

    window.hamidSetGoogleAnalyticsConsent?.(choices.google);
    if (saved.clarity && !choices.clarity) {
      window.clarity?.("consentv2", {
        ad_Storage: "denied",
        analytics_Storage: "denied",
      });
      // Stop the recording session by loading the page without Clarity.
      if (persisted) window.location.reload();
    }
    setSaved(choices);
    closeSettings();
  };

  return (
    <>
      <button
        ref={settings}
        type="button"
        className="analytics-settings"
        aria-controls="analytics-choice"
        aria-expanded={showPanel}
        onClick={() => edit(true)}
      >
        Analytics settings
      </button>
      <section
        id="analytics-choice"
        className="analytics-choice"
        aria-labelledby="analytics-choice-title"
        data-lenis-prevent
        hidden={!showPanel}
      >
        <h2 id="analytics-choice-title">Optional analytics</h2>
        <p>
          Google Analytics measures visits. Microsoft Clarity records site
          interactions with project fields masked. Change your choices at any
          time in Analytics settings.
        </p>
        {open ? (
          <>
            <fieldset className="analytics-choices">
              <legend>Analytics tools</legend>
              <label>
                <input
                  ref={googleChoice}
                  type="checkbox"
                  checked={draft.google}
                  onChange={(event) =>
                    setDraft({ ...draft, google: event.target.checked })
                  }
                />
                Google Analytics
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={draft.clarity}
                  onChange={(event) =>
                    setDraft({ ...draft, clarity: event.target.checked })
                  }
                />
                Microsoft Clarity
              </label>
            </fieldset>
            <div className="analytics-choice-actions">
              <button
                type="button"
                className="button button-outline"
                onClick={closeSettings}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button-accent"
                onClick={() => save(draft)}
              >
                Save choices
              </button>
            </div>
          </>
        ) : (
          <div className="analytics-choice-actions">
            <button
              type="button"
              className="button button-outline"
              onClick={() => save({ google: false, clarity: false })}
            >
              Decline
            </button>
            <button
              type="button"
              className="button button-accent"
              onClick={() => save({ google: true, clarity: true })}
            >
              Allow analytics
            </button>
            <button
              type="button"
              className="analytics-settings"
              onClick={() => edit(false)}
            >
              Customize
            </button>
          </div>
        )}
        <div className="analytics-privacy-links">
          <a href="https://policies.google.com/technologies/partner-sites">
            Google privacy
          </a>
          <a href="https://privacy.microsoft.com/privacystatement">
            Microsoft privacy
          </a>
        </div>
      </section>
      {saved.clarity && (
        <Script id="hamid-microsoft-clarity" strategy="afterInteractive">
          {clarityTag}
        </Script>
      )}
    </>
  );
}
