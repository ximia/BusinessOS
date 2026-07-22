import { getLeadStats } from "@/services/leads.service";
import { getQuotes } from "@/services/quotes.service";
import { getReviews } from "@/services/reviews.service";
import { getPosts } from "@/services/posts.service";
import { getGalleryImages } from "@/services/gallery.service";
import { getEmployees } from "@/services/employees.service";
import { metricsSnapshotSchema, type MetricsSnapshot } from "../api/schema";

/**
 * Agency API (Phase 2) — metrics service.
 *
 * Produces an AGGREGATE-ONLY operational snapshot by composing the EXISTING
 * business services. It never queries Supabase directly and never re-implements
 * business logic — it reuses `getLeadStats`, `getQuotes`, etc., and reduces
 * their results to counts, rollups, and distributions.
 *
 * PRIVACY: individual records fetched by the underlying services are used only
 * to compute counts and are then discarded. No name, email, phone, message, or
 * per-record identifier is ever read into the returned snapshot.
 *
 * RESILIENCE: each source is isolated. If one read fails (e.g. a configured
 * deployment where the machine caller's context can't see a staff-only table),
 * that section degrades to zero rather than failing the whole endpoint. The
 * response stays well-formed and validated.
 *
 * CONTEXT NOTE: these endpoints authenticate via API key, not a staff session,
 * so under RLS a configured deployment returns what that context can read.
 * Wiring an elevated read context for the API is intentionally out of Phase 2
 * scope (would mean bypassing the services / RLS, which is explicitly avoided).
 */

/** Resolve a promise to its value, or a fallback if it rejects. */
async function orFallback<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

export async function buildMetricsSnapshot(): Promise<MetricsSnapshot> {
  const [leadStats, quotes, reviews, posts, gallery, employees] =
    await Promise.all([
      orFallback(getLeadStats(), {
        total: 0,
        newThisWeek: 0,
        byStatus: {} as Record<string, number>,
        pipelineValue: 0,
        wonValue: 0,
      }),
      orFallback(getQuotes(), []),
      orFallback(getReviews(), []),
      orFallback(getPosts(), []),
      orFallback(getGalleryImages(), []),
      orFallback(getEmployees(), []),
    ]);

  const quotesByStatus = quotes.reduce<Record<string, number>>((acc, quote) => {
    acc[quote.status] = (acc[quote.status] ?? 0) + 1;
    return acc;
  }, {});

  const averageRating =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length) *
            10
        ) / 10
      : 0;

  return metricsSnapshotSchema.parse({
    leads: {
      total: leadStats.total,
      newThisWeek: leadStats.newThisWeek,
      byStatus: leadStats.byStatus,
      pipelineValue: leadStats.pipelineValue,
      wonValue: leadStats.wonValue,
    },
    quotes: {
      total: quotes.length,
      byStatus: quotesByStatus,
    },
    reviews: {
      total: reviews.length,
      approved: reviews.filter((review) => review.approved).length,
      featured: reviews.filter((review) => review.featured).length,
      averageRating,
    },
    posts: {
      total: posts.length,
      published: posts.filter((post) => post.status === "published").length,
      draft: posts.filter((post) => post.status === "draft").length,
      scheduled: posts.filter((post) => post.status === "scheduled").length,
    },
    gallery: {
      total: gallery.length,
    },
    team: {
      total: employees.length,
      active: employees.filter((employee) => employee.active).length,
    },
  });
}
