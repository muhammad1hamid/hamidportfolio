import type { Metadata } from "next";
import { site } from "@/data/site";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Experience } from "@/components/motion/Experience";
import { entityGraph, pageMeta } from "@/data/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Analytics } from "@/components/seo/Analytics";
import "./globals.css";
import "./refinements.css";
import "./testimonials.css";
import "./content.css";
import "./discovery.css";

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
    <html lang="en">
      <body suppressHydrationWarning>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Navigation />
        <Experience />
        {children}
        <Footer />
        <JsonLd data={entityGraph} />
        {!site.noindex && <Analytics />}
      </body>
    </html>
  );
}
