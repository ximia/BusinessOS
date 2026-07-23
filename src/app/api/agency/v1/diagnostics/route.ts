import { connectorDiagnosticsSchema } from "@/lib/agency/schema";
import { getConnectorDiagnostics } from "@/lib/agency/services/diagnostics.service";
import { handleAgencyRead } from "@/lib/agency/api/handler";

/**
 * GET /api/agency/v1/diagnostics
 *
 * The full diagnostics bundle: diagnostic state, connector status, registration
 * status, synchronization state (outbox depth), live connection state (last
 * contact outcome/timestamps), and the health report. Everything Agency OS needs
 * for a deployment's diagnostics view — no database access. Authenticated; no PII.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handleAgencyRead(
    request,
    "diagnostics",
    connectorDiagnosticsSchema,
    () => getConnectorDiagnostics()
  );
}
