import { getConnectorConfig } from "../config";
import { ENV } from "../constants";
import { joinUrl } from "../url";

/**
 * Agency events — delivery configuration.
 *
 * Resolves whether events CAN be delivered and, if so, where and with what
 * credential. Reuses the outbound key from Phase 3. Any missing prerequisite
 * yields `canDeliver: false` with a `skipReason` (events still queue safely).
 * The outbound key stays internal to the events module.
 */

export const DEFAULT_EVENTS_PATH = "/api/v1/events";

/** Retry policy for event delivery (per-event, across dispatcher cycles). */
export const EVENT_RETRY_POLICY = {
  maxAttempts: 6,
  baseDelayMs: 1000,
  maxDelayMs: 60000,
} as const;

export const EVENT_REQUEST_TIMEOUT_MS = 10000;

export interface EventsConfig {
  canDeliver: boolean;
  skipReason: string | null;
  endpointUrl: string | null;
  outboundKey: string | null;
}

function skip(reason: string): EventsConfig {
  return {
    canDeliver: false,
    skipReason: reason,
    endpointUrl: null,
    outboundKey: null,
  };
}

export function getEventsConfig(): EventsConfig {
  const connector = getConnectorConfig();

  if (!connector.enabled) return skip("connector disabled");
  if (!connector.agencyBaseUrl) return skip("AGENCY_OS_BASE_URL not set");

  const outboundKey = process.env[ENV.OUTBOUND_API_KEY]?.trim() || null;
  if (!outboundKey) return skip("AGENCY_OUTBOUND_API_KEY not set");

  const path = process.env[ENV.EVENTS_PATH]?.trim() || DEFAULT_EVENTS_PATH;

  return {
    canDeliver: true,
    skipReason: null,
    endpointUrl: joinUrl(connector.agencyBaseUrl, path),
    outboundKey,
  };
}
