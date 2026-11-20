export const projectProofLabels = {
  "verified-client-case-study": "Client case study",
  "experience-notes": "Experience notes",
  "self-directed-demo": "Self-directed demo",
  "portfolio-preview": "Portfolio preview",
} as const;

export type ProjectProofType = keyof typeof projectProofLabels;

export type Project = {
  id: string;
  title: string;
  slug: string;
  industry: string;
  proofType: ProjectProofType;
  featuredRank?: number;
  thumbnail: string;
  mobileThumbnail: string;
  screenSubject?: string;
  crop?: { desktop: number; mobile: number };
  description: string;
  liveUrl: string;
  liveStatus?: "unavailable";
  detailUrl?: string;
};

type WebsiteInput = Pick<
  Project,
  | "id"
  | "title"
  | "industry"
  | "description"
  | "featuredRank"
  | "screenSubject"
  | "crop"
  | "liveUrl"
  | "liveStatus"
> & { proofType?: Exclude<ProjectProofType, "verified-client-case-study"> };

function website(input: WebsiteInput): Project {
  const proofType = input.proofType ?? "portfolio-preview";
  return {
    ...input,
    proofType,
    slug: input.id,
    thumbnail: `/images/projects/${input.id}.webp`,
    mobileThumbnail: `/images/projects/${input.id}-mobile.webp`,
    detailUrl:
      proofType === "portfolio-preview" ? undefined : `/work/${input.id}/`,
  };
}

