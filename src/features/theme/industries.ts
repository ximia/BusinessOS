import type { IconKey } from "@/lib/icons";

/**
 * Industry preset registry — the heart of the Theme Generator.
 *
 * Each preset bundles a color palette (runtime CSS-variable overrides), an icon
 * set, hero imagery, and starter copy tuned to a trade. Selecting one in
 * Admin → Theme re-skins the site and (optionally) loads placeholder content.
 *
 * Palette values are HSL triples ("H S% L%") consumed as `hsl(var(--primary))`.
 * Add a new trade by appending an entry here — the engine is fully data-driven.
 */
export interface SampleService {
  title: string;
  excerpt: string;
  icon: IconKey;
}

export interface IndustryPreset {
  id: string;
  label: string;
  /** Brand accent for light mode, HSL triple. */
  primary: string;
  /** Brand accent for dark mode (usually lighter/more saturated). */
  primaryDark: string;
  /** Primary brand/service icon. */
  icon: IconKey;
  /** Icon set used for sample service cards. */
  serviceIcons: IconKey[];
  heroImage: string;
  gallery: string[];
  sampleTagline: string;
  sampleDescription: string;
  sampleBadges: string[];
  sampleServices: SampleService[];
}

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

export const industryPresets: IndustryPreset[] = [
  {
    id: "auto-detailing",
    label: "Auto Detailing",
    primary: "216 90% 44%",
    primaryDark: "214 95% 62%",
    icon: "car",
    serviceIcons: ["sparkles", "car", "shield", "droplets"],
    heroImage: img("photo-1605164599901-db7f68c1b1a5"),
    gallery: [img("photo-1552519507-da3b142c6e3d"), img("photo-1503376780353-7e6692767b70")],
    sampleTagline: "Concours-level detailing, brought to your driveway.",
    sampleDescription:
      "Studio-grade mobile detailing for people who care how their car is treated — by appointment, on your schedule.",
    sampleBadges: ["Insured & bonded", "Ceramic certified", "500+ vehicles detailed"],
    sampleServices: [
      { title: "Interior Detail", excerpt: "A full reset of the cabin by hand.", icon: "sparkles" },
      { title: "Paint Correction", excerpt: "Machine polishing that restores true depth.", icon: "car" },
      { title: "Ceramic Coating", excerpt: "Years of protection and easy upkeep.", icon: "shield" },
    ],
  },
  {
    id: "mechanic",
    label: "Auto Repair / Mechanic",
    primary: "8 78% 48%",
    primaryDark: "8 88% 62%",
    icon: "wrench",
    serviceIcons: ["wrench", "gauge", "car", "shield"],
    heroImage: img("photo-1486262715619-67b85e0b08d3"),
    gallery: [img("photo-1487754180451-c456f719a1fc"), img("photo-1530046339160-ce3e530c7d2f")],
    sampleTagline: "Honest repairs, done right the first time.",
    sampleDescription:
      "Straightforward diagnostics and quality repairs from technicians who explain the problem before touching your car.",
    sampleBadges: ["ASE-certified techs", "12-month warranty", "Upfront pricing"],
    sampleServices: [
      { title: "Diagnostics", excerpt: "Pinpoint the real issue, not a guess.", icon: "gauge" },
      { title: "Brakes & Suspension", excerpt: "Safety-critical work done properly.", icon: "wrench" },
      { title: "Scheduled Service", excerpt: "Keep it running for the long haul.", icon: "shield" },
    ],
  },
  {
    id: "hvac",
    label: "HVAC",
    primary: "190 85% 40%",
    primaryDark: "188 85% 55%",
    icon: "wind",
    serviceIcons: ["wind", "gauge", "shield", "timer"],
    heroImage: img("photo-1631545806609-c2b999c9f177"),
    gallery: [img("photo-1621905251189-08b45d6a269e"), img("photo-1558618666-fcd25c85cd64")],
    sampleTagline: "Comfort you can count on, every season.",
    sampleDescription:
      "Fast, clean HVAC installs and repairs with straight answers and same-day service when the weather turns.",
    sampleBadges: ["Licensed & insured", "Same-day service", "Financing available"],
    sampleServices: [
      { title: "AC Repair", excerpt: "Back to cool, fast.", icon: "wind" },
      { title: "Heating Service", excerpt: "Reliable warmth all winter.", icon: "timer" },
      { title: "System Install", excerpt: "Right-sized, efficient systems.", icon: "shield" },
    ],
  },
  {
    id: "roofing",
    label: "Roofing",
    primary: "24 90% 48%",
    primaryDark: "26 92% 60%",
    icon: "home",
    serviceIcons: ["home", "hammer", "shield", "droplets"],
    heroImage: img("photo-1632759145351-1d592919f522"),
    gallery: [img("photo-1600585154340-be6161a56a0c"), img("photo-1503387762-592deb58ef4e")],
    sampleTagline: "Roofs built to outlast the weather.",
    sampleDescription:
      "Workmanship-guaranteed roof replacement and repair, with honest inspections and no pressure.",
    sampleBadges: ["Licensed & insured", "Workmanship warranty", "Free inspections"],
    sampleServices: [
      { title: "Roof Replacement", excerpt: "Durable, code-compliant installs.", icon: "home" },
      { title: "Repairs & Leaks", excerpt: "Stop the damage at the source.", icon: "droplets" },
      { title: "Storm Damage", excerpt: "Insurance-claim support included.", icon: "shield" },
    ],
  },
  {
    id: "electrician",
    label: "Electrician",
    primary: "42 96% 46%",
    primaryDark: "44 96% 58%",
    icon: "zap",
    serviceIcons: ["zap", "gauge", "shield", "home"],
    heroImage: img("photo-1621905251918-48416bd8575a"),
    gallery: [img("photo-1558618666-fcd25c85cd64"), img("photo-1504328345606-18bbc8c9d7d1")],
    sampleTagline: "Safe, code-perfect electrical work.",
    sampleDescription:
      "Licensed electricians for panels, wiring, and installs — clean work and a tidy site, every time.",
    sampleBadges: ["Licensed & insured", "Upfront quotes", "24/7 emergency"],
    sampleServices: [
      { title: "Panel Upgrades", excerpt: "Modern capacity, safely installed.", icon: "gauge" },
      { title: "Wiring & Repair", excerpt: "Diagnose and fix the fault.", icon: "zap" },
      { title: "EV Chargers", excerpt: "Home charging done right.", icon: "home" },
    ],
  },
  {
    id: "plumber",
    label: "Plumbing",
    primary: "212 88% 46%",
    primaryDark: "210 92% 62%",
    icon: "droplets",
    serviceIcons: ["droplets", "wrench", "gauge", "shield"],
    heroImage: img("photo-1607472586893-edb57bdc0e39"),
    gallery: [img("photo-1585704032915-c3400ca199e7"), img("photo-1620626011761-996317b8d101")],
    sampleTagline: "Plumbing done cleanly, on time.",
    sampleDescription:
      "From leaks to repipes, licensed plumbers who show up on time and leave the space cleaner than they found it.",
    sampleBadges: ["Licensed & insured", "Flat-rate pricing", "Same-day service"],
    sampleServices: [
      { title: "Leak Repair", excerpt: "Find it, fix it, no mess.", icon: "droplets" },
      { title: "Water Heaters", excerpt: "Repair or replace, done fast.", icon: "gauge" },
      { title: "Drain Cleaning", excerpt: "Flowing freely again.", icon: "wrench" },
    ],
  },
  {
    id: "window-cleaning",
    label: "Window Cleaning",
    primary: "199 89% 45%",
    primaryDark: "198 90% 60%",
    icon: "sparkles",
    serviceIcons: ["sparkles", "home", "droplets", "shield"],
    heroImage: img("photo-1527515637462-cff94eecc1ac"),
    gallery: [img("photo-1523413363574-c30aa1c2a516"), img("photo-1600585152220-90363fe7e115")],
    sampleTagline: "Streak-free views, inside and out.",
    sampleDescription:
      "Spotless residential and commercial window cleaning with careful, insured crews.",
    sampleBadges: ["Insured crews", "Satisfaction guarantee", "Eco-friendly"],
    sampleServices: [
      { title: "Residential", excerpt: "Crystal-clear home windows.", icon: "home" },
      { title: "Commercial", excerpt: "Storefronts that shine.", icon: "sparkles" },
      { title: "Screens & Tracks", excerpt: "The details others skip.", icon: "droplets" },
    ],
  },
  {
    id: "pressure-washing",
    label: "Pressure Washing",
    primary: "187 80% 40%",
    primaryDark: "186 84% 55%",
    icon: "droplets",
    serviceIcons: ["droplets", "home", "sparkles", "leaf"],
    heroImage: img("photo-1610478920-6c6f5e2b9d6e"),
    gallery: [img("photo-1558904541-efa843a96f01"), img("photo-1600566752355-35792bedcfea")],
    sampleTagline: "Bring surfaces back to life.",
    sampleDescription:
      "Soft-wash and pressure-washing that lifts years of grime from driveways, siding, and decks — safely.",
    sampleBadges: ["Insured", "Soft-wash safe", "Free estimates"],
    sampleServices: [
      { title: "House Washing", excerpt: "Safe soft-wash for siding.", icon: "home" },
      { title: "Driveways", excerpt: "Concrete like new.", icon: "droplets" },
      { title: "Decks & Patios", excerpt: "Restore the wood.", icon: "leaf" },
    ],
  },
  {
    id: "landscaping",
    label: "Landscaping",
    primary: "142 62% 38%",
    primaryDark: "142 60% 52%",
    icon: "leaf",
    serviceIcons: ["leaf", "trees", "sparkles", "shield"],
    heroImage: img("photo-1558904541-efa843a96f01"),
    gallery: [img("photo-1585320806297-9794b3e4eeae"), img("photo-1416879595882-3373a0480b5b")],
    sampleTagline: "Outdoor spaces you'll actually use.",
    sampleDescription:
      "Design, install, and maintenance from a crew that treats your yard like their own.",
    sampleBadges: ["Insured", "Design-build", "Weekly maintenance"],
    sampleServices: [
      { title: "Design & Install", excerpt: "A yard with a plan.", icon: "trees" },
      { title: "Maintenance", excerpt: "Consistently sharp, all season.", icon: "leaf" },
      { title: "Hardscaping", excerpt: "Patios, walls, and paths.", icon: "shield" },
    ],
  },
  {
    id: "nail-salon",
    label: "Nail Salon",
    primary: "330 74% 54%",
    primaryDark: "330 80% 66%",
    icon: "sparkles",
    serviceIcons: ["sparkles", "star", "brush", "award"],
    heroImage: img("photo-1604654894610-df63bc536371"),
    gallery: [img("photo-1519014816548-bf5fe059798b"), img("photo-1607779097040-26e80aa78e66")],
    sampleTagline: "A little luxury for your hands and feet.",
    sampleDescription:
      "A calm, spotless studio for manicures, pedicures, and nail art by artists who take their time.",
    sampleBadges: ["Sanitized tools", "Walk-ins welcome", "Gift cards"],
    sampleServices: [
      { title: "Manicures", excerpt: "Classic to gel, done beautifully.", icon: "sparkles" },
      { title: "Pedicures", excerpt: "Relax and be pampered.", icon: "star" },
      { title: "Nail Art", excerpt: "Custom designs you'll love.", icon: "brush" },
    ],
  },
  {
    id: "barber",
    label: "Barbershop",
    primary: "20 14% 20%",
    primaryDark: "28 30% 70%",
    icon: "scissors",
    serviceIcons: ["scissors", "brush", "star", "award"],
    heroImage: img("photo-1503951914875-452162b0f3f1"),
    gallery: [img("photo-1521490878406-4a2a05a0e9a1"), img("photo-1599351431202-1e0f0137899a")],
    sampleTagline: "A proper cut, every time.",
    sampleDescription:
      "Skilled barbers, classic service, and a chair that feels like the neighborhood's living room.",
    sampleBadges: ["Master barbers", "Walk-ins welcome", "Hot-towel shaves"],
    sampleServices: [
      { title: "Haircuts", excerpt: "Tailored to you, done sharp.", icon: "scissors" },
      { title: "Beard Trims", excerpt: "Shaped and lined up clean.", icon: "brush" },
      { title: "Hot-Towel Shave", excerpt: "The full traditional treatment.", icon: "star" },
    ],
  },
  {
    id: "dentist",
    label: "Dental",
    primary: "184 66% 38%",
    primaryDark: "184 70% 54%",
    icon: "stethoscope",
    serviceIcons: ["stethoscope", "shield", "sparkles", "star"],
    heroImage: img("photo-1588776814546-1ffcf47267a5"),
    gallery: [img("photo-1609840114035-3c981b782dfe"), img("photo-1606811841689-23dfddce3e95")],
    sampleTagline: "Gentle, modern dental care.",
    sampleDescription:
      "A friendly practice focused on comfort, honesty, and healthy smiles — for the whole family.",
    sampleBadges: ["Accepting new patients", "Most insurance", "Gentle care"],
    sampleServices: [
      { title: "Cleanings & Exams", excerpt: "Preventive care that lasts.", icon: "shield" },
      { title: "Cosmetic", excerpt: "A smile you're proud of.", icon: "sparkles" },
      { title: "Emergencies", excerpt: "Seen quickly when it hurts.", icon: "stethoscope" },
    ],
  },
  {
    id: "medical-spa",
    label: "Medical Spa",
    primary: "265 60% 56%",
    primaryDark: "265 68% 70%",
    icon: "sparkles",
    serviceIcons: ["sparkles", "star", "shield", "award"],
    heroImage: img("photo-1570172619644-dfd03ed5d881"),
    gallery: [img("photo-1596178065887-1198b6148b2b"), img("photo-1512290923902-8a9f81dc236c")],
    sampleTagline: "Refined treatments, real results.",
    sampleDescription:
      "Evidence-based aesthetic treatments in a serene, spotless setting, guided by licensed professionals.",
    sampleBadges: ["Licensed providers", "Consultations", "Members' pricing"],
    sampleServices: [
      { title: "Injectables", excerpt: "Natural, expert-administered.", icon: "sparkles" },
      { title: "Facials & Skincare", excerpt: "Glow, restored.", icon: "star" },
      { title: "Laser", excerpt: "Advanced, comfortable care.", icon: "shield" },
    ],
  },
];

export function getIndustryPreset(id: string): IndustryPreset | undefined {
  return industryPresets.find((p) => p.id === id);
}
