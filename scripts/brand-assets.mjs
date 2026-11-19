import sharp from "sharp";

await sharp("public/social-card.svg").png().toFile("public/social-card.png");
await sharp("public/favicon.svg")
  .resize(180, 180)
  .png()
  .toFile("public/apple-touch-icon.png");
console.log("Social sharing image and Apple touch icon generated.");
