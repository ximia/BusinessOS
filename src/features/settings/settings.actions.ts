"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import {
  businessSettingsSchema,
  SETTINGS_SINGLETON_ID,
} from "./settings.schema";
import { SETTINGS_CACHE_TAG } from "./settings.service";

export type SettingsActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

/**
 * Persist Business Settings. Auth-guarded when Supabase is configured; a
 * friendly no-op in demo mode so the editor is fully explorable out of the box.
 */
export async function updateBusinessSettings(
  values: unknown
): Promise<SettingsActionState> {
  const parsed = businessSettingsSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: true,
      message:
        "Saved locally (demo mode). Connect Supabase to persist changes across visits.",
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, message: "You must be signed in." };

    const { error } = await supabase.from("business_settings").upsert(
      {
        id: SETTINGS_SINGLETON_ID,
        data: parsed.data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    if (error) throw error;

    revalidateTag(SETTINGS_CACHE_TAG);
    revalidatePath("/", "layout");

    return { ok: true, message: "Business settings saved and published." };
  } catch (err) {
    console.error("[settings] save failed", err);
    return {
      ok: false,
      message: "Couldn't save settings. Please try again.",
    };
  }
}
