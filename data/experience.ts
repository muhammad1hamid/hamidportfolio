import pages from "./experience-pages.json";
import { pageMeta } from "./seo";
export function experienceMeta(path: string) {
  const page = pages.find((item) => item.path === path);
  if (!page) throw new Error(`Missing page metadata: ${path}`);
  return pageMeta(page.title, page.description, page.path);
}
