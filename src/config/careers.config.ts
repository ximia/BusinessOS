import type { JobOpening } from "@/types/content";

export const jobOpenings: JobOpening[] = [
  {
    slug: "detailer",
    title: "Auto Detailer",
    location: "Portland, OR",
    type: "Full-time",
    department: "Operations",
    summary:
      "We're looking for someone who takes genuine pride in their work to join our small, quality-obsessed team. Experience is great; the right attitude is essential.",
    responsibilities: [
      "Perform interior and exterior details to our standard",
      "Communicate clearly and professionally with clients",
      "Maintain equipment and keep the mobile rig organized",
      "Document jobs with before/after photos",
    ],
    requirements: [
      "Valid driver's license and clean record",
      "Comfortable working independently on-site",
      "Detail-oriented and reliable",
      "1+ year detailing experience preferred, not required",
    ],
  },
  {
    slug: "coating-technician",
    title: "Coating Technician",
    location: "Portland, OR",
    type: "Full-time",
    department: "Operations",
    summary:
      "An experienced role for someone confident with machine polishing and coating application who wants to work on high-end vehicles without cutting corners.",
    responsibilities: [
      "Perform multi-stage paint correction safely",
      "Prep and apply ceramic coatings to manufacturer spec",
      "Measure and document paint condition",
      "Mentor junior detailers on correction technique",
    ],
    requirements: [
      "2+ years of correction/coating experience",
      "Familiarity with paint-depth gauges and polishers",
      "Coating certification a plus",
      "Meticulous, patient, and consistent",
    ],
  },
];

export function getJobBySlug(slug: string): JobOpening | undefined {
  return jobOpenings.find((j) => j.slug === slug);
}
