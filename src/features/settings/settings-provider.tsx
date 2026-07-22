"use client";

import * as React from "react";
import { siteConfig } from "@/config";
import type { SiteConfig } from "@/types/content";

/**
 * Supplies the effective site configuration to client components. The marketing
 * layout resolves settings on the server (getSiteConfig) and feeds them here,
 * so any client component can call useSettings() to read live, admin-edited
 * values. Falls back to compile-time defaults when no provider is present.
 */
const SettingsContext = React.createContext<SiteConfig>(siteConfig);

export function SettingsProvider({
  settings,
  children,
}: {
  settings: SiteConfig;
  children: React.ReactNode;
}) {
  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SiteConfig {
  return React.useContext(SettingsContext);
}
