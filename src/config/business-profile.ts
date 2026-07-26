import type { NavLink, Service, SiteConfig } from "@/types/content";
import { getIndustryPreset, type IndustryPreset } from "@/features/theme/industries";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  BUSINESS PROFILE OVERLAY
 * ─────────────────────────────────────────────────────────────────────────────
 *  Turns a freshly-cloned template into *this client's* site with no code edits.
 *
 *  Agency OS injects a client's identity as `NEXT_PUBLIC_BUSINESS_*` environment
 *  variables when it provisions the site. This module reads them and overlays
 *  them onto the compile-time demo config:
 *
 *    • an industry PRESET (`NEXT_PUBLIC_BUSINESS_PRESET`, e.g. "hvac") swaps in a
 *      matching color palette, tagline, description, trust badges, and a starter
 *      set of services — reusing the existing Theme Generator registry
 *      (`features/theme/industries.ts`), so there is one source of truth.
 *    • explicit identity fields (name, phone, email, address, …) then override
 *      on top, so a client's real details always win over the preset's samples.
 *
 *  Precedence: explicit env value  >  industry preset  >  demo default.
 *
 *  When NO business env vars are set, every function here returns the input
 *  unchanged — so an un-provisioned clone still runs in pure demo mode. That
 *  contract (never break demo mode) must hold.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** A trimmed env value, or undefined when unset/empty. */
function env(key: string): string | undefined {
  const v = process.env[key];
  return v && v.trim() ? v.trim() : undefined;
}

/** "Interior Detail" → "interior-detail". Shared so services + nav slugs match. */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Best-effort E.164 for tel: links; assumes US when no country code given. */
function toE164(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  const digits = cleaned.replace(/\D/g, "");
  return digits.length === 10 ? `+1${digits}` : `+${digits}`;
}

/** The industry preset selected for this deployment, if any. */
export function getActivePreset(): IndustryPreset | undefined {
  const id = env("NEXT_PUBLIC_BUSINESS_PRESET");
  return id ? getIndustryPreset(id) : undefined;
}

/** True when this clone has been provisioned with any client identity. */
export function isProvisioned(): boolean {
  return Boolean(
    env("NEXT_PUBLIC_BUSINESS_NAME") ||
      env("NEXT_PUBLIC_BUSINESS_PRESET") ||
      env("NEXT_PUBLIC_BUSINESS_INDUSTRY"),
  );
}

/** Expand a preset's lightweight sample services into full Service objects. */
function servicesFromPreset(preset: IndustryPreset): Service[] {
  return preset.sampleServices.map((s, i) => ({
    slug: slugify(s.title),
    title: s.title,
    excerpt: s.excerpt,
    description: [
      s.excerpt,
      `Ask us about ${s.title.toLowerCase()} — we'll explain your options up front and give you an honest, no-pressure quote.`,
    ],
    icon: s.icon,
    features: [
      "Free, no-obligation quote",
      "Licensed & insured",
      "Workmanship you can count on",
    ],
    featured: i === 0,
  }));
}

/**
 * The site's services: the active preset's starter set when provisioned, else
 * the demo services passed in. Called from `services.config.ts`.
 */
export function resolveServices(demoServices: Service[]): Service[] {
  const preset = getActivePreset();
  return preset ? servicesFromPreset(preset) : demoServices;
}

/** Build the "Services" nav children + footer links from a services list. */
function serviceNav(services: Service[]): NavLink[] {
  return [
    { label: "All Services", href: "/services" },
    ...services.map((s) => ({ label: s.title, href: `/services/${s.slug}` })),
  ];
}

/**
 * Overlay this client's identity + industry preset onto the demo site config.
 * Called from `site.config.ts`; the result is what the entire app renders from.
 */
export function applyBusinessProfile(base: SiteConfig): SiteConfig {
  const preset = getActivePreset();
  const name = env("NEXT_PUBLIC_BUSINESS_NAME");

  // Nothing to do — keep pure demo mode intact.
  if (!preset && !name && !isProvisioned()) return base;

  const industry = env("NEXT_PUBLIC_BUSINESS_INDUSTRY") ?? preset?.label ?? base.industry;
  const tagline = env("NEXT_PUBLIC_BUSINESS_TAGLINE") ?? preset?.sampleTagline ?? base.tagline;
  const description =
    env("NEXT_PUBLIC_BUSINESS_DESCRIPTION") ?? preset?.sampleDescription ?? base.description;

  const phone = env("NEXT_PUBLIC_BUSINESS_PHONE");
  const email = env("NEXT_PUBLIC_BUSINESS_EMAIL");

  const street = env("NEXT_PUBLIC_BUSINESS_STREET");
  const city = env("NEXT_PUBLIC_BUSINESS_CITY");
  const state = env("NEXT_PUBLIC_BUSINESS_STATE");
  const zip = env("NEXT_PUBLIC_BUSINESS_ZIP");

  const primary = env("NEXT_PUBLIC_BUSINESS_PRIMARY_HSL") ?? preset?.primary;
  const primaryDark = preset?.primaryDark;

  // Address: only touched when a real one is supplied, and rebuilt cleanly so no
  // demo street/zip leaks through. Map + coordinates stay for the owner to set
  // in Admin → Settings (we don't geocode here).
  const hasAddress = Boolean(street || city || state || zip);
  const address = hasAddress
    ? {
        ...base.address,
        street: street ?? "",
        city: city ?? base.address.city,
        state: state ?? base.address.state,
        zip: zip ?? "",
        formatted: [street, [city, state].filter(Boolean).join(", "), zip]
          .filter((p) => p && p.length)
          .join(", "),
      }
    : base.address;

  const services = preset ? servicesFromPreset(preset) : undefined;

  return {
    ...base,
    companyName: name ?? base.companyName,
    legalName: name ?? base.legalName,
    tagline,
    description,
    industry,

    phone: phone ?? base.phone,
    phoneRaw: phone ? toE164(phone) : base.phoneRaw,
    email: email ?? base.email,
    address,

    logo: { ...base.logo, alt: name ?? base.logo.alt },

    // Rebuild the Services nav/footer from the active services so links resolve.
    nav: services
      ? base.nav.map((item) =>
          item.href === "/services" && item.children
            ? { ...item, children: serviceNav(services) }
            : item,
        )
      : base.nav,
    footerNav: services
      ? base.footerNav.map((col) =>
          col.title === "Services"
            ? { ...col, links: services.map((s) => ({ label: s.title, href: `/services/${s.slug}` })) }
            : col,
        )
      : base.footerNav,

    seo: {
      ...base.seo,
      title: name ?? base.seo.title,
      titleTemplate: name ? `%s · ${name}` : base.seo.titleTemplate,
      description,
    },

    trustBadges: preset?.sampleBadges ?? base.trustBadges,

    theme: primary
      ? {
          preset: preset?.id ?? base.theme?.preset ?? "custom",
          primary,
          primaryDark: primaryDark ?? base.theme?.primaryDark ?? primary,
        }
      : base.theme,
  };
}
