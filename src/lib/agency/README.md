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
| `services/metrics.service.ts` | Aggregate-only metrics (Phase 2); composes existing business services. |
| `api/` | Read-only Agency API layer (Phase 2): `auth`, `response`, `handler`, `schema`. |
| `log.ts` | Scoped `[agency:<scope>]` logger (no secrets/PII). |
| `registration/` | Outbound self-registration (Phase 3): `config`, `payload`, `client`, `retry`, `state`, orchestrator. |
| `outbound.ts` | Shared signed-`POST` primitive (used by event delivery). |
| `events/` | Versioned event system + outbox (Phase 4): `registry`, `envelope`, `outbox`, `config`, `dispatcher`, `publishEvent`. |

### Phase 2 — read-only Agency API (implemented)

Authenticated `GET` route handlers at `app/api/agency/v1/*` (`health`,
`version`, `capabilities`, `metrics`) let a future Agency OS **observe** a
deployment. They are built on the Phase 1 primitives above, expose **operational
aggregates only** (never customer data / PII), validate every response, and
return `503 disabled` when the connector is off. Auth is a per-deployment bearer
key (`AGENCY_INBOUND_API_KEY`). Still no registration, commands, sync, polling,
or outbound calls. See `docs/API.md` §2a.

### Phase 3 — outbound self-registration (implemented)

On server start, `src/instrumentation.ts` fires `ensureRegistered()` — a
**fire-and-forget** `POST` announcing this deployment to Agency OS. It is
**idempotent** (skips when disabled/unconfigured or already registered with an
unchanged payload; concurrent calls share one attempt), **retryable** (exponential
backoff + jitter on transient failures; fast-fail on terminal 4xx), and
**non-blocking** (never awaited, never throws — a failure leaves Business OS
running normally). The payload carries connector identity/version/capabilities
only (**no customer data**) and authenticates with `AGENCY_OUTBOUND_API_KEY`.
State is in-memory (`idle → skipped | registering → registered | failed`). No
monitoring, polling, synchronization, commands, deployment automation, or version
updates. See `docs/API.md` §2b and `docs/DECISIONS.md` ADR-0012.

**Registration env vars:** `AGENCY_OUTBOUND_API_KEY` (required to register),
`AGENCY_OS_REGISTER_PATH` (optional path override). Registration also requires
`AGENCY_OS_ENABLED=true`, `AGENCY_OS_BASE_URL`, and `BUSINESS_OS_DEPLOYMENT_ID`.

### Phase 4 — event system + outbox (implemented)

Business logic calls **only** `publishEvent(name, data, options?)` from
`@/lib/agency/events` and never learns how events are delivered. `publishEvent`
validates (Zod), wraps the payload in a **versioned envelope**, writes to the
**outbox**, and returns — it **never throws**, never blocks, is a **no-op when
disabled**, and is **idempotent** (optional `idempotencyKey`). A **dispatcher**
drains the outbox and delivers via the shared signed `POST`, with exponential
backoff + jitter, **dead-lettering**, and structured logging. If Agency OS is
down, events queue and Business OS keeps running. Event payloads are operational
only (**no PII**). Default outbox is in-memory (per process) behind an
`OutboxStore` interface — a durable store can replace it later (ADR-0013).

**Events env var:** `AGENCY_OS_EVENTS_PATH` (optional path override; default
`/api/v1/events`). Delivery reuses `AGENCY_OUTBOUND_API_KEY`. See `docs/API.md`
§2c and `docs/DECISIONS.md` ADR-0013.

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
