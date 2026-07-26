/**
 * Agency Connector — stored settings overlay (sync surface).
 *
 * The connector's effective configuration is layered:
 *
 *   stored settings (this admin-editable overlay)  ▹ highest precedence
 *   → environment variables (the template's fleet-wide defaults)
 *   → auto-derived defaults (so a fresh clone identifies itself with no config)
 *
 * This file holds only the SYNC surface: the in-memory overlay cache and the
 * auto-derive helper. `getConnectorConfig()` (config.ts) reads it synchronously,
 * so every existing call site picks up admin edits without becoming async. The
 * ASYNC part — reading the row from Supabase and priming this cache — lives in
 * `settings.loader.ts` (Node-only), keeping this module free of any database
 * import so config.ts stays pure and Edge-safe.
 *
 * Only NON-SECRET fields are ever stored/overlaid (enable flag + identity). The
 * shared API keys and Agency base URL remain env-only and never pass through here.
 */

import { ref } from "./global-state";

/** The admin-editable, non-secret connector settings. NULL ⇒ inherit env. */
export interface StoredConnectorSettings {
  enabled: boolean | null;
  deploymentId: string | null;
  organizationId: string | null;
  organizationSlug: string | null;
}

// Cache primed at startup (instrumentation) and refreshed after a save or on
// each heartbeat tick. It MUST live on globalThis: Next.js evaluates modules in
// separate contexts (the save action, the registration path, the API routes),
// and a plain module variable would leave each context with its own empty copy
// — so a toggle saved in one context wouldn't be seen by registration in
// another. See global-state.ts (ADR-0014). `ref` is pure and edge-safe.
const overlayRef = ref<StoredConnectorSettings | null>(
  "settings.connectorOverlay",
  () => null,
);

/** The current overlay (null until primed, or when nothing is stored). */
export function getConnectorOverlay(): StoredConnectorSettings | null {
  return overlayRef.get();
}

/** Replace the cached overlay. Called by the loader after a DB read. */
export function setConnectorOverlay(next: StoredConnectorSettings | null): void {
  overlayRef.set(next);
}

/**
 * Derive a stable deployment id from the Supabase project ref when none is
 * configured, so a brand-new clone self-identifies with zero setup. The project
 * ref (the subdomain of `NEXT_PUBLIC_SUPABASE_URL`) is unique per deployment.
 * Returns null when Supabase isn't configured (the connector stays dormant).
 */
export function autoDeriveDeploymentId(): string | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return undefined;
  const match = url.match(/^https?:\/\/([a-z0-9-]+)\.supabase\./i);
  return match ? `bos_${match[1]}` : undefined;
}
