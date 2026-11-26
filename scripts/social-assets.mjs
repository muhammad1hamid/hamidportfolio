import { readFile, mkdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { design, socialCatalog } from "./social/catalog.mjs";

// Local fonts and real project assets make this renderer independent of browsers,
// external image services and platform font substitution during production builds.
const output = "public/images/social";
const fonts = path.resolve("scripts/social/fonts");
const colors = {
  background: "#111213",
  ivory: "#f4f1eb",
  orange: "#ff8651",
  muted: "#b6b6b3",
};
const escape = (text) =>
  String(text).replace(
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
const layers = [];
const textFrames = [];

async function text(
  text,
  x,
  y,
  {
    size = 24,
    width,
    height,
    color = colors.ivory,
    serif = false,
    weight = "",
    tracking = 0,
  } = {},
) {
  const input = {
    text: `<span foreground="${color}" letter_spacing="${tracking}">${escape(text)}</span>`,
    font: `${serif ? "Instrument Serif Italic" : `Manrope ${weight}`} ${size}`,
    fontfile: path.join(
      fonts,
      serif ? "InstrumentSerif-Italic.ttf" : "Manrope.ttf",
    ),
    rgba: true,
    dpi: 72,
    ...(width ? { width, wrap: "word" } : {}),
  };
  let buffer = await sharp({ text: input }).png().toBuffer();
  let meta = await sharp(buffer).metadata();
  while (height && meta.height > height && size > 28) {
    size -= 2;
    input.font = `${serif ? "Instrument Serif Italic" : `Manrope ${weight}`} ${size}`;
    buffer = await sharp({ text: input }).png().toBuffer();
    meta = await sharp(buffer).metadata();
  }
  if (x + meta.width > 1160 || y + meta.height > 610)
    throw new Error(`Social text outside safe canvas: ${text}`);
  textFrames.push({ text, x, y, width: meta.width, height: meta.height, size });
  layers.push({ input: buffer, left: x, top: y });
  return meta;
}

function vector(svg, left = 0, top = 0) {
  layers.push({ input: Buffer.from(svg), left, top });
}

async function image(source, x, y, width, height, position = "north") {
  const buffer = await sharp(`public${source}`)
    .resize(width, height, { fit: "cover", position })
    .png()
    .toBuffer();
  layers.push({ input: buffer, left: x, top: y });
}

async function logo() {
  const mark = await text("HAMID", 64, 55, {
    size: 38,
    weight: "ExtraBold",
    tracking: -1100,
  });
  vector(
    `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><g stroke="${colors.orange}" stroke-width="1.8"><path d="M14 1V27M1 14H27M5 5L23 23M5 23L23 5"/></g></svg>`,
    64 + mark.width + 14,
    57,
  );
}

await mkdir(output, { recursive: true });
const catalog = await socialCatalog();
const manifest = [];
const portraitSource = await sharp(
  `public${design.portrait.representativeSource}`,
).metadata();
if (
  portraitSource.width < design.portrait.width ||
  portraitSource.height < design.portrait.height
)
  throw new Error("Representative portrait would require upscaling");
await sharp(`public${design.portrait.representativeSource}`)
  .resize(design.portrait.width, design.portrait.height)
  .jpeg({ quality: 94, mozjpeg: true, chromaSubsampling: "4:4:4" })
  .toFile(`public${design.portrait.image}`);
for (const width of [480, 768]) {
  await sharp(`public${design.portrait.representativeSource}`)
    .resize(width, width)
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(`public${design.portrait.image.replace(".jpg", `-${width}.jpg`)}`);
}

for (const card of catalog) {
  layers.length = 0;
  textFrames.length = 0;
  const portrait = card.kind === "portrait";
  if (portrait) {
    const original = await sharp(`public${design.portrait.source}`)
      .resize(700, 700)
      .png()
      .toBuffer();
    // Crop beyond the canvas at the shoulders; do not crop or alter the face.
    layers.push({
      input: await sharp(original)
        .extract({ left: 0, top: 0, width: 700, height: 614 })
        .toBuffer(),
      left: 400,
      top: 16,
    });
  } else if (card.kind === "collage") {
    await image("/images/projects/bridal-house.webp", 640, 137, 246, 170);
    await image("/images/projects/ink-grail.webp", 906, 137, 230, 170);
    await image("/images/projects/qadeer-jewellers.webp", 640, 326, 496, 210);
  } else if (card.kind === "project" || card.kind === "editorial") {
    await image(card.source, 650, 155, 486, 338);
    vector(
      '<svg xmlns="http://www.w3.org/2000/svg" width="486" height="338"><rect x=".5" y=".5" width="485" height="337" fill="none" stroke="#63635c" stroke-width="1"/></svg>',
      650,
      155,
    );
  } else {
    vector(
      `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="322"><path d="M42 41V281M42 41H110M42 161H110M42 281H110" stroke="#ff8651" stroke-width="2"/><g fill="#111213" stroke="#ff8651" stroke-width="2"><circle cx="42" cy="41" r="6"/><circle cx="42" cy="161" r="6"/><circle cx="42" cy="281" r="6"/></g><g stroke="#555753" fill="none"><path d="M110 81H490M110 201H490M110 321H490"/></g></svg>`,
      624,
      166,
    );
    for (const [index, node] of card.nodes.entries())
      await text(node, 736, 190 + index * 120, {
        size: 25,
        width: 390,
        weight: "SemiBold",
      });
  }
  await logo();
  await text(card.label, 66, 151, {
    size: 17,
    color: colors.muted,
    weight: "Medium",
  });
  if (portrait) {
    await text(card.headline[0], 62, 218, {
      size: card.path === "/contact/" ? 106 : 88,
      weight: "ExtraBold",
      tracking: -2600,
    });
    await text(card.headline[1], 64, 303, {
      size: card.path === "/about/" ? 92 : 132,
      serif: true,
      color: colors.orange,
      tracking: -1700,
    });
  } else if (card.headline.length === 2) {
    await text(card.headline[0], 62, 226, {
      size: 68,
      weight: "Bold",
      width: 540,
      height: 154,
      tracking: -1800,
    });
    await text(card.headline[1], 64, 342, {
      size: 88,
      serif: true,
      color: colors.orange,
      width: 550,
      height: 140,
      tracking: -1200,
    });
  } else {
    await text(card.headline[0], 62, 220, {
      size: 68,
      weight: "Bold",
      width: 540,
      height: 235,
      tracking: -1500,
    });
  }
  await text(card.line, 66, 509, {
    size: portrait ? 21 : 18,
    color: colors.muted,
    width: portrait ? 540 : 520,
    height: 46,
  });
  if (card.proof)
    await text(card.proof, 651, 516, {
      size: 16,
      color: colors.muted,
      width: 480,
      height: 40,
    });
  await text("itshamid.com", 66, 578, { size: 20, weight: "Medium" });
  const filename = `public${card.image}`;
  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: colors.background,
    },
  })
    .composite(layers)
    .flatten({ background: colors.background })
    .jpeg({ quality: 93, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toFile(filename);
  const buffer = await readFile(filename);
  manifest.push({
    ...card,
    bytes: buffer.length,
    sha256: createHash("sha256").update(buffer).digest("hex"),
    textFrames: [...textFrames],
    ...(portrait
      ? {
          portraitSource: design.portrait.source,
          faceBounds: { left: 626, top: 166, width: 258, height: 270 },
        }
      : {}),
  });
}

const images = Object.fromEntries(
  catalog.map(({ path: route, image, alt, width, height, type }) => [
    route,
    { image, alt, width, height, type },
  ]),
);
await writeFile(
  "data/social-images.json",
  JSON.stringify(images, null, 2) + "\n",
);
await writeFile(
  "scripts/social/asset-manifest.json",
  JSON.stringify(
    {
      version: design.version,
      portrait: {
        ...design.portrait,
        bytes: (await stat(`public${design.portrait.image}`)).size,
      },
      assets: manifest,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Prepared ${catalog.length} versioned social banners and one natural ${design.portrait.width}px portrait, using real source assets and local fonts.`,
);
