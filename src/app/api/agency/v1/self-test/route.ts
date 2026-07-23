import { selfTestReportSchema } from "@/lib/agency/schema";
import { runSelfTest } from "@/lib/agency/services/self-test.service";
import { handleAgencyRead } from "@/lib/agency/api/handler";

/**
 * GET /api/agency/v1/self-test
 *
 * Runs the connector self-test and returns each check's result (pass/warn/fail/
 * skip) plus an overall status. Verifies the deployment is correctly wired for
 * management: identity, outbound/inbound config, registration, payload build,
 * event pipeline. Pass `?probe=1` to add a live Agency connectivity probe.
 * Authenticated; no PII.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const probeAgency = new URL(request.url).searchParams.get("probe") === "1";
  return handleAgencyRead(request, "self-test", selfTestReportSchema, () =>
    runSelfTest({ probeAgency })
  );
}
