import { ENV } from "./constants";
import { autoDeriveDeploymentId, getConnectorOverlay } from "./settings";
import {
  connectorConfigSchema,
  type ConnectorConfig,
  type DeploymentEnvironment,
} from "./schema";

/**
 * Agency Connector — configuration.
 *
 * Reads the connector's settings from environment variables and validates them
 * with Zod. This is the module's trust boundary: raw `process.env` in, a typed
 * {@link ConnectorConfig} out.
 *
 * Design guarantees (Phase 1):
 *  - Pure and side-effect free — reads env, allocates an object, returns it.
 *  - NEVER throws. Invalid or absent configuration collapses to a safe, dormant
 *    default so a fresh clone behaves exactly as it does today.
 *  - No network, no I/O, no dependency on Agency OS existing.
 */

/** The safe fallback: a fully dormant, unidentified connector. */
const DORMANT_CONFIG: ConnectorConfig = {
  enabled: false,
  agencyBaseUrl: undefined,
  deploymentId: undefined,
  environment: "unknown",
  organization: {},
};

/**
 * Best-effort mapping of the host platform's environment to our own enum.
 * Prefers an explicit override, then Vercel's `VERCEL_ENV`, then `NODE_ENV`.
 */
function resolveEnvironment(): DeploymentEnvironment {
  const explicit = process.env[ENV.ENVIRONMENT]?.trim().toLowerCase();
  const platform = (
    process.env.VERCEL_ENV ??
    process.env.NODE_ENV ??
    ""
  )
    .trim()
    .toLowerCase();
  const value = explicit || platform;

  switch (value) {
    case "production":
      return "production";
    case "preview":
      return "preview";
    case "development":
    case "test":
      return "development";
    default:
      return "unknown";
  }
}

/**
 * Assemble and validate the connector configuration from the environment.
 *
 * @returns a validated {@link ConnectorConfig}; the dormant default if the
 *          environment is empty or fails validation.
 */
export function getConnectorConfig(): ConnectorConfig {
  // Admin-editable overlay (from the Business Hub) takes precedence over env;
  // env is the fleet-wide default; identity auto-derives when neither is set.
  // NULL overlay fields inherit — note `false ?? x === false`, so an admin who
  // switches the connector OFF is respected over an env `enabled=true`.
  const overlay = getConnectorOverlay();

  const raw = {
    enabled: overlay?.enabled ?? process.env[ENV.ENABLED],
    // Shared, fleet-wide, and secret-adjacent: always env, never overlaid.
    agencyBaseUrl: process.env[ENV.BASE_URL] || undefined,
    deploymentId:
      overlay?.deploymentId ||
      process.env[ENV.DEPLOYMENT_ID] ||
      autoDeriveDeploymentId(),
    environment: resolveEnvironment(),
    organization: {
      id: overlay?.organizationId || process.env[ENV.ORG_ID] || undefined,
      slug: overlay?.organizationSlug || process.env[ENV.ORG_SLUG] || undefined,
    },
  };

  const parsed = connectorConfigSchema.safeParse(raw);
  return parsed.success ? parsed.data : DORMANT_CONFIG;
}

/**
 * Whether the connector is switched on. Convenience for guard clauses. Note:
 * even when `true`, the Phase 1 connector remains dormant (introspection only).
 */
export function isConnectorEnabled(): boolean {
  return getConnectorConfig().enabled;
}
