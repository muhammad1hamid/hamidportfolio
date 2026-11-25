import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";
import ts from "typescript";

const base = new URL(process.env.QA_BASE_URL || "http://127.0.0.1:3000").origin;
const output = process.env.QA_FAQ_SITEWIDE_OUTPUT || "qa-output/faq-sitewide";
await mkdir(output, { recursive: true });
async function dataModule(file) {
  const code = ts.transpileModule(await readFile(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext },
  }).outputText;
  return import(
    `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
  );
}
const { faqs } = await dataModule("data/content.ts");
const { agencyQuestions } = await dataModule("data/agency-partnerships.ts");
const services = JSON.parse(await readFile("data/services.json", "utf8"));
const answers = JSON.parse(await readFile("data/answers.json", "utf8"));
const routes = [
  { path: "/", context: "home", expected: faqs },
  ...services.map((service) => ({
    path: `/${service.slug}/`,
    context: service.slug,
    expected: service.faqs.map((faq) => ({
      question: faq.q,
      answer: `${faq.a}${faq.source ? ` ${faq.source.label}.` : ""}`,
    })),
  })),
  { path: "/for-agencies/", context: "agencies", expected: agencyQuestions },
  { path: "/contact/", context: "contact", count: 4 },
  { path: "/answers/", context: "answers", expected: answers },
];
const baseline = await readFile(output + "/baseline.json", "utf8")
  .then(JSON.parse)
  .catch(() => []);
const report = { checks: [], preservation: [], routes: [], errors: [] };
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
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
const normalize = (value) => value.replace(/\s+/g, " ").trim();
async function context(options = {}) {
  const ctx = await browser.newContext({
    reducedMotion: "reduce",
    viewport: { width: 1440, height: 1000 },
    ...options,
  });
  await ctx.addInitScript(() =>
    sessionStorage.setItem("hamid-origin-v1", "seen"),
  );
  await ctx.route(
    (url) => url.origin !== base,
    (route) => route.abort(),
  );
  return ctx;
}
async function visit(page, pathname) {
  assert.equal((await page.goto(base + pathname)).status(), 200);
  await page.evaluate(() => document.fonts.ready);
  const decline = page.getByRole("button", { name: "Decline", exact: true });
  if (await decline.isVisible()) await decline.click();
}
async function geometry(faq) {
  return faq.evaluate((section) => {
    const rect = (el) => {
      const r = el.getBoundingClientRect();
      return {
        x: r.x,
        right: r.right,
        top: r.top,
        bottom: r.bottom,
        width: r.width,
        height: r.height,
      };
    };
    return {
      viewport: innerWidth,
      section: rect(section),
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      background: getComputedStyle(section).backgroundColor,
      headingFont: getComputedStyle(section.querySelector("h2")).fontFamily,
      serifFont: getComputedStyle(section.querySelector("h2 em")).fontFamily,
      serifSize: parseFloat(
        getComputedStyle(section.querySelector("h2 em")).fontSize,
      ),
      headingSize: parseFloat(
        getComputedStyle(section.querySelector("h2")).fontSize,
      ),
      rows: [...section.querySelectorAll("button")].map((button) => ({
        button: rect(button),
        number: rect(button.children[0]),
        text: rect(button.children[2]),
        icon: rect(button.querySelector("svg")),
      })),
    };
  });
}
function verify(layout) {
  assert.equal(layout.overflow, false, "Page overflow");
  assert.ok(
    Math.abs(layout.section.x) <= 1 &&
      Math.abs(layout.section.width - layout.viewport) <= 1,
    "FAQ is not full width",
  );
  assert.equal(layout.background, "rgb(250, 245, 236)");
  assert.match(layout.headingFont, /Manrope/);
  assert.match(layout.serifFont, /Instrument Serif/);
  assert.ok(
    layout.serifSize > layout.headingSize * 1.4,
    "Page CSS overrode the italic heading",
  );
  for (const row of layout.rows) {
    assert.ok(row.button.height >= 44, "Small touch target");
    assert.ok(row.text.x - row.number.right >= 8, "Badge overlaps text");
    assert.ok(row.icon.x - row.text.right >= 8, "Control overlaps text");
    assert.ok(
      row.icon.right <= layout.viewport - 12,
      "Control outside viewport",
    );
    if (layout.viewport > 1000)
      assert.ok(
        row.button.x >= layout.viewport * 0.4,
        "Question intersects diagonal",
      );
  }
}
try {
  for (const route of routes)
    await check(
      `Shared FAQ, original content and responsive states: ${route.path}`,
      async () => {
        const ctx = await context();
        const page = await ctx.newPage();
        page.on("pageerror", (error) => report.errors.push(error.message));
        try {
          await visit(page, route.path);
          const faq = page.locator(`[data-editorial-faq="${route.context}"]`);
          const buttons = faq.locator("button");
          await page.waitForFunction(
            (selector) =>
              document
                .querySelector(selector)
                ?.getAttribute("aria-expanded") === "true",
            `[data-editorial-faq="${route.context}"] button`,
          );
          assert.equal(
            await page.locator("[data-editorial-faq]").count(),
            1,
            "Duplicate FAQ sections",
          );
          assert.equal(
            await buttons.count(),
            route.count ?? route.expected.length,
          );
          const actual = await faq
            .locator("[data-faq-item]")
            .evaluateAll((rows) =>
              rows.map((row) => {
                const title = row.querySelector("button").cloneNode(true);
                title
                  .querySelectorAll('[aria-hidden="true"]')
                  .forEach((el) => el.remove());
                return {
                  question: title.textContent.trim(),
                  answer: row.querySelector("p").textContent.trim(),
                  id: row.id || null,
                  links: [...row.querySelectorAll("a")].map((a) => ({
                    href: a.getAttribute("href"),
                    label: a.textContent.trim(),
                  })),
                };
              }),
            );
          if (route.expected)
            route.expected.forEach((item, index) => {
              assert.equal(
                normalize(actual[index].question),
                normalize(item.question),
              );
              assert.equal(
                normalize(actual[index].answer),
                normalize(item.answer),
              );
            });
          const previous = baseline.find((item) => item.path === route.path);
          if (previous) {
            assert.deepEqual(
              actual.map((row) => ({
                ...row,
                question: normalize(row.question),
                answer: normalize(row.answer),
                links: row.links.map((link) => ({
                  ...link,
                  label: normalize(link.label),
                })),
              })),
              previous.rows.map((row) => ({
                ...row,
                question: normalize(row.question),
                answer: normalize(row.answer),
                links: row.links.map((link) => ({
                  ...link,
                  label: normalize(link.label),
                })),
              })),
            );
            report.preservation.push({
              path: route.path,
              rows: actual.length,
              originalQuestionsAnswersLinksAndIds: "unchanged",
            });
          }
          for (const width of [320, 390, 768, 1440]) {
            await page.setViewportSize({ width, height: 1000 });
            await page.evaluate(
              () =>
                new Promise((resolve) =>
                  requestAnimationFrame(() => requestAnimationFrame(resolve)),
                ),
            );
            await page.waitForFunction(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
              undefined,
              { timeout: 3000 },
            );
            verify(await geometry(faq));
            assert.equal(
              await faq.locator('button[aria-expanded="true"]').count(),
              1,
            );
            for (const index of width === 320 || width === 1440
              ? [...Array(actual.length).keys()]
              : [actual.length - 1]) {
              if (
                (await buttons.nth(index).getAttribute("aria-expanded")) !==
                "true"
              )
                await buttons.nth(index).click();
              const panel = faq.locator(
                `[id="${await buttons.nth(index).getAttribute("aria-controls")}"]`,
              );
              assert.equal(await panel.getAttribute("aria-hidden"), "false");
              assert.equal(await panel.getAttribute("inert"), null);
              const clipped = await panel.evaluate(
                (el) => el.firstElementChild.scrollHeight > el.clientHeight + 1,
              );
              assert.equal(clipped, false, "Answer content clipped");
              assert.equal(
                await faq.locator('button[aria-expanded="true"]').count(),
                1,
              );
            }
            await buttons.first().click();
            if (
              (await buttons.first().getAttribute("aria-expanded")) !== "true"
            )
              await buttons.first().click();
            if ([320, 1440].includes(width)) {
              const { violations } = await new AxeBuilder({ page })
                .include("[data-editorial-faq]")
                .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
                .analyze();
              assert.deepEqual(
                violations.map(({ id, nodes }) => ({
                  id,
                  targets: nodes.map(({ target }) => target),
                })),
                [],
              );
            }
            if (
              [
                "/",
                "/growth/",
                "/web-development/",
                "/for-agencies/",
                "/answers/",
              ].includes(route.path) &&
              [390, 1440].includes(width)
            )
              await faq.screenshot({
                path: `${output}/${route.context}-${width}.png`,
                animations: "disabled",
                style: ".navigation,.skip-link{visibility:hidden!important}",
              });
            if (previous && [390, 1440].includes(width)) {
              await page.evaluate(() => scrollTo(0, 0));
              const current = await page.evaluate(() =>
                [
                  ...document.querySelectorAll(
                    "main .content-hero,main .breadcrumbs,main .content-actions.hero-page-actions,main .agency-hero,.growth-masthead,.first-conversation-grid,main section",
                  ),
                ].map((el) => {
                  const r = el.getBoundingClientRect();
                  return {
                    tag: el.tagName,
                    className: el.className,
                    x: r.x,
                    y: r.y + scrollY,
                    width: r.width,
                    height: r.height,
                  };
                }),
              );
              for (const original of previous.boxes
                .find((item) => item.width === width)
                .items.filter((item) => !/faq/i.test(item.className))) {
                const updated = current.find(
                  (item) =>
                    item.className === original.className &&
                    item.tag === original.tag,
                );
                assert.ok(
                  updated,
                  `Missing original section ${original.className}`,
                );
                const delta = Object.fromEntries(
                  ["x", "y", "width", "height"].map((key) => [
                    key,
                    updated[key] - original[key],
                  ]),
                );
                report.preservation.push({
                  path: route.path,
                  width,
                  className: original.className,
                  delta,
                });
                for (const key of ["x", "y", "width", "height"])
                  assert.ok(
                    Math.abs(delta[key]) <= 0.2,
                    `Non-FAQ ${original.className} ${key} changed by ${delta[key]}`,
                  );
              }
            }
          }
          report.routes.push({
            path: route.path,
            questions: actual.length,
            widths: [320, 390, 768, 1440],
          });
        } finally {
          await ctx.close();
        }
      },
    );
  await check(
    "Additional responsive sizes across homepage, service, Growth Engine, agency and answer library",
    async () => {
      for (const route of routes.filter((route) =>
        ["home", "growth", "web-development", "agencies", "answers"].includes(
          route.context,
        ),
      )) {
        const ctx = await context();
        const page = await ctx.newPage();
        page.on("pageerror", (error) => report.errors.push(error.message));
        try {
          await visit(page, route.path);
          const faq = page.locator("[data-editorial-faq]");
          for (const width of [360, 375, 414, 430, 1024, 1280, 1920]) {
            await page.setViewportSize({ width, height: 1000 });
            await page.evaluate(
              () =>
                new Promise((resolve) =>
                  requestAnimationFrame(() => requestAnimationFrame(resolve)),
                ),
            );
            await page.waitForFunction(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
              undefined,
              { timeout: 3000 },
            );
            verify(await geometry(faq));
          }
        } finally {
          await ctx.close();
        }
      }
    },
  );
  await check(
    "All 23 published answer fragments and all five topic links open the requested content",
    async () => {
      const ctx = await context({ viewport: { width: 390, height: 844 } });
      const page = await ctx.newPage();
      try {
        await visit(page, "/answers/#demo-projects");
        for (const id of [
          ...answers.map((item) => item.id),
          ...new Set(answers.map((item) => item.group)),
        ].map((value) =>
          typeof value === "string" && answers.some((a) => a.id === value)
            ? value
            : `topic-${[...new Set(answers.map((item) => item.group))].indexOf(value)}`,
        )) {
          await page.evaluate((id) => {
            location.hash = id;
          }, id);
          const answer =
            answers.find((item) => item.id === id) ??
            answers.find(
              (item) =>
                item.group ===
                [...new Set(answers.map((entry) => entry.group))][
                  Number(id.split("-")[1])
                ],
            );
          await page.waitForFunction(
            (answerId) =>
              document.getElementById(answerId)?.dataset.open === "true",
            answer.id,
          );
          assert.equal(
            await page
              .locator(`#${answer.id} [role="region"]`)
              .getAttribute("aria-hidden"),
            "false",
          );
        }
        await page.goto(base + "/answers/#service-index-check");
        await page.waitForFunction(
          () =>
            document.getElementById("service-index-check")?.dataset.open ===
            "true",
        );
        assert.equal(
          await page
            .locator("#service-index-check a")
            .first()
            .getAttribute("href"),
          "/insights/portfolio-search-readiness/#crawl-and-index",
        );
      } finally {
        await ctx.close();
      }
    },
  );
  await check(
    "No JavaScript exposes every answer and original link across all page types",
    async () => {
      const ctx = await context({ javaScriptEnabled: false });
      const page = await ctx.newPage();
      try {
        for (const route of routes.filter((route) =>
          [
            "home",
            "growth",
            "web-development",
            "agencies",
            "answers",
            "contact",
          ].includes(route.context),
        )) {
          await visit(page, route.path);
          const regions = page.locator("[data-editorial-faq] [role='region']");
          assert.equal(
            await regions.count(),
            route.count ?? route.expected.length,
          );
          for (const panel of await regions.all()) {
            assert.ok((await panel.boundingBox()).height > 0);
            assert.equal(await panel.getAttribute("aria-hidden"), null);
            assert.equal(await panel.getAttribute("inert"), null);
          }
        }
      } finally {
        await ctx.close();
      }
    },
  );
  await check("No runtime errors or new FAQPage markup", async () => {
    assert.deepEqual(report.errors, []);
    for (const route of routes)
      assert.equal(
        (
          await fetch(base + route.path).then((response) => response.text())
        ).includes('"@type":"FAQPage"'),
        false,
      );
  });
} finally {
  await browser.close();
  await writeFile(output + "/results.json", JSON.stringify(report, null, 2));
}
console.log(
  `${report.checks.filter((item) => item.passed).length}/${report.checks.length} sitewide FAQ checks passed`,
);
if (report.checks.some((item) => !item.passed)) process.exitCode = 1;
