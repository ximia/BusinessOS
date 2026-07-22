import { themeConfig } from "@/config/theme.config";
import type { BrandTheme } from "@/types/content";

/**
 * Injects the active brand palette as CSS-variable overrides. Rendered high in
 * the tree (marketing + admin layouts) so an industry preset or custom color
 * re-skins the whole app at runtime — no rebuild. Only `--primary` and its
 * dependent tokens are overridden; the rest of globals.css stands.
 */
export function BrandStyle({ theme }: { theme?: BrandTheme }) {
  const primary = theme?.primary ?? themeConfig.primary;
  const primaryDark = theme?.primaryDark ?? themeConfig.primaryDark;

  const css = `
:root{--primary:${primary};--ring:${primary};--accent-foreground:${primary};}
.dark{--primary:${primaryDark};--ring:${primaryDark};--accent-foreground:${primaryDark};}
`.trim();

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
