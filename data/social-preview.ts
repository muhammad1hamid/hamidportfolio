import images from "./social-images.json";
import design from "./social-preview-design.json";

export const representativePortrait = design.portrait;
export const homepageSocial = design.home;

export function socialImageFor(path: string) {
  return images[path as keyof typeof images] ?? images["/"];
}
