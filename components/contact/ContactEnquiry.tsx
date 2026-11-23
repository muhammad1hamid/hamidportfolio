"use client";

import { useEffect, useState } from "react";
import {
  enquirySource,
  isEnquiryService,
  type EnquiryService,
} from "@/data/project-enquiry.mjs";
import { ConversationComposer } from "./ConversationComposer";

export function ContactEnquiry({ accessKey }: { accessKey: string | null }) {
  const [context, setContext] = useState<{
    service: EnquiryService | "";
    source: string;
  }>({
    service: "",
    source: "contact",
  });

  useEffect(() => {
    const readContext = (event?: Event) => {
      const params = new URLSearchParams(window.location.search);
      const service = params.get("service");
      const growth = window.location.hash === "#growth-enquiry";
      if (
        event &&
        window.location.hash &&
        !growth &&
        !params.has("source") &&
        !isEnquiryService(service)
      )
        return;
      setContext({
        service: isEnquiryService(service)
          ? service
          : growth
            ? "growth-engine"
            : "",
        source: enquirySource(
          params.get("source") ?? (growth ? "growth" : "contact"),
        ),
      });
    };
    readContext();
    // The legacy Growth Engine anchor and browser history also carry context.
    window.addEventListener("popstate", readContext);
    window.addEventListener("hashchange", readContext);
    return () => {
      window.removeEventListener("popstate", readContext);
      window.removeEventListener("hashchange", readContext);
    };
  }, []);

  return (
    <ConversationComposer
      accessKey={accessKey}
      source={context.source}
      initialService={context.service}
    />
  );
}
