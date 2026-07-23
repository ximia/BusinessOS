/**
 * Agency Connector — shared exponential backoff.
 *
 * Extracted from the registration retry loop and the event dispatcher, which had
 * identical backoff math. Full-jitter exponential backoff, capped at
 * `maxDelayMs`. Pure and edge-safe.
 */

export interface BackoffPolicy {
  baseDelayMs: number;
  maxDelayMs: number;
  /** Jitter as a fraction of the capped delay (0–1). Default 0.2. */
  jitter?: number;
}

export function exponentialBackoff(
  attempt: number,
  policy: BackoffPolicy
): number {
  const exponential = policy.baseDelayMs * 2 ** (attempt - 1);
  const capped = Math.min(policy.maxDelayMs, exponential);
  const jitter = (policy.jitter ?? 0.2) * capped * Math.random();
  return Math.round(capped + jitter);
}
