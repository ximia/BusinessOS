import { AgencyDeliveryError, postSigned } from "../outbound";
import { REQUEST_TIMEOUT_MS, type RegistrationConfig } from "./config";
import type { RegistrationPayload } from "./payload";

/**
 * Agency registration — outbound HTTP client.
 *
 * Delegates the actual request to the shared `postSigned` primitive (which
 * classifies failures and records connection state) and re-wraps its error as a
 * {@link RegistrationError} so the registration orchestrator's retry logic is
 * unchanged. Behavior is identical to the original inline implementation.
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

  try {
    const { status } = await postSigned({
      url: config.endpointUrl,
      apiKey: config.outboundKey,
      body: payload,
      headers: {
        "x-idempotency-key": idempotencyKey,
        "x-business-os-deployment": payload.deployment.id,
        "x-business-os-contract": payload.contractVersion,
      },
      timeoutMs: REQUEST_TIMEOUT_MS,
    });
    return { status };
  } catch (error) {
    if (error instanceof AgencyDeliveryError) {
      throw new RegistrationError(error.message, error.retryable, error.status);
    }
    const message = error instanceof Error ? error.message : "network error";
    throw new RegistrationError(message, true);
  }
}
