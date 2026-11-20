"use client";

import { useEffect, useRef, useState } from "react";
import { enquiryAction } from "@/data/project-enquiry.mjs";

type Widget = {
  render: (
    target: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      theme: "dark";
      size: "normal" | "compact";
      "response-field": false;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
      "timeout-callback": () => void;
      "unsupported-callback": () => void;
    },
  ) => string;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: Widget;
  }
}

let scriptLoad: Promise<Widget> | undefined;

function loadWidget() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptLoad) return scriptLoad;

  scriptLoad = new Promise<Widget>((resolve, reject) => {
    const script = document.createElement("script");
    const failed = () => {
      window.clearTimeout(timeout);
      script.remove();
      reject(new Error("Verification script unavailable"));
    };
    const timeout = window.setTimeout(failed, 10000);
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onerror = failed;
    script.onload = () => {
      if (!window.turnstile) return failed();
      window.clearTimeout(timeout);
      resolve(window.turnstile);
    };
    document.head.append(script);
  }).catch((error: Error) => {
    scriptLoad = undefined;
    throw error;
  });
  return scriptLoad;
}

export type Verification =
  | { state: "idle" | "loading" | "expired" | "error" }
  | { state: "ready"; token: string };

export function TurnstileCheck({
  siteKey,
  revision,
  onChange,
}: {
  siteKey: string;
  revision: number;
  onChange: (verification: Verification) => void;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<"normal" | "compact" | null>(null);

  useEffect(() => {
    const node = mount.current;
    if (!node) return;
    const measure = () =>
      setSize(node.clientWidth < 300 ? "compact" : "normal");
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = mount.current;
    if (!node || !size) return;
    let current = true;
    let widget: Widget | undefined;
    let id: string | undefined;
    const update = (verification: Verification) => {
      if (current) onChange(verification);
    };
    const failure = () => update({ state: "error" });
    update({ state: "loading" });
    loadWidget()
      .then((api) => {
        if (!current) return;
        widget = api;
        id = api.render(node, {
          sitekey: siteKey,
          action: enquiryAction,
          theme: "dark",
          size,
          "response-field": false,
          callback: (token) => update({ state: "ready", token }),
          "expired-callback": () => update({ state: "expired" }),
          "error-callback": failure,
          "timeout-callback": failure,
          "unsupported-callback": failure,
        });
      })
      .catch(failure);
    return () => {
      current = false;
      if (id !== undefined) widget?.remove(id);
    };
  }, [siteKey, revision, size, onChange]);

  return (
    <div
      ref={mount}
      className="enquiry-widget"
      data-compact={size === "compact" || undefined}
    />
  );
}
