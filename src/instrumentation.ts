/**
 * Next.js instrumentation hook — runs once when the server starts.
 *
 * Fires NON-BLOCKING, best-effort Agency OS wiring: self-registration (Phase 3)
 * and the periodic heartbeat (Phase 5). Neither awaits the network nor throws,
 * so startup is never delayed or prevented. When the connector is disabled or
 * unconfigured (the default), both are no-ops and Business OS behaves exactly as
 * it always has.
 *
 * This is the ONLY place the connector is wired into startup. It does nothing on
 * the Edge runtime (this work is Node-only), and any error is swallowed so
 * application startup can never be affected.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { ensureRegistered } = await import("@/lib/agency/registration");
    ensureRegistered(); // fire-and-forget; returns immediately.

    const { startHeartbeat } = await import("@/lib/agency/heartbeat");
    startHeartbeat(); // no-op unless enabled + deliverable.
  } catch {
    // Never let connector wiring affect application startup.
  }
}
