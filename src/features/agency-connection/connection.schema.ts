import { z } from "zod";

/**
 * Agency Connection — the admin-editable form contract.
 *
 * Only the NON-SECRET connector settings a business owner manages from the
 * Business Hub: whether the connector is on, and this deployment's identity.
 * The shared API keys and the Agency OS base URL are template-level env vars and
 * are never edited here. Blank identity fields mean "inherit the env / auto id".
 */
export const connectorConnectionSchema = z.object({
  enabled: z.boolean(),
  deploymentId: z.string().trim().max(200).optional().or(z.literal("")),
  organizationId: z.string().trim().max(200).optional().or(z.literal("")),
  organizationSlug: z.string().trim().max(200).optional().or(z.literal("")),
});

export type ConnectorConnectionInput = z.infer<typeof connectorConnectionSchema>;
