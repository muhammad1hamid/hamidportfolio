import { chromium } from "playwright-core";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.QA_BASE_URL || "http://127.0.0.1:3000";
await mkdir("qa-output/curve", { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.BROWSER_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const reports = [];
try {
  for (const [width, height, dpr] of [
    [1440, 900, 1],
    [390, 844, 2],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: dpr,
      isMobile: width < 768,
      hasTouch: width < 768,
    });
    await context.route(
      (url) => url.origin !== base,
      (route) => route.abort(),
    );
    await context.addInitScript(() => {
      sessionStorage.setItem("hamid-origin-v1", "seen");
      window.curveMeasure = {
        draws: 0,
        createdTextures: 0,
        deletedTextures: 0,
        shifts: [],
        tasks: [],
        lcp: 0,
        ready: 0,
      };
      const metrics = window.curveMeasure;
      for (const name of ["drawElements", "drawArrays"]) {
        const original = WebGL2RenderingContext.prototype[name];
        WebGL2RenderingContext.prototype[name] = function (...args) {
          metrics.draws++;
          return original.apply(this, args);
        };
      }
      for (const [name, property] of [
        ["createTexture", "createdTextures"],
        ["deleteTexture", "deletedTextures"],
      ]) {
        const original = WebGL2RenderingContext.prototype[name];
        WebGL2RenderingContext.prototype[name] = function (...args) {
          metrics[property]++;
          return original.apply(this, args);
        };
      }
      metrics.shiftDetails = [];
      new PerformanceObserver((list) => {
        for (const item of list.getEntries())
          if (!item.hadRecentInput) {
            metrics.shifts.push(item.value);
            metrics.shiftDetails.push({
              time: item.startTime,
              value: item.value,
              nodes: item.sources?.map((source) => ({
                tag: source.node?.tagName,
                classes: source.node?.className,
                text: source.node?.textContent?.slice(0, 80),
                previous: source.previousRect,
                current: source.currentRect,
              })),
            });
          }
      }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((list) =>
        metrics.tasks.push(...list.getEntries().map((x) => x.duration)),
      ).observe({ type: "longtask", buffered: true });
      new PerformanceObserver(
        (list) => (metrics.lcp = list.getEntries().at(-1).startTime),
      ).observe({ type: "largest-contentful-paint", buffered: true });
      const observer = new MutationObserver(() => {
        if (document.querySelector('[data-mode="WALK"]')) {
          metrics.ready = performance.now();
          observer.disconnect();
        }
      });
      observer.observe(document, {
        subtree: true,
        attributes: true,
        childList: true,
      });
    });
    const page = await context.newPage();
    await page.goto(base + "/work/");
    await page.waitForSelector('[data-mode="WALK"]');
    await page.waitForTimeout(900);
    const initial = await page.evaluate(() => ({
      width: innerWidth,
      dpr: devicePixelRatio,
      userAgent: navigator.userAgent,
      ...window.curveMeasure,
      requests: performance.getEntriesByType("resource").map((r) => ({
        url: r.name.replace(location.origin, ""),
        bytes: r.transferSize,
      })),
      loadMs: performance.getEntriesByType("navigation")[0].loadEventEnd,
    }));
    const moving = await page.evaluate(async () => {
      const timestamps = [];
      window.curveMeasure.draws = 0;
      const section = document.querySelector(".curve-walk");
      const travel =
        section.offsetHeight -
        document.querySelector(".curve-canvas").clientHeight;
      await new Promise((resolve) => {
        let tick = 0;
        const draw = (time) => {
          timestamps.push(time);
          section.dispatchEvent(
            new WheelEvent("wheel", {
              deltaY: (12000 * 0.8) / 180,
              bubbles: true,
              cancelable: true,
            }),
          );
          if (++tick <= 180) requestAnimationFrame(draw);
          else resolve();
        };
        requestAnimationFrame(draw);
      });
      const intervals = timestamps
        .slice(1)
        .map((v, i) => v - timestamps[i])
        .sort((a, b) => a - b);
      return {
        p50: intervals[Math.floor(intervals.length * 0.5)],
        p95: intervals[Math.floor(intervals.length * 0.95)],
        max: intervals.at(-1),
        draws: window.curveMeasure.draws,
        samples: intervals.length,
      };
    });
    await page.waitForTimeout(1200);
    const final = await page.evaluate(() => window.curveMeasure);
    const idleStart = final.draws;
    await page.waitForTimeout(500);
    const idle = await page.evaluate(() => window.curveMeasure.draws);
    const gpu = await page.evaluate(() => {
      const gl = document
        .querySelector(".curve-live-world")
        .getContext("webgl2");
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      return {
        renderer: ext
          ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
          : "unavailable",
        drawingBuffer: [gl.drawingBufferWidth, gl.drawingBufferHeight],
      };
    });
    reports.push({
      width,
      height,
      dpr,
      initial: {
        readyMs: initial.ready,
        loadMs: initial.loadMs,
        lcpMs: initial.lcp,
        transferBytes: initial.requests.reduce((s, r) => s + r.bytes, 0),
        jsBytes: initial.requests
          .filter((r) => r.url.includes(".js"))
          .reduce((s, r) => s + r.bytes, 0),
        textureRequests: initial.requests.filter((r) =>
          r.url.includes("/images/curve/"),
        ).length,
        longTasks: initial.tasks.length,
      },
      moving,
      idleDraws: idle - idleStart,
      finalTextureCount: final.createdTextures - final.deletedTextures,
      cls: final.shifts.reduce((s, n) => s + n, 0),
      shiftDetails: final.shiftDetails,
      gpu,
    });
    await context.close();
  }
} finally {
  await browser.close();
}
await writeFile(
  "qa-output/curve/performance.json",
  JSON.stringify(reports, null, 2),
);
console.log(JSON.stringify(reports, null, 2));
