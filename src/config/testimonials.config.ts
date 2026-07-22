import type { Testimonial } from "@/types/content";

/**
 * Seed testimonials for the marketing site. In production these are served
 * from Supabase (approved reviews) via the reviews service; this array is the
 * fallback / demo content and the shape the admin dashboard manages.
 */
export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Marcus Bell",
    role: "Tesla Model 3 owner",
    rating: 5,
    quote:
      "I've paid more for worse at 'luxury' shops. They corrected two years of automatic-wash swirls and the paint honestly looks better than when I picked the car up new.",
    service: "exterior-paint-correction",
    featured: true,
  },
  {
    id: "t2",
    name: "Priya Nadella",
    role: "Family SUV",
    rating: 5,
    quote:
      "Two kids and a dog had destroyed the interior. They extracted things I'd given up on and it doesn't smell like a fast-food bag anymore. Booking again already.",
    service: "interior-detail",
    featured: true,
  },
  {
    id: "t3",
    name: "Devin Cho",
    role: "Porsche Cayman",
    rating: 5,
    quote:
      "Measured the paint before touching it, showed me the readings, explained the whole plan. That's the difference between a detailer and a guy with a buffer.",
    service: "ceramic-coating",
    featured: true,
  },
  {
    id: "t4",
    name: "Rachel Ortiz",
    role: "Daily commuter",
    rating: 5,
    quote:
      "They come to my office, I hand over the keys, and by lunch the car looks incredible. The convenience alone is worth it — the quality is a bonus.",
    service: "maintenance-wash",
  },
  {
    id: "t5",
    name: "Tom Whitfield",
    role: "Ford F-150",
    rating: 5,
    quote:
      "Straightforward, on time, and they didn't try to sell me anything I didn't ask for. Rare these days. The truck hasn't looked this good in years.",
    service: "exterior-paint-correction",
  },
  {
    id: "t6",
    name: "Amara Diallo",
    role: "Audi Q5",
    rating: 5,
    quote:
      "The ceramic coating changed how I feel about washing the car — dirt just rinses off. Six months in and it still beads like day one.",
    service: "ceramic-coating",
  },
];

export function getFeaturedTestimonials(): Testimonial[] {
  return testimonials.filter((t) => t.featured);
}
