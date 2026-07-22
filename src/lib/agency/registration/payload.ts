import { z } from "zod";
import { getConnectorConfig } from "../config";
import { CONNECTOR_CONTRACT_VERSION } from "../constants";
import { getConnectorIdentity } from "../identity";
import { getCapabilities } from "../services/capabilities.service";
import { getVersionInfo } from "../services/version.service";
import {
  capabilitiesSchema,
  deploymentEnvironmentSchema,
  versionInfoSchema,
  type ConnectorConfig,
} from "../schema";

/**
 * Agency registration — payload.
 *
 * The document a deployment sends to announce itself to Agency OS. It is
 * composed entirely from existing connector primitives (identity, version,
 * capabilities) — no new business logic — and carries NO customer data.
 */
export const registrationPayloadSchema = z.object({
  contractVersion: z.string().min(1),
  deployment: z.object({
    id: z.string().min(1),
    environment: deploymentEnvironmentSchema,
    /** Public site URL, when known — lets Agency OS reach back later. */
    publicUrl: z.string().url().nullable(),
  }),
  organization: z.object({
    id: z.string().min(1).nullable(),
    slug: z.string().min(1).nullable(),
  }),
  version: versionInfoSchema,
  capabilities: capabilitiesSchema,
  /** When this registration attempt was assembled (excluded from the hash). */
  requestedAt: z.string().datetime(),
});
export type RegistrationPayload = z.infer<typeof registrationPayloadSchema>;

function resolvePublicUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return url && /^https?:\/\//i.test(url) ? url : null;
}

/** Build a validated registration payload from the connector's state. */
export function buildRegistrationPayload(
  config: ConnectorConfig = getConnectorConfig()
): RegistrationPayload {
  const identity = getConnectorIdentity(config);
  return registrationPayloadSchema.parse({
    contractVersion: CONNECTOR_CONTRACT_VERSION,
    deployment: {
      id: identity.deployment.id,
      environment: identity.deployment.environment,
      publicUrl: resolvePublicUrl(),
    },
    organization: {
      id: identity.organization.id,
      slug: identity.organization.slug,
    },
    version: getVersionInfo(),
    capabilities: getCapabilities(),
    requestedAt: new Date().toISOString(),
  });
}

/**
 * A stable content fingerprint of the payload, EXCLUDING the timestamp. Used as
 * the idempotency key: an unchanged payload fingerprints identically across
 * attempts, so repeat registrations are recognized and skipped.
 *
 * This is a plain, dependency-free hash (FNV-1a, two passes) — it must run on
 * both the Node and Edge runtimes (the registration module is reachable from the
 * instrumentation hook), and it is used only for change detection, never for
 * security.
 */
export function hashPayload(payload: RegistrationPayload): string {
  const { requestedAt: _ignored, ...stable } = payload;
  return fingerprint(JSON.stringify(stable));
}

function fingerprint(input: string): string {
  let forward = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    forward ^= input.charCodeAt(i);
    forward = Math.imul(forward, 0x01000193);
  }
  let reverse = 0x811c9dc5 ^ 0x9e3779b9;
  for (let i = input.length - 1; i >= 0; i -= 1) {
    reverse ^= input.charCodeAt(i);
    reverse = Math.imul(reverse, 0x01000193);
  }
  const toHex = (value: number) => (value >>> 0).toString(16).padStart(8, "0");
  return toHex(forward) + toHex(reverse);
}
