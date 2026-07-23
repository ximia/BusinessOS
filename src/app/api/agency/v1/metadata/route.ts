import { deploymentMetadataSchema } from "@/lib/agency/schema";
import { getDeploymentMetadata } from "@/lib/agency/services/metadata.service";
import { handleAgencyRead } from "@/lib/agency/api/handler";

/**
 * GET /api/agency/v1/metadata
 *
 * Deployment metadata for the dashboard + version management: deployment
 * identity/environment/public URL/start time, version metadata (incl. schema
 * version), build information (commit/build id/region/node), and the installed
 * module list. Composes existing connector services; no database access.
 * Authenticated; no PII.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handleAgencyRead(request, "metadata", deploymentMetadataSchema, () =>
    getDeploymentMetadata()
  );
}
