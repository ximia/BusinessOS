"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { primeConnectorSettings } from "@/lib/agency/settings.loader";
import { connectorConnectionSchema } from "./connection.schema";

export type ConnectionActionState = {
  ok: boolean;
  message: string;
};

/**
 * Persist the connector connection settings for this deployment.
 *
 * Auth-guarded when Supabase is configured; a friendly no-op in demo mode. After
 * saving it re-primes the in-process overlay and re-announces to Agency OS
 * (register + heartbeat) so the change takes effect immediately — no redeploy.
 * Only non-secret fields are written; keys/base URL stay in env.
 */
export async function updateConnectorConnection(
  values: unknown
): Promise<ConnectionActionState> {
  const parsed = connectorConnectionSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields." };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: true,
      message:
        "Saved locally (demo mode). Connect Supabase to persist and connect to Agency OS.",
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, message: "You must be signed in." };

    const v = parsed.data;
    const { error } = await supabase.from("agency_connector_settings").upsert(
      {
        id: "default",
        enabled: v.enabled,
        deployment_id: v.deploymentId?.trim() || null,
        organization_id: v.organizationId?.trim() || null,
        organization_slug: v.organizationSlug?.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    if (error) throw error;

    // Reflect immediately in this process, then act on the new state.
    await primeConnectorSettings();
    try {
      const { register } = await import("@/lib/agency/registration");
      const { startHeartbeat, stopHeartbeat } = await import("@/lib/agency/heartbeat");
      if (v.enabled) {
        void register(); // re-announce with the new identity (idempotent)
        startHeartbeat(); // idempotent; starts if newly enabled + deliverable
      } else {
        stopHeartbeat();
      }
    } catch {
      // Re-announcing is best-effort; the saved settings still stand.
    }

    revalidatePath("/admin/agency");
    return {
      ok: true,
      message: v.enabled
        ? "Connection saved. This deployment will report to Agency OS."
        : "Connection saved. This deployment is paused (not reporting).",
    };
  } catch (err) {
    console.error("[agency-connection] save failed", err);
    return { ok: false, message: "Couldn't save. Please try again." };
  }
}
