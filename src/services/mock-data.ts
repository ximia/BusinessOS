import type {
  Lead,
  QuoteRequest,
  Review,
  GalleryImage,
  Post,
  Employee,
} from "@/types/database";

/**
 * Demo data used by the admin dashboard when Supabase isn't configured yet.
 * This lets the whole product be explored immediately after cloning. Once the
 * client adds Supabase credentials and runs the migration, services read from
 * the database instead (see each `*.service.ts`).
 */

const now = Date.now();
const days = (n: number) => new Date(now - n * 86400000).toISOString();
const hours = (n: number) => new Date(now - n * 3600000).toISOString();

export const mockLeads: Lead[] = [
  {
    id: "ld_01",
    name: "Marcus Bell",
    email: "marcus.bell@example.com",
    phone: "(503) 555-0111",
    message: "Interested in paint correction for my Model 3. Lots of swirls.",
    status: "new",
    source: "website",
    assigned_to: "Elena Ruiz",
    tags: ["paint-correction", "tesla"],
    value: 549,
    created_at: hours(2),
    updated_at: hours(2),
  },
  {
    id: "ld_02",
    name: "Priya Nadella",
    email: "priya.n@example.com",
    phone: "(503) 555-0122",
    message: "Full interior detail — two kids and a dog. Help!",
    status: "contacted",
    source: "google",
    assigned_to: "Jordan Pierce",
    tags: ["interior"],
    value: 219,
    created_at: days(1),
    updated_at: hours(5),
  },
  {
    id: "ld_03",
    name: "Devin Cho",
    email: "devin.cho@example.com",
    phone: "(503) 555-0133",
    message: "Ceramic coating quote for a Porsche Cayman.",
    status: "quoted",
    source: "referral",
    assigned_to: "Sam Okafor",
    tags: ["ceramic", "high-value"],
    value: 1250,
    created_at: days(3),
    updated_at: days(1),
  },
  {
    id: "ld_04",
    name: "Rachel Ortiz",
    email: "rachel.o@example.com",
    phone: "(503) 555-0144",
    message: "Recurring maintenance wash at my office downtown.",
    status: "won",
    source: "social",
    assigned_to: "Elena Ruiz",
    tags: ["recurring"],
    value: 79,
    created_at: days(6),
    updated_at: days(4),
  },
  {
    id: "ld_05",
    name: "Tom Whitfield",
    email: "tom.w@example.com",
    phone: "(503) 555-0155",
    message: "F-150, needs a full exterior. When are you available?",
    status: "qualified",
    source: "website",
    assigned_to: null,
    tags: ["exterior", "truck"],
    value: 389,
    created_at: days(2),
    updated_at: days(2),
  },
  {
    id: "ld_06",
    name: "Amara Diallo",
    email: "amara.d@example.com",
    phone: "(503) 555-0166",
    message: "Following up on my ceramic coating from last year.",
    status: "lost",
    source: "phone",
    assigned_to: "Sam Okafor",
    tags: [],
    value: null,
    created_at: days(9),
    updated_at: days(7),
  },
];

export const mockQuotes: QuoteRequest[] = [
  {
    id: "qr_01",
    customer_name: "Marcus Bell",
    email: "marcus.bell@example.com",
    phone: "(503) 555-0111",
    service: "Exterior & Paint Correction",
    address: "882 SE Ash St, Portland, OR",
    preferred_date: days(-5),
    budget: "$400–$700",
    notes: "Two-year-old Model 3, garage-kept.",
    photo_urls: [],
    status: "requested",
    created_at: hours(3),
  },
  {
    id: "qr_02",
    customer_name: "Devin Cho",
    email: "devin.cho@example.com",
    phone: "(503) 555-0133",
    service: "Ceramic Coating",
    address: "14 NW 21st Ave, Portland, OR",
    preferred_date: days(-9),
    budget: "$1,000+",
    notes: "Porsche Cayman, wants a 5-year coating.",
    photo_urls: [],
    status: "sent",
    created_at: days(2),
  },
];

