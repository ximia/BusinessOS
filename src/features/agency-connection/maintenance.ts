import "server-only";

import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";

/**
 * Maintenance flag — set by Agency OS via the command channel, read by the
 * marketing layout to show a "we'll be right back" screen.
 *
 * FAIL-SAFE: any missing config or error returns `false`, so a database hiccup
 * can never accidentally take a live site down. Cached (revalidated by the
 * command handler on change) so it doesn't add a DB read to every page load.
 */
export const MAINTENANCE_CACHE_TAG = "agency-maintenance";

export const isInMaintenance = unstable_cache(
  async (): Promise<boolean> => {
    if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return false;
    }
    try {
      const supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      );
      const { data, error } = await supabase
        .from("agency_connector_settings")
        .select("maintenance")
        .eq("id", "default")
        .maybeSingle();
      if (error || !data) return false;
      return Boolean(data.maintenance);
    } catch {
      return false;
    }
  },
  ["agency-maintenance"],
  { tags: [MAINTENANCE_CACHE_TAG], revalidate: 30 }
);
