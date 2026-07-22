import { z } from "zod";

/**
 * Website Builder (Priority 2) — the catalog of homepage sections a
 * non-technical admin can enable/disable, reorder, and duplicate. This module
 * is intentionally pure metadata (no React imports) so it is safe to use in
 * both Server Components (homepage rendering) and Client Components (the
 * builder UI). The actual section components are mapped by type in
 * `section-renderer.tsx`.
 */

export const HOME_SECTION_TYPES = [
  "hero",
  "logoStrip",
  "services",
  "about",
  "process",
  "beforeAfter",
  "testimonials",
  "serviceArea",
  "faq",
  "contact",
  "cta",
] as const;

export type HomeSectionType = (typeof HOME_SECTION_TYPES)[number];

export interface SectionMeta {
  label: string;
  description: string;
}

export const SECTION_CATALOG: Record<HomeSectionType, SectionMeta> = {
  hero: { label: "Hero", description: "Headline, subhead & primary call-to-action." },
  logoStrip: { label: "Trust strip", description: "Logo / trust-badge row under the hero." },
  services: { label: "Services", description: "Grid of the services you offer." },
  about: { label: "About", description: "Your story, credentials & differentiators." },
  process: { label: "Process", description: "Step-by-step of how you work." },
  beforeAfter: { label: "Before / After", description: "Interactive results slider." },
  testimonials: { label: "Testimonials", description: "Featured customer reviews." },
  serviceArea: { label: "Service area", description: "Map & list of areas you cover." },
  faq: { label: "FAQ", description: "Answers to common questions." },
  contact: { label: "Contact", description: "Contact form & details." },
  cta: { label: "Closing CTA", description: "Final conversion banner." },
};

export interface HomeSectionInstance {
  /** Stable id. Base sections use their type; duplicates get a unique suffix. */
  id: string;
  type: HomeSectionType;
  enabled: boolean;
}

/** The out-of-the-box homepage order (matches the original static layout). */
export const DEFAULT_HOME_LAYOUT: HomeSectionInstance[] = [
  "hero",
  "logoStrip",
  "services",
  "about",
  "process",
  "beforeAfter",
  "testimonials",
  "serviceArea",
  "faq",
  "contact",
  "cta",
].map((type) => ({ id: type, type: type as HomeSectionType, enabled: true }));

export const homeSectionInstanceSchema = z.object({
  id: z.string().min(1).max(64),
  type: z.enum(HOME_SECTION_TYPES),
  enabled: z.boolean(),
});

export const homeLayoutSchema = z.array(homeSectionInstanceSchema).min(1).max(40);

/**
 * Sanitise an arbitrary stored/loaded layout: drop unknown types and duplicate
 * ids, and fall back to the default when nothing usable remains. Guarantees the
 * homepage always has a valid, renderable layout.
 */
export function normalizeLayout(raw: unknown): HomeSectionInstance[] {
  if (!Array.isArray(raw)) return DEFAULT_HOME_LAYOUT;
  const seen = new Set<string>();
  const out: HomeSectionInstance[] = [];
  for (const item of raw) {
    const parsed = homeSectionInstanceSchema.safeParse(item);
    if (!parsed.success) continue;
    if (seen.has(parsed.data.id)) continue;
    seen.add(parsed.data.id);
    out.push(parsed.data);
  }
  return out.length ? out : DEFAULT_HOME_LAYOUT;
}

/** Generate a unique instance id for a duplicated section. */
export function newInstanceId(type: HomeSectionType): string {
  return `${type}-${Math.random().toString(36).slice(2, 8)}`;
}
