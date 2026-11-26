import type { Metadata } from "next";
import { site } from "./site";
import { servicePages } from "./services";
import { articles } from "./articles";
import { insights, insightPath } from "./insights";
import { storyProjects } from "./projects";
import experiencePages from "./experience-pages.json";
import {
  homepageSocial,
  representativePortrait,
  socialImageFor,
} from "./social-preview";

export const absolute = (path: string) => new URL(path, `${site.url}/`).href;
export const pageMeta = (
  title: string,
  description: string,
  path: string,
  image?: string,
  articleDate?: string,
  modifiedDate = articleDate,
): Metadata => {
  const preview = socialImageFor(path);
  const socialTitle = path === "/" ? homepageSocial.title : title;
  const socialDescription =
    path === "/" ? homepageSocial.description : description;
  const imageUrl = absolute(image || preview.image);
  const imageType = /\.png$/i.test(imageUrl) ? "image/png" : "image/jpeg";
  return {
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
      title: socialTitle,
      description: socialDescription,
      url: absolute(path),
      type: articleDate ? "article" : "website",
      siteName: "HAMID",
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
          url: imageUrl,
          secureUrl: imageUrl,
          type: imageType,
          width: 1200,
          height: 630,
          alt: preview.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description:
        path === "/" ? homepageSocial.twitterDescription : description,
      images: [{ url: imageUrl, alt: preview.alt }],
    },
  };
};

export const publicRoutes: {
  path: string;
  priority: number;
  modified?: string;
}[] = [
  { path: "/", priority: 1 },
  ...experiencePages.map((page) => ({ path: page.path, priority: 0.7 })),
  ...[
    "services",
    "for-agencies",
    "about",
    "contact",
    "privacy",
    "work",
    "case-studies",
    "blog",
    "insights",
  ].map((slug) => ({ path: `/${slug}/`, priority: 0.7 })),
  ...servicePages.map((service) => ({
    path: `/${service.slug}/`,
    priority: 0.8,
  })),
  ...storyProjects.map((project) => ({
    path: project.detailUrl,
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
      name: site.personName,
      alternateName: site.name,
      url: absolute("/about/"),
      image: absolute(representativePortrait.image),
      jobTitle: "Independent Developer & Digital Growth Builder",
      description: site.description,
      homeLocation: { "@type": "Country", name: "Pakistan" },
      sameAs: [site.linkedin, site.instagram],
      knowsAbout: [
        "Web development",
        "Search engine optimization",
        "AI search visibility",
        "AI automation",
        "Chatbot development",
      ],
      worksFor: { "@id": absolute("/#organization") },
    },
    {
      "@type": "Organization",
      "@id": absolute("/#organization"),
      name: site.name,
      url: absolute("/"),
      description:
        "Hamid's independent web development, search and AI visibility, and automation practice, based in Pakistan and working remotely with businesses and agencies.",
      logo: absolute("/apple-touch-icon.png"),
      founder: { "@id": absolute("/#person") },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: site.telephone,
        contactType: "Project enquiries",
        url: site.whatsapp,
      },
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
      name: site.name,
      url: absolute("/"),
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
  { type = "WebPage", mainEntity }: { type?: string; mainEntity?: string } = {},
) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": absolute(`${path}#webpage`),
    url: absolute(path),
    name,
    description,
    isPartOf: { "@id": absolute("/#website") },
    primaryImageOfPage: {
      "@type": "ImageObject",
      "@id": absolute(`${path === "/about/" ? "/" : path}#primaryimage`),
      url: absolute(
        path === "/" || path === "/about/"
          ? representativePortrait.image
          : socialImageFor(path).image,
      ),
      width:
        path === "/" || path === "/about/"
          ? representativePortrait.width
          : 1200,
      height:
        path === "/" || path === "/about/"
          ? representativePortrait.height
          : 630,
      caption:
        path === "/" || path === "/about/"
          ? representativePortrait.alt
          : socialImageFor(path).alt,
    },
    ...(mainEntity && { mainEntity: { "@id": absolute(mainEntity) } }),
    inLanguage: "en",
  };
}

export function serviceSchema(
  service: { slug: string; name: string; description: string },
  serviceType = service.name,
) {
  const path = `/${service.slug}/`;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": absolute(`${path}#service`),
    name: service.name,
    serviceType,
    description: service.description,
    url: absolute(path),
    provider: { "@id": absolute("/#organization") },
    areaServed: [
      { "@type": "Country", name: "Pakistan" },
      { "@type": "Place", name: "Remote / worldwide" },
    ],
    mainEntityOfPage: { "@id": absolute(`${path}#webpage`) },
  };
}
