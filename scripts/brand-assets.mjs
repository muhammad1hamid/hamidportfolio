import sharp from "sharp";

await import("./social-assets.mjs");
await sharp("public/images/social/hamid-home-v2.jpg")
  .png()
  .toFile("public/social-card.png");
await sharp("public/favicon.svg")
  .resize(180, 180)
  .png()
  .toFile("public/apple-touch-icon.png");
console.log("Social sharing image and Apple touch icon generated.");
