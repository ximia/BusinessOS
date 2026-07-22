/**
 * Agency Connector — static constants.
 *
 * These describe *what this Business OS deployment is* so that a future Agency
 * OS can reason about a fleet of deployments running different versions. Nothing
 * here performs I/O; these are compile-time values only.
 *
 * PHASE 1 (dormant): defined and readable, but never transmitted anywhere.
 */

/**
 * The version of the Business OS application. Keep in sync with `package.json`.
 * The future `/version` surface reports this so Agency OS can target upgrades
 * across many deployments running simultaneously.
 */
export const APP_VERSION = "1.0.0";

/**
 * Monotonic database schema version. Corresponds to the highest-numbered file
 * in `supabase/migrations/` (currently `0002_business_settings.sql`). Bump this
 * whenever a new migration ships. Lets Agency OS know a deployment's schema
 * shape without ever touching its database.
 */
export const SCHEMA_VERSION = 2;

/**
 * The version of the *connector contract* — the shape of the health, version,
 * capabilities, and identity payloads defined in this module. Independent from
 * {@link APP_VERSION} so the wire format can evolve separately from the app.
 * Agency OS uses this to know how to parse what a deployment reports.
 */
export const CONNECTOR_CONTRACT_VERSION = "1";

/**
 * Environment variable names the connector reads. Centralized so the contract
 * is documented in one place. All are OPTIONAL — absence keeps the connector
 * dormant and the app fully standalone.
 */
export const ENV = {
  /** Master switch. Falsy/unset ⇒ connector dormant. */
  ENABLED: "AGENCY_OS_ENABLED",
  /** Where Agency OS lives. Stored but UNUSED in Phase 1 (no network). */
  BASE_URL: "AGENCY_OS_BASE_URL",
  /** Stable identity of THIS deployment (the clone). */
  DEPLOYMENT_ID: "BUSINESS_OS_DEPLOYMENT_ID",
  /** Deployment environment override (production | preview | development). */
  ENVIRONMENT: "AGENCY_OS_ENVIRONMENT",
  /** Stable identity of the business/organization this deployment serves. */
  ORG_ID: "BUSINESS_OS_ORG_ID",
  /** Human-friendly organization slug. */
  ORG_SLUG: "BUSINESS_OS_ORG_SLUG",
  /**
   * Shared secret Agency OS must present to call the read-only Agency API
   * (Phase 2). Read ONLY by the API auth module and never placed into
   * `ConnectorConfig`, so it can never leak through the connector's surface.
   */
  INBOUND_API_KEY: "AGENCY_INBOUND_API_KEY",
  /**
   * Shared secret Business OS presents to Agency OS when registering itself
   * (Phase 3, outbound). Server-only; read ONLY by the registration module and
   * never placed into `ConnectorConfig`.
   */
  OUTBOUND_API_KEY: "AGENCY_OUTBOUND_API_KEY",
  /**
   * Optional override for the Agency OS registration endpoint path. Defaults to
   * `DEFAULT_REGISTER_PATH` in the registration config.
   */
  REGISTER_PATH: "AGENCY_OS_REGISTER_PATH",
  /**
   * Optional override for the Agency OS event-ingest endpoint path. Defaults to
   * `DEFAULT_EVENTS_PATH` in the events config.
   */
  EVENTS_PATH: "AGENCY_OS_EVENTS_PATH",
} as const;
