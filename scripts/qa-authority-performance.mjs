import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const base = new URL(process.env.QA_BASE_URL || "http://127.0.0.1:3000");
const label = process.env.QA_LABEL || "authority";
const runs = Number(process.env.QA_RUNS || 3);
const routes = (process.env.QA_ROUTES || "").split(",").filter(Boolean);
const pages = routes.length
  ? routes
  : [
      "/",
      "/growth/",
      "/contact/",
      "/work/",
      "/work/bridal-house/",
      "/insights/",
      "/insights/measure-whatsapp-enquiries/",
      "/blog/",
      "/for-agencies/",
    ];
const profiles = [
  {
    name: "mobile",
    width: 390,
    height: 844,
    cpu: 4,
    latency: 150,
    download: 200000,
    mobile: true,
  },
  {
    name: "desktop",
    width: 1440,
    height: 960,
    cpu: 1,
    latency: 40,
    download: 1250000,
    mobile: false,
  },
];
assert.ok(/^[a-z0-9-]+$/i.test(label) && Number.isInteger(runs) && runs > 0);
const browser = await chromium.launch({
  executablePath:
    process.env.BROWSER_PATH ||
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
});
const results = [];
const checkedAt = new Date().toISOString();
const output = "qa-output/" + label;
await mkdir(output, { recursive: true });

try {
  for (const profile of profiles) {
    for (const pathname of pages) {
      const url = new URL(pathname, base);
      assert.equal(url.origin, base.origin);
      for (let i = 1; i <= runs; i++) {
        const context = await browser.newContext({
          viewport: { width: profile.width, height: profile.height },
          deviceScaleFactor: 1,
          isMobile: profile.mobile,
          hasTouch: profile.mobile,
          reducedMotion: "reduce",
        });
        try {
          let externalRequests = 0;
          await context.route("**/*", (route) => {
            if (new URL(route.request().url()).origin === base.origin)
              return route.continue();
            externalRequests++;
            return route.abort();
          });
          const page = await context.newPage();
          const client = await context.newCDPSession(page);
          await client.send("Network.enable");
          await client.send("Network.emulateNetworkConditions", {
            offline: false,
            latency: profile.latency,
            downloadThroughput: profile.download,
            uploadThroughput: profile.download,
          });
          await client.send("Emulation.setCPUThrottlingRate", {
            rate: profile.cpu,
          });
          await page.addInitScript(() => {
            window.authorityLab = {
              lcpMs: null,
              lcpElement: null,
              cls: 0,
              longTasks: [],
            };
            let windowStart = 0;
            let lastShift = 0;
            let windowValue = 0;
            new PerformanceObserver((list) => {
              const entry = list.getEntries().at(-1);
              window.authorityLab.lcpMs = Math.round(entry.startTime);
              window.authorityLab.lcpElement = entry.element?.tagName ?? null;
              window.authorityLab.lcpImage = entry.url
                ? new URL(entry.url).pathname
                : null;
            }).observe({ type: "largest-contentful-paint", buffered: true });
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (entry.hadRecentInput) continue;
                if (
                  entry.startTime - lastShift > 1000 ||
                  entry.startTime - windowStart > 5000
                ) {
                  windowStart = entry.startTime;
                  windowValue = 0;
                }
                windowValue += entry.value;
                lastShift = entry.startTime;
                window.authorityLab.cls = Math.max(
                  window.authorityLab.cls,
                  windowValue,
                );
              }
            }).observe({ type: "layout-shift", buffered: true });
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                window.authorityLab.longTasks.push({
                  start: Math.round(entry.startTime),
                  duration: Math.round(entry.duration),
                });
              }
            }).observe({ type: "longtask", buffered: true });
          });
          const response = await page.goto(url.href, {
            waitUntil: "load",
            timeout: 25000,
          });
          assert.equal(response.status(), 200, url.href);
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(750);
          const measurement = await page.evaluate(() => {
            const navigation = performance.getEntriesByType("navigation")[0];
            const resources = performance
              .getEntriesByType("resource")
              .filter((entry) => new URL(entry.name).origin === location.origin)
              .map((entry) => ({
                path: new URL(entry.name).pathname,
                bytes: entry.transferSize,
                durationMs: Math.round(entry.duration),
              }));
            return {
              ...window.authorityLab,
              documentBytes: navigation.transferSize,
              responseStartMs: Math.round(navigation.responseStart),
              transferBytes:
                navigation.transferSize +
                resources.reduce((total, item) => total + item.bytes, 0),
              jsBytes: resources
                .filter((item) => item.path.endsWith(".js"))
                .reduce((total, item) => total + item.bytes, 0),
              fontBytes: resources
                .filter((item) => /\.woff2?$/.test(item.path))
                .reduce((total, item) => total + item.bytes, 0),
              resources,
            };
          });
          assert.equal(await page.locator("h1").count(), 1, pathname);
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
            `${pathname} at ${profile.width}px`,
          );
          if (i === 1) {
            const slug =
              pathname.split("/").filter(Boolean).join("-") || "home";
            await page.screenshot({
              path: `${output}/${profile.name}-${slug}.png`,
            });
          }
          results.push({
            page: pathname,
            profile: profile.name,
            run: i,
            externalRequests,
            ...measurement,
          });
        } finally {
          await context.close();
        }
      }
      const matched = results.filter(
        (row) => row.page === pathname && row.profile === profile.name,
      );
      const values = matched.map((row) => row.lcpMs).sort((a, b) => a - b);
      console.log(`${profile.name} ${pathname} LCP ${values.join(", ")} ms`);
    }
  }
} finally {
  await browser.close();
  await writeFile(
    `${output}/performance.json`,
    JSON.stringify(
      {
        label,
        checkedAt,
        base: base.origin,
        browser: "Chromium desktop with mobile emulation",
        conditions:
          "Cold browser contexts, measured with Chrome DevTools, reduced motion, external requests blocked",
        profiles,
        requestedRuns: runs,
        results,
      },
      null,
      2,
    ),
  );
}
