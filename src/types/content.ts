/**
 * Content domain types.
 *
 * These describe the shape of everything that changes from client to client.
 * The homepage and marketing pages read exclusively from objects typed here,
 * so re-branding the site is a matter of editing `src/config/*`, never JSX.
 */
export interface NavLink {
  label: string;
  href: string;
  /** Optional child links render as a dropdown in the navbar. */
  children?: NavLink[];
}

export interface BusinessHours {
  /** Human day label, e.g. "Mon – Fri". */
  day: string;
  /** e.g. "8:00 AM – 6:00 PM", or "Closed". */
  hours: string;
}

export interface SocialLink {
  platform:
    | "facebook"
    | "instagram"
    | "x"
    | "linkedin"
    | "youtube"
    | "tiktok"
    | "google";
  href: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  /** Free-form single line used for schema.org / display. */
  formatted: string;
  /** Optional coordinates for the service-area map. */
  lat?: number;
  lng?: number;
}

export interface ServiceHighlight {
  icon: keyof typeof import("@/lib/icons").iconMap;
  title: string;
  description: string;
}

export interface Service {
  /** URL slug: /services/[slug] */
  slug: string;
  title: string;
  /** One-line summary for cards and grids. */
  excerpt: string;
  /** Longer description for the service detail page (supports paragraphs). */
  description: string[];
  icon: keyof typeof import("@/lib/icons").iconMap;
  /** Optional starting price, e.g. "From $149". */
  price?: string;
  /** Feature bullets shown on the detail page. */
  features: string[];
  /** Optional deeper highlights with icons for the detail page. */
  highlights?: ServiceHighlight[];
  image?: string;
  featured?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  /** 1–5 */
  rating: number;
  quote: string;
  /** Optional avatar image URL. */
  avatar?: string;
  /** Service the review relates to, for filtering. */
  service?: string;
  featured?: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  src: string;
  /** For before/after pairs. */
  before?: string;
  after?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar?: string;
  socials?: SocialLink[];
}

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
  icon: keyof typeof import("@/lib/icons").iconMap;
}

export interface ServiceArea {
  name: string;
  /** Optional note, e.g. "Same-day service". */
  note?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  publishedAt: string;
  readingMinutes: number;
  coverImage?: string;
  tags?: string[];
}

export interface JobOpening {
  slug: string;
  title: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Apprenticeship";
  department: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
}

export interface SeoConfig {
  title: string;
  titleTemplate: string;
  description: string;
  keywords: string[];
  ogImage: string;
  twitterHandle?: string;
}

export interface SiteConfig {
  companyName: string;
  legalName: string;
  tagline: string;
  /** Short elevator pitch used in hero / meta descriptions. */
  description: string;
  /** Industry label, drives some copy and schema.org type. */
  industry: string;
  foundedYear: number;
  phone: string;
  /** E.164 for tel: links, e.g. "+15551234567". */
  phoneRaw: string;
  email: string;
  address: Address;
  hours: BusinessHours[];
  /** Emergency / after-hours note, optional. */
  emergencyNote?: string;
  logo: {
    /** Path or URL. Falls back to wordmark text if omitted. */
    src?: string;
    alt: string;
  };
  nav: NavLink[];
  footerNav: { title: string; links: NavLink[] }[];
  socials: SocialLink[];
  serviceAreas: ServiceArea[];
  /** Google Maps embed URL for the service-area map. */
  mapEmbedUrl: string;
  seo: SeoConfig;
  /** Trust signals shown near the hero — keep factual, no fake stats. */
  trustBadges: string[];
  /**
   * Optional, per-client feature flags. Every new capability is opt-in and
   * configurable from here (and, at runtime, from the Business Settings admin).
   */
  features?: SiteFeatures;
}

export interface SiteFeatures {
  /** Show a floating call button on mobile. */
  floatingCallButton?: boolean;
  /** Show a sticky "Get a quote" bar on mobile once the user scrolls. */
  stickyMobileCta?: boolean;
}
