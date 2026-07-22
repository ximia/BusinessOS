/**
 * Next.js instrumentation hook — runs once when the server starts.
 *
 * Fires a NON-BLOCKING, best-effort Agency OS self-registration. It never awaits
 * the network and never throws, so startup is never delayed or prevented. When
 * the connector is disabled or unconfigured (the default), this is a no-op and
 * Business OS behaves exactly as it always has.
 *
 * This is the ONLY place registration is wired into the app. It does nothing on
 * the Edge runtime (registration is Node-only), and any error is swallowed so
 * application startup can never be affected.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { ensureRegistered } = await import("@/lib/agency/registration");
    ensureRegistered(); // fire-and-forget; returns immediately.
  } catch {
    // Never let registration wiring affect application startup.
  }
}
