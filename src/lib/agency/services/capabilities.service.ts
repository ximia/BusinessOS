import { CONNECTOR_CONTRACT_VERSION } from "../constants";
import {
  capabilitiesSchema,
  type Capabilities,
  type IntegrationCapabilities,
  type ModuleCapability,
} from "../schema";

/**
 * Agency Connector — capabilities service.
 *
 * Describes what this deployment can do, in two parts:
 *   1. `modules`      — the product modules present in the Business OS template.
 *   2. `integration`  — what the deployment can do *with Agency OS*.
 *
 * This is the negotiation surface: a future Agency OS reads it to know which
 * features a given deployment supports before attempting anything. In Phase 1
 * EVERY integration capability is `false` — the primitives are named and typed,
 * but none is wired. Later phases flip individual flags on as each capability
 * ships, without ever changing the contract's shape.
 *
 * PHASE 1 (dormant): computed from static, local knowledge; never transmitted.
 */

/** Product modules shipped by the Business OS template. */
const MODULES: readonly ModuleCapability[] = [
  { key: "leads", label: "Leads / CRM", available: true },
  { key: "quotes", label: "Quotes", available: true },
  { key: "reviews", label: "Reviews", available: true },
  { key: "gallery", label: "Gallery", available: true },
  { key: "blog", label: "Blog", available: true },
  { key: "employees", label: "Team", available: true },
  { key: "settings", label: "Business Settings", available: true },
  { key: "theme", label: "Theme / Industry Studio", available: true },
];

/**
 * Agency-integration capabilities — what this deployment can do with Agency OS.
 * Reflects what is actually built: registration (P3), event publishing (P4),
 * metrics + health/diagnostics reporting (P2/P5). `inboundWebhooks` and
 * `remoteConfig` remain false — no inbound/mutating surface exists yet. Agency OS
 * negotiates on these flags, so they must stay accurate.
 */
const INTEGRATION: IntegrationCapabilities = {
  registration: true,
  eventPublishing: true,
  inboundWebhooks: false,
  metricsReporting: true,
  healthReporting: true,
  diagnostics: true,
  remoteConfig: false,
};

/** Build the capability descriptor for this deployment. */
export function getCapabilities(): Capabilities {
  return capabilitiesSchema.parse({
    contractVersion: CONNECTOR_CONTRACT_VERSION,
    modules: MODULES,
    integration: INTEGRATION,
  });
}
