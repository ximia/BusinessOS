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

    if (!v.enabled) {
      try {
        const { stopHeartbeat } = await import("@/lib/agency/heartbeat");
        stopHeartbeat();
      } catch {
        /* best-effort */
      }
      revalidatePath("/admin/agency");
      return { ok: true, message: "Saved. Reporting is off — this site is hidden from Agency OS." };
    }

    // AWAIT registration so it actually completes inside this request. On
    // serverless (Vercel) a fire-and-forget register() is killed when the
    // function freezes, which is why background check-ins are unreliable there.
    // Doing it here means clicking Save reliably announces the deployment.
    try {
      const { register } = await import("@/lib/agency/registration");
      const { startHeartbeat } = await import("@/lib/agency/heartbeat");
      const state = await register();
      startHeartbeat(); // best-effort periodic beat while the instance is warm

      revalidatePath("/admin/agency");
      if (state.phase === "registered") {
        return { ok: true, message: "Connected — registered with Agency OS." };
      }
      if (state.phase === "failed") {
        return {
          ok: true,
          message: `Saved, but couldn't reach Agency OS${state.lastError ? `: ${state.lastError}` : ""}. Check the keys match, then save again.`,
        };
      }
      return {
        ok: true,
        message: `Saved, but reporting isn't fully configured${state.skipReason ? `: ${state.skipReason}` : ""}.`,
      };
    } catch (regErr) {
      revalidatePath("/admin/agency");
      return {
        ok: true,
        message: `Saved. Registration attempt errored${regErr instanceof Error ? `: ${regErr.message}` : ""}.`,
      };
    }
  } catch (err) {
    console.error("[agency-connection] save failed", err);
    return { ok: false, message: "Couldn't save. Please try again." };
  }
}
