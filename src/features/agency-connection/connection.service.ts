import "server-only";

import { getConnectorConfig } from "@/lib/agency/config";
import { ENV } from "@/lib/agency/constants";
import { autoDeriveDeploymentId, getConnectorOverlay } from "@/lib/agency/settings";
import { primeConnectorSettings } from "@/lib/agency/settings.loader";
import { getStatusReport } from "@/lib/agency/services/diagnostics.service";

/**
 * Agency Connection — read model for the admin panel.
 *
 * Assembles what the "Agency Connection" page renders: the form's initial values
 * (the STORED overlay, so blank = inheriting), the EFFECTIVE resolved identity
 * (overlay ▹ env ▹ auto-derived), a checklist of which fleet-wide env pieces are
 * configured (booleans only — never the secret values), and the live connector
 * status. All server-side; no secret is ever returned.
 */
export interface ConnectionView {
  /** Form defaults (stored overlay; blank identity ⇒ inheriting). */
  form: {
    enabled: boolean;
    deploymentId: string;
    organizationId: string;
    organizationSlug: string;
  };
  /** The identity actually in effect right now (what gets reported to Agency). */
  effectiveDeploymentId: string | null;
  /** The zero-config id this clone would use if nothing is set. */
  autoDerivedDeploymentId: string | null;
  environment: string;
  /** Which fleet-wide env pieces the template has provided (presence only). */
  template: { baseUrl: boolean; outboundKey: boolean; inboundKey: boolean };
  /** Live connector status, or null if it couldn't be produced. */
  status: {
    state: string;
    registrationPhase: string;
    lastContactAt: string | null;
  } | null;
}

export async function getConnectionView(): Promise<ConnectionView> {
  // Make sure the overlay reflects the latest saved values before rendering.
  await primeConnectorSettings();

  const overlay = getConnectorOverlay();
  const config = getConnectorConfig();

  let status: ConnectionView["status"] = null;
  try {
    const report = getStatusReport();
    status = {
      state: report.state,
      registrationPhase: report.registrationPhase,
      lastContactAt: report.lastContactAt,
    };
  } catch {
    // status is best-effort context, never required to render the form
  }

  return {
    form: {
      // Toggle defaults to the effective enabled state when never explicitly set.
      enabled: overlay?.enabled ?? config.enabled,
      deploymentId: overlay?.deploymentId ?? "",
      organizationId: overlay?.organizationId ?? "",
      organizationSlug: overlay?.organizationSlug ?? "",
    },
    effectiveDeploymentId: config.deploymentId ?? null,
    autoDerivedDeploymentId: autoDeriveDeploymentId() ?? null,
    environment: config.environment,
    template: {
      baseUrl: Boolean(process.env[ENV.BASE_URL]),
      outboundKey: Boolean(process.env[ENV.OUTBOUND_API_KEY]),
      inboundKey: Boolean(process.env[ENV.INBOUND_API_KEY]),
    },
    status,
  };
}
