import { readFile } from "node:fs/promises";
import ts from "typescript";

export const design = JSON.parse(
  await readFile("data/social-preview-design.json", "utf8"),
);
export const imagePath = (route) =>
  `/images/social/hamid-${route === "/" ? "home" : route.split("/").filter(Boolean).join("-")}-v${design.version}.jpg`;

async function sourceModule(filename) {
  const code = ts.transpileModule(await readFile(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext },
  }).outputText;
  return import(
    `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
  );
}

export async function socialCatalog() {
  const services = JSON.parse(await readFile("data/services.json", "utf8"));
  const articles = [
    ...JSON.parse(await readFile("data/articles.json", "utf8")),
    ...JSON.parse(await readFile("data/guides.json", "utf8")),
  ];
  const insights = JSON.parse(await readFile("data/insights.json", "utf8"));
  const experience = JSON.parse(
    await readFile("data/experience-pages.json", "utf8"),
  );
  const { storyProjects, projectProofLabels } =
    await sourceModule("data/projects.ts");
  const records = [...design.pages];
  for (const service of services.filter((item) => item.slug !== "growth")) {
    const web = ["web-development", "landing-page-development"].includes(
      service.slug,
    );
    records.push({
      path: `/${service.slug}/`,
      kind: web ? "project" : "diagram",
      headline: [service.displayName ?? service.name],
      label: "Services / Hamid",
      line: service.name,
      source: web ? "/images/projects/bridal-house.webp" : undefined,
      proof: web
        ? "Bridal House · Self-directed demo"
        : "Illustrative scope · Agreed human oversight",
      nodes:
        service.pillar === "ai-conversations"
          ? ["A question", "Approved answers", "Human handover"]
          : service.slug === "business-dashboards"
            ? ["Sources", "A useful view", "Decisions"]
            : ["Inputs", "A scoped workflow", "Human review"],
      alt: web
        ? `${service.name} by Hamid, illustrated with his Bridal House self-directed demo screenshot.`
        : `${service.name}: an illustrative process diagram, with no unverified results or metrics.`,
    });
  }
  for (const article of articles)
    records.push({
      path: `/blog/${article.slug}/`,
      kind: "editorial",
      headline: [article.title],
      label: "Practical guide",
      line: article.category,
      source: `/images/insights/${design.articleSources[article.slug] ?? "first-workflow-to-automate"}.webp`,
      alt: `Hamid’s guide: ${article.title}. Topic-specific editorial illustration.`,
    });
  for (const insight of insights)
    records.push({
      path: `/insights/${insight.slug}/`,
      kind: "editorial",
      headline: [insight.title],
      label: "HAMID Insights",
      line: insight.category,
      source: `/images/insights/${insight.slug}.webp`,
      alt: `${insight.title}. ${insight.cover.alt}`,
    });
  for (const project of storyProjects)
    records.push({
      path: project.detailUrl,
      kind: "project",
      headline: [project.title],
      label: projectProofLabels[project.proofType],
      line: project.industry,
      source: project.thumbnail,
      proof: projectProofLabels[project.proofType],
      alt: `Actual ${project.title} website screenshot. ${projectProofLabels[project.proofType]} in Hamid’s portfolio.`,
    });
  for (const page of experience) {
    const headlines = {
      "/answers/": ["Good questions.", "Useful answers."],
      "/plan/": ["Shape the brief.", "Find a direction."],
      "/demos/enquiry-assistant/": ["Enquiry to", "human handover."],
      "/testimonials/": ["A few words", "from the people."],
      "/testimonials/abdullah-abbasii/": ["Abdullah", "Abbasii."],
      "/testimonials/usman/": ["Usman.", "Prestige Media."],
      "/editorial-policy/": ["Clear examples.", "Honest context."],
    };
    records.push({
      path: page.path,
      kind: "diagram",
      headline: headlines[page.path] ?? [page.title.replace(/ \| Hamid$/, "")],
      label: page.label,
      line: page.path.includes("testimonials")
        ? "Supplied client video perspectives"
        : "Practical decisions · Clear next steps",
      nodes: page.path.includes("testimonials")
        ? ["A conversation", "A perspective", "A real person"]
        : ["Question", "Context", "Next step"],
      alt: `${page.title.replace(/ \| Hamid$/, "")} — a dedicated HAMID editorial preview.`,
    });
  }
  if (new Set(records.map((record) => record.path)).size !== records.length)
    throw new Error("Duplicate social preview route");
  return records.map((record) => ({
    ...record,
    image: imagePath(record.path),
    width: 1200,
    height: 630,
    type: "image/jpeg",
  }));
}
