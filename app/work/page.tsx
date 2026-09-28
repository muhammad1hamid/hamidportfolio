import type { Metadata } from "next";
import Link from "next/link";
import { Work } from "@/components/projects/Work";
import { Arrow } from "@/components/ui/Arrow";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Work archive",
  description:
    "Explore Hamid’s web development, AI systems, automation, and chatbot project archive.",
  alternates: { canonical: "/work/" },
  openGraph: {
    title: "Work archive — Hamid",
    description: "Web experiences and intelligent systems, built with care.",
    url: "/work/",
  },
  twitter: {
    title: "Work archive — Hamid",
    description: "Web experiences and intelligent systems, built with care.",
  },
};

export default function WorkPage() {
  return (
    <main id="main" className="archive-page">
      <div className="archive-heading wrap">
        <Link className="text-link" href="/">
          ← Back to home
        </Link>
        <div className="section-marker">
          <span>The project archive</span>
          <span>Web / Intelligence / Systems</span>
        </div>
        <h1>
          THE WORK.
          <br />
          <em>And what’s next.</em>
        </h1>
        <p>
          A growing collection of web experiences and intelligent systems.
          {!projects.some((project) => project.status === "published") && (
            <>
              <br />
              The real project stories are coming soon.
            </>
          )}
        </p>
      </div>
      <Work archive />
      <div className="archive-contact wrap">
        <span>Have something in mind?</span>
        <Link href="/#contact">
          Let’s build it <Arrow diagonal />
        </Link>
      </div>
    </main>
  );
}