export const mockReviews: Review[] = [
  {
    id: "rv_01",
    name: "Marcus Bell",
    rating: 5,
    quote:
      "Corrected two years of swirls — paint looks better than new. Worth every penny.",
    service: "Paint Correction",
    approved: true,
    featured: true,
    created_at: days(12),
  },
  {
    id: "rv_02",
    name: "Priya Nadella",
    rating: 5,
    quote: "Extracted things I'd given up on. Doesn't smell like a fast-food bag anymore.",
    service: "Interior Detail",
    approved: true,
    featured: true,
    created_at: days(20),
  },
  {
    id: "rv_03",
    name: "Anonymous",
    rating: 4,
    quote: "Great work, ran a little over the estimated time but the result was excellent.",
    service: "Ceramic Coating",
    approved: false,
    featured: false,
    created_at: hours(8),
  },
];

export const mockGallery: GalleryImage[] = [
  {
    id: "gi_01",
    title: "Single-stage correction, black sedan",
    category: "Paint Correction",
    storage_path: "gallery/black-sedan.jpg",
    url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
    position: 0,
    created_at: days(30),
  },
  {
    id: "gi_02",
    title: "Full interior reset, family SUV",
    category: "Interior",
    storage_path: "gallery/suv-interior.jpg",
    url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    position: 1,
    created_at: days(28),
  },
];

export const mockPosts: Post[] = [
  {
    id: "po_01",
    slug: "why-automatic-car-washes-ruin-paint",
    title: "Why automatic car washes quietly ruin your paint",
    excerpt:
      "That $12 tunnel wash feels efficient. Here's what those brushes are doing to your clear coat.",
    content: "…",
    category: "Paint Care",
    cover_image:
      "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1200&q=80",
    status: "published",
    author: "Elena Ruiz",
    seo_title: null,
    seo_description: null,
    published_at: days(65),
    created_at: days(66),
    updated_at: days(65),
  },
  {
    id: "po_02",
    slug: "ceramic-coating-worth-it",
    title: "Is a ceramic coating actually worth it?",
    excerpt: "An honest breakdown of what coatings do, what they don't, and who should bother.",
    content: "…",
    category: "Protection",
    cover_image:
      "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1200&q=80",
    status: "published",
    author: "Sam Okafor",
    seo_title: null,
    seo_description: null,
    published_at: days(50),
    created_at: days(51),
    updated_at: days(50),
  },
  {
    id: "po_03",
    slug: "winter-detailing-checklist",
    title: "A winter detailing checklist for the Pacific Northwest",
    excerpt: "Draft — road salt, grime, and how to protect your car through the wet months.",
    content: "…",
    category: "Tips",
    cover_image: null,
    status: "draft",
    author: "Jordan Pierce",
    seo_title: null,
    seo_description: null,
    published_at: null,
    created_at: days(4),
    updated_at: days(2),
  },
];

export const mockEmployees: Employee[] = [
  {
    id: "em_01",
    full_name: "Elena Ruiz",
    email: "elena@halcyondetailing.com",
    role: "admin",
    avatar_url:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    active: true,
    created_at: days(400),
  },
  {
    id: "em_02",
    full_name: "Jordan Pierce",
    email: "jordan@halcyondetailing.com",
    role: "staff",
    avatar_url:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    active: true,
    created_at: days(300),
  },
  {
    id: "em_03",
    full_name: "Sam Okafor",
    email: "sam@halcyondetailing.com",
    role: "staff",
    avatar_url:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    active: true,
    created_at: days(220),
  },
  {
    id: "em_04",
    full_name: "Riley Chen",
    email: "riley@halcyondetailing.com",
    role: "readonly",
    avatar_url: null,
    active: false,
    created_at: days(120),
  },
];
