import type { Metadata } from "next";
import { siteConfig } from "@/config";
import { absoluteUrl } from "@/lib/utils";

/**
 * Build a Next.js `Metadata` object from the site config, with per-page
 * overrides. Use in each route's `generateMetadata` / `metadata` export.
 */
export function buildMetadata({
  title,
  description,
  path = "/",
  image,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
} = {}): Metadata {
  const pageTitle = title
    ? siteConfig.seo.titleTemplate.replace("%s", title)
    : siteConfig.seo.title;
  const desc = description ?? siteConfig.seo.description;
  const url = absoluteUrl(path);

  // When a page passes an explicit image, use it. Otherwise defer to the
  // dynamically-generated opengraph-image.tsx (Next file convention).
  const images = image
    ? [{ url: absoluteUrl(image), width: 1200, height: 630 }]
    : undefined;

  return {
    title: pageTitle,
    description: desc,
    keywords: siteConfig.seo.keywords,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: pageTitle,
      description: desc,
      url,
      siteName: siteConfig.companyName,
      ...(images ? { images } : {}),
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: desc,
      ...(images ? { images: images.map((i) => i.url) } : {}),
      creator: siteConfig.seo.twitterHandle,
    },
  };
}

/**
 * JSON-LD LocalBusiness schema. Pass `areaServed` to scope it to a specific
 * city (local landing pages); defaults to all configured service areas.
 */
export function localBusinessJsonLd(
  areaServed: string[] = siteConfig.serviceAreas.map((a) => a.name)
) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteConfig.companyName,
    description: siteConfig.description,
    url: absoluteUrl("/"),
    telephone: siteConfig.phoneRaw,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.state,
      postalCode: siteConfig.address.zip,
      addressCountry: siteConfig.address.country,
    },
    geo:
      siteConfig.address.lat && siteConfig.address.lng
        ? {
            "@type": "GeoCoordinates",
            latitude: siteConfig.address.lat,
            longitude: siteConfig.address.lng,
          }
        : undefined,
    areaServed,
    sameAs: siteConfig.socials.map((s) => s.href),
    openingHoursSpecification: siteConfig.hours
      .filter((h) => !/closed/i.test(h.hours))
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.day,
        description: h.hours,
      })),
  };
}

/** JSON-LD LocalBusiness for a single physical location (Multi-location). */
export function locationJsonLd(location: import("@/types/content").Location) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `${siteConfig.companyName} — ${location.name}`,
    description: siteConfig.description,
    url: absoluteUrl(`/locations/${location.slug}`),
    telephone: location.phoneRaw,
    email: location.email ?? siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: location.address.street,
      addressLocality: location.address.city,
      addressRegion: location.address.state,
      postalCode: location.address.zip,
      addressCountry: location.address.country,
    },
    geo:
      location.address.lat && location.address.lng
        ? {
            "@type": "GeoCoordinates",
            latitude: location.address.lat,
            longitude: location.address.lng,
          }
        : undefined,
    areaServed: location.serviceAreas ?? siteConfig.serviceAreas.map((a) => a.name),
    parentOrganization: { "@type": "Organization", name: siteConfig.companyName },
    openingHoursSpecification: location.hours
      .filter((h) => !/closed/i.test(h.hours))
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.day,
        description: h.hours,
      })),
  };
}

/** JSON-LD for a single service. Pass `areaServed` to scope it to a city. */
export function serviceJsonLd(
  name: string,
  description: string,
  areaServed: string[] = siteConfig.serviceAreas.map((a) => a.name)
) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: { "@type": "LocalBusiness", name: siteConfig.companyName },
    areaServed,
  };
}

/** JSON-LD BreadcrumbList for a page's trail. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** JSON-LD FAQPage from FAQ items. */
export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
