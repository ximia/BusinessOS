import { getHealthReport, healthReportSchema } from "@/lib/agency";
import { handleAgencyRead } from "@/lib/agency/api/handler";

/**
 * GET /api/agency/v1/health
 *
 * Liveness + local status of the deployment (status, connector-enabled flag,
 * deployment/org id, uptime, and whether the database is configured). Built from
 * in-process signals only — no remote probes. This is the heartbeat a future
 * Agency OS uses to monitor a fleet. Authenticated; returns operational data
 * only (no customer data).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handleAgencyRead(request, "health", healthReportSchema, () =>
    getHealthReport()
  );
}
