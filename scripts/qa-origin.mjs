import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const origin = new URL(process.env.QA_BASE_URL || "http://127.0.0.1:3000")
  .origin;
const headline = "Stand out online. Get found. Work smarter.";
const overlay = ".signature-intro";
const sizes = [
  [1440, 900],
  [1366, 768],
  [1024, 768],
  [768, 1024],
  [430, 932],
  [390, 844],
  [320, 568],
];
const browser = await chromium.launch({
  executablePath:
    process.env.BROWSER_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const errors = [];
const checks = [];
const devices = [];
await mkdir("qa-output", { recursive: true });

function recordMotion() {
  // Make eligible visits independent of Chrome's previous network estimate.
  if (!Object.hasOwn(navigator, "connection")) {
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: { effectiveType: "4g", downlink: 25, rtt: 25, saveData: false },
    });
  }
  const capture = { frames: [], moves: [], finish: null };
  window.originCapture = capture;
  let frame;
  const canvas = CanvasRenderingContext2D.prototype;
  const clear = canvas.clearRect;
  const stamp = canvas.drawImage;
  const dot = canvas.fillRect;
  const animate = Element.prototype.animate;
  canvas.clearRect = function (...args) {
    if (this.canvas.classList.contains("origin-particles")) {
      frame = {
        t: performance.now(),
        width: args[2],
        dpr: this.getTransform().a,
        dots: 0,
        tiles: 0,
        left: 0,
        right: 0,
      };
      capture.startedAt ??= window.hamidOrigin?.startedAt;
      if (capture.revealAt) {
        const bounds = this.canvas.getBoundingClientRect();
        frame.lift = (innerHeight - bounds.height) / 2 - bounds.top;
        frame.bottom = bounds.bottom;
      }
      capture.frames.push(frame);
    }
    return clear.apply(this, args);
  };
  canvas.drawImage = function (...args) {
    if (frame && this.canvas.classList.contains("origin-particles")) {
      if (args.length === 5) frame.word = [args[1], args[3]];
      if (args.length === 9) {
        const [source, left, , width, , x, , drawWidth] = args;
        frame.anchor ??= [x, drawWidth];
        if (width < source.width * 0.12) {
          frame.tiles++;
          if (Math.abs(drawWidth - width / frame.dpr) > 0.12) {
            if (left < source.width * 0.19) frame.left++;
            if (left > source.width * 0.8) frame.right++;
          }
        }
      }
    }
    return stamp.apply(this, args);
  };
  canvas.fillRect = function (...args) {
    if (frame && this.canvas.classList.contains("origin-particles"))
      frame.dots++;
    return dot.apply(this, args);
  };
  Element.prototype.animate = function (frames, options) {
    if (
      this.matches(
        ".origin-curtain, .origin-route-veil, .hero-topline, .hero-copy, .hero-actions, .content-hero, .growth-hero-copy, .archive-heading",
      )
    ) {
      capture.moves.push({
        target: this.className,
        duration: options.duration,
        at: performance.now(),
      });
    }
    return animate.call(this, frames, options);
  };
  new MutationObserver(() => {
    const stage = document.documentElement.dataset.originIntro;
    if (stage === "playing") capture.played = true;
    if (stage === "revealing") capture.revealAt = performance.now();
    if (capture.played && !stage && !capture.finish)
      capture.finish = performance.now();
  }).observe(document, {
    subtree: true,
    attributes: true,
    attributeFilter: ["data-origin-intro"],
  });
}

async function withPage(test, options = {}, init, collect = true) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ...options,
  });
  try {
    await context.route(
      (url) => url.origin !== origin,
      (route) => route.abort(),
    );
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    if (collect) await page.addInitScript(recordMotion);
    if (init) await page.addInitScript(init);
    await test(page);
  } finally {
    await context.close();
  }
}

const visit = (page, path = "/") =>
  page.goto(origin + path, { waitUntil: "domcontentloaded" });
const playing = (page) =>
  page.waitForFunction(() => window.originCapture.frames.length > 0, null, {
    timeout: 2400,
  });
const finished = (page) =>
  page.locator(overlay).waitFor({ state: "hidden", timeout: 4800 });
const focusIsMain = (page) =>
  page.evaluate(() => document.activeElement?.id === "main");
const screenshot = (page, slug) =>
  page.screenshot({ path: `qa-output/origin-${slug}.png` });

