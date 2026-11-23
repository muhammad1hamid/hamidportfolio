"use client";

import { useEffect, useRef, useState } from "react";
import { web3FormsCaptchaKey } from "@/data/conversation.mjs";

export type ConversationVerification =
  | { state: "idle" | "loading" | "expired" | "error" }
  | { state: "ready"; token: string };

type Captcha = {
  render: (
    host: HTMLElement,
    options: {
      sitekey: string;
      theme: "dark";
      size: "normal" | "compact";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
      "chalexpired-callback": () => void;
    },
  ) => string;
  remove: (widget: string) => void;
};
declare global {
  interface Window {
    hcaptcha?: Captcha;
    hamidContactCaptchaReady?: () => void;
  }
}
let loading: Promise<Captcha> | undefined;

function loadCaptcha() {
  if (window.hcaptcha) return Promise.resolve(window.hcaptcha);
  if (loading) return loading;
  loading = new Promise<Captcha>((resolve, reject) => {
    const script = document.createElement("script");
    const fail = () => {
      clearTimeout(timeout);
      script.remove();
      delete window.hamidContactCaptchaReady;
      reject(new Error("Captcha unavailable"));
    };
    const timeout = setTimeout(fail, 12000);
    window.hamidContactCaptchaReady = () => {
      if (!window.hcaptcha) return fail();
      clearTimeout(timeout);
      delete window.hamidContactCaptchaReady;
      resolve(window.hcaptcha);
    };
    script.src =
      "https://js.hcaptcha.com/1/api.js?onload=hamidContactCaptchaReady&render=explicit&recaptchacompat=off";
    script.async = true;
    script.defer = true;
    script.onerror = fail;
    document.head.append(script);
  }).catch((error: Error) => {
    loading = undefined;
    throw error;
  });
  return loading;
}

export function Web3FormsCheck({
  revision,
  onChange,
}: {
  revision: number;
  onChange: (verification: ConversationVerification) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<"normal" | "compact" | null>(null);
  useEffect(() => {
    if (!host.current) return;
    const element = host.current;
    const measure = () =>
      setSize(element.clientWidth < 304 ? "compact" : "normal");
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const element = host.current;
    if (!element || !size) return;
    let current = true;
    let api: Captcha | undefined;
    let widget: string | undefined;
    const update = (state: ConversationVerification) => {
      if (current) onChange(state);
    };
    update({ state: "loading" });
    loadCaptcha()
      .then((captcha) => {
        if (!current) return;
        api = captcha;
        widget = captcha.render(element, {
          sitekey: web3FormsCaptchaKey,
          theme: "dark",
          size,
          callback: (token) =>
            update(
              typeof token === "string" &&
                token.length > 0 &&
                token.length <= 8192
                ? { state: "ready", token }
                : { state: "error" },
            ),
          "expired-callback": () => update({ state: "expired" }),
          "chalexpired-callback": () => update({ state: "expired" }),
          "error-callback": () => update({ state: "error" }),
        });
      })
      .catch(() => update({ state: "error" }));
    return () => {
      current = false;
      if (widget !== undefined) api?.remove(widget);
    };
  }, [size, revision, onChange]);
  return (
    <div
      ref={host}
      className="conversation-captcha"
      data-compact={size === "compact" || undefined}
    />
  );
}
