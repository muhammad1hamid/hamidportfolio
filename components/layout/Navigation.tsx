"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Arrow } from "@/components/ui/Arrow";
import "@/app/navigation-beam.css";

const links = [
  { title: "Work", href: "/work/" },
  { title: "Services", href: "/services/" },
  { title: "Growth Engine", href: "/growth/" },
  { title: "About", href: "/about/" },
  { title: "Reviews", href: "/#testimonials" },
  { title: "Insights", href: "/insights/" },
];

function setBeamSpeed(link: HTMLAnchorElement, active: boolean) {
  if (typeof CSSAnimation === "undefined") return;
  const beam = link.querySelector(".nav-contact-beam");
  const animation = beam
    ?.getAnimations?.({ subtree: true })
    .find(
      (effect) =>
        effect instanceof CSSAnimation &&
        effect.animationName === "nav-contact-beam-turn",
    );
  animation?.updatePlaybackRate?.(active ? 1.22 : 1);
}

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDialogElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const contact = useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 60);
    const visibility = () =>
      contact.current?.toggleAttribute("data-beam-paused", document.hidden);
    scroll();
    visibility();
    window.addEventListener("scroll", scroll, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("scroll", scroll);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const dialog = menu.current;
    if (!open || !dialog) return;
    const desktop = window.matchMedia("(min-width: 901px)");
    const closeOnDesktop = () => {
      if (desktop.matches) dialog.close();
    };
    if (desktop.matches) {
      setOpen(false);
      return;
    }
    dialog.showModal();
    dialog.scrollTop = 0;
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      desktop.removeEventListener("change", closeOnDesktop);
      dialog.close();
    };
  }, [open]);
  const close = () => {
    menu.current?.close();
    setOpen(false);
  };
  const dismiss = () => {
    close();
    button.current?.focus({ preventScroll: true });
  };
  return (
    <>
      <header
        className={`navigation ${scrolled ? "is-scrolled" : ""}`}
        data-hero-home={pathname === "/" ? "" : undefined}
      >
        <Link className="wordmark" href="/" aria-label="Hamid home">
          HAMID<span aria-hidden="true">✳</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              href={link.href}
              key={link.title}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.title}
            </Link>
          ))}
        </nav>
        <Link
          ref={contact}
          className="nav-contact"
          href="/contact/?source=navigation"
          aria-label="Discuss a project"
          aria-current={pathname === "/contact/" ? "page" : undefined}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse")
              setBeamSpeed(event.currentTarget, true);
          }}
          onPointerLeave={(event) =>
            setBeamSpeed(
              event.currentTarget,
              event.currentTarget.matches(":focus-visible"),
            )
          }
          onFocus={(event) =>
            setBeamSpeed(
              event.currentTarget,
              event.currentTarget.matches(":focus-visible, :hover"),
            )
          }
          onBlur={(event) =>
            setBeamSpeed(
              event.currentTarget,
              event.currentTarget.matches(":hover"),
            )
          }
          onKeyDown={(event) => {
            if (
              event.key !== " " ||
              event.altKey ||
              event.ctrlKey ||
              event.metaKey ||
              event.shiftKey
            )
              return;
            event.preventDefault();
            if (!event.repeat) event.currentTarget.click();
          }}
        >
          <span className="nav-contact-beam" aria-hidden="true" />
          <span>
            Discuss<span className="nav-contact-detail"> a project</span>
          </span>
          <Arrow diagonal />
        </Link>
        <button
          type="button"
          ref={button}
          className="menu-toggle"
          aria-label="Open navigation"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(true)}
        >
          <span />
          <span />
        </button>
      </header>
      <dialog
        id="mobile-menu"
        data-lenis-prevent
        ref={menu}
        className="mobile-menu"
        aria-label="Navigation"
        onCancel={(event) => {
          event.preventDefault();
          dismiss();
        }}
        onClose={() => setOpen(false)}
      >
        <div className="mobile-menu-top">
          <span className="wordmark">HAMID✳</span>
          <button
            type="button"
            autoFocus
            onClick={dismiss}
            aria-label="Close navigation"
          >
            Close <span>×</span>
          </button>
        </div>
        <nav aria-label="Mobile navigation">
          {[...links, { title: "Contact", href: "/contact/" }].map((link) => (
            <Link
              key={link.title}
              href={
                link.href === "/contact/"
                  ? "/contact/?source=navigation"
                  : link.href
              }
              onClick={close}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.title}
              <Arrow diagonal />
            </Link>
          ))}
        </nav>
        <p className="eyebrow">Based in Pakistan · Working worldwide</p>
      </dialog>
    </>
  );
}
