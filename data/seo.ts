import type { Metadata } from "next";
import { site } from "./site";
import { servicePages } from "./services";
import { articles } from "./articles";
import { insights, insightPath } from "./insights";
import { projects } from "./projects";
import { projectDetails } from "./project-details";
import experiencePages from "./experience-pages.json";

export const absolute = (path: string) => new URL(path, `${site.url}/`).href;
export const pageMeta = (
  title: string,
  description: string,
  path: string,
  image?: string,
  articleDate?: string,
  modifiedDate = articleDate,
): Metadata => ({
  title: { absolute: title },
  description,
  alternates: { canonical: path },
  robots: site.noindex
    ? { index: false, follow: false }
    : {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
  openGraph: {
    title,
    description,
    url: path,
    type: articleDate ? "article" : "website",
    siteName: "Hamid",
    locale: "en_US",
    ...(articleDate
      ? {
          publishedTime: articleDate,
          modifiedTime: modifiedDate,
          authors: [absolute("/about/")],
        }
      : {}),
    images: [
      {
        url:
          image ||
          `/images/share/${path === "/" ? "home" : path.split("/").filter(Boolean).join("-")}.png`,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [
      image ||
        `/images/share/${path === "/" ? "home" : path.split("/").filter(Boolean).join("-")}.png`,
    ],
  },
});

export const overviewProjects = projects.filter(
  (project) => projectDetails[project.id],
);
export const publicRoutes: {
  path: string;
  priority: number;
  modified?: string;
}[] = [
  { path: "/", priority: 1 },
  ...experiencePages.map((page) => ({ path: page.path, priority: 0.7 })),
  ...[
    "services",
    "about",
    "contact",
    "work",
    "case-studies",
    "blog",
    "insights",
  ].map((slug) => ({ path: `/${slug}/`, priority: 0.7 })),
  ...servicePages.map((service) => ({
    path: `/${service.slug}/`,
    priority: 0.8,
  })),
  ...overviewProjects.map((project) => ({
    path: `/work/${project.slug}/`,
    priority: 0.6,
  })),
  ...articles.map((article) => ({
    path: `/blog/${article.slug}/`,
    priority: 0.6,
    modified: article.modified || article.date,
  })),
  ...insights.map((insight) => ({
    path: insightPath(insight.slug),
    priority: 0.6,
    modified: insight.modified || insight.date,
  })),
];

export const entityGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": absolute("/#person"),
      name: "Hamid",
      alternateName: "Muhammad Hamid",
      url: absolute("/about/"),
      image: absolute("/images/hamid-hero.webp"),
      jobTitle: "Independent Web Developer & AI Automation Builder",
      description: site.description,
      homeLocation: { "@type": "Country", name: "Pakistan" },
      sameAs: [site.linkedin, site.instagram],
      knowsAbout: ["Web development", "AI automation", "Chatbot development"],
      worksFor: { "@id": absolute("/#organization") },
    },
    {
      "@type": "Organization",
      "@id": absolute("/#organization"),
      name: "Hamid",
      url: site.url,
      description:
        "Hamid's independent web development and AI automation practice, based in Pakistan and working remotely with businesses and agencies.",
      logo: absolute("/apple-touch-icon.png"),
      founder: { "@id": absolute("/#person") },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: site.telephone,
        contactType: "Project enquiries",
        url: site.whatsapp,
      },
      sameAs: [site.linkedin, site.instagram],
    },
    {
      "@type": "Organization",
      "@id": "https://www.elevatexlab.com/#organization",
      name: "ElevateX",
      url: "https://www.elevatexlab.com/",
      founder: { "@id": absolute("/#person") },
    },
    {
      "@type": "WebSite",
      "@id": absolute("/#website"),
      name: "Hamid",
      url: site.url,
      description: site.description,
      publisher: { "@id": absolute("/#organization") },
      inLanguage: "en",
    },
  ],
};

export function pageSchema(
  path: string,
  name: string,
  description: string,
  type = "WebPage",
) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": absolute(`${path}#webpage`),
    url: absolute(path),
    name,
    description,
    isPartOf: { "@id": absolute("/#website") },
    about: { "@id": absolute("/#person") },
    inLanguage: "en",
  };
}
