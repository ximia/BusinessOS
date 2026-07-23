/**
 * Agency Connector — shared outbound delivery primitive.
 *
 * A single, timed, authenticated `POST` to Agency OS that classifies failures as
 * retryable (network / timeout / 5xx / 429) or terminal (other 4xx). Callers own
 * the retry policy; this function performs exactly one attempt. Used by the
 * event dispatcher (Phase 4); the registration client predates it and keeps its
 * own equivalent.
 *
 * Edge-safe: uses only `fetch` / `AbortController` (no `node:*` imports).
 *
 * Every attempt records its outcome into the connection-state tracker so the
 * diagnostics layer always knows the live connectivity to Agency OS.
 */

import {
  classifyStatus,
  recordContactFailure,
  recordContactSuccess,
} from "./connection-state";

export class AgencyDeliveryError extends Error {
  readonly retryable: boolean;
  readonly status?: number;

  constructor(message: string, retryable: boolean, status?: number) {
    super(message);
    this.name = "AgencyDeliveryError";
    this.retryable = retryable;
    this.status = status;
  }
}

export interface DeliveryResult {
  status: number;
}

export interface PostSignedParams {
  url: string;
  apiKey: string;
  body: unknown;
  headers?: Record<string, string>;
  timeoutMs: number;
}

/**
 * POST `body` as JSON with a bearer credential.
 *
 * @throws {AgencyDeliveryError} on any non-2xx response or transport failure.
 */
export async function postSigned(
  params: PostSignedParams
): Promise<DeliveryResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), params.timeoutMs);

  try {
    const response = await fetch(params.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${params.apiKey}`,
        ...(params.headers ?? {}),
      },
      body: JSON.stringify(params.body),
      signal: controller.signal,
      cache: "no-store",
    });

    if (response.ok) {
      recordContactSuccess(response.status);
      return { status: response.status };
    }

    const retryable = response.status >= 500 || response.status === 429;
    recordContactFailure(
      classifyStatus(response.status),
      response.status,
      `HTTP ${response.status}`
    );
    throw new AgencyDeliveryError(
      `Agency OS responded with ${response.status}`,
      retryable,
      response.status
    );
  } catch (error) {
    if (error instanceof AgencyDeliveryError) throw error; // already recorded
    const message = error instanceof Error ? error.message : "network error";
    recordContactFailure("unreachable", null, message);
    throw new AgencyDeliveryError(message, true);
  } finally {
    clearTimeout(timeout);
  }
}
