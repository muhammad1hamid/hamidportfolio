import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright-core";
import sharp from "sharp";

const base = new URL(process.env.QA_BASE_URL || "http://127.0.0.1:3000");
const output = process.env.QA_HERO_OUTPUT || "qa-output/signature-hero";
const viewports = [
  [320, 568],
  [360, 800],
  [375, 812],
  [390, 844],
  [414, 896],
  [430, 932],
  [480, 854],
  [600, 900],
  [719, 900],
  [720, 900],
  [768, 1024],
  [844, 390],
  [1024, 768],
  [1280, 720],
  [1324, 754],
  [1440, 900],
  [1920, 1080],
];
const browser = await chromium.launch({
  executablePath:
    process.env.BROWSER_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const report = {
  checkedAt: new Date().toISOString(),
  layouts: [],
  layoutFailures: [],
  checks: [],
  errors: [],
};
await mkdir(output, { recursive: true });

async function open(viewport, options = {}, skipIntro = true) {
  const context = await browser.newContext({ viewport, ...options });
  await context.route(
    (url) => url.origin !== base.origin,
    (route) => route.abort(),
  );
  if (skipIntro)
    await context.addInitScript(() =>
      sessionStorage.setItem("hamid-origin-v1", "seen"),
    );
  const page = await context.newPage();
  page.on("pageerror", (error) => report.errors.push(error.message));
  await page.goto(base.href, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  return { context, page };
}

const beam = (page) => page.locator(".nav-contact-beam");
const primary = (page) =>
  page
    .locator(".hero-actions")
    .getByRole("link", { name: "Discuss a project", exact: true });
const header = (page) =>
  page
    .locator(".navigation")
    .getByRole("link", { name: "Discuss a project", exact: true });
const fit = (box, height) =>
  box && box.y >= 0 && box.y + box.height <= height + 1;
const serviceLinks = [
  ["Web Experiences", "/services/#web-experiences"],
  ["Growth Engine", "/growth/"],
  ["Smart Systems", "/services/#smart-systems"],
];

async function checkComposition(page, width) {
  const layout = await page.evaluate(() => {
    const rect = (selector) =>
      document.querySelector(selector).getBoundingClientRect();
    const measureText = (element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return [...range.getClientRects()];
    };
    const centered = (box) =>
      Math.abs(box.left + box.width / 2 - innerWidth / 2) < 1;
    const intersects = (a, b) =>
      a.left < b.right &&
      a.right > b.left &&
      a.top < b.bottom &&
      a.bottom > b.top;
    const img = document.querySelector(".hero-portrait img");
    const photo = img.getBoundingClientRect();
    const brush = document.querySelector(".hero-eye-brush");
    const brushBounds = brush?.getBoundingClientRect();
    const ink = brush?.querySelector(".hero-eye-ink");
    // Source-pixel landmarks from hamid-hero-warm.webp, independent of CSS.
    const pupils = [
      [487, 398],
      [622, 396],
    ];
    const eyes = pupils.map(([x, y]) => [
      photo.left + (x / 1100) * photo.width,
      photo.top + (y / 1100) * photo.height,
    ]);
    const portrait = rect(".hero-portrait");
    // Mobile cards may sit behind the hair; the actual face must stay clear.
    // Desktop retains the stricter face-and-hair clearance check.
    const face = {
      left: photo.left + photo.width * 0.31,
      right: photo.left + photo.width * 0.7,
      top: photo.top + photo.height * (innerWidth < 768 ? 0.3 : 0.086),
      bottom: photo.top + photo.height * 0.6,
    };
    const ctas = [...document.querySelectorAll(".hero-actions a")];
    const copyInk = [
      ...document.querySelectorAll(
        ".hero-eyebrow, .hero-title-line, .hero-description",
      ),
    ].flatMap(measureText);
    const links = [...document.querySelectorAll(".hero-card")];
    const cardRects = links.map((link) => link.getBoundingClientRect());
    const activeSurfacesOverlap = (card, box, action) => {
      const button = action.getBoundingClientRect();
      if (!intersects(box, button)) return false;
      // A tilted card's rectangular bounds include transparent corners.
      // Test painted, hittable surfaces where those bounds meet a pill CTA.
      const right = Math.min(box.right, button.right, innerWidth);
      const bottom = Math.min(box.bottom, button.bottom, innerHeight);
      for (let y = Math.max(box.top, button.top, 0) + 0.5; y < bottom; y++) {
        for (let x = Math.max(box.left, button.left, 0) + 0.5; x < right; x++) {
          const stack = document.elementsFromPoint(x, y);
          if (stack.includes(card) && stack.includes(action)) return true;
        }
      }
      return false;
    };
    const web = rect(".hero-card-web .hero-card");
    const systems = rect(".hero-card-systems .hero-card");
    const growth = rect(".hero-card-growth .hero-card");
    const centerX = (box) => box.left + box.width / 2;
    const ctaBottom = Math.max(
      ...ctas.map((link) => link.getBoundingClientRect().bottom),
    );
    return {
      scrollWidth: document.documentElement.scrollWidth,
      heroBottom: rect(".signature-hero").bottom,
      webTitleLines: measureText(
        document.querySelector(".hero-card-web .hero-card-copy strong"),
      ).length,
      copyCentered: [
        "#hero-title",
        ".hero-description",
        ".hero-eyebrow",
        ".hero-actions",
      ].every((selector) => {
        const node = document.querySelector(selector);
        const box = node.getBoundingClientRect();
        return centered(box) && getComputedStyle(node).textAlign === "center";
      }),
      portraitCentered: centered(portrait),
      portraitBelowCopy: face.top >= ctaBottom - 3,
      photoWidth: Math.round(photo.width),
      eyes,
      brushRegistered:
        brush instanceof SVGSVGElement &&
        brush.getAttribute("aria-hidden") === "true" &&
        ["top", "left", "width", "height"].every(
          (edge) => Math.abs(brushBounds[edge] - photo[edge]) <= 1,
        ) &&
        ink instanceof SVGGeometryElement &&
        pupils.every(([x, y]) => ink.isPointInFill(new DOMPoint(x, y))) &&
        eyes.every(
          ([x, y]) =>
            x > portrait.left &&
            x < portrait.right &&
            y > portrait.top &&
            y < portrait.bottom,
        ),
      cardLayout: {
        webAboveSystems: web.top < systems.top,
        webLeftOfFace: centerX(web) < centerX(portrait),
        systemsLeftOfFace: centerX(systems) < centerX(portrait),
        growthRightOfFace: centerX(growth) > centerX(portrait),
      },
      mobileCluster: {
        webLeft: centerX(web) < centerX(portrait),
        growthRight: centerX(growth) > centerX(portrait),
        upperPair: Math.abs(web.top - growth.top) < 24,
        upperCardsAboveEyes: Math.max(web.bottom, growth.bottom) < eyes[0][1],
        lowerCardBelowFace: systems.top > face.bottom,
        lowerCardCentered: Math.abs(centerX(systems) - innerWidth / 2) < 3,
        layered:
          getComputedStyle(document.querySelector(".hero-portrait")).zIndex ===
            "1" &&
          getComputedStyle(document.querySelector(".hero-card-systems"))
            .zIndex === "2",
      },
      foldedCards: cardRects.filter((card) => card.bottom <= innerHeight + 1)
        .length,
      noFaceOrCardCollision:
        cardRects.length === 3 &&
        cardRects.every(
          (card, index) =>
            !intersects(face, card) &&
            copyInk.every((copy) => !intersects(copy, card)) &&
            ctas.every(
              (link) => !activeSurfacesOverlap(links[index], card, link),
            ) &&
            cardRects.every(
              (other, n) => n === index || !intersects(card, other),
            ),
        ),
      noEdgeClipping: cardRects.every(
        (card) =>
          card.left >= 0 && card.right <= innerWidth && card.height >= 44,
      ),
      photoSource: img.currentSrc,
      loaded: img.complete && img.naturalWidth > 0,
      touchable:
        ctas.length === 2 &&
        ctas.every((link) => {
          const box = link.getBoundingClientRect();
          return (
            box.height >= 44 &&
            box.left >= 0 &&
            box.right <= innerWidth &&
            (box.top + box.height / 2 >= innerHeight ||
              link.contains(
                document.elementFromPoint(
                  box.x + box.width / 2,
                  box.y + box.height / 2,
                ),
              ))
          );
        }),
    };
  });
  assert.ok(layout.scrollWidth <= width + 1, `${width}px page overflow`);
  for (const key of [
    "copyCentered",
    "portraitCentered",
    "portraitBelowCopy",
    "brushRegistered",
    "noFaceOrCardCollision",
    "noEdgeClipping",
    "loaded",
    "touchable",
  ])
    assert.ok(layout[key], `${width}px ${key}: ${JSON.stringify(layout)}`);
  return layout;
}

async function checkUnobstructedCardCopy(page, width) {
  const hero = page.locator(".signature-hero");
  const shotOptions = { scale: "css", animations: "disabled" };
  const visible = await hero.screenshot(shotOptions);
  const text = await hero.evaluate((element) => {
    const origin = element.getBoundingClientRect();
    return [
      ...element.querySelectorAll(
        ".hero-card-copy strong, .hero-card-copy > span",
      ),
    ].map((node) => {
      const range = document.createRange();
      range.selectNodeContents(node);
      return {
        content: node.textContent,
        lines: [...range.getClientRects()].map((rect) => ({
          left: rect.left - origin.left,
          right: rect.right - origin.left,
          top: rect.top - origin.top,
          bottom: rect.bottom - origin.top,
        })),
      };
    });
  });
  // Check actual pixels with both the graphics and portrait hidden. This also
  // catches hair masking the upper card's copy in the mobile composition.
  const artHidden = await hero.screenshot({
    ...shotOptions,
    style:
      ".hero-card-preview, .hero-portrait { visibility: hidden !important; }",
  });
  const [before, after] = await Promise.all(
    [visible, artHidden].map((image) =>
      sharp(image).removeAlpha().raw().toBuffer({ resolveWithObject: true }),
    ),
  );
  assert.deepEqual(before.info, after.info);
  for (const { content, lines } of text) {
    let changed = 0;
    let count = 0;
    const { width: imageWidth, height, channels } = before.info;
    for (const line of lines) {
      for (
        let y = Math.max(0, Math.ceil(line.top));
        y < Math.min(height, Math.floor(line.bottom));
        y++
      ) {
        for (
          let x = Math.max(0, Math.ceil(line.left));
          x < Math.min(imageWidth, Math.floor(line.right));
          x++
        ) {
          const i = (y * imageWidth + x) * channels;
          if (
            [0, 1, 2].some(
              (channel) =>
                Math.abs(before.data[i + channel] - after.data[i + channel]) >
                24,
            )
          )
            changed++;
          count++;
        }
      }
    }
    assert.ok(
      count > 0 && changed / count < 0.015,
      `${width}px artwork intersects ${content} (${changed}/${count} changed pixels)`,
    );
  }
}

async function checkPaintedEyes(screenshot, eyes, width) {
  const { data, info } = await sharp(screenshot)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (const [x, y] of eyes) {
    let warm = 0;
    let darker = 0;
    for (let row = Math.round(y) - 8; row <= Math.round(y) + 8; row++) {
      for (
        let column = Math.round(x) - 9;
        column <= Math.round(x) + 9;
        column++
      ) {
        const index = (row * info.width + column) * info.channels;
        const [r, g, b] = data.subarray(index, index + 3);
        if (r > 75 && r - g > 20 && g - b > 9) warm++;
        if (
          Math.abs(row - y) <= 2 &&
          Math.abs(column - x) <= 2 &&
          r < 105 &&
          g < 82 &&
          b < 70
        )
          darker++;
      }
    }
    assert.ok(warm > 5, `${width}px no visible orange wash at ${x},${y}`);
    assert.ok(darker > 1, `${width}px the pupil needs visible dark detail`);
  }
}

async function audit(page, width) {
  const { violations } = await new AxeBuilder({ page })
    .include(".navigation")
    .include(".signature-hero")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  assert.deepEqual(
    violations.map(({ id, nodes }) => [id, nodes.map((n) => n.target)]),
    [],
    `${width}px axe scan`,
  );
}

async function warmPerimeter(page, time, name) {
  await beam(page).evaluate((ring, currentTime) => {
    const animation = ring
      .getAnimations({ subtree: true })
      .find((effect) => effect.animationName === "nav-contact-beam-turn");
    animation.pause();
    animation.currentTime = currentTime;
  }, time);
  const buffer = await header(page).screenshot({
    path: `${output}/beam-${name}.png`,
  });
  const { data, info } = await sharp(buffer)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let warm = 0;
  let xTotal = 0;
  let yTotal = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels;
      const [r, g, b] = data.subarray(i, i + 3);
      if (r < 140 || r - g < 38 || g - b < 12) continue;
      assert.ok(
        x < 25 || x > info.width - 26 || y < 4 || y > info.height - 5,
        "The beam must stay in the pill perimeter",
      );
      warm++;
      xTotal += x;
      yTotal += y;
    }
  }
  assert.ok(
    warm >= 5 && warm < 100,
    `Expected a short warm segment, got ${warm} warm pixels`,
  );
  return {
    warmPixels: warm,
    center: [xTotal / warm, yTotal / warm].map(Math.round),
  };
}

async function tracePaint(page, running) {
  await page.evaluate((play) => {
    for (const animation of document.getAnimations()) animation.pause();
    const ring = document.querySelector(".nav-contact-beam");
    const effect = ring
      .getAnimations({ subtree: true })
      .find((animation) => animation.animationName === "nav-contact-beam-turn");
    if (play) effect.play();
  }, running);
  await page.waitForTimeout(150);
  const session = await page.context().newCDPSession(page);
  const stats = { paintEvents: 0, paintMs: 0, layoutEvents: 0 };
  session.on("Tracing.dataCollected", ({ value }) => {
    for (const event of value) {
      if (event.name === "Paint") {
        stats.paintEvents++;
        stats.paintMs += (event.dur || 0) / 1000;
      }
      if (event.name === "Layout") stats.layoutEvents++;
    }
  });
  await session.send("Tracing.start", { categories: "devtools.timeline" });
  await page.waitForTimeout(1200);
  const complete = new Promise((resolve) =>
    session.once("Tracing.tracingComplete", resolve),
  );
  await session.send("Tracing.end");
  await complete;
  await session.detach();
  stats.paintMs = Number(stats.paintMs.toFixed(2));
  return stats;
}

try {
  const markup = await (await fetch(base)).text();
  const headings = [...markup.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
  assert.equal(headings.length, 1, "One H1 in the static HTML");
  assert.equal(
    headings[0][1]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
    "Build. Grow. Automate.",
  );
  report.checks.push(
    "Static HTML has one H1 with the same copy used at all widths",
  );

  for (const [width, height] of viewports) {
    const { context, page } = await open(
      { width, height },
      { isMobile: width <= 768, hasTouch: width <= 768 },
    );
    try {
      assert.equal(await page.locator("main h1").count(), 1);
      assert.equal(
        (await page.locator(".hero-eyebrow").textContent())
          .trim()
          .toUpperCase(),
        "INDEPENDENT WEB DEVELOPER · DIGITAL GROWTH BUILDER",
      );
      assert.equal(
        await page
          .locator('.hero-scenery[aria-hidden="true"] .hero-watermark')
          .textContent(),
        "HAMID",
      );
      assert.equal(
        (await page.locator("#hero-title").innerText())
          .replace(/\s+/g, " ")
          .trim(),
        "Build. Grow. Automate.",
      );
      assert.equal(
        (await page.locator(".hero-description").innerText()).trim(),
        "I’m Hamid. I build distinctive websites, improve search visibility, and create practical AI systems for growing businesses.",
      );
      assert.equal(
        await page
          .getByRole("heading", { name: "Build. Grow. Automate.", level: 1 })
          .count(),
        1,
      );
      await page.locator(".hero-portrait img").evaluate((img) => img.decode());
      const layout = await checkComposition(page, width);
      const titleLines = await page
        .locator("#hero-title .hero-title-line")
        .evaluateAll((lines) =>
          lines.map((line) => {
            const range = document.createRange();
            range.selectNodeContents(line);
            return [...range.getClientRects()].map(
              ({ x, top, bottom, right }) => ({
                x,
                top,
                bottom,
                right,
              }),
            );
          }),
        );
      assert.deepEqual(
        titleLines.map((line) => line.length),
        [1, 1],
        `${width}px heading wraps within a phrase`,
      );
      if (width >= 768) {
        const [[first], [second]] = titleLines;
        assert.ok(
          second.x >= first.right - 1 &&
            second.top < first.bottom &&
            second.bottom > first.top,
          `${width}px desktop heading should be one line`,
        );
      }
      if (width >= 1024) {
        assert.ok(
          Object.values(layout.cardLayout).every(Boolean),
          `${width}px asymmetric card positions: ${JSON.stringify(layout.cardLayout)}`,
        );
        assert.equal(
          layout.webTitleLines,
          1,
          `${width}px Web Experiences wraps`,
        );
        assert.equal(layout.foldedCards, 3, `${width}px card below the fold`);
        assert.ok(
          layout.heroBottom >= height - 1,
          `${width}px hero ends before the first screen`,
        );
      }
      if (width === 1324) {
        assert.equal(
          layout.foldedCards,
          3,
          "All three cards visible within the locked reference viewport",
        );
        assert.equal(await page.locator(".hero-doodle:visible").count(), 4);
      }
      if (width < 768) {
        assert.equal(await page.locator(".hero-doodle:visible").count(), 4);
        assert.ok(
          Object.values(layout.mobileCluster).every(Boolean),
          `${width}px mobile composition: ${JSON.stringify(layout.mobileCluster)}`,
        );
        const [primaryBox, secondaryBox] = await page
          .locator(".hero-actions a")
          .evaluateAll((links) =>
            links.map((link) => {
              const rect = link.getBoundingClientRect();
              return { top: rect.top, bottom: rect.bottom };
            }),
          );
        assert.ok(
          secondaryBox.top >= primaryBox.bottom + 6,
          `${width}px mobile CTAs should stack with a comfortable gap`,
        );
      }
      assert.equal(
        await page.locator(".hero-portrait img").getAttribute("src"),
        "/images/hamid-hero-warm.webp",
      );
      if (width < 720) {
        assert.equal(await page.locator(".nav-contact").isVisible(), false);
      }
      const button = await primary(page).boundingBox();
      assert.ok(
        button.height >= 44 && (height < 500 || fit(button, height)),
        `${width}px primary CTA above the fold`,
      );
      assert.deepEqual(
        await page
          .locator(".hero-card")
          .evaluateAll((links) =>
            links.map((link) => [
              link.querySelector(".hero-card-copy strong").textContent,
              link.getAttribute("href"),
            ]),
          ),
        serviceLinks,
      );
      assert.equal(await page.locator(".hero-card-preview:visible").count(), 3);
      for (const [kind, src] of [
        ["web", "/images/hero-cards/architecture-laptop.webp"],
        ["growth", "/images/hero-cards/google-search-panel.webp"],
      ]) {
        const preview = page.locator(
          `.hero-card-${kind} .hero-card-preview img`,
        );
        assert.equal(await preview.getAttribute("src"), src);
        await preview.evaluate((img) => img.decode());
      }
      if ([320, 375, 390, 430, 1024, 1324, 1440].includes(width))
        await checkUnobstructedCardCopy(page, width);
      if ([320, 390, 768, 1440].includes(width)) await audit(page, width);
      const screenshot = await page.screenshot({
        path: `${output}/hero-${width}.png`,
        scale: "css",
      });
      if ([390, 1324].includes(width))
        await checkPaintedEyes(screenshot, layout.eyes, width);
      if ([320, 390, 1324, 1440].includes(width))
        await page
          .locator(".signature-hero")
          .screenshot({ path: `${output}/section-${width}.png` });
      report.layouts.push({
        width,
        height,
        ...layout,
        primaryBottom: Math.round(button.y + button.height),
      });
    } catch (error) {
      report.layoutFailures.push({ width, height, error: error.message });
      await page.screenshot({ path: `${output}/failure-${width}.png` });
    } finally {
      await context.close();
    }
  }
  assert.equal(
    report.layoutFailures.length,
    0,
    JSON.stringify(report.layoutFailures, null, 2),
  );
  report.checks.push(
    `${viewports.length} viewports with the locked desktop stage, layered mobile card cluster, centered portrait, registered eye strip and no face, link or card collisions. Unobstructed card copy verified against pixels on seven screens.`,
  );
  report.checks.push(
    "Four WCAG A and AA axe scans at desktop, tablet and phone sizes",
  );

  const desktop = await open({ width: 1440, height: 900 });
  try {
    const { page } = desktop;
    const nav = header(page);
    assert.match(
      await nav.evaluate((link) => getComputedStyle(link).boxShadow),
      /inset/,
    );
    await page.waitForFunction(() =>
      document
        .querySelector(".hero-composition")
        ?.hasAttribute("data-portrait-motion"),
    );
    await nav.hover();
    await page.waitForFunction(() =>
      document
        .querySelector(".nav-contact-beam")
        .getAnimations({ subtree: true })
        .some(
          (effect) =>
            effect.animationName === "nav-contact-beam-turn" &&
            effect.playbackRate > 1.15,
        ),
    );
    await page.mouse.move(30, 90);
    const first = await warmPerimeter(page, 250, "top");
    const second = await warmPerimeter(page, 3680, "bottom");
    assert.ok(
      Math.hypot(
        second.center[0] - first.center[0],
        second.center[1] - first.center[1],
      ) > 15,
    );
    report.beam = [first, second];
    report.paintTrace = {
      durationMs: 1200,
      paused: await tracePaint(page, false),
      rotating: await tracePaint(page, true),
    };
    report.checks.push(
      "Header border has a steady inner glow and the moving beam speeds up on hover",
    );

    const stage = page.locator(".hero-composition");
    await page.mouse.move(1320, 680);
    await page.waitForFunction(
      () =>
        parseFloat(
          document
            .querySelector(".hero-composition")
            .style.getPropertyValue("--hero-pointer-x"),
        ) > 0.7,
    );
    const offset = await stage.evaluate((el) =>
      ["--hero-pointer-x", "--hero-pointer-y"].map((key) =>
        parseFloat(el.style.getPropertyValue(key)),
      ),
    );
    assert.ok(offset[0] <= 1 && offset[1] > 0 && offset[1] <= 1);
    await page.mouse.move(30, 30);
    await page.waitForFunction(
      () =>
        !document
          .querySelector(".hero-composition")
          .style.getPropertyValue("--hero-pointer-x"),
    );
    await page.evaluate(() => scrollTo({ top: 240, behavior: "instant" }));
    await page.waitForFunction(
      () =>
        Number(
          document
            .querySelector(".hero-composition")
            .style.getPropertyValue("--hero-exit"),
        ) > 0.15,
    );
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    const webCard = page.locator(".hero-card-web a");
    await webCard.hover();
    await page.waitForFunction(() => {
      const arrow = document.querySelector(".hero-card-web .hero-card-arrow");
      const move = new DOMMatrixReadOnly(getComputedStyle(arrow).transform);
      return move.m41 > 1.6 && move.m42 < -1.6;
    });
    const cardSlot = await page.locator(".hero-card-web").boundingBox();
    const pointOnCard = (fraction) =>
      page.mouse.move(
        cardSlot.x + cardSlot.width * fraction,
        cardSlot.y + cardSlot.height * 0.5,
      );
    const readCardTilt = () =>
      webCard.evaluate((el) => {
        const matrix = new DOMMatrixReadOnly(getComputedStyle(el).transform);
        return matrix.m13;
      });
    const cardX = (sign) =>
      page.waitForFunction((sign) => {
        const el = document.querySelector(".hero-card-web .hero-card");
        const point = Number(el.style.getPropertyValue("--card-pointer-x"));
        const vertical = Number(el.style.getPropertyValue("--card-pointer-y"));
        return (
          point * sign > 0.35 && Math.abs(point) <= 1 && Math.abs(vertical) <= 1
        );
      }, sign);
    await pointOnCard(0.23);
    await cardX(-1);
    await webCard.evaluate((el) =>
      Promise.all(
        el.getAnimations().map((motion) => motion.finished.catch(() => {})),
      ),
    );
    const leftTilt = await readCardTilt();
    await pointOnCard(0.77);
    await cardX(1);
    await page.waitForFunction((leftTilt) => {
      const el = document.querySelector(".hero-card-web .hero-card");
      const tilt = new DOMMatrixReadOnly(getComputedStyle(el).transform).m13;
      return Math.abs(tilt - leftTilt) > 0.025;
    }, leftTilt);
    await page.mouse.move(30, 90);
    await page.waitForFunction(() => {
      const style = document.querySelector(".hero-card-web .hero-card").style;
      return (
        !style.getPropertyValue("--card-pointer-x") &&
        !style.getPropertyValue("--card-pointer-y")
      );
    });
    report.checks.push(
      "Desktop hover, per-card 3D tilt, bounded pointer motion, pointer-leave reset and native scroll exit",
    );

    await primary(page).hover();
    await page.waitForFunction(() => {
      const arrow = document.querySelector(".hero-primary-icon svg");
      const matrix = new DOMMatrixReadOnly(getComputedStyle(arrow).transform);
      return matrix.m41 > 1.6 && matrix.m42 < -1.6;
    });
    await page.keyboard.press("Tab");
    await primary(page).focus();
    assert.ok(
      await primary(page).evaluate(
        (link) =>
          link.matches(":focus-visible") &&
          getComputedStyle(link).outlineWidth === "2px",
      ),
    );
    await page.keyboard.press("Enter");
    await page.waitForURL("**/contact/?source=home");
    await page.goBack();
    assert.equal(await page.locator("#hamid-origin").isVisible(), false);
    await page.keyboard.press("Tab");
    await primary(page).focus();
    for (const expected of [
      ".hero-secondary",
      ".hero-card-web a",
      ".hero-card-growth a",
      ".hero-card-systems a",
    ]) {
      await page.keyboard.press("Tab");
      assert.ok(
        await page.evaluate(
          (selector) => document.activeElement?.matches(selector),
          expected,
        ),
      );
    }
    for (const [name, href] of serviceLinks) {
      const link = page
        .locator(".hero-capabilities")
        .getByRole("link", { name: new RegExp(name) });
      await link.focus();
      assert.ok(
        await link.evaluate(
          (el) =>
            el.matches(":focus-visible") &&
            getComputedStyle(el).outlineStyle === "solid",
        ),
      );
      await page.keyboard.press("Enter");
      await page.waitForURL(new URL(href, base).href);
      if (href.includes("#"))
        await page.locator(new URL(href, base).hash).waitFor();
      await page.goBack();
    }
    for (const key of ["Enter", "Space"]) {
      await header(page).focus();
      await page.keyboard.press(key);
      await page.waitForURL("**/contact/?source=navigation");
      await page.goBack();
    }
    await page
      .locator(".signature-hero")
      .getByRole("link", { name: "Explore work", exact: true })
      .click();
    await page.waitForURL("**/work/");
    await page.goBack();
    assert.equal(await page.locator(".signature-hero + #work").count(), 1);
    report.checks.push(
      "CTA and capability links work by keyboard in reading order, header Enter and Space work, Work opens and Selected Work immediately follows the hero, intro does not replay",
    );
  } finally {
    await desktop.context.close();
  }

  const touch = await open(
    { width: 390, height: 844 },
    { isMobile: true, hasTouch: true },
  );
  try {
    const { page } = touch;
    const menu = page.getByRole("button", { name: "Open navigation" });
    await menu.tap();
    await page.getByRole("dialog", { name: "Navigation" }).waitFor();
    assert.equal(await menu.getAttribute("aria-expanded"), "true");
    await page.keyboard.press("Escape");
    await page
      .getByRole("dialog", { name: "Navigation" })
      .waitFor({ state: "hidden" });
    assert.equal(await menu.getAttribute("aria-expanded"), "false");
    assert.equal(
      await menu.evaluate((button) => document.activeElement === button),
      true,
    );
    assert.equal(
      await page
        .locator(".hero-composition")
        .getAttribute("data-portrait-motion"),
      null,
    );
    for (const [name, href] of serviceLinks) {
      await page
        .locator(".hero-capabilities")
        .getByRole("link", { name: new RegExp(name) })
        .tap();
      await page.waitForURL(new URL(href, base).href);
      await page.goBack();
    }
    await primary(page).tap();
    await page.waitForURL("**/contact/?source=home");
    report.checks.push(
      "Touch menu restores focus, portrait stays still, and tapping each capability card and primary CTA opens its real destination",
    );
  } finally {
    await touch.context.close();
  }

  for (const options of [
    { reducedMotion: "reduce" },
    { forcedColors: "active" },
    { javaScriptEnabled: false },
  ]) {
    const { context, page } = await open(
      { width: 1440, height: 900 },
      options,
      false,
    );
    try {
      assert.equal(await page.locator("#hamid-origin").isVisible(), false);
      assert.equal(await page.locator("#hero-title").isVisible(), true);
      assert.equal(
        await primary(page).getAttribute("href"),
        "/contact/?source=home",
      );
      if (options.javaScriptEnabled === false) {
        assert.deepEqual(
          await page
            .locator(".hero-card")
            .evaluateAll((links) =>
              links.map((link) => [
                link.querySelector(".hero-card-copy strong").textContent,
                link.getAttribute("href"),
              ]),
            ),
          serviceLinks,
        );
      } else {
        const beamAnimations = await beam(page).evaluate(
          (ring) => ring.getAnimations({ subtree: true }).length,
        );
        assert.equal(beamAnimations, 0);
        assert.equal(
          await page
            .locator(".hero-composition")
            .getAttribute("data-portrait-motion"),
          null,
        );
        assert.equal(
          await page
            .locator(".signature-hero")
            .evaluate(
              (element) => element.getAnimations({ subtree: true }).length,
            ),
          0,
        );
      }
    } finally {
      await context.close();
    }
  }
  report.checks.push(
    "Reduced motion, forced colors and JavaScript-disabled HTML keep the page and real enquiry link accessible",
  );
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    const { context, page } = await open(viewport, { reducedMotion: "reduce" });
    try {
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
      // Root rem units and nested container queries settle over multiple frames.
      await page.evaluate(
        () =>
          new Promise((resolve) => {
            let frames = 0;
            const settle = () => {
              if (++frames === 5) resolve();
              else requestAnimationFrame(settle);
            };
            requestAnimationFrame(settle);
          }),
      );
      await checkComposition(page, viewport.width);
      if (viewport.width < 768)
        await checkUnobstructedCardCopy(page, viewport.width);
      await page
        .locator(".signature-hero")
        .screenshot({ path: `${output}/zoom-${viewport.width}.png` });
    } finally {
      await context.close();
    }
  }
  report.checks.push(
    "The hero remains aligned and its links remain usable at 200% text size",
  );
  assert.deepEqual(report.errors, []);
} finally {
  await browser.close();
  await writeFile(`${output}/results.json`, JSON.stringify(report, null, 2));
}

console.log(
  JSON.stringify({
    layouts: report.layouts.length,
    checks: report.checks,
    paintTrace: report.paintTrace,
  }),
);
