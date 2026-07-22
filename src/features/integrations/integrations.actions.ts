"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { getProvider, SECRET_MASK } from "./catalog";

/**
 * Integration write-actions (Priority 7). Auth-guarded; secrets are handled
 * carefully:
 *  - Incoming secret values that are blank or still the mask sentinel are
 *    treated as "unchanged" and the previously stored value is preserved.
 *  - Only staff (authenticated) can write; the table has no anon policy.
 * Demo mode is a friendly no-op so the admin is explorable out of the box.
 */

export type IntegrationActionState = { ok: boolean; message: string };

async function requireAuth(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? null : "You must be signed in.";
}

/**
 * Save (upsert) a provider's config + enabled flag. Merges secret fields so a
 * blank/masked secret never wipes the stored credential.
 */
export async function saveIntegration(
  providerId: string,
  values: { enabled: boolean; config: Record<string, string> }
): Promise<IntegrationActionState> {
  const provider = getProvider(providerId);
  if (!provider) return { ok: false, message: "Unknown integration." };

  if (!isSupabaseConfigured()) {
    return { ok: true, message: `${provider.name} saved locally (demo mode).` };
  }

  const authError = await requireAuth();
  if (authError) return { ok: false, message: authError };

  try {
    const supabase = await createClient();

    // Load existing config so we can preserve unchanged secrets.
    const { data: existing } = await supabase
      .from("integrations")
      .select("config")
      .eq("provider", providerId)
      .maybeSingle();
    const prev = (existing?.config as Record<string, string> | undefined) ?? {};

    const config: Record<string, string> = {};
    for (const field of provider.fields) {
      const incoming = (values.config[field.key] ?? "").trim();
      if (field.secret) {
        // Keep the stored secret when the input is blank or the mask sentinel.
        const keep = incoming === "" || incoming === SECRET_MASK;
        const value = keep ? prev[field.key] ?? "" : incoming;
        if (value) config[field.key] = value;
      } else if (incoming) {
        config[field.key] = incoming;
      }
    }

    // Required-field validation (a preserved secret counts as present).
    const missing = provider.fields
      .filter((f) => f.required && !config[f.key])
      .map((f) => f.label);
    if (missing.length) {
      return { ok: false, message: `Please fill in: ${missing.join(", ")}.` };
    }

    const { error } = await supabase.from("integrations").upsert(
      {
        provider: providerId,
        enabled: values.enabled,
        config,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "provider" }
    );
    if (error) throw error;

    revalidatePath("/admin/integrations");
    return { ok: true, message: `${provider.name} saved.` };
  } catch (err) {
    console.error("[integrations] save failed", err);
    return { ok: false, message: "Couldn't save. Please try again." };
  }
}

/** Toggle a connected provider on/off without editing its config. */
export async function setIntegrationEnabled(
  providerId: string,
  enabled: boolean
): Promise<IntegrationActionState> {
  const provider = getProvider(providerId);
  if (!provider) return { ok: false, message: "Unknown integration." };
  if (!isSupabaseConfigured()) {
    return { ok: true, message: `${provider.name} ${enabled ? "enabled" : "disabled"} (demo mode).` };
  }
  const authError = await requireAuth();
  if (authError) return { ok: false, message: authError };
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("integrations")
      .update({ enabled })
      .eq("provider", providerId);
    if (error) throw error;
    revalidatePath("/admin/integrations");
    return { ok: true, message: `${provider.name} ${enabled ? "enabled" : "disabled"}.` };
  } catch (err) {
    console.error("[integrations] toggle failed", err);
    return { ok: false, message: "Couldn't update. Please try again." };
  }
}

/** Remove a provider's stored config entirely. */
export async function disconnectIntegration(
  providerId: string
): Promise<IntegrationActionState> {
  const provider = getProvider(providerId);
  if (!provider) return { ok: false, message: "Unknown integration." };
  if (!isSupabaseConfigured()) {
    return { ok: true, message: `${provider.name} disconnected (demo mode).` };
  }
  const authError = await requireAuth();
  if (authError) return { ok: false, message: authError };
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("integrations")
      .delete()
      .eq("provider", providerId);
    if (error) throw error;
    revalidatePath("/admin/integrations");
    return { ok: true, message: `${provider.name} disconnected.` };
  } catch (err) {
    console.error("[integrations] disconnect failed", err);
    return { ok: false, message: "Couldn't disconnect. Please try again." };
  }
}
