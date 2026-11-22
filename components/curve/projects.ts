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

export const corridorProjects = sequence.map((id, index) => {
  const project = projects.find((item) => item.id === id);
  if (!project) throw new Error(`Missing corridor project ${id}`);
  return {
    ...project,
    typeLabel: projectProofLabels[project.proofType],
    notes: projectDetails[id],
    imageAspect: 1440 / (project.crop?.desktop ?? 960),
    thumbnailAlt: `Desktop screenshot of ${project.title}${project.screenSubject ? `, showing ${project.screenSubject}` : ""}`,
    wallSide: index % 2 === 0 ? ("left" as const) : ("right" as const),
    distance: 8.4 + Math.floor(index / 2) * 8.1 + (index % 2 ? 1.5 : 0),
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
