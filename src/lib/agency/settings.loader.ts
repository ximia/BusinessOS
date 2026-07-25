import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { createLogger } from "./log";
import {
  setConnectorOverlay,
  type StoredConnectorSettings,
} from "./settings";

/**
 * Agency Connector — stored settings loader (async, Node-only).
 *
 * Reads the single `agency_connector_settings` row with the service-role client
 * (the table has no anon policy — operational config is never public) and primes
 * the sync overlay cache in `settings.ts`. Every read is best-effort and fail-
 * safe: any error leaves the overlay untouched, so the connector simply falls
 * back to environment variables. Never throws.
 */

const log = createLogger("settings");

const SETTINGS_ROW_ID = "default";

/** Read the stored overlay (or null when unset / unavailable). Never throws. */
export async function loadStoredConnectorSettings(): Promise<StoredConnectorSettings | null> {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
    const { data, error } = await supabase
      .from("agency_connector_settings")
      .select("enabled, deployment_id, organization_id, organization_slug")
      .eq("id", SETTINGS_ROW_ID)
      .maybeSingle();

    if (error || !data) return null;
    return {
      enabled: data.enabled ?? null,
      deploymentId: data.deployment_id ?? null,
      organizationId: data.organization_id ?? null,
      organizationSlug: data.organization_slug ?? null,
    };
  } catch (err) {
    log.warn(
      `could not load connector settings — ${err instanceof Error ? err.message : "unknown"}`
    );
    return null;
  }
}

/**
 * Refresh the sync overlay cache from the database. Called at startup, after a
 * save, and on each heartbeat tick so warm processes converge on admin edits.
 */
export async function primeConnectorSettings(): Promise<void> {
  setConnectorOverlay(await loadStoredConnectorSettings());
}
