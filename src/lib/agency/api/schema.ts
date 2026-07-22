import { z } from "zod";

/**
 * Agency API (Phase 2) — response contracts.
 *
 * The read-only API layer wraps every payload in a consistent, validated
 * envelope so a future Agency OS can parse responses uniformly across a fleet.
 * These are separate from the Phase 1 connector schemas (`../schema.ts`) — the
 * API layer builds ON those primitives without modifying them.
 *
 * PRIVACY: the metrics contract below is AGGREGATE-ONLY by construction. There
 * is no field for a name, email, phone, message, or any per-record identifier.
 * If a customer-data field is ever needed, it does not belong here.
 */

/* ─────────────────────────────── Envelopes ───────────────────────────────── */

/**
 * A successful response envelope for a given `data` schema. Metadata is
 * operational only (deployment id, contract version, timestamp).
 */
export function successEnvelopeSchema<T extends z.ZodTypeAny>(data: T) {
  return z.object({
    ok: z.literal(true),
    /** Which resource this is ("health" | "version" | "metrics" | ...). */
    resource: z.string().min(1),
    /** Connector wire-contract version, for forward/backward compatibility. */
    contractVersion: z.string().min(1),
    /** Operational identity of the responding deployment (never PII). */
    deploymentId: z.string().min(1).nullable(),
    /** ISO-8601 generation timestamp. */
    generatedAt: z.string().datetime(),
    data,
  });
}

/** Machine-readable status for non-success responses. */
export const errorStatusSchema = z.enum(["disabled", "unauthorized", "error"]);
export type ErrorStatus = z.infer<typeof errorStatusSchema>;

/** A non-success response envelope (disabled / unauthorized / error). */
export const errorEnvelopeSchema = z.object({
  ok: z.literal(false),
  status: errorStatusSchema,
  message: z.string().min(1),
  contractVersion: z.string().min(1),
  generatedAt: z.string().datetime(),
});
export type ErrorEnvelope = z.infer<typeof errorEnvelopeSchema>;

/* ──────────────────────── Metrics (aggregate-only) ───────────────────────── */

/** A non-negative integer count. */
const count = z.number().int().nonnegative();
/** A monetary rollup (aggregate; may be any real number). */
const money = z.number();

/**
 * Operational metrics snapshot. Every value is a COUNT, a ROLLUP, or a
 * distribution — never an individual record and never PII. Built by composing
 * the existing business services (see `../services/metrics.service.ts`).
 */
export const metricsSnapshotSchema = z.object({
  leads: z.object({
    total: count,
    newThisWeek: count,
    /** Count of leads by pipeline stage (e.g. { new: 3, won: 2 }). */
    byStatus: z.record(z.string(), count),
    /** Aggregate value of open pipeline. */
    pipelineValue: money,
    /** Aggregate value of won leads. */
    wonValue: money,
  }),
  quotes: z.object({
    total: count,
    /** Count of quotes by status. */
    byStatus: z.record(z.string(), count),
  }),
  reviews: z.object({
    total: count,
    approved: count,
    featured: count,
    /** Mean rating across all reviews, 0–5 (0 when none). */
    averageRating: z.number().min(0).max(5),
  }),
  posts: z.object({
    total: count,
    published: count,
    draft: count,
    scheduled: count,
  }),
  gallery: z.object({
    total: count,
  }),
  team: z.object({
    total: count,
    active: count,
  }),
});
export type MetricsSnapshot = z.infer<typeof metricsSnapshotSchema>;
