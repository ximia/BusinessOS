import { getConnectorConfig } from "../config";
import { ENV } from "../constants";
import { getOutboxSnapshot } from "../events";
import { getEventsConfig } from "../events/config";
import { buildRegistrationPayload } from "../registration/payload";
import { getRegistrationState } from "../registration/state";
import {
  selfTestReportSchema,
  type SelfTestCheck,
  type SelfTestReport,
} from "../schema";

/**
 * Agency Connector — self-test service (Phase 5).
 *
 * Runs a series of checks so Agency OS (or an operator) can confirm a deployment
 * is correctly wired for management. All checks are local except the optional
 * connectivity probe. Never throws — a failing check is a reported result, not
 * an exception.
 */

const CONNECTIVITY_TIMEOUT_MS = 5000;

function check(
  name: string,
  status: SelfTestCheck["status"],
  detail: string | null = null
): SelfTestCheck {
  return { name, status, detail };
}

/** Best-effort connectivity probe to the Agency base URL (no auth, no delivery). */
async function probeConnectivity(baseUrl: string): Promise<SelfTestCheck> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONNECTIVITY_TIMEOUT_MS);
  try {
    const response = await fetch(baseUrl, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });
    // Any HTTP response means Agency OS host is reachable.
    return check("agency_connectivity", "pass", `reachable (HTTP ${response.status})`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unreachable";
    return check("agency_connectivity", "fail", message);
  } finally {
    clearTimeout(timeout);
  }
}

export interface SelfTestOptions {
  /** Perform a live connectivity probe to Agency OS. Off by default. */
  probeAgency?: boolean;
}

export async function runSelfTest(
  options: SelfTestOptions = {}
): Promise<SelfTestReport> {
  const config = getConnectorConfig();
  const events = getEventsConfig();
  const registration = getRegistrationState();
  const checks: SelfTestCheck[] = [];

  // 1. Connector enabled.
  checks.push(
    config.enabled
      ? check("connector_enabled", "pass")
      : check("connector_enabled", "warn", "connector disabled")
  );

  // 2. Deployment identity — required to be managed.
  checks.push(
    config.deploymentId
      ? check("deployment_identity", "pass", config.deploymentId)
      : check("deployment_identity", "fail", "BUSINESS_OS_DEPLOYMENT_ID not set")
  );

  // 3. Organization identity — recommended.
  checks.push(
    config.organization.id
      ? check("organization_identity", "pass", config.organization.id)
      : check("organization_identity", "warn", "BUSINESS_OS_ORG_ID not set")
  );

  // 4. Outbound delivery config (base URL + outbound key).
  checks.push(
    events.canDeliver
      ? check("outbound_config", "pass")
      : check("outbound_config", "fail", events.skipReason)
  );

  // 5. Inbound API auth config.
  checks.push(
    process.env[ENV.INBOUND_API_KEY]?.trim()
      ? check("inbound_auth_config", "pass")
      : check("inbound_auth_config", "warn", "AGENCY_INBOUND_API_KEY not set")
  );

  // 6. Registration status.
  checks.push(
    registration.phase === "registered"
      ? check("registration", "pass")
      : registration.phase === "failed"
        ? check("registration", "fail", registration.lastError)
        : check("registration", "warn", registration.phase)
  );

  // 7. Registration payload builds (identity/version/capabilities compose).
  try {
    buildRegistrationPayload(config);
    checks.push(check("payload_build", "pass"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid";
    checks.push(check("payload_build", "fail", message));
  }

  // 8. Event pipeline / outbox health.
  const dead = getOutboxSnapshot().filter((r) => r.status === "dead").length;
  checks.push(
    dead > 0
      ? check("event_pipeline", "warn", `${dead} dead-lettered event(s)`)
      : check("event_pipeline", "pass")
  );

  // 9. Optional live connectivity probe.
  if (options.probeAgency) {
    checks.push(
      config.agencyBaseUrl
        ? await probeConnectivity(config.agencyBaseUrl)
        : check("agency_connectivity", "skip", "AGENCY_OS_BASE_URL not set")
    );
  }

  const status = checks.some((c) => c.status === "fail")
    ? "fail"
    : checks.some((c) => c.status === "warn")
      ? "warn"
      : "pass";

  return selfTestReportSchema.parse({
    status,
    checks,
    generatedAt: new Date().toISOString(),
  });
}
