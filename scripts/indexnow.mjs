import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());
const submit = process.argv.includes("--submit");
if (process.env.SEO_NOINDEX === "true")
  throw new Error("IndexNow is disabled for a noindex/staging build.");
const sitemap = await readFile("out/sitemap.xml", "utf8");
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
  (match) => match[1],
);
if (!urls.length)
  throw new Error("No indexable URLs found. Build the public site first.");
const origin = new URL(urls[0]).origin;
if (
  !origin.startsWith("https://") ||
  urls.some((url) => new URL(url).origin !== origin)
)
  throw new Error("All URLs must use one public HTTPS origin.");
const stateFile = ".indexnow-state.json";
let previous = {};
try {
  const saved = JSON.parse(await readFile(stateFile, "utf8"));
  if (saved.origin === origin) previous = saved.pages;
} catch {
  /* First submission includes all pages. */
}
const sha = (value) => createHash("sha256").update(value).digest("hex");
const pages = {};
for (const url of urls) {
  const pathname = new URL(url).pathname;
  const filename = path.resolve("out", `.${pathname}`, "index.html");
  if (!filename.startsWith(path.resolve("out") + path.sep))
    throw new Error("Invalid sitemap path.");
  const html = await readFile(filename);
  if (/name="robots"[^>]*content="[^"]*noindex/.test(html.toString()))
    throw new Error(`Noindex page in sitemap: ${url}`);
  pages[url] = sha(html);
}
const changed = urls.filter((url) => pages[url] !== previous[url]);
const deleted = Object.keys(previous).filter((url) => !pages[url]);
const notifications = [...changed, ...deleted];
console.log(
  JSON.stringify(
    { mode: submit ? "submit" : "dry-run", origin, changed, deleted },
    null,
    2,
  ),
);
if (!submit || !notifications.length) process.exit(0);
const key = process.env.INDEXNOW_KEY || "";
if (!/^[a-zA-Z0-9-]{8,128}$/.test(key))
  throw new Error(
    "Set a real public INDEXNOW_KEY, rebuild and deploy before submitting.",
  );
const keyLocation = `${origin}/${key}.txt`;
const proof = await fetch(keyLocation, {
  redirect: "error",
  signal: AbortSignal.timeout(15000),
});
if (!proof.ok || (await proof.text()).trim() !== key)
  throw new Error(
    "The live site does not serve the matching IndexNow ownership key.",
  );
// Confirm the changed build is actually deployed, not merely present on disk.
for (const url of changed) {
  const response = await fetch(url, {
    redirect: "error",
    signal: AbortSignal.timeout(15000),
  });
  if (
    !response.ok ||
    sha(Buffer.from(await response.arrayBuffer())) !== pages[url]
  )
    throw new Error(
      `Live page differs from this export: ${url}. Deploy this build before submitting.`,
    );
}
for (const url of deleted) {
  const response = await fetch(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
  });
  if (![301, 308, 404, 410].includes(response.status))
    throw new Error(`Removed URL is still publicly served: ${url}`);
}
for (let start = 0; start < notifications.length; start += 10000) {
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      host: new URL(origin).hostname,
      key,
      keyLocation,
      urlList: notifications.slice(start, start + 10000),
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (![200, 202].includes(response.status))
    throw new Error(
      `IndexNow rejected the request with HTTP ${response.status}. State was not advanced.`,
    );
  console.log(
    `IndexNow accepted a batch (HTTP ${response.status}); indexing is not guaranteed.`,
  );
}
await writeFile(
  stateFile,
  JSON.stringify(
    { origin, pages, submittedAt: new Date().toISOString() },
    null,
    2,
  ),
);
