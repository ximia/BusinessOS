import { z } from "zod";

/**
 * Agency Connector — data contracts (Zod).
 *
 * Every shape that could later cross the Business OS ⇄ Agency OS boundary is
 * defined here as a Zod schema, so it is both a compile-time type and a runtime
 * validator. Behavioral interfaces (the connector itself) live in `types.ts`.
 *
 * PHASE 1 (dormant): these validate local, in-process values only. Nothing is
 * ever sent or received over a network.
 */

/* ─────────────────────────── Environment / config ────────────────────────── */

/** Deployment environments a clone can run in. */
export const deploymentEnvironmentSchema = z.enum([
  "production",
  "preview",
  "development",
  "unknown",
]);
export type DeploymentEnvironment = z.infer<typeof deploymentEnvironmentSchema>;

/**
 * Coerces an environment-variable value (always a string or undefined) into a
 * boolean. Unset ⇒ false, keeping the connector dormant by default.
 */
const envBoolean = z.preprocess((value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
  }
  return false;
}, z.boolean());

/** Organization (the business this deployment serves) identity, from config. */
export const organizationConfigSchema = z.object({
  id: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
});

/**
 * The connector's effective configuration. Assembled from environment variables
 * (see `constants.ts` → ENV) and validated. All fields are optional/defaulted so
 * a fresh clone with no configuration parses cleanly into a dormant connector.
 */
export const connectorConfigSchema = z.object({
  /** Master switch. When false the connector does nothing (Phase 1: always). */
  enabled: envBoolean.default(false),
  /** Agency OS base URL. Stored for later; UNUSED in Phase 1 (no network). */
  agencyBaseUrl: z.string().url().optional(),
  /** Stable identity of this deployment (the clone). */
  deploymentId: z.string().min(1).optional(),
  /** Where this deployment runs. */
  environment: deploymentEnvironmentSchema.default("unknown"),
  /** The organization/business this deployment serves. */
  organization: organizationConfigSchema.default({}),
});
export type ConnectorConfig = z.infer<typeof connectorConfigSchema>;

/* ──────────────────────────────── Identity ───────────────────────────────── */

/** Identity of THIS deployment (the running clone). */
export const deploymentIdentitySchema = z.object({
  /** Stable id, or null when the deployment has not been given one. */
  id: z.string().min(1).nullable(),
  /** True when a deployment id is present. */
  identified: z.boolean(),
  /** Environment the deployment runs in. */
  environment: deploymentEnvironmentSchema,
});
export type DeploymentIdentity = z.infer<typeof deploymentIdentitySchema>;

/** Identity of the organization/business the deployment serves. */
export const organizationIdentitySchema = z.object({
  /** Stable org id (maps to the reserved `org_id` column), or null. */
  id: z.string().min(1).nullable(),
  /** Human-friendly slug, or null. */
  slug: z.string().min(1).nullable(),
  /** True when an org id is present. */
  identified: z.boolean(),
});
export type OrganizationIdentity = z.infer<typeof organizationIdentitySchema>;

/** The combined identity a future Agency OS would use to address a deployment. */
export const connectorIdentitySchema = z.object({
  deployment: deploymentIdentitySchema,
  organization: organizationIdentitySchema,
});
export type ConnectorIdentity = z.infer<typeof connectorIdentitySchema>;

/* ───────────────────────────────── Health ────────────────────────────────── */

export const healthStatusSchema = z.enum(["ok", "degraded", "unknown"]);
export type HealthStatus = z.infer<typeof healthStatusSchema>;

/**
 * A point-in-time health report built entirely from local, in-process signals.
 * Phase 1 never checks a remote dependency — `database` reflects whether
 * credentials are configured, not whether the DB is reachable.
 */
export const healthReportSchema = z.object({
  status: healthStatusSchema,
  /** Whether the connector is switched on (Phase 1: has no behavioral effect). */
  connectorEnabled: z.boolean(),
  deploymentId: z.string().min(1).nullable(),
  organizationId: z.string().min(1).nullable(),
  /** ISO-8601 timestamp the report was generated. */
  generatedAt: z.string().datetime(),
  /** Process uptime in whole seconds (0 when unavailable). */
  uptimeSeconds: z.number().int().nonnegative(),
  checks: z.object({
    /** Local signal only — presence of Supabase credentials. */
    database: z.enum(["configured", "not_configured"]),
  }),
});
export type HealthReport = z.infer<typeof healthReportSchema>;

/* ───────────────────────────────── Version ───────────────────────────────── */

/** What this deployment *is*, for fleet/version awareness. */
export const versionInfoSchema = z.object({
  /** Business OS application version (semver). */
  app: z.string().min(1),
  /** Database schema version (highest applied migration). */
  schema: z.number().int().nonnegative(),
  /** Connector wire-contract version. */
  connectorContract: z.string().min(1),
  /** Runtime descriptor (e.g. node version), best-effort and local. */
  runtime: z.string().min(1),
});
export type VersionInfo = z.infer<typeof versionInfoSchema>;

/* ────────────────────────────── Capabilities ─────────────────────────────── */

/** A product module present in this deployment. */
export const moduleCapabilitySchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  /** Whether the module is available in this deployment. */
  available: z.boolean(),
});
export type ModuleCapability = z.infer<typeof moduleCapabilitySchema>;

/**
 * Integration capabilities — what this deployment can do *with Agency OS*.
 * Every flag is `false` in Phase 1: the primitives are described but none are
 * wired. This is the negotiation surface a later phase flips on, feature by
 * feature, without changing the contract shape.
 */
export const integrationCapabilitiesSchema = z.object({
  registration: z.boolean(),
  eventPublishing: z.boolean(),
  inboundWebhooks: z.boolean(),
  metricsReporting: z.boolean(),
  remoteConfig: z.boolean(),
});
export type IntegrationCapabilities = z.infer<
  typeof integrationCapabilitiesSchema
>;

/** The full capability descriptor a future Agency OS would read. */
export const capabilitiesSchema = z.object({
  contractVersion: z.string().min(1),
  modules: z.array(moduleCapabilitySchema),
  integration: integrationCapabilitiesSchema,
});
export type Capabilities = z.infer<typeof capabilitiesSchema>;
