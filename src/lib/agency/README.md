# `src/lib/agency` — Agency Connector (Phase 1: dormant foundation)

This module prepares Business OS to be **observed and addressed** by a future,
completely separate **Agency OS** — without adding any dependency on it.

> **Independence is the invariant.** Business OS must run identically whether
> Agency OS exists, is offline, or is disabled. This module never breaks that.

## Dormancy contract (Phase 1)

This module **does not**, and in Phase 1 never will:

- make network requests,
- expose APIs or route handlers,
- send or receive webhooks,
- register with Agency OS,
- publish events, or
- synchronize any data.

It only **describes the deployment locally**: identity, health, version, and
capabilities — computed in-process, on demand, from environment + constants.
**Nothing in the running application imports it**, so the app behaves exactly as
it did before this code existed.

## What's here

| File | Responsibility |
|---|---|
| `index.ts` | Public surface. Import from `@/lib/agency` only. |
| `connector.ts` | Composition root — assembles the dormant `AgencyConnector`. |
| `config.ts` | Env → validated `ConnectorConfig` (never throws; dormant default). |
| `constants.ts` | App/schema/contract versions + env-var names. |
| `identity.ts` | Deployment identity + organization identity. |
| `schema.ts` | Zod data contracts (config, identity, health, version, capabilities). |
| `types.ts` | Behavioral interfaces (`AgencyConnector`, `ConnectorStatus`). |
| `services/health.service.ts` | Local health report (no remote probes). |
| `services/version.service.ts` | Version / fleet-awareness info. |
| `services/capabilities.service.ts` | Module + integration capability descriptor. |

## Configuration (all optional; unset ⇒ dormant + standalone)

| Env var | Meaning |
|---|---|
| `AGENCY_OS_ENABLED` | Master switch. Unset/false ⇒ dormant. (No behavioral effect in Phase 1.) |
| `AGENCY_OS_BASE_URL` | Agency OS location. Stored for later; **unused in Phase 1**. |
| `AGENCY_OS_ENVIRONMENT` | `production` \| `preview` \| `development` (else inferred). |
| `BUSINESS_OS_DEPLOYMENT_ID` | Stable identity of this deployment (the clone). |
| `BUSINESS_OS_ORG_ID` | Stable identity of the business this deployment serves. |
| `BUSINESS_OS_ORG_SLUG` | Human-friendly org slug. |

## How later phases build on this

Future phases add the API layer, machine authentication, event pipeline, and
registration **on top of** these primitives — flipping the `integration.*`
capability flags on one at a time — while the contract shapes here stay stable.
See `docs/API.md` §4 and `docs/DECISIONS.md` (ADR-0005/0007) for the boundary
this respects.
