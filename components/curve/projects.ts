import { projects, projectProofLabels } from "@/data/projects";
import { projectDetails } from "@/data/project-details";

// Editorial placement only. All published facts come from the existing inventory.
const sequence = [
  "bridal-house",
  "ink-grail",
  "dylan-seedin",
  "qadeer-jewellers",
  "classic-detailers",
  "editing-julian",
  "aurelia-beauty",
  "bespoke-tailors",
  "fortress-events",
  "carpe-diem",
  "luxury-florist",
  "iron-lodge",
  "infinity-salon",
  "davis-portfolio",
  "defence-marquee",
  "luxwatch",
  "hamid-design-services",
  "elevate-x",
];

// A curated, deterministic rhythm. Neighbours never share a path station.
const walls = [
  "left",
  "right",
  "left",
  "left",
  "right",
  "left",
  "right",
  "right",
  "left",
  "right",
  "left",
  "left",
  "right",
  "left",
  "right",
  "right",
  "left",
  "right",
] as const;
export const frameSpacing = 4.3;

export const corridorProjects = sequence.map((id, index) => {
  const project = projects.find((item) => item.id === id);
  if (!project) throw new Error(`Missing corridor project ${id}`);
  return {
    ...project,
    typeLabel: projectProofLabels[project.proofType],
    notes: projectDetails[id],
    imageAspect: 1440 / (project.crop?.desktop ?? 960),
    thumbnailAlt: `Desktop screenshot of ${project.title}${project.screenSubject ? `, showing ${project.screenSubject}` : ""}`,
    wallSide: walls[index],
    distance: 7.4 + index * frameSpacing,
    rank: index,
  };
});

if (
  new Set(sequence).size !== projects.length ||
  sequence.length !== projects.length
)
  throw new Error(
    "The corridor must account for every portfolio project exactly once",
  );

export type CorridorProject = (typeof corridorProjects)[number];
