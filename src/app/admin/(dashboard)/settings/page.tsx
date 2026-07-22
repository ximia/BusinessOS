import { getSiteConfig } from "@/features/settings/settings.service";
import { settingsFromConfig } from "@/features/settings/settings.schema";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { SettingsEditor } from "@/components/admin/settings-editor";

export default async function SettingsPage() {
  // Pre-fill the editor with the current effective values (defaults + overrides).
  const effective = await getSiteConfig();
  const initial = settingsFromConfig(effective);

  return <SettingsEditor initial={initial} demo={!isSupabaseConfigured()} />;
}
