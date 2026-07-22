import type { Location } from "@/types/content";
import { siteConfig } from "./site.config";

/**
 * Business locations (Multi-location — Priority 10).
 *
 * A single-location business needs only the one entry below (kept in sync with
 * `siteConfig.address`). Add more entries to turn on the /locations hub, the
 * per-location landing pages, and per-location schema/sitemap automatically —
 * no code changes required. `getSiteConfig()`/settings are unaffected; this is
 * a separate, additive config surface.
 */
export const locations: Location[] = [
  {
    slug: "portland",
    name: "Portland (HQ)",
    primary: true,
    address: siteConfig.address,
    phone: siteConfig.phone,
    phoneRaw: siteConfig.phoneRaw,
    email: siteConfig.email,
    hours: siteConfig.hours,
    mapEmbedUrl: siteConfig.mapEmbedUrl,
    note: "Our flagship studio and mobile dispatch hub.",
    serviceAreas: ["Portland", "Milwaukie", "Happy Valley"],
  },
  {
    slug: "beaverton",
    name: "Beaverton",
    address: {
      street: "8600 SW Hall Blvd, Suite 12",
      city: "Beaverton",
      state: "OR",
      zip: "97008",
      country: "USA",
      formatted: "8600 SW Hall Blvd, Suite 12, Beaverton, OR 97008",
      lat: 45.4779,
      lng: -122.8093,
    },
    phone: "(503) 555-0188",
    phoneRaw: "+15035550188",
    email: "beaverton@halcyondetailing.com",
    hours: [
      { day: "Monday – Friday", hours: "8:00 AM – 6:00 PM" },
      { day: "Saturday", hours: "9:00 AM – 3:00 PM" },
      { day: "Sunday", hours: "Closed" },
    ],
    mapEmbedUrl: siteConfig.mapEmbedUrl,
    note: "Serving the west side and Tualatin Valley.",
    serviceAreas: ["Beaverton", "Tigard", "Tualatin", "Hillsboro"],
  },
  {
    slug: "lake-oswego",
    name: "Lake Oswego",
    address: {
      street: "333 S State St, Suite B",
      city: "Lake Oswego",
      state: "OR",
      zip: "97034",
      country: "USA",
      formatted: "333 S State St, Suite B, Lake Oswego, OR 97034",
      lat: 45.4207,
      lng: -122.6706,
    },
    phone: "(503) 555-0170",
    phoneRaw: "+15035550170",
    email: "lakeoswego@halcyondetailing.com",
    hours: [
      { day: "Monday – Friday", hours: "9:00 AM – 5:00 PM" },
      { day: "Saturday", hours: "By appointment" },
      { day: "Sunday", hours: "Closed" },
    ],
    mapEmbedUrl: siteConfig.mapEmbedUrl,
    note: "Appointment-first studio for the south metro.",
    serviceAreas: ["Lake Oswego", "West Linn", "Tualatin"],
  },
];

/** True when the site should surface multi-location UI. */
export function isMultiLocation(): boolean {
  return locations.length > 1;
}

export function getLocationBySlug(slug: string): Location | null {
  return locations.find((l) => l.slug === slug) ?? null;
}

/** The primary location (or the first configured). */
export function getPrimaryLocation(): Location {
  return locations.find((l) => l.primary) ?? locations[0]!;
}
