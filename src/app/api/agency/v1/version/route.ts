import { getVersionInfo, versionInfoSchema } from "@/lib/agency";
import { handleAgencyRead } from "@/lib/agency/api/handler";

/**
 * GET /api/agency/v1/version
 *
 * Reports what this deployment IS: application version, database schema version,
 * connector contract version, and runtime. In a fleet where many independent
 * clones run different versions simultaneously, this lets Agency OS know what it
 * is talking to (and which deployments need upgrading) before it acts.
 * Authenticated; contains no customer data.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handleAgencyRead(request, "version", versionInfoSchema, () =>
    getVersionInfo()
  );
}
