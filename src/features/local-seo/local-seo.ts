import { services, siteConfig } from "@/config";
import { slugify } from "@/lib/utils";
import type { Service, ServiceArea } from "@/types/content";

/**
 * Local SEO (Priority 9). Auto-generates city landing pages and city × service
 * landing pages from the existing `serviceAreas` and `services` config — the
 * classic "service in {city}" pattern that ranks for local intent. All copy is
 * templated from real config so it stays unique per page without hand-writing
 * dozens of pages. Everything here is pure + compile-time (no async), so the
 * generated routes are statically rendered like the rest of the marketing site.
 */

export interface Area extends ServiceArea {
  slug: string;
}

/** All service areas with URL slugs. */
export function areas(): Area[] {
  return siteConfig.serviceAreas.map((a) => ({ ...a, slug: slugify(a.name) }));
}

export function getAreaBySlug(slug: string): Area | null {
  return areas().find((a) => a.slug === slug) ?? null;
}

/** Nearby areas for internal linking (excludes the current one). */
export function nearbyAreas(slug: string, n = 5): Area[] {
  return areas()
    .filter((a) => a.slug !== slug)
    .slice(0, n);
}

/** Home base city, used in copy ("based in … serving …"). */
export function baseCity(): string {
  return siteConfig.address.city;
}

// ─── Copy generators ─────────────────────────────────────────────────────────

/** Intro paragraphs for a city hub page (covers all services). */
export function cityIntro(area: Area): string[] {
  const base = baseCity();
  const local =
    area.name === base
      ? `Our studio is right here in ${area.name}, so booking is quick and turnaround is fast.`
      : `We're based in ${base} and regularly serve ${area.name} clients${
          area.note ? ` — ${area.note.toLowerCase()}` : ""
        }.`;
  return [
    `${siteConfig.companyName} provides ${siteConfig.industry.toLowerCase()} to ${area.name} and the surrounding area. ${siteConfig.description}`,
    `Whether you need a one-off appointment or ongoing care, our ${area.name} customers get the same meticulous work and honest pricing we're known for. ${local}`,
  ];
}

/** Intro paragraphs for a city × service landing page. */
export function cityServiceIntro(area: Area, service: Service): string[] {
  const base = baseCity();
  const svc = service.title.toLowerCase();
  const paras = [
    `Looking for ${svc} in ${area.name}? ${siteConfig.companyName} delivers ${svc} for ${area.name} drivers with the care and attention to detail that keeps customers coming back. ${service.excerpt}`,
  ];
  if (service.description[0]) {
    paras.push(service.description[0]);
  }
  paras.push(
    area.name === base
      ? `Because we're based in ${area.name}, scheduling your ${svc} is simple and turnaround is quick.`
      : `We're just a short drive from ${area.name} in ${base}, so ${area.name} customers get the full ${svc} experience without travelling far.`
  );
  return paras;
}

/** A localized FAQ for a city × service page (unique, schema-eligible). */
export function cityServiceFaq(
  area: Area,
  service: Service
): { question: string; answer: string }[] {
  const svc = service.title.toLowerCase();
  const faq = [
    {
      question: `Do you offer ${svc} in ${area.name}?`,
      answer: `Yes — ${siteConfig.companyName} provides ${svc} throughout ${area.name} and the nearby area. Get in touch and we'll find a time that works for you.`,
    },
    {
      question: `How much does ${svc} cost in ${area.name}?`,
      answer: service.price
        ? `${svc.charAt(0).toUpperCase() + svc.slice(1)} starts at ${service.price}. Final pricing depends on the size and condition of your vehicle — we'll confirm before any work begins.`
        : `Pricing depends on the size and condition of your vehicle. Contact us for a fast, no-obligation quote for your ${area.name} ${svc}.`,
    },
    {
      question: `How do I book ${svc} near ${area.name}?`,
      answer: `Call ${siteConfig.phone} or send a message through our contact form. We'll confirm your ${area.name} appointment and answer any questions about your ${svc}.`,
    },
  ];
  return faq;
}

/** "Why {city} chooses us" bullets, blending trust badges with local framing. */
export function localWhyUs(area: Area): string[] {
  const badges = siteConfig.trustBadges.slice(0, 3);
  return [
    `Trusted by drivers across ${area.name} and the surrounding area`,
    ...badges,
  ];
}

/** Services list for internal linking on city pages. */
export function allServices(): Service[] {
  return services;
}
