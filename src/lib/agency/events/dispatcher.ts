import { exponentialBackoff } from "../backoff";
import { ref } from "../global-state";
import { createLogger } from "../log";
import { AgencyDeliveryError, postSigned } from "../outbound";
import {
  EVENT_REQUEST_TIMEOUT_MS,
  EVENT_RETRY_POLICY,
  getEventsConfig,
  type EventsConfig,
} from "./config";
import type { EventEnvelope } from "./envelope";
import { outbox } from "./outbox";

/**
 * Agency events — the dispatcher.
 *
 * Drains the outbox and delivers events to Agency OS. It is event-driven, not a
 * poller: `flush()` is invoked after a publish and re-scheduled with a single
 * self-terminating timer only while retries are pending. On a transient failure
 * an event backs off (exponential + jitter) and is retried; on a terminal
 * failure or after `maxAttempts` it is dead-lettered (kept, marked `dead`). If
 * Agency OS is unreachable, events simply wait — Business OS is never affected.
 */

const log = createLogger("events");

// Shared across bundles so the instrumentation and route contexts don't flush
// the same shared outbox concurrently. The retry timer stays context-local.
const flushing = ref<boolean>("events.flushing", () => false);
let timer: ReturnType<typeof setTimeout> | null = null;

async function deliver(
  event: EventEnvelope,
  config: EventsConfig
): Promise<void> {
  await postSigned({
    url: config.endpointUrl as string,
    apiKey: config.outboundKey as string,
    body: event,
    headers: {
      "x-idempotency-key": event.idempotencyKey,
      "x-business-os-deployment": event.source.deploymentId ?? "",
      "x-event-name": event.name,
      "x-event-version": String(event.version),
      "x-business-os-contract": event.specVersion,
    },
    timeoutMs: EVENT_REQUEST_TIMEOUT_MS,
  });
}

/**
 * Attempt delivery of all due events. Fire-and-forget; never throws. Concurrent
 * calls collapse into the in-flight run (a follow-up is re-scheduled at the end).
 */
export async function flush(): Promise<void> {
  if (flushing.get()) return;

  const config = getEventsConfig();
  if (!config.canDeliver) return; // Safe-fail: events stay queued.

  flushing.set(true);
  try {
    const due = outbox.due(Date.now());
    for (const record of due) {
      const attempt = record.attempts + 1;
      outbox.update(record.event.id, { status: "delivering" });
      try {
        await deliver(record.event, config);
        outbox.update(record.event.id, {
          status: "delivered",
          attempts: attempt,
          lastError: null,
        });
        log.info(`delivered ${record.event.name}`, {
          id: record.event.id,
          attempt,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "delivery failed";
        const retryable =
          error instanceof AgencyDeliveryError ? error.retryable : true;

        if (!retryable || attempt >= EVENT_RETRY_POLICY.maxAttempts) {
          outbox.update(record.event.id, {
            status: "dead",
            attempts: attempt,
            lastError: message,
          });
          log.error(
            `dead-lettered ${record.event.name} after ${attempt} attempt(s) — ${message}`,
            { id: record.event.id }
          );
        } else {
          const delayMs = exponentialBackoff(attempt, EVENT_RETRY_POLICY);
          outbox.update(record.event.id, {
            status: "pending",
            attempts: attempt,
            nextAttemptAt: Date.now() + delayMs,
            lastError: message,
          });
          log.warn(
            `delivery of ${record.event.name} failed (${message}); retrying in ${delayMs}ms`,
            { id: record.event.id, attempt }
          );
        }
      }
    }
  } finally {
    flushing.set(false);
    scheduleNext();
  }
}

/** Schedule one follow-up flush for the earliest pending retry, if any. */
function scheduleNext(): void {
  const earliest = outbox.earliestPendingAt();
  if (earliest === null) {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    return;
  }
  const delay = Math.max(0, earliest - Date.now());
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void flush().catch(() => {
      /* never throws */
    });
  }, delay);
  // Don't keep the process alive just for a retry (Node); no-op on Edge.
  (timer as unknown as { unref?: () => void }).unref?.();
}
