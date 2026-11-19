import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const origin = process.env.QA_BASE_URL || "http://127.0.0.1:3001";
const file = await readFile("out/social-card.png");
const asset = `${origin}/social-card.png`;
for (const [range, start, end] of [
  ["bytes=0-31", 0, 31],
  ["bytes=64-", 64, file.length - 1],
  ["bytes=-48", file.length - 48, file.length - 1],
  [
    `bytes=${file.length - 12}-${file.length + 500}`,
    file.length - 12,
    file.length - 1,
  ],
]) {
  const response = await fetch(asset, { headers: { Range: range } });
  assert.equal(response.status, 206);
  assert.equal(
    response.headers.get("content-range"),
    `bytes ${start}-${end}/${file.length}`,
  );
  assert.deepEqual(
    Buffer.from(await response.arrayBuffer()),
    file.subarray(start, end + 1),
  );
}
for (const range of [`bytes=${file.length}-`, "bytes=100-50", "bytes=-0"]) {
  const response = await fetch(asset, { headers: { Range: range } });
  assert.equal(response.status, 416);
  assert.equal(response.headers.get("content-range"), `bytes */${file.length}`);
  assert.equal((await response.arrayBuffer()).byteLength, 0);
}
const head = await fetch(asset, { method: "HEAD" });
assert.equal(head.headers.get("content-length"), String(file.length));
assert.equal(head.headers.get("accept-ranges"), "bytes");
assert.equal((await head.arrayBuffer()).byteLength, 0);
const full = await fetch(asset);
assert.equal(full.status, 200);
assert.deepEqual(Buffer.from(await full.arrayBuffer()), file);
const missing = await fetch(`${origin}/does-not-exist`);
assert.equal(missing.status, 404);
console.log(
  "Static delivery verified: full files, HEAD, byte ranges, invalid ranges and 404s.",
);
