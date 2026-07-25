import { getConnectionView } from "@/features/agency-connection/connection.service";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { ConnectionEditor } from "@/components/admin/connection-editor";

export const dynamic = "force-dynamic";

/**
 * Business Hub → Agency Connection. Manage this deployment's connector settings
 * (on/off + identity) without touching environment variables or redeploying.
 */
export default async function AgencyConnectionPage() {
  const view = await getConnectionView();
  return <ConnectionEditor initial={view} demo={!isSupabaseConfigured()} />;
}
