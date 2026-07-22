import { getConnectorConfig } from "../config";
import { ENV } from "../constants";

/**
 * Agency registration — configuration.
 *
 * Resolves whether this deployment CAN attempt registration and, if so, where
 * to send it and with what credential. Registration is opt-in and fail-safe:
 * any missing prerequisite yields `canAttempt: false` with a human `skipReason`,
 * never an error.
 *
 * The outbound API key is read directly from the environment here and is NEVER
 * placed into `ConnectorConfig`, so it cannot leak through the connector's
 * public surface.
 */

/** Default Agency OS registration endpoint path (override via env). */
export const DEFAULT_REGISTER_PATH = "/api/v1/deployments/register";

/** Retry policy for the registration call. */
export const RETRY_POLICY = {
  maxAttempts: 4,
  baseDelayMs: 2000,
  maxDelayMs: 30000,
} as const;

/** Abort the request if Agency OS does not respond within this window. */
export const REQUEST_TIMEOUT_MS = 10000;

export interface RegistrationConfig {
  canAttempt: boolean;
  skipReason: string | null;
  endpointUrl: string | null;
  /** Server-only; internal to the registration module. */
  outboundKey: string | null;
}

function skip(reason: string): RegistrationConfig {
  return {
    canAttempt: false,
    skipReason: reason,
    endpointUrl: null,
    outboundKey: null,
  };
}

function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

export function getRegistrationConfig(): RegistrationConfig {
  const connector = getConnectorConfig();

  if (!connector.enabled) return skip("connector disabled");
  if (!connector.agencyBaseUrl) return skip("AGENCY_OS_BASE_URL not set");
  if (!connector.deploymentId) return skip("BUSINESS_OS_DEPLOYMENT_ID not set");

  const outboundKey = process.env[ENV.OUTBOUND_API_KEY]?.trim() || null;
  if (!outboundKey) return skip("AGENCY_OUTBOUND_API_KEY not set");

  const path = process.env[ENV.REGISTER_PATH]?.trim() || DEFAULT_REGISTER_PATH;

  return {
    canAttempt: true,
    skipReason: null,
    endpointUrl: joinUrl(connector.agencyBaseUrl, path),
    outboundKey,
  };
}
