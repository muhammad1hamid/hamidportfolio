"use client";

import { useEffect, useState } from "react";
import { site } from "@/data/site";
import { Arrow } from "@/components/ui/Arrow";

export function MobileContact() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let heroPassed = false;
    let contactVisible = false;
    let reviewsVisible = false;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target.matches(".hero"))
          heroPassed = entry.boundingClientRect.bottom <= 0;
        if (entry.target.id === "contact")
          contactVisible =
            entry.isIntersecting || entry.boundingClientRect.top < 0;
        if (entry.target.id === "testimonials")
          reviewsVisible = entry.isIntersecting;
      }
      setVisible(heroPassed && !contactVisible && !reviewsVisible);
    });
    for (const selector of [".hero", "#contact", "#testimonials"]) {
      const element = document.querySelector(selector);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <a
      className="mobile-contact"
      href={site.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      hidden={!visible}
    >
      <span>Have a project?</span> Let’s talk <Arrow diagonal />
      <span className="sr-only"> on WhatsApp (new tab)</span>
    </a>
  );
}
