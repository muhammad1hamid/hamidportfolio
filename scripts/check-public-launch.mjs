import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve4 } from "node:dns/promises";
import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());
const sitemap = await readFile("out/sitemap.xml", "utf8");
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
  (match) => match[1],
);
const origin = new URL(urls[0]).origin;
const report = {
  checkedAt: new Date().toISOString(),
  origin,
  configured: {
    googleVerification: Boolean(process.env.GOOGLE_SITE_VERIFICATION),
    bingVerification: Boolean(process.env.BING_SITE_VERIFICATION),
    googleTagManager: (await readFile("out/index.html", "utf8")).includes(
      'id="hamid-google-tag-manager"',
    ),
    indexNow: Boolean(process.env.INDEXNOW_KEY),
  },
  dns: null,
  pages: [],
  ready: false,
};
try {
  report.dns = { addresses: await resolve4(new URL(origin).hostname) };
} catch (error) {
  report.dns = { error: error.code || error.message };
}
if (report.dns.addresses) {
  for (const pathname of [
    "/",
    "/robots.txt",
    "/sitemap.xml",
    "/plan/",
    "/testimonials/abdullah-abbasii/",
    "/this-page-does-not-exist/",
  ]) {
    try {
      const response = await fetch(`${origin}${pathname}`, {
        signal: AbortSignal.timeout(15000),
        redirect: "manual",
      });
      const text = await response.text();
      const missing = pathname === "/this-page-does-not-exist/";
      const page = {
        path: pathname,
        status: response.status,
        expectedStatus: missing ? 404 : 200,
      };
      if (pathname === "/sitemap.xml")
        page.matchesBuild = urls.every((url) =>
          text.includes(`<loc>${url}</loc>`),
        );
      if (pathname === "/robots.txt")
        page.hasSitemap = text.includes(`${origin}/sitemap.xml`);
      if (!missing && pathname.endsWith("/") && response.ok) {
        page.canonical = text.includes(
          `rel="canonical" href="${origin}${pathname}"`,
        );
        page.indexable =
          !/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(text) &&
          !response.headers.get("x-robots-tag")?.includes("noindex");
        page.matchesBuild =
          text === (await readFile(`out${pathname}index.html`, "utf8"));
      }
      report.pages.push(page);
    } catch (error) {
      report.pages.push({ path: pathname, error: error.message });
    }
  }
}
report.ready =
  report.pages.length === 6 &&
  report.pages.every(
    (page) =>
      !page.error &&
      page.status === page.expectedStatus &&
      page.canonical !== false &&
      page.indexable !== false &&
      page.matchesBuild !== false &&
      page.hasSitemap !== false,
  );
await mkdir("qa-output", { recursive: true });
await writeFile(
  "qa-output/public-launch.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
// This check reads the public host only. It never publishes or submits URLs.
if (!report.ready) process.exitCode = 2;
