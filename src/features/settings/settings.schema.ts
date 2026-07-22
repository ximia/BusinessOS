import { z } from "zod";
import type { SiteConfig } from "@/types/content";
import { themeConfig } from "@/config/theme.config";
import {
  homeLayoutSchema,
  DEFAULT_HOME_LAYOUT,
} from "@/features/website/sections.catalog";

/**
 * Business Settings — the editable subset of {@link SiteConfig} that a
 * non-technical admin can change at runtime from the dashboard. Compile-time
 * `siteConfig` remains the source of defaults; stored settings are deep-merged
 * over it (see settings.service.ts). Structural content (nav, footer columns,
 * service definitions) stays in config/ and is managed by its own editors.
 */
export const businessSettingsSchema = z.object({
  companyName: z.string().min(1).max(120),
  legalName: z.string().min(1).max(160),
  tagline: z.string().min(1).max(200),
  description: z.string().min(1).max(600),
  industry: z.string().min(1).max(80),

  phone: z.string().min(1).max(40),
  phoneRaw: z.string().min(1).max(40),
  email: z.string().email(),

  address: z.object({
    street: z.string().max(200),
    city: z.string().max(120),
    state: z.string().max(60),
    zip: z.string().max(20),
    country: z.string().max(60),
  }),

  hours: z
    .array(
      z.object({
        day: z.string().min(1).max(60),
        hours: z.string().min(1).max(60),
      })
    )
    .max(14),

  emergencyNote: z.string().max(200).optional().or(z.literal("")),

  logo: z.object({
    src: z.string().url().optional().or(z.literal("")),
    alt: z.string().max(120),
  }),

  socials: z
    .array(
      z.object({
        platform: z.enum([
          "facebook",
          "instagram",
          "x",
          "linkedin",
          "youtube",
          "tiktok",
          "google",
        ]),
        href: z.string().url(),
      })
    )
    .max(10),

  mapEmbedUrl: z.string().max(2000).optional().or(z.literal("")),

  seo: z.object({
    title: z.string().max(70),
    description: z.string().max(200),
    keywords: z.array(z.string()).max(30),
  }),

  trustBadges: z.array(z.string().max(60)).max(6),

  features: z.object({
    floatingCallButton: z.boolean(),
    stickyMobileCta: z.boolean(),
  }),

  theme: z.object({
    preset: z.string().max(60),
    primary: z.string().max(30),
    primaryDark: z.string().max(30),
  }),

  announcement: z.object({
    enabled: z.boolean(),
    message: z.string().max(160),
    href: z.string().max(300).optional().or(z.literal("")),
    linkLabel: z.string().max(40).optional().or(z.literal("")),
  }),

  /** Homepage section layout (Website Builder). Optional — defaults applied. */
  homeLayout: homeLayoutSchema.optional(),
});

export type BusinessSettings = z.infer<typeof businessSettingsSchema>;

/** The persisted id of the singleton settings row (single-tenant default). */
export const SETTINGS_SINGLETON_ID = "default";

/** Build editable settings from a full SiteConfig (form default values). */
export function settingsFromConfig(config: SiteConfig): BusinessSettings {
  return {
    companyName: config.companyName,
    legalName: config.legalName,
    tagline: config.tagline,
    description: config.description,
    industry: config.industry,
    phone: config.phone,
    phoneRaw: config.phoneRaw,
    email: config.email,
    address: {
      street: config.address.street,
      city: config.address.city,
      state: config.address.state,
      zip: config.address.zip,
      country: config.address.country,
    },
    hours: config.hours.map((h) => ({ day: h.day, hours: h.hours })),
    emergencyNote: config.emergencyNote ?? "",
    logo: { src: config.logo.src ?? "", alt: config.logo.alt },
    socials: config.socials.map((s) => ({ platform: s.platform, href: s.href })),
    mapEmbedUrl: config.mapEmbedUrl,
    seo: {
      title: config.seo.title,
      description: config.seo.description,
      keywords: config.seo.keywords,
    },
    trustBadges: config.trustBadges,
    features: {
      floatingCallButton: config.features?.floatingCallButton ?? false,
      stickyMobileCta: config.features?.stickyMobileCta ?? false,
    },
    theme: {
      preset: config.theme?.preset ?? "custom",
      primary: config.theme?.primary ?? themeConfig.primary,
      primaryDark: config.theme?.primaryDark ?? themeConfig.primaryDark,
    },
    announcement: {
      enabled: config.announcement?.enabled ?? false,
      message: config.announcement?.message ?? "",
      href: config.announcement?.href ?? "",
      linkLabel: config.announcement?.linkLabel ?? "",
    },
    homeLayout: config.homeLayout ?? DEFAULT_HOME_LAYOUT,
  };
}

/**
 * Deep-merge stored (partial) settings over the compile-time SiteConfig to
 * produce the effective config the site renders from. Only the fields the
 * settings own are overridden; everything else (nav, footer, service data)
 * flows through untouched.
 */
export function mergeSettings(
  base: SiteConfig,
  overrides: Partial<BusinessSettings> | null | undefined
): SiteConfig {
  if (!overrides) return base;

  const address = overrides.address
    ? { ...base.address, ...overrides.address }
    : base.address;

  // Keep the human-readable formatted line in sync with edited parts.
  const formatted = overrides.address
    ? `${address.street}, ${address.city}, ${address.state} ${address.zip}`
    : base.address.formatted;

  return {
    ...base,
    companyName: overrides.companyName ?? base.companyName,
    legalName: overrides.legalName ?? base.legalName,
    tagline: overrides.tagline ?? base.tagline,
    description: overrides.description ?? base.description,
    industry: overrides.industry ?? base.industry,
    phone: overrides.phone ?? base.phone,
    phoneRaw: overrides.phoneRaw ?? base.phoneRaw,
    email: overrides.email ?? base.email,
    address: { ...address, formatted },
    hours: overrides.hours ?? base.hours,
    emergencyNote: overrides.emergencyNote || base.emergencyNote,
    logo: overrides.logo
      ? { src: overrides.logo.src || undefined, alt: overrides.logo.alt }
      : base.logo,
    socials: overrides.socials ?? base.socials,
    mapEmbedUrl: overrides.mapEmbedUrl || base.mapEmbedUrl,
    seo: overrides.seo ? { ...base.seo, ...overrides.seo } : base.seo,
    trustBadges: overrides.trustBadges ?? base.trustBadges,
    features: { ...base.features, ...overrides.features },
    theme: overrides.theme ?? base.theme,
    announcement: overrides.announcement ?? base.announcement,
    homeLayout: overrides.homeLayout ?? base.homeLayout,
  };
}
