import { getCapabilities, capabilitiesSchema } from "@/lib/agency";
import { handleAgencyRead } from "@/lib/agency/api/handler";

/**
 * GET /api/agency/v1/capabilities
 *
 * Describes what this deployment can do: which product modules are present, and
 * which Agency-integration capabilities are available (all `false` in the
 * current phase). This is the negotiation surface — Agency OS reads it to learn
 * what a deployment supports before attempting anything. Authenticated; static,
 * non-sensitive descriptor with no customer data.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handleAgencyRead(request, "capabilities", capabilitiesSchema, () =>
    getCapabilities()
  );
}
