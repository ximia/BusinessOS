"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import {
  businessSettingsSchema,
  settingsFromConfig,
  SETTINGS_SINGLETON_ID,
} from "@/features/settings/settings.schema";
import {
  getSiteConfig,
  SETTINGS_CACHE_TAG,
} from "@/features/settings/settings.service";
import { getIndustryPreset } from "./industries";
import type { SettingsActionState } from "@/features/settings/settings.actions";

export interface ApplyThemeInput {
  presetId?: string;
  custom?: { primary: string; primaryDark: string };
  /** When true (industry presets only), also load starter copy. */
  applyContent?: boolean;
}

/**
 * Apply an industry preset or a custom brand color. Loads the current effective
 * settings, patches the theme (and optionally the starter copy), then persists
 * — so switching industries never wipes unrelated fields.
 */
export async function applyTheme(
  input: ApplyThemeInput
): Promise<SettingsActionState> {
  const current = settingsFromConfig(await getSiteConfig());

  if (input.presetId) {
    const preset = getIndustryPreset(input.presetId);
    if (!preset) return { ok: false, message: "Unknown industry preset." };
    current.theme = {
      preset: preset.id,
      primary: preset.primary,
      primaryDark: preset.primaryDark,
    };
    if (input.applyContent) {
      current.industry = preset.label;
      current.tagline = preset.sampleTagline;
      current.description = preset.sampleDescription;
      current.trustBadges = preset.sampleBadges;
    }
  } else if (input.custom) {
    current.theme = {
      preset: "custom",
      primary: input.custom.primary,
      primaryDark: input.custom.primaryDark,
    };
  } else {
    return { ok: false, message: "Nothing to apply." };
  }

  const parsed = businessSettingsSchema.safeParse(current);
  if (!parsed.success) {
    return { ok: false, message: "Theme values were invalid." };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: true,
      message:
        "Previewed (demo mode). Connect Supabase to publish theme changes.",
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
    return { ok: true, message: "Theme applied and published." };
  } catch (err) {
    console.error("[theme] apply failed", err);
    return { ok: false, message: "Couldn't apply theme. Please try again." };
  }
}
