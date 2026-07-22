import { getSiteConfig } from "@/features/settings/settings.service";
import {
  DEFAULT_HOME_LAYOUT,
  normalizeLayout,
} from "@/features/website/sections.catalog";
import { WebsiteBuilder } from "@/components/admin/website-builder";

export default async function WebsitePage() {
  const config = await getSiteConfig();
  const layout = config.homeLayout
    ? normalizeLayout(config.homeLayout)
    : DEFAULT_HOME_LAYOUT;

  return <WebsiteBuilder initial={layout} />;
}
