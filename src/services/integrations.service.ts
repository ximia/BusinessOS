import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { mockIntegrations } from "./mock-data";
import type { Integration } from "@/types/database";
import { getProvider, SECRET_MASK } from "@/features/integrations/catalog";

/**
 * Integrations data access. Reads only through the authenticated server client
 * (RLS restricts this table to staff), so secret keys never reach the public
 * anon key. `getMaskedIntegrations()` additionally strips secret values before
 * anything is handed to a Client Component.
 */
export async function getIntegrations(): Promise<Integration[]> {
  if (!isSupabaseConfigured()) return mockIntegrations;
  const supabase = await createClient();
  const { data, error } = await supabase.from("integrations").select("*");
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** A provider's stored config with all secret fields masked. */
export type MaskedIntegration = Integration;

/**
 * Integrations with secret field values replaced by the mask sentinel, safe to
 * send to the browser. Non-secret values (public IDs, URLs) pass through so the
 * admin can see and edit them.
 */
export async function getMaskedIntegrations(): Promise<MaskedIntegration[]> {
  const rows = await getIntegrations();
  return rows.map((row) => ({ ...row, config: maskConfig(row.provider, row.config) }));
}

/** Replace secret values with the mask sentinel (keeps the key so the UI knows it's set). */
export function maskConfig(
  providerId: string,
  config: Record<string, string>
): Record<string, string> {
  const provider = getProvider(providerId);
  if (!provider) return {};
  const out: Record<string, string> = {};
  for (const field of provider.fields) {
    const value = config[field.key];
    if (value == null || value === "") continue;
    out[field.key] = field.secret ? SECRET_MASK : value;
  }
  return out;
}
