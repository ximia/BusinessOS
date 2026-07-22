import { z } from "zod";
import { CONNECTOR_CONTRACT_VERSION } from "../constants";
import { getConnectorIdentity } from "../identity";
import { eventVersions, type EventName } from "./registry";

/**
 * Agency events — the delivery envelope.
 *
 * Every event is wrapped in a stable, versioned envelope. `specVersion` versions
 * the envelope format; `version` versions the specific event's payload. `id` is
 * unique per event; `idempotencyKey` (defaulting to `id`) lets both the local
 * outbox and Agency OS de-duplicate.
 */
export interface EventEnvelope {
  /** Envelope/contract format version. */
  specVersion: string;
  /** Unique event id (UUID). */
  id: string;
  name: EventName;
  /** Payload schema version for `name`. */
  version: number;
  /** ISO-8601 time the event occurred. */
  occurredAt: string;
  /** Operational origin — never PII. */
  source: {
    deploymentId: string | null;
    organizationId: string | null;
  };
  /** De-duplication key (defaults to `id`). */
  idempotencyKey: string;
  /** Validated, PII-free event payload. */
  data: unknown;
}

/** Validates envelope metadata (the payload is validated separately at publish). */
export const envelopeMetaSchema = z.object({
  specVersion: z.string().min(1),
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.number().int().positive(),
  occurredAt: z.string().datetime(),
  source: z.object({
    deploymentId: z.string().min(1).nullable(),
    organizationId: z.string().min(1).nullable(),
  }),
  idempotencyKey: z.string().min(1),
});

/** Build a validated-shape envelope around already-validated event data. */
export function buildEnvelope(
  name: EventName,
  data: unknown,
  idempotencyKey?: string
): EventEnvelope {
  const identity = getConnectorIdentity();
  const id = crypto.randomUUID();
  const envelope: EventEnvelope = {
    specVersion: CONNECTOR_CONTRACT_VERSION,
    id,
    name,
    version: eventVersions[name],
    occurredAt: new Date().toISOString(),
    source: {
      deploymentId: identity.deployment.id,
      organizationId: identity.organization.id,
    },
    idempotencyKey: idempotencyKey ?? id,
    data,
  };
  // Validate the metadata shape (defensive; cheap).
  envelopeMetaSchema.parse(envelope);
  return envelope;
}
