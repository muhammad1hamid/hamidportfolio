export type Testimonial = {
  id: string;
  quote?: string;
  name: string;
  company: string;
  role?: string;
  avatar?: string;
  video?:
    | {
        provider: "google-drive";
        fileId: string;
        aspectRatio: string;
        durationLabel: string;
      }
    | {
        provider?: "file";
        src: string;
        poster: string;
        aspectRatio?: string;
        durationLabel?: string;
        captions?: string;
        captionsLanguage?: string;
        captionsLabel?: string;
        transcript?: string;
      };
};
// Recordings and client details supplied by Hamid. No quotes are inferred.
export const testimonials: Testimonial[] = [
  {
    id: "abdullah-nexus-growth",
    name: "Abdullah Abbasii",
    role: "Co-founder",
    company: "Nexus Growth",
    video: {
      provider: "google-drive",
      fileId: "1X04fjJPFVjgm4caTk6GWmub0B0lAlx9m",
      aspectRatio: "9 / 16",
      durationLabel: "0:49",
    },
  },
  {
    id: "usman-prestige-media",
    name: "Usman",
    role: "Co-founder",
    company: "Prestige Media",
    video: {
      provider: "google-drive",
      fileId: "1Fne2xejDttvQHV87rt_e4DlNAnPWArcP",
      aspectRatio: "9 / 16",
      durationLabel: "0:56",
    },
  },
];
