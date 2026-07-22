import { getConnectorConfig } from "./config";
import { getConnectorIdentity } from "./identity";
import { getCapabilities } from "./services/capabilities.service";
import { getHealthReport } from "./services/health.service";
import { getVersionInfo } from "./services/version.service";
import type { AgencyConnector, ConnectorStatus } from "./types";
import type { ConnectorConfig } from "./schema";

/**
 * Agency Connector — architecture / composition root.
 *
 * Assembles configuration, identity, and the health/version/capabilities
 * services into a single {@link AgencyConnector}. This is the one object the
 * rest of the app would use to introspect the deployment.
 *
 * DORMANCY CONTRACT (Phase 1):
 *  - The connector is ALWAYS in `dormant` mode. It never opens a socket, never
 *    schedules a task, never touches Agency OS.
 *  - Constructing it has no side effects: it captures config and exposes pure
 *    accessors. Reports (health, etc.) are computed on each call, not at build.
 *  - The `enabled` flag is surfaced for future phases, but changing it does NOT
 *    change behavior today. Disabled or enabled, Business OS runs identically.
 *  - Nothing in the running application imports this module yet, so the app
 *    behaves exactly as it did before this code existed.
 */

/** Explain the connector's mode given its configuration. */
function describeStatus(config: ConnectorConfig): ConnectorStatus {
  const reason = config.enabled
    ? "Connector is enabled but dormant: Phase 1 exposes local introspection only (no network, no Agency OS communication)."
    : "Connector is disabled: Business OS runs fully standalone.";
  return { enabled: config.enabled, mode: "dormant", reason };
}

/**
 * Create an {@link AgencyConnector} bound to a configuration (defaults to the
 * environment-derived config). Pass an explicit config for testing.
 */
export function createAgencyConnector(
  config: ConnectorConfig = getConnectorConfig()
): AgencyConnector {
  return {
    enabled: config.enabled,
    getConfig: () => config,
    getStatus: () => describeStatus(config),
    getIdentity: () => getConnectorIdentity(config),
    getHealth: () => getHealthReport(config),
    getVersion: () => getVersionInfo(),
    getCapabilities: () => getCapabilities(),
  };
}
