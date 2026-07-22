import { z } from "zod";
import {
  deploymentEnvironmentSchema,
  healthStatusSchema,
  versionInfoSchema,
} from "../schema";

/**
 * Agency events — the versioned event catalog.
 *
 * The single source of truth for every event Business OS can publish. Each entry
 * pairs a Zod schema (validated at publish time) with a version number (carried
 * on the envelope so Agency OS can evolve consumers independently).
 *
 * PRIVACY: event payloads are operational by design — ids, types, statuses,
 * counts, ratings, timestamps. They carry NO customer PII (no names, emails,
 * phones, or message bodies). Keep it that way when adding events.
 *
 * EVOLUTION: never repurpose a field within a version. To change a payload
 * incompatibly, bump the event's version here.
 */
export const eventSchemas = {
  "deployment.registered": z.object({
    deploymentId: z.string().min(1),
    environment: deploymentEnvironmentSchema,
  }),
  "deployment.updated": z.object({
    deploymentId: z.string().min(1),
    version: versionInfoSchema,
  }),
  "health.changed": z.object({
    status: healthStatusSchema,
    previousStatus: healthStatusSchema.nullable(),
  }),
  "lead.created": z.object({
    leadId: z.string().min(1).nullable().optional(),
    source: z.string().min(1),
  }),
  "quote.created": z.object({
    quoteId: z.string().min(1).nullable().optional(),
    service: z.string().min(1),
  }),
  "appointment.created": z.object({
    appointmentId: z.string().min(1).nullable().optional(),
    service: z.string().min(1).nullable().optional(),
    scheduledFor: z.string().datetime().nullable().optional(),
  }),
  "review.received": z.object({
    reviewId: z.string().min(1).nullable().optional(),
    rating: z.number().int().min(1).max(5),
    approved: z.boolean(),
  }),
  "backup.completed": z.object({
    ok: z.boolean(),
    sizeBytes: z.number().int().nonnegative().optional(),
    durationMs: z.number().int().nonnegative().optional(),
  }),
} satisfies Record<string, z.ZodTypeAny>;

/** A publishable event name. */
export type EventName = keyof typeof eventSchemas;

/** The validated payload type for a given event name. */
export type EventData<K extends EventName> = z.infer<(typeof eventSchemas)[K]>;

/** Per-event schema version, carried on the envelope. */
export const eventVersions = {
  "deployment.registered": 1,
  "deployment.updated": 1,
  "health.changed": 1,
  "lead.created": 1,
  "quote.created": 1,
  "appointment.created": 1,
  "review.received": 1,
  "backup.completed": 1,
} as const satisfies Record<EventName, number>;
