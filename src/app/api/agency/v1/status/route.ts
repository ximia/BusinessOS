import { statusReportSchema } from "@/lib/agency/schema";
import { getStatusReport } from "@/lib/agency/services/diagnostics.service";
import { handleAgencyRead } from "@/lib/agency/api/handler";

/**
 * GET /api/agency/v1/status
 *
 * Compact connector status for frequent monitoring polls: the single diagnostic
 * `state` (registered/healthy/degraded/disconnected/authentication_failed/
 * agency_unreachable/pending_registration/connector_disabled), connector mode,
 * registration phase, last-contact time, and uptime. Agency OS polls this to
 * drive a deployment dashboard and uptime monitoring. Authenticated; no PII.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handleAgencyRead(request, "status", statusReportSchema, () =>
    getStatusReport()
  );
}
