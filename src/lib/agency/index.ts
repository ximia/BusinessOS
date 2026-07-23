/**
 * Agency Connector — public surface (barrel).
 *
 * The single entry point for the Agency OS integration. Import from
 * `@/lib/agency`, never from the internal files.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ WHAT THIS IS                                                             │
 * │ The client-side connector that lets a completely separate Agency OS      │
 * │ discover, monitor, and manage this deployment — through authenticated    │
 * │ APIs (read-only) and signed outbound events. It provides identity,       │
 * │ health/version/capabilities, self-registration, an event outbox, and     │
 * │ diagnostics/heartbeat/self-test.                                          │
 * │                                                                          │
 * │ THE INVARIANT                                                            │
 * │ Business OS NEVER depends on Agency OS. Everything here is optional and  │
 * │ fail-safe: disabled or unreachable, Business OS runs exactly the same.   │
 * │ There is no inbound mutating/command surface — Agency OS observes and     │
 * │ addresses; it does not control.                                          │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * Note: event publishing is exposed from `@/lib/agency/events` (`publishEvent`),
 * kept separate so business logic imports only that one function.
 */

import { createAgencyConnector } from "./connector";

/* ── Composition ──────────────────────────────────────────────────────────── */
export { createAgencyConnector } from "./connector";

/**
 * The default, environment-derived connector instance. Construction is
 * side-effect free; reports are computed lazily on each call.
 */
export const agencyConnector = createAgencyConnector();

/* ── Configuration ────────────────────────────────────────────────────────── */
export { getConnectorConfig, isConnectorEnabled } from "./config";
export { ENV, APP_VERSION, SCHEMA_VERSION, CONNECTOR_CONTRACT_VERSION } from "./constants";

/* ── Identity ─────────────────────────────────────────────────────────────── */
export {
  getConnectorIdentity,
  getDeploymentIdentity,
  getOrganizationIdentity,
} from "./identity";

/* ── Services ─────────────────────────────────────────────────────────────── */
export { getHealthReport } from "./services/health.service";
export { getVersionInfo } from "./services/version.service";
export { getCapabilities } from "./services/capabilities.service";
export { getBuildInfo } from "./services/build.service";
export { getDeploymentMetadata } from "./services/metadata.service";
export {
  deriveDiagnosticState,
  getConnectorDiagnostics,
  getStatusReport,
  getSyncState,
  resolveConnectorStatus,
} from "./services/diagnostics.service";
export { runSelfTest } from "./services/self-test.service";

/* ── Connection state ─────────────────────────────────────────────────────── */
export { getConnectionState } from "./connection-state";

/* ── Behavioral interfaces ────────────────────────────────────────────────── */
export type {
  AgencyConnector,
  ConnectorMode,
  ConnectorStatus,
} from "./types";

/* ── Data contracts (Zod-inferred types) ──────────────────────────────────── */
export type {
  BuildInfo,
  Capabilities,
  ConnectionStateReport,
  ConnectorConfig,
  ConnectorDiagnostics,
  ConnectorIdentity,
  ConnectorStatusReport,
  DeploymentEnvironment,
  DeploymentIdentity,
  DeploymentMetadata,
  DiagnosticState,
  HealthReport,
  HealthStatus,
  HeartbeatPayload,
  IntegrationCapabilities,
  ModuleCapability,
  OrganizationIdentity,
  RegistrationStatusReport,
  SelfTestReport,
  StatusReport,
  SyncStateReport,
  VersionInfo,
} from "./schema";

/* ── Zod schemas (for runtime validation at boundaries) ───────────────────── */
export {
  capabilitiesSchema,
  connectorConfigSchema,
  connectorDiagnosticsSchema,
  connectorIdentitySchema,
  deploymentIdentitySchema,
  deploymentMetadataSchema,
  healthReportSchema,
  organizationIdentitySchema,
  selfTestReportSchema,
  statusReportSchema,
  versionInfoSchema,
} from "./schema";
