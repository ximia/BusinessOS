import { REQUEST_TIMEOUT_MS, type RegistrationConfig } from "./config";
import type { RegistrationPayload } from "./payload";

/**
 * Agency registration — outbound HTTP client.
 *
 * The single place in Business OS that makes an outbound call to Agency OS. It
 * is a plain, timed `POST`; it classifies failures as retryable (network/timeout
 * /5xx/429) or terminal (other 4xx, e.g. a bad key) and surfaces that via
 * {@link RegistrationError}. It performs no retries itself — that is the caller's
 * concern (see `./retry.ts`).
 */

export class RegistrationError extends Error {
  readonly retryable: boolean;
  readonly status?: number;

  constructor(message: string, retryable: boolean, status?: number) {
    super(message);
    this.name = "RegistrationError";
    this.retryable = retryable;
    this.status = status;
  }
}

export interface RegistrationResult {
  status: number;
}

/**
 * POST the registration payload to Agency OS.
 *
 * @throws {RegistrationError} on any non-2xx response or transport failure.
 */
export async function sendRegistration(
  payload: RegistrationPayload,
  config: RegistrationConfig,
  idempotencyKey: string
): Promise<RegistrationResult> {
  if (!config.endpointUrl || !config.outboundKey) {
    throw new RegistrationError("registration not configured", false);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(config.endpointUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${config.outboundKey}`,
        "x-idempotency-key": idempotencyKey,
        "x-business-os-deployment": payload.deployment.id,
        "x-business-os-contract": payload.contractVersion,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: "no-store",
    });

    if (response.ok) return { status: response.status };

    // 5xx and 429 are worth retrying; other 4xx are terminal (fix config first).
    const retryable = response.status >= 500 || response.status === 429;
    throw new RegistrationError(
      `Agency OS responded with ${response.status}`,
      retryable,
      response.status
    );
  } catch (error) {
    if (error instanceof RegistrationError) throw error;
    // Network error or abort/timeout — transient, so retryable.
    const message = error instanceof Error ? error.message : "network error";
    throw new RegistrationError(message, true);
  } finally {
    clearTimeout(timeout);
  }
}
