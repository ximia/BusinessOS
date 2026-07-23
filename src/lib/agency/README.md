# `src/lib/agency` — Agency Connector

The client-side connector that lets a completely separate **Agency OS**
**discover, monitor, and manage** this deployment — through authenticated,
read-only APIs and signed outbound events.

> **Independence is the invariant.** Business OS must run identically whether
> Agency OS exists, is offline, or is disabled. Every part of this module is
> optional and fail-safe; disabled (the default) it is a complete no-op.

## What it does (and never does)

**Does:** local identity/health/version/capabilities introspection; a read-only
management API (health, version, capabilities, metrics, status, metadata,
diagnostics, self-test); outbound self-registration; a versioned event system
with an outbox; a periodic heartbeat; and a derived diagnostic state.

**Never does:** depend on Agency OS to function; expose an inbound *mutating*
surface; accept remote commands; perform deployment updates, automation,
billing, AI, or DNS/SSL. Agency OS *observes and addresses* — it does not
control. Business logic touches only `publishEvent()` (from
`@/lib/agency/events`); everything else is the connector's own concern.

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
| `outbound.ts` | Shared signed-`POST` primitive (records connection state). |
| `backoff.ts` / `url.ts` | Shared exponential-backoff + URL-join helpers. |
| `connection-state.ts` | Live last-outbound-contact tracker (feeds diagnostics). |
| `global-state.ts` | `globalThis`-backed singletons shared across bundles (ADR-0014). |
| `events/` | Versioned event system + outbox (Phase 4): `registry`, `envelope`, `outbox`, `config`, `dispatcher`, `publishEvent`. |
| `heartbeat.ts` | Periodic `deployment.heartbeat` scheduler (Phase 5). |
| `services/build.service.ts` | Build/runtime provenance. |
| `services/metadata.service.ts` | Deployment + version + build + modules bundle. |
| `services/diagnostics.service.ts` | Diagnostic state + status/sync/diagnostics reports. |
| `services/self-test.service.ts` | Connector self-test (optional connectivity probe). |

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

### Phase 5 — management, diagnostics & heartbeat (implemented)

Makes the deployment *manageable*: read-only endpoints `GET
/api/agency/v1/{status,metadata,diagnostics,self-test}` (reusing the Phase 2
pipeline) let Agency OS build a dashboard, monitoring, version management, and
diagnostics with **no database access**. The connector derives a single
**diagnostic state** (`connector_disabled` / `pending_registration` /
`registered` / `healthy` / `degraded` / `disconnected` / `authentication_failed`
/ `agency_unreachable`) from registration state, live connection state, and
outbox depth. A periodic **`deployment.heartbeat`** event provides periodic
health reporting (via the existing outbox). Mutable state is shared across the
instrumentation and route contexts via `globalThis` (ADR-0014). No inbound
mutating surface; no remote commands/updates/automation. See `docs/API.md`
§2a-2 and `docs/DECISIONS.md` ADR-0014/0015.

**Heartbeat env var:** `AGENCY_HEARTBEAT_INTERVAL_MS` (optional; default 5 min).

## Configuration (all optional; unset ⇒ connector disabled + fully standalone)

| Env var | Meaning |
|---|---|
| `AGENCY_OS_ENABLED` | Master switch. Unset/false ⇒ disabled (full no-op). |
| `AGENCY_OS_BASE_URL` | Agency OS location (for registration + event/heartbeat delivery). |
| `AGENCY_OS_ENVIRONMENT` | `production` \| `preview` \| `development` (else inferred). |
| `BUSINESS_OS_DEPLOYMENT_ID` | Stable identity of this deployment (the clone). |
| `BUSINESS_OS_ORG_ID` | Stable identity of the business this deployment serves. |
| `BUSINESS_OS_ORG_SLUG` | Human-friendly org slug. |
| `AGENCY_INBOUND_API_KEY` | Secret Agency OS presents to call the read-only API. Server-only. |
| `AGENCY_OUTBOUND_API_KEY` | Secret Business OS presents to Agency OS (registration + events). Server-only. |
| `AGENCY_OS_REGISTER_PATH` / `AGENCY_OS_EVENTS_PATH` | Optional endpoint path overrides. |
| `AGENCY_HEARTBEAT_INTERVAL_MS` | Optional heartbeat cadence (default 300000). |

## The boundary this respects

Everything here is the **client-side seam** only. The Agency OS itself is a
separate product in a separate repository; no Agency OS internals live here. The
remaining connector work (durable outbox, auth hardening, the inbound mutating
receiver) is tracked in `docs/TODO.md`; the boundary rationale is in
`docs/DECISIONS.md` (ADR-0005/0007/0010/0015).
