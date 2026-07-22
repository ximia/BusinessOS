import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { mockReviews } from "./mock-data";
import { testimonials } from "@/config";
import type { Review } from "@/types/database";
import type { Testimonial } from "@/types/content";

/** All reviews (admin view — includes unapproved). */
export async function getReviews(): Promise<Review[]> {
  if (!isSupabaseConfigured()) return mockReviews;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Approved reviews for the public site, mapped to the marketing `Testimonial`
 * shape. Falls back to the curated config testimonials in demo mode.
 */
export async function getApprovedTestimonials(): Promise<Testimonial[]> {
  if (!isSupabaseConfigured()) return testimonials;
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("approved", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    rating: r.rating,
    quote: r.quote,
    service: r.service ?? undefined,
    featured: r.featured,
  }));
}
