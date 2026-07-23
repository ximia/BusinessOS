/**
 * Agency Connector — behavioral interfaces.
 *
 * Data *shapes* live in `schema.ts` (Zod). This file defines the *contracts* —
 * the interfaces a consumer programs against — plus the status types that
 * describe the connector's operating mode. Keeping behavior here and data in
 * `schema.ts` means the wire format and the object model evolve independently.
 *
 * PHASE 1 (dormant): the connector exposes read-only introspection only. There
 * is intentionally NO `publish`, `register`, `sync`, or `send` method — those
 * belong to later phases and would imply outbound communication.
 */

import type {
  Capabilities,
  ConnectorConfig,
  ConnectorIdentity,
  HealthReport,
  VersionInfo,
} from "./schema";

/** The connector's operating mode: `active` when enabled, else `dormant`. */
export type ConnectorMode = "dormant" | "active";

/** A snapshot describing whether/how the connector is operating. */
export interface ConnectorStatus {
  /** Reflects the `AGENCY_OS_ENABLED` switch. */
  enabled: boolean;
  /** `active` when the connector communicates with Agency OS, else `dormant`. */
  mode: ConnectorMode;
  /** Human-readable explanation of why the connector is in this mode. */
  reason: string;
}

/**
 * The public surface of the Agency Connector.
 *
 * Every method is synchronous, pure, and local — it reads in-process state and
 * returns a value. None performs I/O, and none ever will in Phase 1. This is
 * the single object the rest of the app (and, later, an API route) would use to
 * introspect the deployment.
 */
export interface AgencyConnector {
  /** Whether the connector is switched on. Dormant regardless in Phase 1. */
  readonly enabled: boolean;
  /** The effective, validated configuration. */
  getConfig(): ConnectorConfig;
  /** Operating-mode snapshot. */
  getStatus(): ConnectorStatus;
  /** Deployment + organization identity. */
  getIdentity(): ConnectorIdentity;
  /** Local health report (see health service). */
  getHealth(): HealthReport;
  /** Version / fleet-awareness info (see version service). */
  getVersion(): VersionInfo;
  /** Capability descriptor (see capabilities service). */
  getCapabilities(): Capabilities;
}
