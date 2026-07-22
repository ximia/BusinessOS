import { getSiteConfig } from "@/features/settings/settings.service";
import { industryPresets } from "@/features/theme/industries";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { ThemeStudio } from "@/components/admin/theme-studio";

export default async function ThemePage() {
  const settings = await getSiteConfig();
  return (
    <ThemeStudio
      presets={industryPresets}
      currentPreset={settings.theme?.preset ?? "custom"}
      demo={!isSupabaseConfigured()}
    />
  );
}
