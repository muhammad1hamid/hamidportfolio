import catalog from "./services.json";
export const servicePages = catalog;
export const serviceBySlug = (slug: string) =>
  servicePages.find((service) => service.slug === slug);
