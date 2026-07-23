/**
 * Agency registration — retry with exponential backoff + jitter.
 *
 * A small, generic helper: it retries a failing async operation up to
 * `maxAttempts`, but only while `isRetryable` says the error is transient. A
 * non-retryable error (e.g. a 4xx auth failure) is thrown immediately.
 *
 * The waiting happens off the critical path — registration is invoked
 * fire-and-forget (see `./index.ts`), so these delays never block a request or
 * startup.
 */

import { exponentialBackoff } from "../backoff";

export interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  /** Return true only for transient errors worth retrying. */
  isRetryable: (error: unknown) => boolean;
  /** Observability hook fired before each backoff wait. */
  onRetry?: (info: { attempt: number; delayMs: number; error: unknown }) => void;
  /** Injectable sleep (defaults to setTimeout) — useful for tests. */
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const sleep = options.sleep ?? defaultSleep;
  let attempt = 0;

  for (;;) {
    attempt += 1;
    try {
      return await operation();
    } catch (error) {
      if (attempt >= options.maxAttempts || !options.isRetryable(error)) {
        throw error;
      }
      const delayMs = exponentialBackoff(attempt, options);
      options.onRetry?.({ attempt, delayMs, error });
      await sleep(delayMs);
    }
  }
}
