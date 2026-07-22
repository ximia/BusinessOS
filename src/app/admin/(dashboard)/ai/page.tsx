import { AiTools } from "@/components/admin/ai-tools";
import { isAIConfigured, aiProviderLabel } from "@/features/ai/provider";

export default function AiToolsPage() {
  return (
    <AiTools configured={isAIConfigured()} providerLabel={aiProviderLabel()} />
  );
}
