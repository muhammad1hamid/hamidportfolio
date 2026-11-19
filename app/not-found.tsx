import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Page not found — Hamid",
  description:
    "This page could not be found. Explore Hamid’s services, portfolio or contact page.",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
};
export default function NotFound() {
  return (
    <main id="main" className="not-found wrap">
      <span className="eyebrow">404 / A wrong turn</span>
      <h1>
        Nothing built
        <br />
        <em>here. Yet.</em>
      </h1>
      <Link href="/" className="button button-light">
        Back to Hamid ↗
      </Link>
      <nav className="related-links" aria-label="Find another page">
        <Link href="/services/">Explore services ↗</Link>
        <Link href="/contact/">Contact Hamid ↗</Link>
      </nav>
    </main>
  );
}
