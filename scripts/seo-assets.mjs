import { readFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import ts from "typescript";

const services = JSON.parse(await readFile("data/services.json", "utf8"));
const articles = [
  ...JSON.parse(await readFile("data/articles.json", "utf8")),
  ...JSON.parse(await readFile("data/guides.json", "utf8")),
];
const insights = JSON.parse(await readFile("data/insights.json", "utf8"));
const experiencePages = JSON.parse(
  await readFile("data/experience-pages.json", "utf8"),
);
const compiled = ts.transpileModule(
  await readFile("data/projects.ts", "utf8"),
  { compilerOptions: { module: ts.ModuleKind.ESNext } },
).outputText;
const { projects } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);
const notesModule = ts.transpileModule(
  await readFile("data/project-details.ts", "utf8"),
  { compilerOptions: { module: ts.ModuleKind.ESNext } },
).outputText;
const { projectDetails } = await import(
  `data:text/javascript;base64,${Buffer.from(notesModule).toString("base64")}`
);
const cards = [
  [
    "home",
    "Stand out online. Get found. Work smarter.",
    "INDEPENDENT DEVELOPER / PAKISTAN",
  ],
  ["services", "Find the right starting point.", "SERVICES"],
  ["about", "The person behind the work.", "ABOUT HAMID"],
  ["contact", "A good project starts here.", "CONTACT"],
  ["work", "18 websites. Different worlds.", "THE PORTFOLIO"],
  ["case-studies", "The details behind the experience.", "PROJECT NOTES"],
  ["blog", "Better questions. Clearer projects.", "PRACTICAL GUIDES"],
  ["insights", "Website and automation insights", "HAMID / INSIGHTS"],
  ...experiencePages.map((p) => [
    p.path.split("/").filter(Boolean).join("-"),
    p.title.replace(/ \| Hamid$/, ""),
    p.label.toUpperCase(),
  ]),
  ...services
    .filter((service) => service.slug !== "growth")
    .map((service) => [service.slug, service.name, "SERVICES / HAMID"]),
  ...articles.map((a) => [`blog-${a.slug}`, a.title, a.category.toUpperCase()]),
  ...projects
    .filter((p) => projectDetails[p.id])
    .map((p) => [`work-${p.slug}`, p.title, "WEBSITE EXPERIENCE NOTES"]),
];
const escape = (value) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[character],
  );
function lines(text, length = 27) {
  const output = [""];
  for (const word of text.split(" ")) {
    if ((output.at(-1) + " " + word).trim().length > length) output.push(word);
    else output[output.length - 1] = `${output.at(-1)} ${word}`.trim();
  }
  return output;
}
await mkdir("public/images/share", { recursive: true });
for (const [slug, title, label] of cards) {
  const rows = lines(title);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#101112"/><path d="M60 146H1140M60 552H1140" stroke="#343739"/><circle cx="1070" cy="87" r="23" fill="#ff8651"/><text x="65" y="104" fill="#f0f0ec" font-family="Arial,sans-serif" font-size="48" font-weight="700" letter-spacing="-2">HAMID</text><text x="65" y="204" fill="#ff8651" font-family="Arial,sans-serif" font-size="19" letter-spacing="3">${escape(label)}</text>${rows.map((row, i) => `<text x="62" y="${295 + i * 82}" fill="#f0f0ec" font-family="Arial,sans-serif" font-size="${rows.length > 3 ? 60 : 70}" font-weight="500" letter-spacing="-2">${escape(row)}</text>`).join("")}<text x="65" y="593" fill="#a6aaa9" font-family="Arial,sans-serif" font-size="18">WEB DEVELOPMENT · AI AUTOMATION · CHATBOTS</text><text x="1100" y="593" text-anchor="end" fill="#ff8651" font-family="Arial,sans-serif" font-size="24">↗</text></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(`public/images/share/${slug}.png`);
}
const growthArt = await sharp(
  "public/images/growth/discovery-field-charcoal.webp",
)
  .resize(528, 630)
  .toBuffer();
const growthCard = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <rect width="1200" height="630" fill="#101112"/>
    <path d="M54 119H625M54 560H625" stroke="#343739"/>
    <text x="54" y="90" font-family="Arial,sans-serif" font-size="42" font-weight="700" fill="#f0f0ec">HAMID</text>
    <text x="54" y="171" font-family="Arial,sans-serif" font-size="24" letter-spacing="2" font-weight="700" fill="#ff8651">GROWTH ENGINE</text>
    <text x="54" y="278" font-family="Arial,sans-serif" font-size="71" letter-spacing="-4" font-weight="700" fill="#f0f0ec">Get found.</text>
    <text x="54" y="359" font-family="Arial,sans-serif" font-size="70" letter-spacing="-4" font-weight="700" fill="#f0f0ec">Get understood.</text>
    <text x="54" y="438" font-family="Georgia,serif" font-size="46" font-style="italic" fill="#ff8651">Give people a reason</text>
    <text x="54" y="491" font-family="Georgia,serif" font-size="46" font-style="italic" fill="#ff8651">to choose you.</text>
    <text x="54" y="597" font-family="Arial,sans-serif" font-size="18" font-weight="700" fill="#a6aaa9">SEO · AEO · GEO · CONVERSION PATHS</text>
  </svg>`);
await sharp(growthCard)
  .composite([{ input: growthArt, left: 672, top: 0 }])
  .png()
  .toFile("public/images/share/growth.png");

await mkdir("public/images/responsive", { recursive: true });
for (const { slug, cover } of insights) {
  const source = `public/images/insights/${slug}.webp`;
  const blue = cover.tone === "blue";
  const colors = blue ? ["#ffffff", "#ffe3a8"] : ["#101112", "#1239bc"];
  const text = cover.poster
    .map(
      (line, index) =>
        `<text x="60" y="${370 + index * 78}" fill="${colors[index] || colors[0]}" font-size="78" font-weight="800" letter-spacing="-4">${escape(line.toUpperCase())}</text>`,
    )
    .join("");
  const typography = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" font-family="Arial, sans-serif"><text x="60" y="61" fill="${colors[0]}" font-size="24" font-weight="700">HAMID / INSIGHTS</text>${text}</svg>`;

  await sharp(source)
    .resize(1200, 630)
    .composite([{ input: Buffer.from(typography) }])
    .jpeg({ quality: 87, mozjpeg: true })
    .toFile(`public/images/share/insights-${slug}.jpg`);

  for (const width of [480, 768]) {
    await sharp(source)
      .resize({ width })
      .webp({ quality: 82 })
      .toFile(`public/images/responsive/insight-${slug}-${width}.webp`);
  }
}

for (const width of [480, 768]) {
  await sharp("public/images/hamid-hero.webp")
    .resize({ width })
    .webp({ quality: 85 })
    .toFile(`public/images/responsive/hamid-hero-${width}.webp`);
}
const originals = (await readdir("public/images/projects")).filter(
  (name) => name.endsWith(".webp") && !name.includes("-mobile"),
);
for (const name of originals) {
  for (const width of [640, 960]) {
    await sharp(path.join("public/images/projects", name))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(
        `public/images/responsive/${name.replace(".webp", `-${width}.webp`)}`,
      );
  }
}
console.log(
  `Prepared ${cards.length + insights.length + 1} page-specific share images and responsive portrait, project and insight assets.`,
);
