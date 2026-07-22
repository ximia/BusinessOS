import { z } from "zod";
import { isConnectorEnabled } from "../config";
import { createLogger } from "../log";
import { buildEnvelope } from "./envelope";
import { flush } from "./dispatcher";
import { outbox } from "./outbox";
import { eventSchemas, type EventData, type EventName } from "./registry";

/**
 * Agency events — public surface.
 *
 * `publishEvent()` is the ONLY function business logic calls. It validates the
 * payload, wraps it in a versioned envelope, writes it to the outbox, and kicks
 * the dispatcher — then returns immediately. Callers never learn how (or whether)
 * events are delivered; that is entirely the dispatcher's concern.
 *
 * GUARANTEES:
 *  - Never throws. A validation error, a full/broken outbox, anything — is
 *    caught and logged; business logic is never interrupted.
 *  - Non-blocking. Delivery happens in the background; the caller does not wait.
 *  - Safe when disabled. If the connector is off (default), it is a no-op.
 *  - Idempotent. Pass `idempotencyKey` (e.g. a domain id) to collapse duplicates.
 */

const log = createLogger("events");

export interface PublishOptions {
  /** Stable de-duplication key. Defaults to a unique per-event id. */
  idempotencyKey?: string;
}

export function publishEvent<K extends EventName>(
  name: K,
  data: EventData<K>,
  options?: PublishOptions
): void {
  try {
    // Disabled ⇒ no-op, so a standalone deployment behaves exactly as today.
    if (!isConnectorEnabled()) return;

    const schema: z.ZodTypeAny = eventSchemas[name];
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      log.error(`invalid payload for "${name}"; event dropped`, {
        issues: parsed.error.issues,
      });
      return;
    }

    const envelope = buildEnvelope(name, parsed.data, options?.idempotencyKey);

    const result = outbox.enqueue(envelope);
    if (result.duplicate) {
      log.info(`duplicate "${name}" skipped`, {
        idempotencyKey: envelope.idempotencyKey,
      });
      return;
    }

    log.info(`queued "${name}"`, { id: envelope.id });
    void flush().catch(() => {
      /* delivery failures are handled inside the dispatcher */
    });
  } catch (error) {
    // Publishing must NEVER interrupt business logic.
    try {
      log.error(`publishEvent("${name}") failed`, {
        error: error instanceof Error ? error.message : "unknown",
      });
    } catch {
      /* even logging must not throw */
    }
  }
}

/** Defensive snapshot of the outbox (observability / tests). */
export function getOutboxSnapshot() {
  return outbox.list();
}

export type { EventName, EventData } from "./registry";
export { eventSchemas, eventVersions } from "./registry";
export type { EventEnvelope } from "./envelope";
export type { OutboxRecord, OutboxStatus, OutboxStore } from "./outbox";
