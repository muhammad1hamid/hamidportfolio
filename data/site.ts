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
  title: "Web Development & AI Automation in Pakistan | Hamid",
  description:
    "Premium web development, useful AI automation, and chatbot development. Hamid is an independent developer based in Pakistan, collaborating with businesses and agencies worldwide.",
  url: configuredOrigin.origin,
  noindex: process.env.SEO_NOINDEX === "true",
  telephone: "+923356709222",
  // User-supplied contact details. An email can be added when available.
  email: "",
  whatsapp: "https://wa.me/923356709222",
  linkedin: "https://www.linkedin.com/in/muhammad-hamid-2072b6401/",
  instagram: "https://www.instagram.com/m.hamid_2006/?hl=en",
};
