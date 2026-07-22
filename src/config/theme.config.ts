/**
 * Brand theme configuration.
 *
 * The actual colour values live as CSS variables in `src/app/globals.css`
 * (both light and dark). This file documents the token contract and exposes a
 * couple of runtime-relevant values (e.g. the theme-color meta tag). To
 * re-brand: change the HSL values in globals.css under `:root` and `.dark`.
 *
 * Token reference (HSL, space-separated — no `hsl()` wrapper):
 *   --primary            Brand accent, used for CTAs and highlights.
 *   --background         Page background.
 *   --foreground         Default text.
 *   --muted / --muted-foreground   Subtle surfaces & secondary text.
 *   --card               Card surfaces.
 *   --border / --input / --ring    Lines, fields, focus rings.
 *   --radius             Global corner radius.
 */
export const themeConfig = {
  /** Used for the browser theme-color meta tag (light mode). */
  themeColorLight: "#ffffff",
  themeColorDark: "#0a0a0b",
  /**
   * Default brand accent (HSL triples), mirroring `--primary` in globals.css.
   * The Theme Generator overrides these at runtime via BrandStyle.
   */
  primary: "216 90% 44%",
  primaryDark: "214 95% 62%",
  /** Default corner radius, mirrors --radius in globals.css. */
  radius: "0.75rem",
  /** Whether to expose the light/dark toggle in the UI. */
  enableThemeToggle: true,
  /** Default theme: "light" | "dark" | "system". */
  defaultTheme: "system" as const,
};
