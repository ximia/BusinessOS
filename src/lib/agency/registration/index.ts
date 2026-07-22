import { getConnectorConfig } from "../config";
import { createLogger } from "../log";
import { RegistrationError, sendRegistration } from "./client";
import { getRegistrationConfig, RETRY_POLICY } from "./config";
import { buildRegistrationPayload, hashPayload } from "./payload";
import { withRetry } from "./retry";
import {
  getRegistrationState,
  setRegistrationState,
  type RegistrationState,
} from "./state";

/**
 * Agency registration — orchestration & public surface.
 *
 * Announces this deployment to Agency OS. The whole flow is:
 *   1. IDEMPOTENT   — skip if disabled/unconfigured, or already registered with
 *                     an unchanged payload; concurrent calls share one attempt.
 *   2. RETRYABLE    — transient failures back off and retry (bounded).
 *   3. NON-BLOCKING — `ensureRegistered()` is fire-and-forget and never throws;
 *                     it never blocks a request or startup, and a failure leaves
 *                     Business OS running normally.
 */

const log = createLogger("registration");

/** Shared in-flight promise so concurrent callers don't double-register. */
let inFlight: Promise<RegistrationState> | null = null;

async function performRegistration(): Promise<RegistrationState> {
  const registrationConfig = getRegistrationConfig();

  // Not configured to register → skip cleanly (this is the default state).
  if (!registrationConfig.canAttempt) {
    log.info(`skipped — ${registrationConfig.skipReason}`);
    return setRegistrationState({
      phase: "skipped",
      skipReason: registrationConfig.skipReason,
      lastError: null,
    });
  }

  // Build + hash the payload.
  let payload;
  let payloadHash: string;
  try {
    payload = buildRegistrationPayload(getConnectorConfig());
    payloadHash = hashPayload(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid payload";
    log.error(`could not build registration payload — ${message}`);
    return setRegistrationState({ phase: "failed", lastError: message });
  }

  // Idempotent: already registered with the same payload → no-op.
  const existing = getRegistrationState();
  if (existing.phase === "registered" && existing.payloadHash === payloadHash) {
    log.info("already registered (payload unchanged); skipping");
    return existing;
  }

  const idempotencyKey = `${payload.deployment.id}:${payloadHash}`;
  setRegistrationState({ phase: "registering", skipReason: null });

  try {
    const result = await withRetry(
      () => {
        setRegistrationState({
          attempts: getRegistrationState().attempts + 1,
          lastAttemptAt: new Date().toISOString(),
        });
        return sendRegistration(payload, registrationConfig, idempotencyKey);
      },
      {
        maxAttempts: RETRY_POLICY.maxAttempts,
        baseDelayMs: RETRY_POLICY.baseDelayMs,
        maxDelayMs: RETRY_POLICY.maxDelayMs,
        isRetryable: (error) =>
          error instanceof RegistrationError ? error.retryable : true,
        onRetry: ({ attempt, delayMs, error }) => {
          const message = error instanceof Error ? error.message : "error";
          log.warn(
            `attempt ${attempt} failed (${message}); retrying in ${delayMs}ms`
          );
        },
      }
    );

    log.info(`registered with Agency OS (status ${result.status})`);
    return setRegistrationState({
      phase: "registered",
      registeredAt: new Date().toISOString(),
      payloadHash,
      lastError: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "registration failed";
    log.error(
      `registration failed after ${getRegistrationState().attempts} attempt(s) — ${message}`
    );
    return setRegistrationState({ phase: "failed", lastError: message });
  }
}

/**
 * Register this deployment, returning the resulting state. Idempotent and
 * concurrency-safe: an in-flight registration is shared rather than duplicated.
 * Awaitable for callers that want the outcome (e.g. a future manual trigger).
 */
export function register(): Promise<RegistrationState> {
  if (inFlight) return inFlight;
  inFlight = performRegistration().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

/**
 * Fire-and-forget registration. Returns immediately, never awaits the network,
 * and never throws — the safe entry point for startup wiring. If registration
 * fails, Business OS keeps running normally.
 */
export function ensureRegistered(): void {
  try {
    void register().catch(() => {
      /* performRegistration already records failure; never surface it here. */
    });
  } catch {
    /* Registration must never affect the caller. */
  }
}

export {
  getRegistrationState,
  resetRegistrationState,
  type RegistrationState,
  type RegistrationPhase,
} from "./state";
export {
  buildRegistrationPayload,
  registrationPayloadSchema,
  type RegistrationPayload,
} from "./payload";
