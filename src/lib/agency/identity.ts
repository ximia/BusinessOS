import { getConnectorConfig } from "./config";
import {
  connectorIdentitySchema,
  deploymentIdentitySchema,
  organizationIdentitySchema,
  type ConnectorConfig,
  type ConnectorIdentity,
  type DeploymentIdentity,
  type OrganizationIdentity,
} from "./schema";

/**
 * Agency Connector — identity.
 *
 * Answers two questions a future Agency OS must be able to ask of a deployment:
 *   1. "Which deployment are you?"      → {@link DeploymentIdentity}
 *   2. "Which organization do you serve?" → {@link OrganizationIdentity}
 *
 * Both are derived purely from validated configuration. When nothing is
 * configured the identity is a valid *unidentified* state (`id: null,
 * identified: false`) — never an error. This is the primitive the whole future
 * integration is addressed by; defining it now (dormant) means later phases add
 * behavior, not a new identity model.
 *
 * The organization id intentionally mirrors the reserved, nullable `org_id`
 * column present on every business table (see docs/DATABASE.md) — the seam kept
 * open for future multi-tenancy and Agency OS correlation.
 */

/** Identity of THIS running deployment (the clone). */
export function getDeploymentIdentity(
  config: ConnectorConfig = getConnectorConfig()
): DeploymentIdentity {
  const id = config.deploymentId ?? null;
  return deploymentIdentitySchema.parse({
    id,
    identified: id !== null,
    environment: config.environment,
  });
}

/** Identity of the organization/business this deployment serves. */
export function getOrganizationIdentity(
  config: ConnectorConfig = getConnectorConfig()
): OrganizationIdentity {
  const id = config.organization.id ?? null;
  const slug = config.organization.slug ?? null;
  return organizationIdentitySchema.parse({
    id,
    slug,
    identified: id !== null,
  });
}

/** The combined identity used to address a deployment. */
export function getConnectorIdentity(
  config: ConnectorConfig = getConnectorConfig()
): ConnectorIdentity {
  return connectorIdentitySchema.parse({
    deployment: getDeploymentIdentity(config),
    organization: getOrganizationIdentity(config),
  });
}
