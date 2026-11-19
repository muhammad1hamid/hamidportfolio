import http from "node:http";
import path from "node:path";
import { readFile, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";

const root = path.resolve("out");
const port = Number(process.env.PORT || 3000);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp4": "video/mp4",
  ".m4v": "video/mp4",
  ".webm": "video/webm",
  ".vtt": "text/vtt; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
  ".xml": "application/xml",
};
http
  .createServer(async (req, res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Cache-Control", "no-cache");
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { Allow: "GET, HEAD" }).end();
      return;
    }
    try {
      const url = new URL(req.url, "http://127.0.0.1");
      let canonicalPath = url.pathname.replace(/\/index\.html$/, "/");
      if (/^\/portfolio\/?$/.test(canonicalPath)) canonicalPath = "/work/";
      if (canonicalPath !== url.pathname) {
        res.writeHead(301, { Location: canonicalPath + url.search }).end();
        return;
      }
      const filename = path.resolve(
        root,
        `.${decodeURIComponent(url.pathname)}`,
      );
      if (filename !== root && !filename.startsWith(root + path.sep)) {
        res.writeHead(403).end();
        return;
      }
      const info = await stat(filename);
      if (info.isDirectory() && !url.pathname.endsWith("/")) {
        res.writeHead(301, { Location: url.pathname + "/" + url.search }).end();
        return;
      }
      const resolved = info.isDirectory()
        ? path.join(filename, "index.html")
        : filename;
      res.setHeader(
        "Content-Type",
        types[path.extname(resolved)] || "application/octet-stream",
      );
      if (url.pathname.startsWith("/_next/static/")) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      } else if (url.pathname.startsWith("/images/")) {
        res.setHeader(
          "Cache-Control",
          "public, max-age=86400, must-revalidate",
        );
      }
      let served = resolved;
      let file = info.isDirectory() ? await stat(resolved) : info;
      if (/\.(html|css|js|json|svg|txt|xml)$/.test(resolved)) {
        res.setHeader("Vary", "Accept-Encoding");
        const accepted = (req.headers["accept-encoding"] || "")
          .split(",")
          .map((part) => {
            const [name, ...params] = part.trim().split(";");
            const quality = params.find((param) =>
              param.trim().startsWith("q="),
            );
            return {
              name,
              quality: quality ? Number(quality.trim().slice(2)) : 1,
            };
          });
        if (!req.headers.range) {
          for (const encoding of ["br", "gzip"]) {
            if (
              !accepted.some(
                (item) =>
                  (item.name === encoding || item.name === "*") &&
                  item.quality > 0,
              )
            )
              continue;
            try {
              const candidate = resolved + (encoding === "br" ? ".br" : ".gz");
              file = await stat(candidate);
              served = candidate;
              res.setHeader("Content-Encoding", encoding);
              break;
            } catch {
              /* Uncompressed export remains usable. */
            }
          }
        }
      }
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Content-Length", file.size);
      if (req.method === "HEAD") {
        res.end();
        return;
      }
      let start = 0;
      let end = file.size - 1;
      const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
      if (range && (range[1] || range[2])) {
        if (range[1]) {
          start = Number(range[1]);
          if (range[2]) end = Math.min(Number(range[2]), end);
        } else {
          start = Math.max(0, file.size - Number(range[2]));
        }
        if (
          !Number.isSafeInteger(start) ||
          !Number.isSafeInteger(end) ||
          start > end ||
          start >= file.size
        ) {
          res
            .writeHead(416, {
              "Content-Range": `bytes */${file.size}`,
              "Content-Length": 0,
            })
            .end();
          return;
        }
        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${file.size}`,
          "Content-Length": end - start + 1,
        });
      }
      const stream = createReadStream(
        served,
        file.size ? { start, end } : undefined,
      );
      stream.on("error", () => res.destroy());
      res.on("close", () => stream.destroy());
      stream.pipe(res);
    } catch {
      res.writeHead(404, { "Content-Type": "text/html" });
      try {
        res.end(
          req.method === "HEAD"
            ? undefined
            : await readFile(path.join(root, "404.html")),
        );
      } catch {
        res.end("Build the site first.");
      }
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`Portfolio preview: http://127.0.0.1:${port}`),
  );
