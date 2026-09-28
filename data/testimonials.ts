export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  company: string;
  role?: string;
  avatar?: string;
};
// Add only client-approved testimonials. The section stays hidden until supplied.
export const testimonials: Testimonial[] = [];
