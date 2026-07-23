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
 * rest of the app uses to introspect the deployment.
 *
 * CONTRACT:
 *  - Constructing it has no side effects: it captures config and exposes pure
 *    accessors. Reports (health, etc.) are computed on each call, not at build.
 *  - `mode` is `active` when the connector is enabled (it registers, emits
 *    events, and reports), else `dormant`. When disabled, Business OS runs
 *    identically to a build without the connector.
 */

/** Explain the connector's mode given its configuration. */
function describeStatus(config: ConnectorConfig): ConnectorStatus {
  const reason = config.enabled
    ? "Connector is enabled and communicating with Agency OS (registration, events, and reporting)."
    : "Connector is disabled: Business OS runs fully standalone.";
  return {
    enabled: config.enabled,
    mode: config.enabled ? "active" : "dormant",
    reason,
  };
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
