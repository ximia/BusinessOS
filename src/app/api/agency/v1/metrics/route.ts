import { metricsSnapshotSchema } from "@/lib/agency/api/schema";
import { buildMetricsSnapshot } from "@/lib/agency/services/metrics.service";
import { handleAgencyRead } from "@/lib/agency/api/handler";

/**
 * GET /api/agency/v1/metrics
 *
 * Aggregate operational metrics for fleet dashboards: lead/quote/review/content/
 * team counts, status distributions, and value rollups. Composed from the
 * EXISTING business services (never a direct Supabase query, never duplicated
 * logic) and reduced to AGGREGATES ONLY — no names, emails, phones, messages, or
 * individual records ever appear. Authenticated.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handleAgencyRead(request, "metrics", metricsSnapshotSchema, () =>
    buildMetricsSnapshot()
  );
}
