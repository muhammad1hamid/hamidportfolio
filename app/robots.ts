import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { testimonialPages } from "@/data/testimonial-pages";
export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  const publicRule = {
    allow: "/",
    disallow: [
      "/api/",
      "/admin/",
      "/auth/",
      "/login/",
      "/dashboard/",
      "/internal/",
    ],
  };
  return {
    rules: site.noindex
      ? { userAgent: "*", disallow: "/" }
      : [
          { userAgent: "*", ...publicRule },
          {
            userAgent: [
              "Googlebot",
              "Bingbot",
              "OAI-SearchBot",
              "GPTBot",
              "Claude-SearchBot",
              "Claude-User",
              "ClaudeBot",
              "PerplexityBot",
            ],
            ...publicRule,
          },
        ],
    ...(site.noindex
      ? {}
      : {
          sitemap: [
            `${site.url}/sitemap.xml`,
            ...(testimonialPages.some(
              (video) => video.thumbnail && video.uploadDate,
            )
              ? [`${site.url}/video-sitemap.xml`]
              : []),
          ],
        }),
  };
}
