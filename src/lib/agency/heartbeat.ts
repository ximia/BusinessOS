import { isConnectorEnabled } from "./config";
import { ENV } from "./constants";
import { createLogger } from "./log";
import { getEventsConfig } from "./events/config";
import { getOutboxSnapshot, publishEvent } from "./events";
import { getRegistrationState } from "./registration/state";
import { deriveDiagnosticState } from "./services/diagnostics.service";
import {
  heartbeatPayloadSchema,
  type DiagnosticState,
  type HealthStatus,
  type HeartbeatPayload,
} from "./schema";

/**
 * Agency Connector — deployment heartbeat (Phase 5).
 *
 * Periodically publishes a `deployment.heartbeat` event (a compact health
 * report) through the existing outbox/event system, so Agency OS can monitor
 * liveness and derive uptime. It also emits `health.changed` when the deployment
 * transitions between health states.
 *
 * Reuses the event pipeline entirely — no new delivery path. It is opt-in (only
 * runs when the connector is enabled and can deliver), non-blocking, and driven
 * by a single self-terminating, `unref`'d timer (no busy poller). On serverless
 * it may not persist across cold starts — best-effort, like all outbound work.
 */

const log = createLogger("heartbeat");

const DEFAULT_INTERVAL_MS = 300_000; // 5 minutes
const MIN_INTERVAL_MS = 1_000;

let started = false;
let sequence = 0;
let lastHealthStatus: HealthStatus | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

function resolveIntervalMs(): number {
  const raw = Number.parseInt(process.env[ENV.HEARTBEAT_INTERVAL] ?? "", 10);
  if (Number.isFinite(raw) && raw > 0) return Math.max(MIN_INTERVAL_MS, raw);
  return DEFAULT_INTERVAL_MS;
}

/** Map the rich diagnostic state onto the coarse health-status enum. */
function toHealthStatus(state: DiagnosticState): HealthStatus {
  switch (state) {
    case "healthy":
    case "registered":
      return "ok";
    case "degraded":
    case "disconnected":
    case "agency_unreachable":
    case "authentication_failed":
      return "degraded";
    default:
      return "unknown";
  }
}

function buildHeartbeat(): HeartbeatPayload {
  const records = getOutboxSnapshot();
  const uptimeSeconds =
    typeof process !== "undefined" && typeof process.uptime === "function"
      ? Math.max(0, Math.floor(process.uptime()))
      : 0;
  return heartbeatPayloadSchema.parse({
    state: deriveDiagnosticState(),
    uptimeSeconds,
    sequence,
    outbox: {
      pending: records.filter((r) => r.status === "pending").length,
      dead: records.filter((r) => r.status === "dead").length,
    },
    registrationPhase: getRegistrationState().phase,
  });
}

async function tick(): Promise<void> {
  try {
    // Converge on admin edits made in the Business Hub: refresh the settings
    // overlay before reporting, so a paused/renamed deployment reflects within
    // one interval even on a long-lived (warm) process. Best-effort.
    try {
      const { primeConnectorSettings } = await import("./settings.loader");
      await primeConnectorSettings();
    } catch {
      // keep last-known settings
    }
    sequence += 1;
    const heartbeat = buildHeartbeat();
    publishEvent("deployment.heartbeat", heartbeat);

    const healthStatus = toHealthStatus(heartbeat.state);
    if (lastHealthStatus !== null && healthStatus !== lastHealthStatus) {
      publishEvent("health.changed", {
        status: healthStatus,
        previousStatus: lastHealthStatus,
      });
    }
    lastHealthStatus = healthStatus;
  } catch {
    // Heartbeat must never affect the process.
  } finally {
    scheduleNext();
  }
}

function scheduleNext(): void {
  if (!started) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(tick, resolveIntervalMs());
  (timer as unknown as { unref?: () => void }).unref?.();
}

/** Start periodic heartbeats. No-op when disabled/unconfigured or already running. */
export function startHeartbeat(): void {
  if (started) return;
  if (!isConnectorEnabled()) return;
  if (!getEventsConfig().canDeliver) return;
  started = true;
  log.info(`started (interval ${resolveIntervalMs()}ms)`);
  scheduleNext();
}

/** Stop periodic heartbeats. */
export function stopHeartbeat(): void {
  started = false;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}
