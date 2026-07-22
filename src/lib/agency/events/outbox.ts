import type { EventEnvelope } from "./envelope";

/**
 * Agency events — the outbox.
 *
 * Decouples *publishing* from *delivery*. `publishEvent()` writes here and
 * returns; the dispatcher drains it in the background. This is what lets Business
 * OS keep working when Agency OS is down — events wait in the outbox instead of
 * blocking or failing the caller.
 *
 * SCOPE (Phase 4): the default store is IN-MEMORY (per process). If the process
 * dies with undelivered events, they are lost — a safe failure that never
 * interrupts operation, but not durable across restarts. The store is an
 * interface precisely so a Supabase-backed durable outbox can replace it later
 * (see DECISIONS.md ADR-0013 / ADR-0011 for the write-context caveat). Business
 * logic and the dispatcher depend only on {@link OutboxStore}, never on the
 * backing implementation.
 */

export type OutboxStatus = "pending" | "delivering" | "delivered" | "dead";

export interface OutboxRecord {
  event: EventEnvelope;
  status: OutboxStatus;
  attempts: number;
  enqueuedAt: number;
  /** Epoch ms; the record is eligible for delivery at/after this time. */
  nextAttemptAt: number;
  lastError: string | null;
}

export interface OutboxStore {
  /** Idempotent enqueue: a repeat idempotency key is ignored. */
  enqueue(event: EventEnvelope): { enqueued: boolean; duplicate: boolean };
  /** Pending records whose backoff has elapsed. */
  due(now: number): OutboxRecord[];
  update(id: string, patch: Partial<OutboxRecord>): void;
  /** Earliest `nextAttemptAt` among pending records, or null if none. */
  earliestPendingAt(): number | null;
  /** Defensive snapshot (observability / tests). */
  list(): OutboxRecord[];
  clear(): void;
}

export function createInMemoryOutbox(): OutboxStore {
  const records = new Map<string, OutboxRecord>();
  const seenKeys = new Set<string>();

  return {
    enqueue(event) {
      if (seenKeys.has(event.idempotencyKey)) {
        return { enqueued: false, duplicate: true };
      }
      seenKeys.add(event.idempotencyKey);
      const now = Date.now();
      records.set(event.id, {
        event,
        status: "pending",
        attempts: 0,
        enqueuedAt: now,
        nextAttemptAt: now,
        lastError: null,
      });
      return { enqueued: true, duplicate: false };
    },
    due(now) {
      return [...records.values()].filter(
        (record) => record.status === "pending" && record.nextAttemptAt <= now
      );
    },
    update(id, patch) {
      const record = records.get(id);
      if (record) records.set(id, { ...record, ...patch });
    },
    earliestPendingAt() {
      let earliest: number | null = null;
      for (const record of records.values()) {
        if (record.status !== "pending") continue;
        earliest =
          earliest === null
            ? record.nextAttemptAt
            : Math.min(earliest, record.nextAttemptAt);
      }
      return earliest;
    },
    list() {
      return [...records.values()].map((record) => ({ ...record }));
    },
    clear() {
      records.clear();
      seenKeys.clear();
    },
  };
}

/** The process-wide outbox instance. */
export const outbox: OutboxStore = createInMemoryOutbox();
