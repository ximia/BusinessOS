/**
 * Agency Connector — public surface (barrel).
 *
 * The single entry point for the (currently dormant) Agency OS integration
 * foundation. Import from `@/lib/agency`, never from the internal files.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ WHAT THIS IS                                                             │
 * │ Phase 1 scaffolding that prepares Business OS to be *observed and        │
 * │ addressed* by a future, completely separate Agency OS — without adding   │
 * │ any dependency on it. It provides deployment/organization identity and   │
 * │ local health, version, and capability introspection.                     │
 * │                                                                          │
 * │ WHAT THIS IS NOT (by design, Phase 1)                                    │
 * │ No network requests. No APIs or route handlers. No webhooks. No          │
 * │ registration. No synchronization. No event publishing. The connector is  │
 * │ dormant and nothing in the app imports it, so Business OS behaves         │
 * │ exactly as it did before.                                                │
 * │                                                                          │
 * │ HOW IT WILL BE USED LATER                                                │
 * │ Future phases build the API layer, event pipeline, and auth *on top of*  │
 * │ these primitives — flipping capability flags on one at a time — while     │
 * │ this contract stays stable. Independence remains the invariant: the      │
 * │ connector may emit and answer, but Business OS must never require Agency  │
 * │ OS to function.                                                          │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

import { createAgencyConnector } from "./connector";

/* ── Composition ──────────────────────────────────────────────────────────── */
export { createAgencyConnector } from "./connector";

/**
 * The default, environment-derived connector instance. Dormant in Phase 1.
 * Construction is side-effect free; reports are computed lazily on each call.
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

/* ── Behavioral interfaces ────────────────────────────────────────────────── */
export type {
  AgencyConnector,
  ConnectorMode,
  ConnectorStatus,
} from "./types";

/* ── Data contracts (Zod-inferred types) ──────────────────────────────────── */
export type {
  Capabilities,
  ConnectorConfig,
  ConnectorIdentity,
  DeploymentEnvironment,
  DeploymentIdentity,
  HealthReport,
  HealthStatus,
  IntegrationCapabilities,
  ModuleCapability,
  OrganizationIdentity,
  VersionInfo,
} from "./schema";

/* ── Zod schemas (for runtime validation at future boundaries) ────────────── */
export {
  capabilitiesSchema,
  connectorConfigSchema,
  connectorIdentitySchema,
  deploymentIdentitySchema,
  healthReportSchema,
  organizationIdentitySchema,
  versionInfoSchema,
} from "./schema";
