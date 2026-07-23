import { getConnectorConfig } from "../config";
import { getConnectionState } from "../connection-state";
import { getOutboxSnapshot } from "../events";
import { getRegistrationState } from "../registration/state";
import {
  connectorDiagnosticsSchema,
  connectorStatusSchema,
  registrationStatusSchema,
  statusReportSchema,
  syncStateSchema,
  type ConnectorConfig,
  type ConnectorDiagnostics,
  type ConnectorStatusReport,
  type DiagnosticState,
  type StatusReport,
  type SyncStateReport,
} from "../schema";
import { getHealthReport } from "./health.service";

/**
 * Agency Connector — diagnostics service (Phase 5).
 *
 * The deployment's self-knowledge: it derives a single {@link DiagnosticState}
 * and assembles connector status, registration status, synchronization state,
 * and live connection state so Agency OS can monitor and diagnose a deployment
 * without any database access. All computed from local, in-process signals.
 */

/** Consecutive outbound failures (while registered) that mean "disconnected". */
const DISCONNECT_THRESHOLD = 3;
/** Pending outbox depth above which sync is considered "degraded". */
const BACKLOG_THRESHOLD = 50;

function resolveUptimeSeconds(): number {
  if (typeof process !== "undefined" && typeof process.uptime === "function") {
    return Math.max(0, Math.floor(process.uptime()));
  }
  return 0;
}

/** Count outbox records by status. */
function summarizeOutbox() {
  const records = getOutboxSnapshot();
  const summary = {
    pending: 0,
    delivering: 0,
    delivered: 0,
    dead: 0,
    total: records.length,
  };
  for (const record of records) summary[record.status] += 1;
  return summary;
}

/** Connector status (enabled / mode / reason). Kept consistent with connector.ts. */
export function resolveConnectorStatus(
  config: ConnectorConfig = getConnectorConfig()
): ConnectorStatusReport {
  const mode = config.enabled ? "active" : "dormant";
  const reason = config.enabled
    ? "Connector is enabled and communicating with Agency OS (registration, events, and reporting)."
    : "Connector is disabled: Business OS runs fully standalone.";
  return connectorStatusSchema.parse({ enabled: config.enabled, mode, reason });
}

/**
 * Derive the single lifecycle/health state. Priority order:
 * disabled → auth failure → unregistered(/unreachable) → disconnected →
 * degraded → healthy/registered.
 */
export function deriveDiagnosticState(
  config: ConnectorConfig = getConnectorConfig()
): DiagnosticState {
  if (!config.enabled) return "connector_disabled";

  const connection = getConnectionState();
  const registration = getRegistrationState();

  // A hard auth failure is a configuration problem — surface it above all else.
  if (connection.lastOutcome === "auth_failed") return "authentication_failed";

  const registered = registration.phase === "registered";
  if (!registered) {
    if (connection.lastOutcome === "unreachable") return "agency_unreachable";
    return "pending_registration";
  }

  // Registered: assess ongoing sync health.
  if (connection.consecutiveFailures >= DISCONNECT_THRESHOLD) {
    return "disconnected";
  }
  const outbox = summarizeOutbox();
  if (
    outbox.dead > 0 ||
    connection.consecutiveFailures > 0 ||
    outbox.pending > BACKLOG_THRESHOLD
  ) {
    return "degraded";
  }
  return connection.lastOkAt ? "healthy" : "registered";
}

/** Synchronization state — outbox depth + last-contact summary. */
export function getSyncState(): SyncStateReport {
  const connection = getConnectionState();
  return syncStateSchema.parse({
    outbox: summarizeOutbox(),
    lastOkAt: connection.lastOkAt,
    lastContactAt: connection.lastContactAt,
    lastOutcome: connection.lastOutcome,
  });
}

/** Full diagnostics bundle (the diagnostics detail view). */
export function getConnectorDiagnostics(
  config: ConnectorConfig = getConnectorConfig()
): ConnectorDiagnostics {
  return connectorDiagnosticsSchema.parse({
    state: deriveDiagnosticState(config),
    connector: resolveConnectorStatus(config),
    registration: registrationStatusSchema.parse(getRegistrationState()),
    synchronization: getSyncState(),
    connection: getConnectionState(),
    health: getHealthReport(config),
    generatedAt: new Date().toISOString(),
  });
}

/** Compact status projection (frequent monitoring polls). */
export function getStatusReport(
  config: ConnectorConfig = getConnectorConfig()
): StatusReport {
  const connection = getConnectionState();
  return statusReportSchema.parse({
    state: deriveDiagnosticState(config),
    connector: resolveConnectorStatus(config),
    registrationPhase: getRegistrationState().phase,
    lastContactAt: connection.lastContactAt,
    uptimeSeconds: resolveUptimeSeconds(),
    generatedAt: new Date().toISOString(),
  });
}
