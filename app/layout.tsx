import type { Metadata } from "next";
import { site } from "@/data/site";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Experience } from "@/components/motion/Experience";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: "%s — Hamid" },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: site.title,
    description: site.description,
    siteName: "Hamid",
    url: "/",
  },
  twitter: {
    card: "summary",
    title: site.title,
    description: site.description,
  },
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Navigation />
        <Experience />
        {children}
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Hamid",
              url: site.url,
              jobTitle: "Web Developer & AI Automation Builder",
              knowsAbout: [
                "Web development",
                "AI automation",
                "Chatbot development",
              ],
              homeLocation: { "@type": "Country", name: "Pakistan" },
              sameAs: [site.linkedin, site.instagram].filter(Boolean),
            }).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
