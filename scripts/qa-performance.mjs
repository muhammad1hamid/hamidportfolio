import { chromium } from "playwright-core";
import { mkdir, writeFile } from "node:fs/promises";

const base = process.env.QA_BASE_URL || "http://127.0.0.1:3001";
const label = process.env.QA_LABEL || "final";
const runCount = Number(process.env.QA_RUNS || 3);
const browser = await chromium.launch({
  executablePath:
    process.env.BROWSER_PATH ||
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: true,
});
const runs = [];
try {
  for (let run = 0; run < runCount; run++) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: 200000,
      uploadThroughput: 93750,
    });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.addInitScript(() => {
      window.lab = { lcp: 0, cls: 0, longTasks: [] };
      window.tapDurations = [];
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) if (entry.interactionId) window.tapDurations.push(entry.duration);
      }).observe({ type: "event", buffered: true, durationThreshold: 16 });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.lab.lcp = entry.startTime;
          window.lab.lcpElement = { tag: entry.element?.tagName, className: entry.element?.className, url: entry.url, loadTime: entry.loadTime, renderTime: entry.renderTime };
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });
      let sessionStart = 0,
        sessionEnd = 0,
        sessionScore = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue;
          if (
            entry.startTime - sessionEnd > 1000 ||
            entry.startTime - sessionStart > 5000
          ) {
            sessionStart = entry.startTime;
            sessionScore = 0;
          }
          sessionEnd = entry.startTime;
          sessionScore += entry.value;
          window.lab.cls = Math.max(window.lab.cls, sessionScore);
        }
      }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          window.lab.longTasks.push({
            start: entry.startTime,
            duration: entry.duration,
          });
      }).observe({ type: "longtask", buffered: true });
    });
    await page.goto(base, { waitUntil: "load", timeout: 90000 });
    await page.waitForTimeout(5000);
    runs.push(
      await page.evaluate(() => {
        const nav = performance.getEntriesByType("navigation")[0];
        const resources = performance.getEntriesByType("resource");
        return {
          ...window.lab,
          domContentLoadedMs: nav.domContentLoadedEventEnd,
          loadMs: nav.loadEventEnd,
          transferredBytes:
            nav.transferSize +
            resources.reduce((total, r) => total + r.transferSize, 0),
          jsBytes: resources
            .filter((r) => /\.js(?:\?|$)/.test(r.name))
            .reduce((total, r) => total + r.transferSize, 0),
          fontRequests: resources.filter((r) => /\.woff2?(?:\?|$)/.test(r.name))
            .length,
          startupBlockingMs: window.lab.longTasks
            .filter((t) => t.start < 10000)
            .reduce((total, t) => total + Math.max(0, t.duration - 50), 0),
          portrait: document.querySelector(".hero-portrait img")?.currentSrc,
          resourceTimings: resources.map(resource => ({ url: resource.name, start: resource.startTime, end: resource.responseEnd, bytes: resource.transferSize })),
        };
      }),
    );
    if (label !== "baseline") {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await page.getByRole("button", { name: "Close navigation" }).click();
      await page.locator(".faq-item button").first().click();
      await page.locator(".faq-item button").first().click();
      await page.waitForTimeout(300);
      runs.at(-1).sampledTapLatencyMs = await page.evaluate(() => Math.max(0, ...window.tapDurations));
    }
    await context.close();
  }
} finally {
  await browser.close();
}
const median = (key) => runs.map((r) => r[key]).sort((a, b) => a - b)[Math.floor(runs.length / 2)];
const result = {
  label,
  base,
  date: new Date().toISOString(),
  conditions:
    `Chrome, cold contexts, 390×844, 4× CPU throttle, 150ms latency, 1.6Mbps download, ${runCount} runs; local static server`,
  median: Object.fromEntries(
    [
      "lcp",
      "cls",
      "transferredBytes",
      "jsBytes",
      "startupBlockingMs",
      "fontRequests",
    ].map((key) => [key, median(key)]),
  ),
  runs,
};
await mkdir("qa-output", { recursive: true });
await writeFile(
  `qa-output/performance-${label}.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result.median));