async function check(name, test) {
  try {
    await test();
    checks.push({ name, passed: true });
  } catch (error) {
    checks.push({ name, passed: false, message: String(error.stack || error) });
  }
}

try {
  for (const [width, height] of sizes) {
    await check(
      `Centered formation, one-second hold and upward exit at ${width}×${height}`,
      () =>
        withPage(
          async (page) => {
            await visit(page);
            await playing(page);
            const captureScreens =
              process.env.QA_ORIGIN_SCREENSHOTS === "1" &&
              (width === 1440 || width === 390);
            if (captureScreens) {
              await screenshot(page, `${width}-anchor`);
              await page.waitForFunction(
                () => {
                  const record = window.originCapture;
                  return (
                    performance.now() - record.startedAt > 1120 &&
                    record.frames.at(-1).dots > 45
                  );
                },
                null,
                { timeout: 1800 },
              );
              await screenshot(page, `${width}-assembly`);
              await page.waitForFunction(
                () => !!window.originCapture.frames.at(-1)?.word,
                null,
                { timeout: 1400 },
              );
              await screenshot(page, `${width}-lockup`);
              await page.waitForFunction(
                () => window.originCapture.frames.at(-1)?.left > 8,
                null,
                { timeout: 1800 },
              );
              await screenshot(page, `${width}-breakup`);
              await page.waitForFunction(
                () => {
                  const last = window.originCapture.frames.at(-1);
                  return last?.lift > innerHeight * 0.18 && last.tiles > 10;
                },
                null,
                { timeout: 1400 },
              );
              await screenshot(page, `${width}-lift`);
            }
            await finished(page);
            const { startedAt, frames, moves, revealAt, finish } =
              await page.evaluate(() => window.originCapture);
            const first = frames.find(
              (frame) => frame.anchor && frame.dots === 0,
            );
            assert.ok(first, "No isolated H frame");
            assert.ok(
              Math.abs(
                first.anchor[0] + first.anchor[1] / 2 - first.width / 2,
              ) < 4,
            );
            assert.ok(
              frames.some((frame) => frame.dots > 45),
              "No moving assembly points",
            );
            const lockup = frames.find((frame) => frame.word);
            assert.ok(
              lockup &&
                lockup.word[0] >= 0 &&
                lockup.word[0] + lockup.word[1] <= lockup.width + 1,
            );
            const breakup = frames.find((frame) => frame.tiles > 0);
            assert.ok(breakup, "No breakup frames");
            const holdMs = breakup.t - lockup.t;
            assert.ok(
              holdMs >= 970 && holdMs <= 1160,
              `Full name held for ${holdMs} ms`,
            );
            assert.ok(
              frames.some(
                (frame) =>
                  frame.tiles > 45 && frame.left > 5 && frame.right > 5,
              ),
              "Both ends of the word must fragment",
            );
            assert.ok(
              frames.some((frame) => frame.t >= revealAt && frame.tiles > 0),
              "Curtain and breakup should overlap",
            );
            assert.ok(
              frames.some(
                (frame) => frame.lift > height * 0.2 && frame.tiles > 10,
              ),
              "Visible fragments should move up with the curtain",
            );
            assert.ok(
              frames.some((frame) => frame.bottom <= 0),
              "The particle canvas should leave the top of the viewport",
            );
            assert.ok(
              moves.some(
                (move) =>
                  move.target === "origin-curtain" && move.duration > 250,
              ),
            );
            assert.ok(moves.some((move) => move.target === "hero-copy"));
            assert.ok(finish - startedAt >= 3380 && finish - startedAt <= 3950);
            assert.equal(
              await page.locator(".origin-particles").getAttribute("width"),
              "1",
            );
            assert.equal(
              await page
                .locator("#hero-title")
                .innerText()
                .then((value) => value.replace(/\s+/g, " ")),
              headline,
            );
            assert.ok(
              await page.evaluate(
                () => document.documentElement.scrollWidth <= innerWidth + 1,
              ),
            );
            devices.push({
              width,
              height,
              durationMs: Math.round(finish - startedAt),
              holdMs: Math.round(holdMs),
              tiles: Math.max(...frames.map((frame) => frame.tiles)),
              dpr: first.dpr,
            });
            if (captureScreens) await screenshot(page, `${width}-hero`);
          },
          {
            viewport: { width, height },
            deviceScaleFactor: width < 500 ? 3 : 1,
            isMobile: width < 500,
            hasTouch: width < 500,
          },
        ),
    );
  }

  await check(
    "Deep links reveal their own content, reload and history do not replay",
    () =>
      withPage(async (page) => {
        await visit(page, "/growth/");
        await playing(page);
        await finished(page);
        assert.match(
          await page.locator("#main h1").innerText(),
          /^Get found\./,
        );
        assert.ok(
          await page.evaluate(() =>
            window.originCapture.moves.some(
              (move) => move.target === "growth-hero-copy",
            ),
          ),
        );
        await page.reload({ waitUntil: "networkidle" });
        assert.equal(await page.locator(overlay).isVisible(), false);
        await page
          .getByRole("navigation", { name: "Main navigation" })
          .getByRole("link", { name: "Work" })
          .click();
        await page.waitForURL("**/work/");
        assert.ok(
          await page.evaluate(() =>
            window.originCapture.moves.some(
              (move) => move.target === "origin-route-veil",
            ),
          ),
        );
        assert.ok(
          await page.evaluate(() =>
            window.originCapture.moves.some(
              (move) =>
                move.target.split(" ").includes("archive-heading") &&
                move.duration === 220,
            ),
          ),
        );
        await page.goBack();
        await page.waitForURL("**/growth/");
        await page.goForward();
        await page.waitForURL("**/work/");
        assert.equal(await page.locator(overlay).isVisible(), false);
      }),
  );

  for (const key of ["Enter", "Space"]) {
    await check(`Skip intro with ${key} and return focus to the page`, () =>
      withPage(async (page) => {
        await visit(page);
        if (key === "Space") {
          await page.waitForFunction(
            () => !!window.originCapture.frames.at(-1)?.word,
            null,
            { timeout: 2600 },
          );
        }
        await page
          .getByRole("button", { name: "Skip intro", exact: true })
          .waitFor();
        await page.keyboard.press("Tab");
        assert.ok(
          await page.evaluate(
            () => document.activeElement?.id === "hamid-origin-skip",
          ),
        );
        await page.keyboard.press(key);
        await finished(page);
        assert.ok(await focusIsMain(page));
        if (key === "Space") {
          const lastFrame = await page.evaluate(
            () => window.originCapture.frames.length,
          );
          await page.waitForTimeout(1100);
          assert.equal(
            await page.evaluate(() => window.originCapture.frames.length),
            lastFrame,
          );
        }
      }),
    );
  }

  await check("Escape works during breakup and no frames run afterwards", () =>
    withPage(async (page) => {
      await visit(page);
      await page.waitForFunction(
        () => window.originCapture.frames.at(-1)?.tiles > 45,
        null,
        { timeout: 3500 },
      );
      await page.keyboard.press("Escape");
      await finished(page);
      const postSkip = await page.evaluate(
        () => window.originCapture.frames.length,
      );
      await page.waitForTimeout(180);
      assert.equal(
        await page.evaluate(() => window.originCapture.frames.length),
        postSkip,
      );
      assert.ok(await focusIsMain(page));
    }),
  );

  await check("Pointer skip works before hydration", () =>
    withPage(async (page) => {
      await page.route("**/_next/**/*.js", (route) => route.abort());
      await visit(page);
      await playing(page);
      await page
        .getByRole("button", { name: "Skip intro", exact: true })
        .click();
      await finished(page);
      assert.ok(await focusIsMain(page));
    }),
  );

  await check(
    "Reduced-motion entry and runtime preference changes",
    async () => {
      await withPage(
        async (page) => {
          await visit(page);
          assert.equal(await page.locator(overlay).isVisible(), false);
          await page
            .getByRole("navigation", { name: "Main navigation" })
            .getByRole("link", { name: "Work" })
            .click();
          await page.waitForURL("**/work/");
          assert.deepEqual(
            await page.evaluate(() => window.originCapture.moves),
            [],
          );
        },
        { reducedMotion: "reduce" },
      );
      await withPage(async (page) => {
        await visit(page);
        await playing(page);
        await page.emulateMedia({ reducedMotion: "reduce" });
        await finished(page);
        assert.equal(
          await page.locator("html").getAttribute("data-origin-intro"),
          null,
        );
      });
    },
  );

  await check(
    "Resize, canvas or storage failure, save-data and slow links all fail open",
    async () => {
      await withPage(async (page) => {
        await visit(page);
        await playing(page);
        await page.setViewportSize({ width: 812, height: 430 });
        await finished(page);
      });
      for (const fault of [
        () => {
          const getContext = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
            return kind === "2d" && this.classList.contains("origin-particles")
              ? null
              : getContext.call(this, kind, ...args);
          };
        },
        () => {
          Object.defineProperty(window, "sessionStorage", {
            get() {
              throw new DOMException("Unavailable", "SecurityError");
            },
          });
        },
        () => {
          Object.defineProperty(navigator, "connection", {
            value: { effectiveType: "4g", saveData: true },
          });
        },
      ]) {
        await withPage(
          async (page) => {
            await visit(page);
            await finished(page);
            assert.equal(await page.locator("#hero-title").isVisible(), true);
            assert.deepEqual(
              await page.evaluate(() => window.originCapture.frames),
              [],
            );
          },
          {},
          fault,
        );
      }
      await withPage(
        async (page) => {
          await page.route(origin + "/", async (route) => {
            await new Promise((resolve) => setTimeout(resolve, 180));
            await route.continue();
          });
          await visit(page);
          assert.equal(await page.locator(overlay).isVisible(), false);
          assert.equal(await page.locator("#hero-title").isVisible(), true);
          assert.equal(
            await page.evaluate(() =>
              performance
                .getEntriesByType("resource")
                .some((entry) => entry.name.includes("/motion/origin/")),
            ),
            false,
          );
        },
        {},
        () => {
          Object.defineProperty(navigator, "connection", {
            value: { effectiveType: "4g", downlink: 1.5, rtt: 150 },
          });
        },
      );
    },
  );

  await check("Without JS the homepage and navigation are available", () =>
    withPage(
      async (page) => {
        await visit(page);
        assert.equal(await page.locator(overlay).isVisible(), false);
        assert.ok(await page.locator("#hero-title").isVisible());
        await page
          .getByRole("navigation", { name: "Main navigation" })
          .getByRole("link", { name: "Growth Engine" })
          .click();
        await page.waitForURL("**/growth/");
        assert.match(
          await page.locator("#main h1").innerText(),
          /^Get found\./,
        );
      },
      { javaScriptEnabled: false },
      undefined,
      false,
    ),
  );

  await check(
    "Mobile menu closes on navigation and anchor links skip the veil",
    () =>
      withPage(
        async (page) => {
          await visit(page);
          await finished(page);
          await page.getByRole("button", { name: "Open navigation" }).click();
          await page
            .getByRole("navigation", { name: "Mobile navigation" })
            .getByRole("link", { name: "Reviews" })
            .click();
          await page.waitForURL("**/#testimonials");
          assert.equal(await page.locator("#mobile-menu").isVisible(), false);
          assert.equal(
            await page.evaluate(() =>
              window.originCapture.moves.some(
                (move) => move.target === "origin-route-veil",
              ),
            ),
            false,
          );
          await page.getByRole("button", { name: "Open navigation" }).click();
          await page
            .getByRole("navigation", { name: "Mobile navigation" })
            .getByRole("link", { name: "Growth Engine" })
            .click();
          await page.waitForURL("**/growth/");
          assert.equal(await page.locator("#mobile-menu").isVisible(), false);
        },
        {
          viewport: { width: 390, height: 844 },
          isMobile: true,
          hasTouch: true,
        },
      ),
  );

  await check("Cancelled navigation and 404s cannot leave a cover", () =>
    withPage(async (page) => {
      await visit(page);
      await finished(page);
      await page.evaluate(() => {
        const work = document.querySelector(".desktop-nav a[href='/work/']");
        work.addEventListener(
          "click",
          (event) => {
            event.preventDefault();
            event.stopPropagation();
          },
          { once: true },
        );
        work.click();
      });
      await page.waitForFunction(
        () =>
          document.querySelector(".origin-route-veil").getAnimations()
            .length === 0,
      );
      assert.equal(new URL(page.url()).pathname, "/");
      const response = await visit(page, "/origin-path-not-found/");
      assert.equal(response.status(), 404);
      await finished(page);
      assert.match(
        await page.locator("#main h1").innerText(),
        /^Nothing built/,
      );
    }),
  );
} finally {
  await browser.close();
}

await writeFile(
  "qa-output/origin-qa.json",
  JSON.stringify({ checks, devices, errors }, null, 2),
);
for (const result of checks)
  console.log(
    result.passed ? "PASS" : "FAIL",
    result.name,
    result.message || "",
  );
assert.deepEqual(errors, []);
assert.ok(
  checks.every((check) => check.passed),
  "See qa-output/origin-qa.json for failures",
);