// Names and descriptions reflect the supplied live websites.
export const projects: Project[] = [
  website({
    id: "bridal-house",
    title: "Bridal House",
    industry: "Bridal & fashion",
    description:
      "A photography-led bridal concept that connects collection browsing with a consultation enquiry.",
    liveUrl: "https://bridal-house-canvas-main.vercel.app/",
    proofType: "self-directed-demo",
    featuredRank: 1,
    screenSubject: "bridal couture photography and collection navigation",
  }),
  website({
    id: "ink-grail",
    title: "Ink Grail Tattoos",
    industry: "Tattoo studio",
    description:
      "A tattoo studio website showcasing custom artwork, tattoo styles, the artist, and consultation enquiries.",
    liveUrl: "https://ink-grail-canvas.vercel.app/",
    proofType: "experience-notes",
    featuredRank: 2,
    screenSubject: "black-and-white tattoo artwork and studio typography",
  }),
  website({
    id: "qadeer-jewellers",
    title: "Qadeer Jewellers",
    industry: "Fine jewellery",
    description:
      "A showroom concept for exploring gold, diamond and bridal collections and planning a visit.",
    liveUrl: "https://qadeerjewellers.vercel.app/",
    proofType: "self-directed-demo",
    screenSubject: "jewellery photography and collection browsing",
  }),
  website({
    id: "classic-detailers",
    title: "Classic Detailers",
    industry: "Automotive",
    description:
      "An automotive detailing website covering ceramic coating, paint protection film, paint correction, and custom quote requests.",
    liveUrl: "https://apex-detailing-studio-phi.vercel.app/",
  }),
  website({
    id: "aurelia-beauty",
    title: "Aurelia Beauty Lounge",
    industry: "Beauty & wellness",
    description:
      "A beauty salon website presenting hair, skin, nail, and bridal services alongside locations and booking enquiries.",
    liveUrl: "https://safa-s-beauty-unveiled.vercel.app/",
  }),
  website({
    id: "carpe-diem",
    title: "Carpe Diem Barbershop",
    industry: "Men’s grooming",
    description:
      "A barbershop website featuring grooming services, barber profiles, a gallery, and appointment booking links.",
    liveUrl: "https://carpe-diem-digital.vercel.app/",
  }),
  website({
    id: "dylan-seedin",
    title: "Dylan Seedin Photography",
    industry: "Photography",
    description:
      "A photographer’s portfolio showcasing wedding, fashion, corporate, and destination photography.",
    liveUrl: "https://photography-studio-green.vercel.app/",
    proofType: "experience-notes",
    featuredRank: 4,
    screenSubject: "the photography portfolio’s image-led opening",
  }),
  website({
    id: "fortress-events",
    title: "Fortress Events Complex",
    industry: "Weddings & events",
    description:
      "A wedding and events venue website with hall details, event types, a gallery, and event enquiries.",
    liveUrl: "https://fortress-vision.vercel.app/",
  }),
  website({
    id: "infinity-salon",
    title: "Infinity Salon",
    industry: "Beauty & wellness",
    description:
      "A salon website showcasing hair, beauty, and bridal services, with a gallery and appointment enquiries.",
    liveUrl: "https://infinity-salon-swart.vercel.app/",
  }),
  website({
    id: "defence-marquee",
    title: "Defence Marquee & Event Complex",
    industry: "Weddings & events",
    description:
      "A wedding and event venue website with venue information, a gallery, and visit enquiries.",
    liveUrl: "https://defence-marquee.vercel.app/",
  }),
  website({
    id: "bespoke-tailors",
    title: "Bespoke Tailors Islamabad",
    industry: "Bespoke menswear",
    description:
      "A custom menswear website presenting suit collections, fabrics, a lookbook, and private fitting enquiries.",
    liveUrl: "https://islamabad-tailors-main.vercel.app/",
  }),
  website({
    id: "luxury-florist",
    title: "The Luxury Florist",
    industry: "Flowers & gifts",
    description:
      "A flower and gift delivery website with arrangement collections, occasion choices, and custom request forms.",
    liveUrl: "https://bloom-boutique-smoky.vercel.app/",
  }),
  website({
    id: "iron-lodge",
    title: "Iron Lodge Gym",
    industry: "Fitness",
    description:
      "A strength and performance gym website presenting facilities, coaching, membership options, and trial-pass enquiries.",
    liveUrl: "https://iron-lodge-ascend.vercel.app/",
  }),
  website({
    id: "davis-portfolio",
    title: "Davis — Designer Portfolio",
    industry: "Personal portfolio",
    description:
      "A visual designer’s portfolio website with services, selected work, skills, and a résumé.",
    liveUrl: "https://friendly-haupia-a1f91e.netlify.app/",
  }),
  website({
    id: "editing-julian",
    title: "Editing Julian",
    industry: "Video production",
    description:
      "A video editor’s portfolio concept that connects featured edits with services and an enquiry path.",
    liveUrl: "https://editingjulian.com/",
    proofType: "self-directed-demo",
    featuredRank: 3,
    screenSubject: "the editor’s opening headline and portfolio links",
    crop: { desktop: 600, mobile: 470 },
  }),
  website({
    id: "hamid-design-services",
    title: "M. Hamid — Design Services",
    industry: "Design & digital products",
    description:
      "A graphic design services website with a portfolio, process overview, digital product plans, and enquiry links.",
    liveUrl: "https://service-site-project1.netlify.app/",
  }),
  website({
    id: "luxwatch",
    title: "LuxWatch",
    industry: "Watches & retail",
    description:
      "A watch storefront showcasing featured collections, product cards, new arrivals, and brand storytelling.",
    liveUrl: "https://watch-project4.netlify.app/",
  }),
  website({
    id: "elevate-x",
    title: "Elevate X",
    industry: "Digital agency",
    description:
      "A digital services website presenting web development, chatbot offerings, project examples, and enquiry options.",
    liveUrl: "https://www.elevatexlab.com/",
    liveStatus: "unavailable",
    proofType: "experience-notes",
    screenSubject: "the agency’s opening message and project enquiry action",
    crop: { desktop: 675, mobile: 650 },
  }),
];

export const homepageProjects = projects
  .filter((project) => project.featuredRank !== undefined)
  .sort((a, b) => (a.featuredRank ?? Infinity) - (b.featuredRank ?? Infinity));

export const storyProjects = projects.filter(
  (project): project is Project & { detailUrl: string } =>
    Boolean(project.detailUrl),
);
