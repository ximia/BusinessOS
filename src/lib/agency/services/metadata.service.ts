import { getConnectorConfig } from "../config";
import { getConnectorIdentity } from "../identity";
import {
  deploymentMetadataSchema,
  type ConnectorConfig,
  type DeploymentMetadata,
} from "../schema";
import { getBuildInfo } from "./build.service";
import { getCapabilities } from "./capabilities.service";
import { getVersionInfo } from "./version.service";

/**
 * Agency Connector — deployment metadata service (Phase 5).
 *
 * Assembles the static-ish "what is this deployment" bundle: identity,
 * environment, public URL, start time, version (incl. schema version), build
 * info, and installed modules. This is what Agency OS reads to populate a
 * deployment's dashboard card and version-management view — no DB access needed.
 */

function resolvePublicUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return url && /^https?:\/\//i.test(url) ? url : null;
}

/** Best-effort process start time (now − uptime). */
function resolveStartedAt(): string | null {
  if (typeof process !== "undefined" && typeof process.uptime === "function") {
    return new Date(Date.now() - Math.floor(process.uptime()) * 1000).toISOString();
  }
  return null;
}

export function getDeploymentMetadata(
  config: ConnectorConfig = getConnectorConfig()
): DeploymentMetadata {
  const identity = getConnectorIdentity(config);
  return deploymentMetadataSchema.parse({
    deployment: {
      id: identity.deployment.id,
      environment: identity.deployment.environment,
      organizationId: identity.organization.id,
      organizationSlug: identity.organization.slug,
      publicUrl: resolvePublicUrl(),
      startedAt: resolveStartedAt(),
    },
    version: getVersionInfo(),
    build: getBuildInfo(),
    modules: getCapabilities().modules,
  });
}
