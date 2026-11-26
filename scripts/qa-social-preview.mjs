import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { chromium } from "playwright-core";

const base = process.env.QA_BASE_URL || "http://127.0.0.1:3000";
const output = process.env.QA_SOCIAL_OUTPUT || "qa-output/social-preview";
const publicOrigin = "https://itshamid.com";
const registry = JSON.parse(await readFile("data/social-images.json", "utf8"));
const design = JSON.parse(
  await readFile("data/social-preview-design.json", "utf8"),
);
const manifest = JSON.parse(
  await readFile("scripts/social/asset-manifest.json", "utf8"),
);
const report = { checks: [], pages: [], images: [], crawlers: [], errors: [] };
await mkdir(output, { recursive: true });
const decode = (value) =>
  value.replace(
    /&(?:amp|quot|lt|gt|#x27|#39);/g,
    (entity) =>
      ({
        "&amp;": "&",
        "&quot;": '"',
        "&lt;": "<",
        "&gt;": ">",
        "&#x27;": "'",
        "&#39;": "'",
      })[entity],
  );
function rawMetadata(html) {
  const tags = [...html.matchAll(/<meta\s[^>]*>/g)].map(([tag]) => {
    const attributes = Object.fromEntries(
      [...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [
        key,
        decode(value),
      ]),
    );
    return {
      key: attributes.property ?? attributes.name,
      value: attributes.content,
    };
  });
  const meta = (key) =>
    tags.filter((tag) => tag.key === key).map((tag) => tag.value);
  return {
    meta,
    title: decode(html.match(/<title>(.*?)<\/title>/)?.[1] ?? ""),
    canonical: decode(
      html.match(/<link\s[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1] ?? "",
    ),
    schemas: [
      ...html.matchAll(
        /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
      ),
    ].flatMap(([, json]) => {
      const schema = JSON.parse(json);
      return schema["@graph"] ?? [schema];
    }),
  };
}
const check = async (name, run) => {
  try {
    await run();
    report.checks.push({ name, passed: true });
    console.log("PASS", name);
  } catch (error) {
    report.checks.push({ name, passed: false, error: error.message });
    console.error("FAIL", name, error.message);
  }
};
const one = (data, key) => {
  const values = data.meta(key);
  assert.equal(values.length, 1, `${key}: expected one tag`);
  return values[0];
};
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
try {
  await check(
    "Every canonical route has one complete social metadata set in its initial HTML",
    async () => {
      const sitemap = await fetch(base + "/sitemap.xml").then((response) =>
        response.text(),
      );
      const routes = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
        ([, url]) => new URL(url).pathname,
      );
      assert.equal(routes.length, Object.keys(registry).length);
      for (const route of routes) {
        const response = await fetch(base + route);
        assert.equal(response.status, 200, route);
        assert.doesNotMatch(
          response.headers.get("x-robots-tag") ?? "",
          /noindex|none/i,
        );
        const html = await response.text();
        const data = rawMetadata(html);
        assert.equal(data.canonical, publicOrigin + route);
        const image = registry[route];
        assert.ok(image, route);
        const imageURL = publicOrigin + image.image;
        assert.equal(one(data, "og:url"), data.canonical);
        assert.equal(one(data, "og:site_name"), "HAMID");
        assert.equal(
          one(data, "og:type"),
          /^\/(blog|insights)\/[^/]+\//.test(route) ? "article" : "website",
        );
        assert.equal(one(data, "og:image"), imageURL);
        assert.equal(one(data, "og:image:secure_url"), imageURL);
        assert.equal(one(data, "og:image:type"), "image/jpeg");
        assert.equal(one(data, "og:image:width"), "1200");
        assert.equal(one(data, "og:image:height"), "630");
        assert.equal(one(data, "og:image:alt"), image.alt);
        assert.equal(one(data, "twitter:card"), "summary_large_image");
        assert.equal(one(data, "twitter:image"), imageURL);
        assert.equal(one(data, "twitter:image:alt"), image.alt);
        assert.equal(data.meta("twitter:site").length, 0);
        assert.equal(data.meta("twitter:creator").length, 0);
        assert.equal(data.meta("og:video").length, 0);
        assert.match(one(data, "robots"), /max-image-preview:large/);
        if (route === "/") {
          assert.equal(
            data.title,
            "Web Development, SEO & AI Automation | Hamid",
          );
          assert.equal(one(data, "og:title"), design.home.title);
          assert.equal(one(data, "og:description"), design.home.description);
          assert.equal(one(data, "twitter:title"), design.home.title);
          assert.equal(
            one(data, "twitter:description"),
            design.home.twitterDescription,
          );
        } else {
          assert.equal(one(data, "og:title"), data.title);
          assert.equal(one(data, "og:description"), one(data, "description"));
          assert.equal(one(data, "twitter:title"), data.title);
        }
        const person = data.schemas.filter(
          (node) => node["@type"] === "Person",
        );
        assert.equal(person.length, 1);
        assert.equal(person[0]["@id"], publicOrigin + "/#person");
        assert.equal(person[0].image, publicOrigin + design.portrait.image);
        const webpage = data.schemas.find(
          (node) => node["@id"] === data.canonical + "#webpage",
        );
        assert.ok(webpage?.primaryImageOfPage);
        const representative = route === "/" || route === "/about/";
        assert.equal(
          webpage.primaryImageOfPage.url,
          publicOrigin + (representative ? design.portrait.image : image.image),
        );
        report.pages.push({
          route,
          title: data.title,
          socialTitle: one(data, "og:title"),
          image: imageURL,
          primaryImage: webpage.primaryImageOfPage.url,
          initialHTML: true,
          duplicateOG: false,
        });
      }
    },
  );
  await check(
    "All versioned image URLs are direct public JPEGs with correct dimensions and no image indexing block",
    async () => {
      for (const image of [...Object.values(registry), design.portrait]) {
        const response = await fetch(base + image.image, {
          redirect: "manual",
        });
        assert.equal(response.status, 200, image.image);
        assert.match(response.headers.get("content-type"), /^image\/jpeg/);
        assert.doesNotMatch(
          response.headers.get("x-robots-tag") ?? "",
          /noindex|noimageindex|none/i,
        );
        const buffer = Buffer.from(await response.arrayBuffer());
        const meta = await sharp(buffer).metadata();
        assert.equal(meta.width, image.width);
        assert.equal(meta.height, image.height);
        assert.ok(
          buffer.length < 300_000,
          `Oversized social image: ${image.image}`,
        );
        report.images.push({
          path: image.image,
          status: response.status,
          type: response.headers.get("content-type"),
          width: meta.width,
          height: meta.height,
          bytes: buffer.length,
          cache: response.headers.get("cache-control"),
        });
      }
    },
  );
  await check(
    "Facebook, LinkedIn, WhatsApp, Twitter and Google-style requests receive the same initial metadata and real image",
    async () => {
      for (const agent of [
        "facebookexternalhit/1.1",
        "LinkedInBot/1.0",
        "WhatsApp/2.24.0",
        "Twitterbot/1.0",
        "Googlebot/2.1",
      ]) {
        const response = await fetch(base + "/", {
          headers: { "User-Agent": agent },
        });
        assert.equal(response.status, 200);
        const data = rawMetadata(await response.text());
        assert.equal(one(data, "og:image"), publicOrigin + registry["/"].image);
        assert.equal(one(data, "og:title"), design.home.title);
        const image = await fetch(base + registry["/"].image, {
          headers: { "User-Agent": agent },
          redirect: "manual",
        });
        assert.equal(image.status, 200);
        assert.match(image.headers.get("content-type"), /^image\/jpeg/);
        report.crawlers.push({
          userAgent: agent,
          pageStatus: response.status,
          imageStatus: image.status,
        });
      }
    },
  );
  await check(
    "Banner crop simulations retain the real face and text stays within the composed canvas",
    async () => {
      const home = `public${registry["/"].image}`;
      for (const [width, height] of [
        [1200, 630],
        [600, 315],
        [300, 158],
        [96, 96],
        [80, 80],
      ]) {
        await sharp(home)
          .resize(width, height, { fit: "cover", position: "centre" })
          .png()
          .toFile(path.join(output, `home-${width}x${height}.png`));
      }
      const frame = manifest.assets.find((asset) => asset.path === "/");
      const squareStart = (1200 - 630) / 2;
      assert.ok(frame.faceBounds.left >= squareStart);
      assert.ok(
        frame.faceBounds.left + frame.faceBounds.width <= squareStart + 630,
      );
      for (const asset of manifest.assets)
        for (const text of asset.textFrames) {
          assert.ok(
            text.x >= 50 &&
              text.y >= 40 &&
              text.x + text.width <= 1160 &&
              text.y + text.height <= 610,
            `Text outside safe area: ${asset.path}`,
          );
        }
      const original = await sharp(
        `public${design.portrait.representativeSource}`,
      ).metadata();
      assert.ok(
        original.width >= design.portrait.width &&
          original.height >= design.portrait.height,
        "Portrait is upscaled",
      );
    },
  );
  await check(
    "Homepage and About retain readable natural portrait HTML, correct page title and favicon without JavaScript",
    async () => {
      const context = await browser.newContext({
        javaScriptEnabled: false,
        viewport: { width: 390, height: 844 },
      });
      await context.route(
        (url) => url.origin !== new URL(base).origin,
        (route) => route.abort(),
      );
      const page = await context.newPage();
      try {
        for (const route of ["/", "/about/"]) {
          await page.goto(base + route);
          assert.equal(await page.locator("main h1").count(), 1);
          const portrait = page.locator(`img[src="${design.portrait.image}"]`);
          assert.equal(await portrait.count(), 1);
          assert.equal(await portrait.getAttribute("alt"), design.portrait.alt);
          assert.equal(
            await page.locator('link[rel="icon"]').getAttribute("href"),
            "/favicon.svg",
          );
        }
      } finally {
        await context.close();
      }
    },
  );
  await check(
    "Public image crawling remains allowed while private route protections stay in robots.txt",
    async () => {
      const robots = await fetch(base + "/robots.txt").then((response) =>
        response.text(),
      );
      assert.doesNotMatch(robots, /Disallow: \/images/);
      for (const route of [
        "api",
        "admin",
        "auth",
        "login",
        "dashboard",
        "internal",
      ])
        assert.ok(robots.includes(`Disallow: /${route}/`));
    },
  );
} finally {
  await browser.close();
  await writeFile(
    path.join(output, "results.json"),
    JSON.stringify(report, null, 2),
  );
}
console.log(
  `${report.checks.filter((check) => check.passed).length}/${report.checks.length} social preview checks passed; ${report.pages.length} pages, ${report.images.length} images.`,
);
if (report.checks.some((check) => !check.passed)) process.exitCode = 1;
