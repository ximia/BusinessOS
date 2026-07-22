import { createHash, timingSafeEqual } from "node:crypto";
import { ENV } from "../constants";

/**
 * Agency API (Phase 2) — authentication.
 *
 * Authenticates an inbound request from Agency OS using a per-deployment shared
 * secret (`AGENCY_INBOUND_API_KEY`). This is deliberately a *separate lane* from
 * the app's human Supabase-cookie auth: the API caller is a machine peer, not a
 * signed-in staff user, so it must not rely on session cookies or RLS identity.
 *
 * Scope note (Phase 2): a static bearer key with constant-time comparison is the
 * authentication mechanism for these read-only endpoints. Request signing (HMAC),
 * timestamp/nonce replay defense, and key rotation are deferred to a later phase
 * (they matter most for mutating/inbound-command surfaces, which do not exist).
 *
 * The expected key is read directly from the environment here and is NEVER
 * placed into `ConnectorConfig`, so it cannot leak through the connector.
 */

export type AgencyAuthResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "missing" | "mismatch" };

/** Fixed-length SHA-256 digest, so comparison length never leaks key length. */
function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

/** Constant-time equality over hashed inputs. */
function safeEqual(a: string, b: string): boolean {
  const da = digest(a);
  const db = digest(b);
  return da.length === db.length && timingSafeEqual(da, db);
}

/** Extract the presented key from `Authorization: Bearer` or `x-agency-key`. */
function extractPresentedKey(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  if (authorization) {
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    if (match && match[1]) return match[1].trim();
  }
  const alt = request.headers.get("x-agency-key");
  return alt ? alt.trim() : null;
}

/**
 * Verify an inbound Agency API request.
 *
 * - `not_configured` — no key set on this deployment ⇒ deny (never fail open).
 * - `missing`        — no credential presented by the caller.
 * - `mismatch`       — credential presented but incorrect.
 */
export function authenticateAgencyRequest(request: Request): AgencyAuthResult {
  const expected = process.env[ENV.INBOUND_API_KEY]?.trim();
  if (!expected) return { ok: false, reason: "not_configured" };

  const presented = extractPresentedKey(request);
  if (!presented) return { ok: false, reason: "missing" };

  return safeEqual(presented, expected)
    ? { ok: true }
    : { ok: false, reason: "mismatch" };
}
