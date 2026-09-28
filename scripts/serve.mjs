import http from "node:http";
import path from "node:path";
import { readFile, stat } from "node:fs/promises";

const root = path.resolve("out");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
  ".xml": "application/xml",
};
http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://127.0.0.1");
      const filename = path.resolve(
        root,
        `.${decodeURIComponent(url.pathname)}`,
      );
      if (filename !== root && !filename.startsWith(root + path.sep)) {
        res.writeHead(403).end();
        return;
      }
      const info = await stat(filename);
      const resolved = info.isDirectory()
        ? path.join(filename, "index.html")
        : filename;
      res.setHeader(
        "Content-Type",
        types[path.extname(resolved)] || "application/octet-stream",
      );
      res.end(await readFile(resolved));
    } catch {
      res.writeHead(404, { "Content-Type": "text/html" });
      try {
        res.end(await readFile(path.join(root, "404.html")));
      } catch {
        res.end("Build the site first.");
      }
    }
  })
  .listen(3000, "127.0.0.1", () =>
    console.log("Portfolio preview: http://127.0.0.1:3000"),
  );
