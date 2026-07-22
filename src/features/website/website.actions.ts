"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { siteConfig } from "@/config";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import {
  businessSettingsSchema,
  settingsFromConfig,
  SETTINGS_SINGLETON_ID,
} from "@/features/settings/settings.schema";
import {
  SETTINGS_CACHE_TAG,
  getStoredSettings,
} from "@/features/settings/settings.service";
import { homeLayoutSchema } from "./sections.catalog";

export type WebsiteActionState = { ok: boolean; message: string };

/**
 * Persist the homepage section layout (Website Builder). Merges over the
 * existing stored business settings so unrelated fields are never dropped.
 * Auth-guarded when Supabase is configured; a friendly no-op in demo mode.
 */
export async function updateHomeLayout(
  layout: unknown
): Promise<WebsiteActionState> {
  const parsed = homeLayoutSchema.safeParse(layout);
  if (!parsed.success) {
    return { ok: false, message: "That layout isn't valid. Please try again." };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: true,
      message: "Saved locally (demo mode). Connect Supabase to publish changes.",
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, message: "You must be signed in." };

    // Merge over the current effective settings so we don't clobber other fields.
    const stored = await getStoredSettings();
    const base = settingsFromConfig(siteConfig);
    const next = { ...base, ...stored, homeLayout: parsed.data };

    const validated = businessSettingsSchema.safeParse(next);
    if (!validated.success) {
      return { ok: false, message: "Couldn't save — settings failed validation." };
    }

    const { error } = await supabase.from("business_settings").upsert(
      {
        id: SETTINGS_SINGLETON_ID,
        data: validated.data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    if (error) throw error;

    revalidateTag(SETTINGS_CACHE_TAG);
    revalidatePath("/", "layout");

    return { ok: true, message: "Homepage layout saved and published." };
  } catch (err) {
    console.error("[website] updateHomeLayout failed", err);
    return { ok: false, message: "Couldn't save the layout. Please try again." };
  }
}
