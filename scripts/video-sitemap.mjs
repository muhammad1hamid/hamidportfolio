import { readFile, stat, writeFile } from "node:fs/promises";
import ts from "typescript";
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[char],
  );
async function data(file) {
  const code = ts.transpileModule(await readFile(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext },
  }).outputText;
  return import(
    `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
  );
}
export async function createVideoSitemap(origin) {
  const { testimonialPages } = await data("data/testimonial-pages.ts");
  const { testimonials } = await data("data/testimonials.ts");
  const entries = [];
  for (const publication of testimonialPages) {
    if (!publication.thumbnail || !publication.uploadDate) continue;
    if (
      !Number.isFinite(Date.parse(publication.uploadDate)) ||
      !/^\d{4}-\d{2}-\d{2}T/.test(publication.uploadDate)
    )
      throw new Error(
        `Use the real ISO video publication datetime: ${publication.slug}`,
      );
    if (
      !publication.thumbnail.startsWith("/images/") ||
      publication.thumbnail.includes("..") ||
      !(await stat(`public${publication.thumbnail}`)).isFile()
    )
      throw new Error(`Missing stable video thumbnail: ${publication.slug}`);
    const person = testimonials.find(
      (item) => item.id === publication.testimonialId,
    );
    if (!person?.video) throw new Error(`Missing video: ${publication.slug}`);
    const video = person.video;
    const media =
      video.provider === "google-drive"
        ? `<video:player_loc>${escape(`https://drive.google.com/file/d/${video.fileId}/preview`)}</video:player_loc>`
        : `<video:content_loc>${escape(new URL(video.src, origin).href)}</video:content_loc>`;
    entries.push(
      `<url><loc>${escape(`${origin}/testimonials/${publication.slug}/`)}</loc><video:video><video:thumbnail_loc>${escape(new URL(publication.thumbnail, origin).href)}</video:thumbnail_loc><video:title>${escape(`${person.name} — ${person.company} video testimonial`)}</video:title><video:description>${escape(`${person.name}, ${person.role} of ${person.company}, shares a perspective on working with Hamid.`)}</video:description><video:publication_date>${escape(publication.uploadDate)}</video:publication_date>${media}</video:video></url>`,
    );
  }
  if (entries.length)
    await writeFile(
      "out/video-sitemap.xml",
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">${entries.join("")}</urlset>`,
    );
  console.log(
    entries.length
      ? `Prepared ${entries.length} verified video sitemap entries.`
      : "Video sitemap withheld: verified thumbnails/publication dates are not supplied.",
  );
}
