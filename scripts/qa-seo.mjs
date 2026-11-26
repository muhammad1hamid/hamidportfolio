import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
import sharp from "sharp";

const base = process.env.QA_BASE_URL || "http://127.0.0.1:3001";
const sitemapResponse = await fetch(`${base}/sitemap.xml`);
assert.equal(sitemapResponse.status, 200);
const sitemap = await sitemapResponse.text();
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
  (match) => match[1],
);
assert.equal(new Set(urls).size, urls.length);
assert.ok(urls.length >= 26);
const origin = new URL(urls[0]).origin;
const paths = urls.map((url) => new URL(url).pathname);
const servicePaths = JSON.parse(
  await readFile("data/services.json", "utf8"),
).map((service) => `/${service.slug}/`);
assert.equal(servicePaths.length, 11);
assert.ok(servicePaths.every((service) => paths.includes(service)));
const browser = await chromium.launch({
  executablePath:
    process.env.BROWSER_PATH ||
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
});
const records = [],
  failures = [],
  assets = new Set();
try {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  await context.route(/https?:\/\/(?!127\.0\.0\.1|localhost)/, (route) =>
    route.abort(),
  );
  const page = await context.newPage();
  for (const pathname of paths) {
    const response = await page.goto(base + pathname, { waitUntil: "load" });
    assert.equal(response.status(), 200, pathname);
    const record = await page.evaluate(() => {
      const meta = (name) =>
        document.querySelector(`meta[name="${name}"],meta[property="${name}"]`)
          ?.content;
      return {
        path: location.pathname,
        title: document.title,
        description: meta("description"),
        canonical: document.querySelector('link[rel="canonical"]')?.href,
        robots: meta("robots"),
        h1: [...document.querySelectorAll("main h1")].map((node) =>
          node.textContent.trim(),
        ),
        mainText: document.querySelector("main")?.innerText.length,
        ogTitle: meta("og:title"),
        ogDescription: meta("og:description"),
        ogImage: meta("og:image"),
        ogUrl: meta("og:url"),
        twitter: meta("twitter:card"),
        schema: [
          ...document.querySelectorAll('script[type="application/ld+json"]'),
        ].map((node) => JSON.parse(node.textContent)),
        links: [...document.querySelectorAll("a[href]")].map((node) =>
          node.getAttribute("href"),
        ),
        ids: [...document.querySelectorAll("[id]")].map((node) => node.id),
        images: [...document.images].map((img) => ({
          src: img.getAttribute("src"),
          alt: img.getAttribute("alt"),
          width: img.getAttribute("width"),
          height: img.getAttribute("height"),
          style: img.getAttribute("style"),
        })),
        breadcrumb:
          document.querySelector('[aria-label="Breadcrumb"]') !== null,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
      };
    });
    try {
      assert.ok(record.title && record.description, "title/description");
      assert.equal(record.canonical, origin + pathname, "self canonical");
      assert.ok(!record.robots?.includes("noindex"), "indexable");
      assert.doesNotMatch(
        (await response.headerValue("x-robots-tag")) || "",
        /\bnoindex\b|(?:^|,)\s*none\s*(?:,|$)/i,
        "indexable HTTP response",
      );
      assert.equal(record.h1.length, 1, "one H1");
      assert.ok(record.mainText > 350, "crawlable main text");
      assert.equal(
        record.ogTitle,
        pathname === "/"
          ? "Hamid — Web Development, SEO & AI Automation"
          : record.title,
        "OG title",
      );
      assert.equal(
        record.ogDescription,
        pathname === "/"
          ? "Independent developer building distinctive websites, improving search visibility, and creating practical AI systems for businesses."
          : record.description,
        "OG description",
      );
      assert.equal(record.ogUrl, record.canonical, "OG URL");
      assert.equal(record.twitter, "summary_large_image");
      assert.ok(record.ogImage.startsWith(origin), "absolute OG image");
      assert.equal(record.overflow, false, "mobile overflow");
      // The approved Contact composition uses the shared navigation without
      // a breadcrumb trail. Other interior pages keep their existing contract.
      const expectsBreadcrumb = pathname !== "/" && pathname !== "/contact/";
      if (expectsBreadcrumb)
        assert.ok(record.breadcrumb, "visible breadcrumbs");
      const nodes = record.schema.flatMap((item) => item["@graph"] || [item]);
      const webpage = nodes.find(
        (node) =>
          node.url === record.canonical &&
          ["WebPage", "CollectionPage", "AboutPage", "ContactPage"].includes(
            node["@type"],
          ),
      );
      assert.ok(webpage, "WebPage");
      if (servicePaths.includes(pathname) || pathname === "/for-agencies/") {
        const service = nodes.find((node) => node["@type"] === "Service");
        assert.equal(service?.url, record.canonical, "Service canonical URL");
        const provider =
          pathname === "/for-agencies/" ? "person" : "organization";
        assert.equal(service?.provider?.["@id"], `${origin}/#${provider}`);
        assert.equal(service?.mainEntityOfPage?.["@id"], webpage["@id"]);
        assert.equal(webpage.mainEntity?.["@id"], service["@id"]);
      }
      for (const type of ["Person", "Organization", "WebSite"])
        assert.ok(
          nodes.some((node) => node["@type"] === type),
          type,
        );
      if (pathname === "/" || pathname === "/about/") {
        const person = nodes.find(
          (node) => node["@id"] === `${origin}/#person`,
        );
        assert.equal(person?.name, "Muhammad Hamid");
        assert.equal(webpage.mainEntity?.["@id"], person["@id"]);
        assert.ok(person.sameAs?.length, "Person profile links");
        const practice = nodes.find(
          (node) => node["@id"] === `${origin}/#organization`,
        );
        assert.equal(practice?.founder?.["@id"], person["@id"]);
        assert.ok(
          !(practice.sameAs || []).some((url) => person.sameAs.includes(url)),
          "Personal profiles identify the Person",
        );
        const website = nodes.find(
          (node) => node["@id"] === `${origin}/#website`,
        );
        assert.equal(website?.publisher?.["@id"], practice["@id"]);
        assert.equal(webpage.isPartOf?.["@id"], website["@id"]);
      }
      if (expectsBreadcrumb)
        assert.ok(
          nodes.some((node) => node["@type"] === "BreadcrumbList"),
          "Breadcrumb schema",
        );
      if (/^\/(blog|insights)\/[^/]+\/$/.test(pathname)) {
        const article = nodes.find((node) => node["@type"] === "BlogPosting");
        assert.ok(
          article?.datePublished &&
            article.author?.["@id"] === `${origin}/#person`,
          "Article schema",
        );
        assert.equal(webpage.mainEntity?.["@id"], article["@id"]);
        assert.equal(article.mainEntityOfPage?.["@id"], webpage["@id"]);
      }
      for (const img of record.images) {
        assert.notEqual(img.alt, null, "image alt");
        assert.ok(
          (img.width && img.height) ||
            img.style?.includes("position:absolute") ||
            img.style?.includes("position: absolute"),
          "image dimensions",
        );
        if (img.src.startsWith("/")) assets.add(img.src);
      }
    } catch (error) {
      failures.push(`${pathname}: ${error.message}`);
    }
    assets.add(new URL(record.ogImage).pathname);
    records.push(record);
  }
  assert.equal(
    new Set(records.map((r) => r.title)).size,
    records.length,
    "unique titles",
  );
  assert.equal(
    new Set(records.map((r) => r.description)).size,
    records.length,
    "unique descriptions",
  );
  assert.equal(
    new Set(records.map((r) => r.ogImage)).size,
    records.length,
    "unique share images",
  );
  const graph = new Map(records.map((record) => [record.path, new Set()]));
  for (const record of records) {
    for (const href of record.links) {
      const url = new URL(href, base + record.path);
      if (![new URL(base).origin, origin].includes(url.origin)) continue;
      if (["/robots.txt", "/sitemap.xml"].includes(url.pathname)) {
        assets.add(url.pathname);
        continue;
      }
      const target = records.find((page) => page.path === url.pathname);
      if (!target) {
        failures.push(`${record.path}: internal link outside sitemap ${href}`);
        continue;
      }
      graph.get(record.path).add(url.pathname);
      if (
        url.hash &&
        !target.ids.includes(decodeURIComponent(url.hash.slice(1)))
      )
        failures.push(`${record.path}: missing anchor ${href}`);
    }
  }
  const reached = new Set(["/"]);
  const queue = ["/"];
  while (queue.length)
    for (const child of graph.get(queue.shift()))
      if (!reached.has(child)) {
        reached.add(child);
        queue.push(child);
      }
  assert.equal(reached.size, paths.length, "no orphan pages");
  for (const asset of assets)
    assert.equal((await fetch(base + asset)).status, 200, `asset ${asset}`);
  for (const record of records) {
    const metadata = await sharp(
      `out${new URL(record.ogImage).pathname}`,
    ).metadata();
    assert.equal(metadata.width, 1200);
    assert.equal(metadata.height, 630);
  }
  await context.close();
  const live = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await live.route(/https?:\/\/(?!127\.0\.0\.1|localhost)/, (route) =>
    route.abort(),
  );
  const interactive = await live.newPage();
  for (const pathname of paths.filter(
    (pathname) => !["/", "/work/"].includes(pathname),
  )) {
    await interactive.goto(base + pathname, { waitUntil: "networkidle" });
    const results = await new AxeBuilder({ page: interactive })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    if (results.violations.length)
      failures.push(
        `${pathname}: axe ${JSON.stringify(results.violations.map((item) => ({ id: item.id, nodes: item.nodes.map((node) => node.target) })))}`,
      );
    const widths = ["/growth/", "/services/", "/contact/"].includes(pathname)
      ? [320, 375, 390, 768, 1024, 1440]
      : [320, 390, 768, 1440];
    for (const width of widths) {
      await interactive.setViewportSize({ width, height: 900 });
      assert.equal(
        await interactive.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        true,
        `${pathname} overflow at ${width}`,
      );
    }
    await interactive.setViewportSize({ width: 390, height: 844 });
  }
  for (const [pathname, file] of [
    ["/web-development/", "seo-service"],
    ["/growth/", "seo-growth"],
    ["/services/", "seo-service-index"],
    ["/blog/business-website-brief/", "seo-article"],
    ["/work/bridal-house/", "seo-project"],
    ["/", "seo-home"],
  ]) {
    for (const width of [390, 1440]) {
      await interactive.setViewportSize({ width, height: 1000 });
      await interactive.goto(base + pathname, { waitUntil: "networkidle" });
      await interactive.screenshot({
        path: `qa-output/${file}-${width}.png`,
        fullPage: !["/growth/", "/services/"].includes(pathname),
      });
    }
  }
  await live.close();
} finally {
  await browser.close();
}
const robots = await (await fetch(base + "/robots.txt")).text();
for (const name of [
  "Googlebot",
  "Bingbot",
  "OAI-SearchBot",
  "GPTBot",
  "Claude-SearchBot",
  "Claude-User",
  "ClaudeBot",
  "PerplexityBot",
])
  assert.ok(robots.includes(`User-Agent: ${name}`), name);
assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
for (const [source, target] of [
  ["/portfolio", "/work/"],
  ["/portfolio/", "/work/"],
  ["/portfolio/index.html", "/work/"],
  ["/work", "/work/"],
  ["/work/index.html", "/work/"],
  ["/index.html", "/"],
  ["/web-development?campaign=test", "/web-development/?campaign=test"],
]) {
  const response = await fetch(base + source, { redirect: "manual" });
  assert.equal(response.status, 301, source);
  assert.equal(response.headers.get("location"), target);
}
const missing = await fetch(base + "/this-page-does-not-exist/");
assert.equal(missing.status, 404);
assert.ok((await missing.text()).includes("noindex"));
const queryPage = await (
  await fetch(base + "/web-development/?campaign=test")
).text();
assert.ok(
  queryPage.includes(`rel="canonical" href="${origin}/web-development/"`),
);
const overview = await fetch(base + "/llms.txt");
assert.equal(overview.status, 200);
assert.match(overview.headers.get("content-type"), /^text\/plain/);
const overviewText = await overview.text();
for (const pathname of servicePaths)
  assert.ok(overviewText.includes(`(${origin}${pathname})`), pathname);
const compressed = await fetch(base + "/services/", {
  headers: { "Accept-Encoding": "br" },
});
assert.equal(compressed.headers.get("content-encoding"), "br");
const identity = await fetch(base + "/services/", {
  headers: { "Accept-Encoding": "br;q=0, gzip;q=0" },
});
assert.equal(identity.headers.get("content-encoding"), null);
await mkdir("qa-output", { recursive: true });
await writeFile(
  "qa-output/seo-audit.json",
  JSON.stringify(
    {
      date: new Date().toISOString(),
      base,
      canonicalOrigin: origin,
      pages: records.length,
      assets: assets.size,
      mobileWidths: [320, 390, 768, 1440],
      failures,
      records,
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    { pages: records.length, assets: assets.size, failures },
    null,
    2,
  ),
);
assert.equal(
  failures.length,
  0,
  "SEO/accessibility failures — see qa-output/seo-audit.json",
);
