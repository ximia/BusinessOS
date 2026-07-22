import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { getConnectorConfig } from "../config";
import { getConnectorIdentity } from "../identity";
import {
  healthReportSchema,
  type ConnectorConfig,
  type HealthReport,
} from "../schema";

/**
 * Agency Connector — health service.
 *
 * Produces a point-in-time health report from purely local, in-process signals.
 * This is the "heartbeat" a future Agency OS would poll to monitor a fleet — but
 * in Phase 1 it is only computed on demand and returned in-process.
 *
 * IMPORTANT (Phase 1 dormancy): this performs NO network I/O. It does not ping
 * the database or Agency OS. The `database` check reflects whether Supabase
 * credentials are *configured* (a local env check), not whether the database is
 * *reachable* — reachability requires a network call, which a later phase adds.
 */

/** Process uptime in whole seconds; 0 when unavailable (e.g. edge runtime). */
function resolveUptimeSeconds(): number {
  if (typeof process !== "undefined" && typeof process.uptime === "function") {
    return Math.max(0, Math.floor(process.uptime()));
  }
  return 0;
}

/** Build a health report for this deployment. */
export function getHealthReport(
  config: ConnectorConfig = getConnectorConfig()
): HealthReport {
  const identity = getConnectorIdentity(config);

  return healthReportSchema.parse({
    // Local signals only ⇒ we can affirm "ok"; degradation detection that
    // needs a live probe is deferred to a later, non-dormant phase.
    status: "ok",
    connectorEnabled: config.enabled,
    deploymentId: identity.deployment.id,
    organizationId: identity.organization.id,
    generatedAt: new Date().toISOString(),
    uptimeSeconds: resolveUptimeSeconds(),
    checks: {
      database: isSupabaseConfigured() ? "configured" : "not_configured",
    },
  });
}
