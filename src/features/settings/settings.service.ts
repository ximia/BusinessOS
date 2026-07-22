import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { siteConfig } from "@/config";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import type { SiteConfig } from "@/types/content";
import {
  mergeSettings,
  SETTINGS_SINGLETON_ID,
  type BusinessSettings,
} from "./settings.schema";

export const SETTINGS_CACHE_TAG = "business-settings";

/**
 * Read stored settings with a cookieless, cached client so the public site
 * stays statically generated (ISR). The admin action revalidates the tag on
 * save. Returns null when nothing has been saved yet or Supabase is absent.
 */
const readStoredSettings = unstable_cache(
  async (): Promise<Partial<BusinessSettings> | null> => {
    if (!isSupabaseConfigured()) return null;
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );
    const { data, error } = await supabase
      .from("business_settings")
      .select("data")
      .eq("id", SETTINGS_SINGLETON_ID)
      .maybeSingle();
    if (error || !data) return null;
    return (data.data as Partial<BusinessSettings>) ?? null;
  },
  ["business-settings"],
  { tags: [SETTINGS_CACHE_TAG], revalidate: 60 }
);

/**
 * The effective site configuration the whole app should render from:
 * compile-time defaults deep-merged with any admin-edited overrides.
 *
 * Use this in Server Components; client components read it via SettingsProvider
 * / useSettings(), which the marketing layout feeds from this function.
 */
export async function getSiteConfig(): Promise<SiteConfig> {
  if (!isSupabaseConfigured()) return siteConfig;
  const overrides = await readStoredSettings();
  return mergeSettings(siteConfig, overrides);
}

/** Raw stored overrides (or null). Used by the admin editor to know what's set. */
export async function getStoredSettings(): Promise<Partial<BusinessSettings> | null> {
  return readStoredSettings();
}
