"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Arrow } from "@/components/ui/Arrow";

const links = [
  { title: "Work", href: "/work/" },
  { title: "Services", href: "/services/" },
  { title: "About", href: "/about/" },
  { title: "Reviews", href: "/#testimonials" },
  { title: "Insights", href: "/insights/" },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDialogElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 60);
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    return () => window.removeEventListener("scroll", scroll);
  }, []);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (open) {
      menu.current?.showModal();
      document.body.style.overflow = "hidden";
    } else {
      menu.current?.close();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  const close = () => {
    setOpen(false);
    button.current?.focus();
  };
  return (
    <>
      <header className={`navigation ${scrolled ? "is-scrolled" : ""}`}>
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
          className="nav-contact"
          href="/contact/"
          aria-current={pathname === "/contact/" ? "page" : undefined}
        >
          Discuss a project <Arrow diagonal />
        </Link>
        <button
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
        onCancel={close}
        onClose={() => setOpen(false)}
      >
        <div className="mobile-menu-top">
          <span className="wordmark">HAMID✳</span>
          <button autoFocus onClick={close} aria-label="Close navigation">
            Close <span>×</span>
          </button>
        </div>
        <nav aria-label="Mobile navigation">
          {[...links, { title: "Contact", href: "/contact/" }].map((link) => (
            <Link
              key={link.title}
              href={link.href}
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
