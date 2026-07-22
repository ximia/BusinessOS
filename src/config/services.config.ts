import type { Service } from "@/types/content";

/**
 * Services power the homepage grid, the /services index, and each
 * /services/[slug] detail page. Order here is the order shown on the site.
 */
export const services: Service[] = [
  {
    slug: "interior-detail",
    title: "Interior Detail",
    excerpt:
      "A full reset of the cabin — extraction, conditioning, and every seam addressed by hand.",
    description: [
      "Interiors take the brunt of daily life: spilled coffee, pet hair, sand in the seat rails, a film on the dash you stopped noticing months ago. Our interior detail is a methodical, top-to-bottom reset that returns the cabin to a state most owners haven't seen since the day they bought the car.",
      "We steam and agitate every panel, hot-water-extract fabric seats and carpets, and hand-condition leather with a pH-balanced treatment that won't leave the greasy sheen cheap products do. Vents, seams, and switchgear are cleaned individually — the details you feel more than see.",
    ],
    icon: "sparkles",
    price: "From $189",
    features: [
      "Hot-water extraction of seats & carpets",
      "Steam-cleaned vents, seams, and console",
      "Leather cleaned & conditioned by hand",
      "Interior glass cleaned streak-free",
      "Odor neutralized at the source",
    ],
    highlights: [
      {
        icon: "droplets",
        title: "Deep extraction",
        description: "Lifts embedded grime and spills that surface wipes leave behind.",
      },
      {
        icon: "leaf",
        title: "Safe chemistry",
        description: "pH-balanced products that protect factory finishes and trim.",
      },
      {
        icon: "clock",
        title: "2–4 hours",
        description: "Most sedans are finished the same morning we arrive.",
      },
    ],
    image:
      "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1200&q=80",
    featured: true,
  },
  {
    slug: "exterior-paint-correction",
    title: "Exterior & Paint Correction",
    excerpt:
      "Multi-stage machine polishing that removes swirls and haze to restore true depth.",
    description: [
      "Most 'shiny' cars are hiding a web of fine swirl marks put there by automatic washes and careless drying. Paint correction is the machine-polishing process that actually removes those defects rather than filling them temporarily — the difference between paint that looks clean and paint that looks deep.",
      "We measure your clear coat, test panels to find the least aggressive combination that works, then correct in stages. The result is a mirror-clean finish and a surface that's ready to be protected properly.",
    ],
    icon: "car",
    price: "From $449",
    features: [
      "Clear-coat depth measured before we start",
      "Iron decontamination & clay treatment",
      "One or two-stage machine correction",
      "Swirls, holograms, and light scratches removed",
      "Finished with a durable sealant",
    ],
    highlights: [
      {
        icon: "gauge",
        title: "Measured, not guessed",
        description: "Paint-depth readings keep correction safe for your clear coat.",
      },
      {
        icon: "shield",
        title: "Protected finish",
        description: "Every correction is sealed so the results actually last.",
      },
    ],
    image:
      "https://images.unsplash.com/photo-1605164599901-db7f68c1b1a5?auto=format&fit=crop&w=1200&q=80",
    featured: true,
  },
  {
    slug: "ceramic-coating",
    title: "Ceramic Coating",
    excerpt:
      "A semi-permanent glass coating that makes upkeep easier and depth last for years.",
    description: [
      "A ceramic coating is a liquid-glass layer that bonds to your paint and stays there — not a wax you reapply every few weeks. It makes water and dirt bead and sheet off, cuts washing time dramatically, and holds a level of gloss that traditional protection can't match.",
      "We only coat properly prepped paint, which is why coatings are paired with correction. Applied over corrected paint, a coating locks in that flawless finish for years instead of weeks.",
    ],
    icon: "shield",
    price: "From $799",
    features: [
      "Applied only over prepped, corrected paint",
      "2–5 year durability options",
      "Extreme hydrophobic, self-cleaning behavior",
      "UV and chemical-stain resistance",
      "Documented warranty & care guide",
    ],
    highlights: [
      {
        icon: "timer",
        title: "Years, not weeks",
        description: "Coatings measured in years of protection instead of a monthly wax.",
      },
      {
        icon: "droplets",
        title: "Self-cleaning",
        description: "Water sheets off and takes most road grime with it.",
      },
    ],
    image:
      "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1200&q=80",
    featured: true,
  },
  {
    slug: "maintenance-wash",
    title: "Maintenance Wash",
    excerpt:
      "A careful hand wash on a schedule to keep a corrected or coated car looking new.",
    description: [
      "The fastest way to ruin great paint is a $12 automatic wash. Our maintenance wash is a proper hand wash — two buckets, soft media, and a safe drying process — designed to keep corrected and coated cars in the condition we left them.",
      "Set it up as a recurring appointment and your car stays consistently clean without you thinking about it.",
    ],
    icon: "droplets",
    price: "From $79",
    features: [
      "Two-bucket contact wash",
      "Wheels & wheel wells cleaned",
      "Coating-safe soaps only",
      "Streak-free glass",
      "Recurring scheduling available",
    ],
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80",
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export function getFeaturedServices(): Service[] {
  return services.filter((s) => s.featured);
}
