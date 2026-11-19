import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { publicRoutes, absolute } from "@/data/seo";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return site.noindex
    ? []
    : publicRoutes.map((route) => ({
        url: absolute(route.path),
        priority: route.priority,
        ...("modified" in route ? { lastModified: route.modified } : {}),
      }));
}
