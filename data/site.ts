const configuredOrigin = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://itshamid.com",
);
if (
  configuredOrigin.protocol !== "https:" ||
  configuredOrigin.username ||
  configuredOrigin.password ||
  configuredOrigin.port ||
  configuredOrigin.pathname !== "/" ||
  configuredOrigin.search ||
  configuredOrigin.hash ||
  /^(localhost|127\.|\[::1\])/.test(configuredOrigin.hostname)
) {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL must be a public HTTPS origin without a path, port or credentials.",
  );
}

export const site = {
  name: "Hamid",
  personName: "Muhammad Hamid",
  title: "Web Development, SEO & AI Automation | Hamid",
  description:
    "I’m Hamid, an independent developer building distinctive websites, improving search and AI visibility, and creating practical automations for businesses and agencies.",
  url: configuredOrigin.origin,
  noindex: process.env.SEO_NOINDEX === "true",
  telephone: "+923356709222",
  // Contact destinations supplied by the owner.
  email: "hamidwork360@gmail.com",
  whatsapp: "https://wa.me/923356709222",
  linkedin: "https://www.linkedin.com/in/muhammad-hamid-2072b6401/",
  instagram: "https://www.instagram.com/m.hamid_2006/?hl=en",
};
