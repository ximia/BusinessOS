import {
  APP_VERSION,
  CONNECTOR_CONTRACT_VERSION,
  SCHEMA_VERSION,
} from "../constants";
import { versionInfoSchema, type VersionInfo } from "../schema";

/**
 * Agency Connector — version service.
 *
 * Reports what this deployment *is*: application version, database schema
 * version, and connector contract version. In a fleet of thousands of
 * independent clones running different versions simultaneously, this is how a
 * future Agency OS knows what it is talking to before it acts (and which
 * deployments need upgrading).
 *
 * PHASE 1 (dormant): computed from local constants only; never transmitted.
 */

/** Best-effort, local runtime descriptor. No I/O. */
function resolveRuntime(): string {
  if (typeof process !== "undefined" && process.version) {
    return `node ${process.version}`;
  }
  return "unknown";
}

/** Build the version info for this deployment. */
export function getVersionInfo(): VersionInfo {
  return versionInfoSchema.parse({
    app: APP_VERSION,
    schema: SCHEMA_VERSION,
    connectorContract: CONNECTOR_CONTRACT_VERSION,
    runtime: resolveRuntime(),
  });
}
