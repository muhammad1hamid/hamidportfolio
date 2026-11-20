import { projects } from "./projects";

const entries = [
  "home_selected",
  "work_archive",
  "story_index",
  "project_story",
  "project_related",
] as const;
const destinations = [
  "screens",
  "story",
  "live",
  "source",
  "contact",
  "service",
] as const;

export type ProjectEntry = (typeof entries)[number];
type Destination = (typeof destinations)[number];

export function projectLinkData(
  slug: string,
  entry: ProjectEntry,
  destination: Destination,
) {
  return {
    "data-project-slug": slug,
    "data-project-entry": entry,
    "data-project-destination": destination,
  };
}

export function projectClickData(dataset: DOMStringMap | undefined) {
  const slug = dataset?.projectSlug;
  const entry = entries.find((value) => value === dataset?.projectEntry);
  const destination = destinations.find(
    (value) => value === dataset?.projectDestination,
  );
  if (
    !entry ||
    !destination ||
    !slug ||
    !projects.some((project) => project.slug === slug)
  )
    return;
  return { project_slug: slug, entry_section: entry, destination };
}
