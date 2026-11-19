export const categories = [
  "All",
  "Web",
  "AI Systems",
  "Automation",
  "Chatbots",
] as const;
export type Category = Exclude<(typeof categories)[number], "All">;
export type Project = {
  id: string;
  title: string;
  slug: string;
  category: Category;
  projectType?: "Self-directed demo";
  industry?: string;
  featured: boolean;
  thumbnail: string;
  mobileThumbnail?: string;
  preview?: string;
  description: string;
  technologies: string[];
  liveUrl: string | null;
  year: number | null;
  status: "placeholder" | "published";
  visual: "web" | "commerce" | "workflow" | "chat" | "brand" | "system";
};

type WebsiteInput = Pick<
  Project,
  "id" | "title" | "industry" | "description" | "featured"
> & { liveUrl: string };

function website(input: WebsiteInput): Project {
  return {
    ...input,
    ...(["bridal-house", "editing-julian", "qadeer-jewellers"].includes(
      input.id,
    )
      ? { projectType: "Self-directed demo" as const }
      : {}),
    slug: input.id,
    category: "Web",
    thumbnail: `/images/projects/${input.id}.webp`,
    mobileThumbnail: `/images/projects/${input.id}-mobile.webp`,
    preview: input.featured
      ? `/images/projects/${input.id}-preview.webp`
      : undefined,
    technologies: [],
    year: null,
    status: "published",
    visual: "web",
  };
}

// Names and descriptions reflect the supplied live websites.
export const projects: Project[] = [
  website({
    id: "bridal-house",
    title: "Bridal House",
    industry: "Bridal & fashion",
    description:
      "A bridal couture website with collection browsing, sale and rental options, and consultation enquiries.",
    liveUrl: "https://bridal-house-canvas-main.vercel.app/",
    featured: true,
  }),
  website({
    id: "ink-grail",
    title: "Ink Grail Tattoos",
    industry: "Tattoo studio",
    description:
      "A tattoo studio website showcasing custom artwork, tattoo styles, the artist, and consultation enquiries.",
    liveUrl: "https://ink-grail-canvas.vercel.app/",
    featured: true,
  }),
  website({
    id: "qadeer-jewellers",
    title: "Qadeer Jewellers",
    industry: "Fine jewellery",
    description:
      "A jewellery showroom experience presenting gold, diamond, and bridal collections with showroom visit enquiries.",
    liveUrl: "https://qadeerjewellers.vercel.app/",
    featured: true,
  }),
  website({
    id: "classic-detailers",
    title: "Classic Detailers",
    industry: "Automotive",
    description:
      "An automotive detailing website covering ceramic coating, paint protection film, paint correction, and custom quote requests.",
    liveUrl: "https://apex-detailing-studio-phi.vercel.app/",
    featured: false,
  }),
  website({
    id: "aurelia-beauty",
    title: "Aurelia Beauty Lounge",
    industry: "Beauty & wellness",
    description:
      "A beauty salon website presenting hair, skin, nail, and bridal services alongside locations and booking enquiries.",
    liveUrl: "https://safa-s-beauty-unveiled.vercel.app/",
    featured: false,
  }),
  website({
    id: "carpe-diem",
    title: "Carpe Diem Barbershop",
    industry: "Men’s grooming",
    description:
      "A barbershop website featuring grooming services, barber profiles, a gallery, and appointment booking links.",
    liveUrl: "https://carpe-diem-digital.vercel.app/",
    featured: false,
  }),
  website({
    id: "dylan-seedin",
    title: "Dylan Seedin Photography",
    industry: "Photography",
    description:
      "A photographer’s portfolio showcasing wedding, fashion, corporate, and destination photography.",
    liveUrl: "https://photography-studio-green.vercel.app/",
    featured: true,
  }),
  website({
    id: "fortress-events",
    title: "Fortress Events Complex",
    industry: "Weddings & events",
    description:
      "A wedding and events venue website with hall details, event types, a gallery, and event enquiries.",
    liveUrl: "https://fortress-vision.vercel.app/",
    featured: false,
  }),
  website({
    id: "infinity-salon",
    title: "Infinity Salon",
    industry: "Beauty & wellness",
    description:
      "A salon website showcasing hair, beauty, and bridal services, with a gallery and appointment enquiries.",
    liveUrl: "https://infinity-salon-swart.vercel.app/",
    featured: false,
  }),
  website({
    id: "defence-marquee",
    title: "Defence Marquee & Event Complex",
    industry: "Weddings & events",
    description:
      "A wedding and event venue website with venue information, a gallery, and visit enquiries.",
    liveUrl: "https://defence-marquee.vercel.app/",
    featured: false,
  }),
  website({
    id: "bespoke-tailors",
    title: "Bespoke Tailors Islamabad",
    industry: "Bespoke menswear",
    description:
      "A custom menswear website presenting suit collections, fabrics, a lookbook, and private fitting enquiries.",
    liveUrl: "https://islamabad-tailors-main.vercel.app/",
    featured: false,
  }),
  website({
    id: "luxury-florist",
    title: "The Luxury Florist",
    industry: "Flowers & gifts",
    description:
      "A flower and gift delivery website with arrangement collections, occasion choices, and custom request forms.",
    liveUrl: "https://bloom-boutique-smoky.vercel.app/",
    featured: false,
  }),
  website({
    id: "iron-lodge",
    title: "Iron Lodge Gym",
    industry: "Fitness",
    description:
      "A strength and performance gym website presenting facilities, coaching, membership options, and trial-pass enquiries.",
    liveUrl: "https://iron-lodge-ascend.vercel.app/",
    featured: false,
  }),
  website({
    id: "davis-portfolio",
    title: "Davis — Designer Portfolio",
    industry: "Personal portfolio",
    description:
      "A visual designer’s portfolio website with services, selected work, skills, and a résumé.",
    liveUrl: "https://friendly-haupia-a1f91e.netlify.app/",
    featured: false,
  }),
  website({
    id: "editing-julian",
    title: "Editing Julian",
    industry: "Video production",
    description:
      "A video editor’s portfolio presenting featured edits, creative services, and consultation booking options.",
    liveUrl: "https://editingjulian.com/",
    featured: true,
  }),
  website({
    id: "hamid-design-services",
    title: "M. Hamid — Design Services",
    industry: "Design & digital products",
    description:
      "A graphic design services website with a portfolio, process overview, digital product plans, and enquiry links.",
    liveUrl: "https://service-site-project1.netlify.app/",
    featured: false,
  }),
  website({
    id: "luxwatch",
    title: "LuxWatch",
    industry: "Watches & retail",
    description:
      "A watch storefront showcasing featured collections, product cards, new arrivals, and brand storytelling.",
    liveUrl: "https://watch-project4.netlify.app/",
    featured: false,
  }),
  website({
    id: "elevate-x",
    title: "Elevate X",
    industry: "Digital agency",
    description:
      "A digital services website presenting web development, chatbot offerings, project examples, and enquiry options.",
    liveUrl: "https://www.elevatexlab.com/",
    featured: true,
  }),
];
