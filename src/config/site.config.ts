import type { SiteConfig } from "@/types/content";
import { applyBusinessProfile } from "@/config/business-profile";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  MASTER SITE CONFIG
 * ─────────────────────────────────────────────────────────────────────────────
 *  Everything a new client needs to change lives in `src/config/*`. Edit the
 *  values below and the entire marketing site re-brands itself. The demo data
 *  models a premium auto-detailing studio; replace it with any local trade.
 *
 *  Colours & fonts:  src/config/theme.config.ts + src/app/globals.css
 *  Services:         src/config/services.config.ts
 *  Testimonials:     src/config/testimonials.config.ts
 *  FAQ:              src/config/faq.config.ts
 *  Gallery:          src/config/gallery.config.ts
 *  Team:             src/config/team.config.ts
 * ─────────────────────────────────────────────────────────────────────────────
 */
const demoSiteConfig: SiteConfig = {
  companyName: "Halcyon Detailing Co.",
  legalName: "Halcyon Detailing LLC",
  tagline: "Concours-level detailing, brought to your driveway.",
  description:
    "A studio-grade mobile detailing service for people who care about how their car is treated. We work by appointment, on your schedule, with our own water and power.",
  industry: "Auto Detailing",
  foundedYear: 2016,

  phone: "(503) 555-0142",
  phoneRaw: "+15035550142",
  email: "hello@halcyondetailing.com",

  address: {
    street: "1420 SE Umatilla St, Suite 4",
    city: "Portland",
    state: "OR",
    zip: "97202",
    country: "USA",
    formatted: "1420 SE Umatilla St, Suite 4, Portland, OR 97202",
    lat: 45.4695,
    lng: -122.6553,
  },

  hours: [
    { day: "Monday – Friday", hours: "8:00 AM – 6:00 PM" },
    { day: "Saturday", hours: "9:00 AM – 4:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ],
  emergencyNote: "Same-week appointments are usually available — call to check.",

  logo: {
    src: undefined, // Falls back to a styled wordmark. Drop a logo in /public.
    alt: "Halcyon Detailing Co.",
  },

  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    {
      label: "Services",
      href: "/services",
      children: [
        { label: "All Services", href: "/services" },
        { label: "Interior Detail", href: "/services/interior-detail" },
        { label: "Exterior & Paint", href: "/services/exterior-paint-correction" },
        { label: "Ceramic Coating", href: "/services/ceramic-coating" },
      ],
    },
    { label: "Gallery", href: "/gallery" },
    { label: "Reviews", href: "/reviews" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],

  footerNav: [
    {
      title: "Services",
      links: [
        { label: "Interior Detail", href: "/services/interior-detail" },
        { label: "Paint Correction", href: "/services/exterior-paint-correction" },
        { label: "Ceramic Coating", href: "/services/ceramic-coating" },
        { label: "Maintenance Wash", href: "/services/maintenance-wash" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Gallery", href: "/gallery" },
        { label: "Reviews", href: "/reviews" },
        { label: "Careers", href: "/careers" },
        { label: "Blog", href: "/blog" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Contact", href: "/contact" },
      ],
    },
  ],

  socials: [
    { platform: "instagram", href: "https://instagram.com/" },
    { platform: "facebook", href: "https://facebook.com/" },
    { platform: "google", href: "https://g.page/" },
  ],

  serviceAreas: [
    { name: "Portland", note: "Home studio" },
    { name: "Lake Oswego" },
    { name: "Beaverton" },
    { name: "Tigard" },
    { name: "West Linn" },
    { name: "Milwaukie" },
    { name: "Happy Valley" },
    { name: "Tualatin" },
  ],

  // Replace with a Google Maps embed for the client's area (Share → Embed a map).
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d178959.6!2d-122.65!3d45.52!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zUG9ydGxhbmQsIE9S!5e0!3m2!1sen!2sus!4v1700000000000",

  seo: {
    title: "Halcyon Detailing Co.",
    titleTemplate: "%s · Halcyon Detailing Co.",
    description:
      "Studio-grade mobile auto detailing in Portland, OR. Paint correction, ceramic coatings, and interior restoration — by appointment, at your home or office.",
    keywords: [
      "auto detailing portland",
      "mobile detailing",
      "ceramic coating",
      "paint correction",
      "car interior cleaning",
    ],
    ogImage: "/og-image.jpg",
    twitterHandle: "@halcyondetail",
  },

  trustBadges: [
    "Insured & bonded",
    "Ceramic Pro certified",
    "500+ vehicles detailed",
  ],

  // Optional, per-client feature flags. Override live from Admin → Settings.
  features: {
    floatingCallButton: true,
    stickyMobileCta: true,
  },

  // Runtime brand theme. Change from Admin → Theme (industry presets).
  theme: {
    preset: "auto-detailing",
    primary: "216 90% 44%",
    primaryDark: "214 95% 62%",
  },

  // Optional announcement bar (Admin → Settings → Features).
  announcement: {
    enabled: true,
    message: "Now booking — same-week appointments usually available.",
    href: "/contact",
    linkLabel: "Reserve a spot",
  },
};

/**
 * The effective site config: the demo defaults above, overlaid with this
 * client's identity + industry preset when Agency OS has provisioned the site
 * (via `NEXT_PUBLIC_BUSINESS_*` env vars). With none set, this is exactly the
 * demo config — demo mode is never broken.
 */
export const siteConfig: SiteConfig = applyBusinessProfile(demoSiteConfig);
