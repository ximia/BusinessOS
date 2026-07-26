import type { z } from "zod";
import { isConnectorEnabled } from "../config";
import { authenticateAgencyRequest } from "./auth";
import {
  apiDisabled,
  apiOk,
  apiServerError,
  apiUnauthorized,
} from "./response";
import type { NextResponse } from "next/server";

/**
 * Agency API (Phase 2) — shared read pipeline.
 *
 * Every read-only endpoint runs the identical guard sequence, expressed once
 * here so the routes stay declarative and consistent:
 *
 *   1. Connector disabled?  → 503 disabled envelope (integration off; benign).
 *   2. Request authenticated? → else 401 unauthorized.
 *   3. Produce + validate the payload → 200, or 500 on failure.
 *
 * The disabled check comes first so a disabled deployment always returns a
 * clear, uniform "disabled" signal (the state carries no sensitive data), while
 * an enabled deployment protects every payload behind authentication.
 */
export async function handleAgencyRead<T extends z.ZodTypeAny>(
  request: Request,
  resource: string,
  dataSchema: T,
  produce: () => z.infer<T> | Promise<z.infer<T>>
): Promise<NextResponse> {
  // Refresh the admin-editable settings overlay from the database so the
  // enabled/paused state reflects what was last saved, in this route context
  // (Next.js evaluates modules per-context; without this a fresh route instance
  // would only see env/auto). Best-effort — falls back to env/auto on failure.
  try {
    const { primeConnectorSettings } = await import("../settings.loader");
    await primeConnectorSettings();
  } catch {
    /* fall back to env / auto-on */
  }

  if (!isConnectorEnabled()) return apiDisabled();
  if (!authenticateAgencyRequest(request).ok) return apiUnauthorized();

  try {
    const data = await produce();
    return apiOk(resource, dataSchema, data);
  } catch {
    return apiServerError();
  }
}
