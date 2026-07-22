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

/** JSON-LD LocalBusiness schema for the homepage. */
export function localBusinessJsonLd() {
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
    areaServed: siteConfig.serviceAreas.map((a) => a.name),
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

/** JSON-LD for a single service. */
export function serviceJsonLd(name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: { "@type": "LocalBusiness", name: siteConfig.companyName },
    areaServed: siteConfig.serviceAreas.map((a) => a.name),
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
