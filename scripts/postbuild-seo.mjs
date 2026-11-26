import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { brotliCompress, gzip, constants } from "node:zlib";
import nextEnv from "@next/env";
import { createVideoSitemap } from "./video-sitemap.mjs";
nextEnv.loadEnvConfig(process.cwd());
const sitemap = await readFile("out/sitemap.xml", "utf8");
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
  (match) => match[1],
);
const origin = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://itshamid.com",
).origin;
await createVideoSitemap(origin);
const key = process.env.INDEXNOW_KEY || "";
if (key) {
  if (!/^[a-zA-Z0-9-]{8,128}$/.test(key))
    throw new Error(
      "INDEXNOW_KEY must be an 8–128 character public ownership key.",
    );
  if (process.env.SEO_NOINDEX !== "true")
    await writeFile(path.join("out", `${key}.txt`), key);
}
// Static hosts must honor these redirects or apply equivalent rules.
const redirects = [
  "/portfolio /work/ 301",
  "/portfolio/ /work/ 301",
  "/portfolio/index.html /work/ 301",
  "/index.html / 301",
  ...urls
    .filter((url) => new URL(url).pathname !== "/")
    .flatMap((url) => {
      const pathname = new URL(url).pathname;
      return [
        `${pathname.slice(0, -1)} ${pathname} 301`,
        `${pathname}index.html ${pathname} 301`,
      ];
    }),
];
await writeFile("out/_redirects", redirects.join("\n") + "\n");
await writeFile(
  "out/_headers",
  `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n${process.env.SEO_NOINDEX === "true" ? "  X-Robots-Tag: noindex, nofollow\n" : ""}/_next/static/*\n  Cache-Control: public, max-age=31536000, immutable\n/images/*\n  Cache-Control: public, max-age=86400, must-revalidate\n/images/social/*\n  Cache-Control: public, max-age=31536000, immutable\n`,
);
const br = promisify(brotliCompress),
  gz = promisify(gzip);
let count = 0;
async function compress(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await compress(filename);
      continue;
    }
    if (!/\.(html|css|js|json|svg|txt|xml)$/.test(entry.name)) continue;
    const buffer = await readFile(filename);
    if (buffer.length < 1024) continue;
    const [brotli, zipped] = await Promise.all([
      br(buffer, { params: { [constants.BROTLI_PARAM_QUALITY]: 6 } }),
      gz(buffer, { level: 8 }),
    ]);
    await writeFile(`${filename}.br`, brotli);
    await writeFile(`${filename}.gz`, zipped);
    count++;
  }
}
await compress("out");
console.log(
  `Prepared host rules and ${count} precompressed assets for ${urls.length} canonical pages.`,
);
