export type TranscriptSegment = { start: string; text: string };
export type TestimonialPublication = {
  slug: string;
  testimonialId: string;
  transcript?: TranscriptSegment[];
  transcriptLanguage?: string;
  translation?: string;
  thumbnail?: string;
  uploadDate?: string;
  duration?: string;
};
// Add only information checked against the supplied recordings. An absent date is not today's date.
export const testimonialPages: TestimonialPublication[] = [
  {
    slug: "abdullah-abbasii",
    testimonialId: "abdullah-nexus-growth",
    duration: "PT49S",
  },
  { slug: "usman", testimonialId: "usman-prestige-media", duration: "PT56S" },
];
