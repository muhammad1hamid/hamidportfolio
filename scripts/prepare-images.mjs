import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const assets = path.resolve("../assets");
const output = path.resolve("public/images");
await mkdir(path.join(output, "projects"), { recursive: true });
await sharp(path.join(assets, "mypic1.jpeg"))
  .resize({ width: 1100, withoutEnlargement: true })
  .webp({ quality: 86 })
  .toFile(path.join(output, "hamid-hero.webp"));
await sharp(path.join(assets, "mypic2.jpeg"))
  .resize({ width: 850, withoutEnlargement: true })
  .webp({ quality: 84 })
  .toFile(path.join(output, "hamid-about.webp"));
console.log("Prepared two optimized portraits from supplied photos.");
