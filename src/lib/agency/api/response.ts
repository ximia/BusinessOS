import { NextResponse } from "next/server";
import type { z } from "zod";
import { CONNECTOR_CONTRACT_VERSION } from "../constants";
import { getDeploymentIdentity } from "../identity";
import {
  errorEnvelopeSchema,
  successEnvelopeSchema,
  type ErrorStatus,
} from "./schema";

/**
 * Agency API (Phase 2) — response builders.
 *
 * Every endpoint returns through these helpers, which construct the envelope,
 * **validate it with Zod before it leaves the process**, and disable caching.
 * This is where the "validate all responses" requirement is enforced centrally.
 */

const NO_STORE = { "Cache-Control": "no-store" } as const;

/**
 * A validated success response for a resource and its data schema. The data is
 * validated against `dataSchema` as part of the envelope, so a handler can never
 * emit a shape that violates the contract.
 */
export function apiOk<T extends z.ZodTypeAny>(
  resource: string,
  dataSchema: T,
  data: z.infer<T>
): NextResponse {
  const envelope = successEnvelopeSchema(dataSchema).parse({
    ok: true,
    resource,
    contractVersion: CONNECTOR_CONTRACT_VERSION,
    deploymentId: getDeploymentIdentity().id,
    generatedAt: new Date().toISOString(),
    data,
  });
  return NextResponse.json(envelope, { status: 200, headers: NO_STORE });
}

function apiError(
  status: ErrorStatus,
  httpStatus: number,
  message: string,
  extraHeaders: Record<string, string> = {}
): NextResponse {
  const envelope = errorEnvelopeSchema.parse({
    ok: false,
    status,
    message,
    contractVersion: CONNECTOR_CONTRACT_VERSION,
    generatedAt: new Date().toISOString(),
  });
  return NextResponse.json(envelope, {
    status: httpStatus,
    headers: { ...NO_STORE, ...extraHeaders },
  });
}

/** 503 — the connector is disabled on this deployment (integration off). */
export function apiDisabled(): NextResponse {
  return apiError(
    "disabled",
    503,
    "Agency connector is disabled on this deployment."
  );
}

/** 401 — missing or invalid Agency API credentials. */
export function apiUnauthorized(): NextResponse {
  return apiError(
    "unauthorized",
    401,
    "Missing or invalid Agency API credentials.",
    { "WWW-Authenticate": "Bearer" }
  );
}

/** 500 — the report could not be produced. */
export function apiServerError(): NextResponse {
  return apiError("error", 500, "Failed to produce the requested report.");
}
