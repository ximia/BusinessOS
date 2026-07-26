import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { MAINTENANCE_CACHE_TAG } from "@/features/agency-connection/maintenance";
import { primeConnectorSettings } from "./settings.loader";
import { runSelfTest } from "./services/self-test.service";
import { createLogger } from "./log";

/**
 * Agency command channel — the whitelisted actions Agency OS can trigger on this
 * deployment. This is the ONE inbound *mutating* surface (everything else is
 * read-only). Every command is small, explicit, reversible, and authenticated by
 * the caller (see the route). Nothing here accepts arbitrary code or SQL.
 */

const log = createLogger("commands");

export const AGENCY_COMMANDS = [
  "ping",
  "connector.pause",
  "connector.resume",
  "cache.revalidate",
  "self-test",
  "maintenance.on",
  "maintenance.off",
] as const;
export type AgencyCommand = (typeof AGENCY_COMMANDS)[number];

export type CommandResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string };

function serviceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

/** Upsert non-secret fields on the connector settings row. */
async function patchSettings(patch: Record<string, unknown>): Promise<void> {
  const { error } = await serviceClient()
    .from("agency_connector_settings")
    .upsert(
      { id: "default", ...patch, updated_at: new Date().toISOString() },
      { onConflict: "id" }
    );
  if (error) throw new Error(error.message);
}

/** Execute a whitelisted command. Never throws — returns a typed result. */
export async function executeCommand(
  command: string,
  _args?: Record<string, unknown>
): Promise<CommandResult> {
  const needsDb =
    command !== "ping" && command !== "cache.revalidate" && command !== "self-test";
  if (needsDb && (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    return { ok: false, error: "This command needs a configured database." };
  }

  try {
    switch (command) {
      case "ping":
        return { ok: true, data: { pong: true, at: new Date().toISOString() } };

      case "connector.pause":
        await patchSettings({ enabled: false });
        await primeConnectorSettings();
        log.info("paused by Agency OS command");
        return { ok: true, data: { enabled: false } };

      case "connector.resume":
        await patchSettings({ enabled: true });
        await primeConnectorSettings();
        try {
          const { register } = await import("./registration");
          await register();
        } catch {
          /* re-announce is best-effort */
        }
        log.info("resumed by Agency OS command");
        return { ok: true, data: { enabled: true } };

      case "cache.revalidate":
        revalidatePath("/", "layout");
        return { ok: true, data: { revalidated: true } };

      case "self-test": {
        const report = await runSelfTest();
        return { ok: true, data: report };
      }

      case "maintenance.on":
      case "maintenance.off": {
        const on = command === "maintenance.on";
        await patchSettings({ maintenance: on });
        revalidateTag(MAINTENANCE_CACHE_TAG);
        log.info(`maintenance ${on ? "enabled" : "disabled"} by Agency OS command`);
        return { ok: true, data: { maintenance: on } };
      }

      default:
        return { ok: false, error: `Unknown command: ${command}` };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "command failed";
    log.error(`command "${command}" failed — ${message}`);
    return { ok: false, error: message };
  }
}
