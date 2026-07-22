/**
 * Application/domain types for data stored in Supabase.
 *
 * These are hand-written to keep the admin dashboard strongly typed without a
 * codegen step. If you later run `supabase gen types`, you can replace these
 * with the generated `Database` type — the services layer is the only place
 * that needs to change.
 */

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "quoted"
  | "won"
  | "lost";

export type LeadSource =
  | "website"
  | "referral"
  | "google"
  | "social"
  | "phone"
  | "walk-in"
  | "other";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: LeadStatus;
  source: LeadSource;
  assigned_to: string | null;
  tags: string[];
  value: number | null;
  created_at: string;
  updated_at: string;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  author: string;
  body: string;
  created_at: string;
}

export type CallOutcome =
  | "connected"
  | "voicemail"
  | "no-answer"
  | "callback"
  | "busy";

export interface CallLog {
  id: string;
  lead_id: string;
  outcome: CallOutcome;
  duration_seconds: number | null;
  notes: string | null;
  created_at: string;
}

export interface FollowUp {
  id: string;
  lead_id: string;
  due_at: string;
  note: string;
  completed: boolean;
}

export type QuoteStatus =
  | "requested"
  | "reviewing"
  | "sent"
  | "accepted"
  | "declined";

export interface QuoteRequest {
  id: string;
  customer_name: string;
  email: string;
  phone: string | null;
  service: string;
  address: string | null;
  preferred_date: string | null;
  budget: string | null;
  notes: string | null;
  photo_urls: string[];
  status: QuoteStatus;
  created_at: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  quote: string;
  service: string | null;
  approved: boolean;
  featured: boolean;
  created_at: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  category: string;
  storage_path: string;
  url: string;
  position: number;
  created_at: string;
}

export type PostStatus = "draft" | "scheduled" | "published";

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  cover_image: string | null;
  status: PostStatus;
  author: string;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export type UserRole = "admin" | "staff" | "readonly";

export interface Employee {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  active: boolean;
  created_at: string;
}
