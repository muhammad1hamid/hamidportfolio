const word = "HAMID";
const fontFamily = '"Manrope", Arial, sans-serif';

export function originFont(size: number) {
  return `800 ${size}px ${fontFamily}`;
}

type GlyphTile = {
  left: number;
  top: number;
  width: number;
  height: number;
  x: number;
  y: number;
  letter: number;
};

function measureWord(context: CanvasRenderingContext2D, size: number) {
  context.font = originFont(size);
  let advance = -Infinity;
  let right = 3 - size * 0.018;

  return Array.from(word, (letter) => {
    const metrics = context.measureText(letter);
    const x = Math.max(
      advance,
      right + size * 0.018 + metrics.actualBoundingBoxLeft,
    );
    const left = x - metrics.actualBoundingBoxLeft;
    right = x + metrics.actualBoundingBoxRight;
    advance = x + metrics.width - size * 0.046;
    return {
      letter,
      x,
      left,
      right,
      ascent: metrics.actualBoundingBoxAscent,
      descent: metrics.actualBoundingBoxDescent,
    };
  });
}

function sampleTiles(
  { data, width, height }: ImageData,
  stride: number,
  dpr: number,
  letterEdges: number[],
) {
  const tiles: GlyphTile[] = [];
  for (let top = 0; top < height; top += stride) {
    const tileHeight = Math.min(stride, height - top);
    for (let left = 0; left < width; left += stride) {
      const tileWidth = Math.min(stride, width - left);
      const midX = left + tileWidth / 2;
      const midY = top + tileHeight / 2;
      let best = -Infinity;
      let pointX = 0;
      let pointY = 0;
      // Use an interior pixel near the cell's centre for emission and landing.
      // Keep the entire cell so the breakup starts with the original glyph ink.
      for (let y = top; y < top + tileHeight; y++) {
        for (let x = left; x < left + tileWidth; x++) {
          const alpha = data[(y * width + x) * 4 + 3];
          if (alpha === 0) continue;
          const score = alpha - 4 * (Math.abs(x - midX) + Math.abs(y - midY));
          if (score <= best) continue;
          best = score;
          pointX = x;
          pointY = y;
        }
      }
      if (best === -Infinity) continue;
      const letter = letterEdges.findIndex((edge) => pointX < edge);
      tiles.push({
        left,
        top,
        width: tileWidth,
        height: tileHeight,
        x: (pointX + 0.5) / dpr,
        y: (pointY + 0.5) / dpr,
        letter: letter < 0 ? word.length - 1 : letter,
      });
    }
  }
  return tiles;
}

export function rasterizeOriginWord(
  fontSize: number,
  viewportWidth: number,
  dpr: number,
  ink: string,
) {
  const bitmap = document.createElement("canvas");
  const context = bitmap.getContext("2d", { willReadFrequently: true });
  if (!context) return;

  let size = fontSize;
  let glyphs = measureWord(context, size);
  const usableWidth = viewportWidth - 32;
  if (glyphs[4].right + 3 > usableWidth) {
    size = Math.floor(size * (usableWidth / (glyphs[4].right + 3)));
    glyphs = measureWord(context, size);
  }

  const baseline = 3 + Math.max(...glyphs.map((glyph) => glyph.ascent));
  bitmap.width = Math.ceil((glyphs[4].right + 3) * dpr);
  bitmap.height = Math.ceil(
    (baseline + Math.max(...glyphs.map((glyph) => glyph.descent)) + 3) * dpr,
  );
  context.scale(dpr, dpr);
  context.font = originFont(size);
  context.fillStyle = ink;
  for (const { letter, x } of glyphs) context.fillText(letter, x, baseline);

  const image = context.getImageData(0, 0, bitmap.width, bitmap.height);
  let inkArea = 0;
  for (let index = 3; index < image.data.length; index += 4) {
    if (image.data[index] > 127) inkArea++;
  }
  if (inkArea === 0) return;

  const letterEdges = glyphs
    .slice(0, -1)
    .map((glyph, index) => ((glyph.right + glyphs[index + 1].left) / 2) * dpr);
  const budget = viewportWidth >= 1024 ? 670 : viewportWidth >= 700 ? 400 : 235;
  const step = Math.max(2, Math.ceil(Math.sqrt(inkArea / (budget * 0.72))));
  let tiles = sampleTiles(image, step, dpr, letterEdges);
  if (tiles.length > budget) {
    const largerStep = Math.ceil(step * Math.sqrt(tiles.length / budget));
    tiles = sampleTiles(image, largerStep, dpr, letterEdges);
  }

  return {
    bitmap,
    dpr,
    tiles,
    anchorWidth: Math.ceil(glyphs[0].right * dpr),
    anchorCenter: (glyphs[0].left + glyphs[0].right) / 2,
  };
}
