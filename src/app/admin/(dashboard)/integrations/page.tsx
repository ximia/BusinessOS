import { getMaskedIntegrations } from "@/services/integrations.service";
import { IntegrationsManager } from "@/components/admin/integrations-manager";

export default async function IntegrationsPage() {
  // Secrets are masked server-side before reaching the client.
  const integrations = await getMaskedIntegrations();
  return <IntegrationsManager initial={integrations} />;
}
