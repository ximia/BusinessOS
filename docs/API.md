# API.md — Business OS

> How data moves into and out of the application: today's **Server Actions**,
> and the **future API/webhook contract** with the (separate) Agency OS. Update
> this file in the **same change** as any new action, route handler, or
> integration seam.

---

## Philosophy

- **Server Actions are the default interface.** Business OS is a single Next.js
  app; mutations are typed, co-located Server Actions — not REST endpoints.
- **Route handlers (`app/api/*`) are the exception,** introduced only when an
  external system genuinely needs an HTTP endpoint. The first expected use is
  the Agency OS webhook receiver (§4).
- **The services layer is the boundary.** Everything that reads data goes
  through `src/services/*`; everything that writes goes through a Server Action
  (or feature action) that validates first. This is where tenancy and future
  Agency OS sync live.
- **Validated and safe by default.** Zod parses every input; demo mode never
  breaks; secrets stay server-only.

---

## 1. Server Actions (current)

All actions are `"use server"` and validate input with Zod before touching data.
They return typed results (no throwing across the client boundary).

### Public — website forms

**`submitContact(prev, formData) → ActionState`** — `src/server/actions/contact.ts`
- Validates with `contactSchema`; **honeypot** (`company`) silently drops bots.
- Inserts into `leads` (`status: 'new'`, `source: 'website'`) when Supabase is
  configured; otherwise returns a friendly success (demo mode).
- Fires an owner notification stub (`notifyOwner`, gated by
  `LEAD_NOTIFICATION_EMAIL`) — real email provider is planned (`ROADMAP.md`
  v1.2).
- Return shape: `{ ok: boolean; message: string; errors?: Record<string, string[]> }`.

**`submitQuote(prev, formData) → ActionState`** — `src/server/actions/quote.ts`
- Validates with `quoteSchema`; inserts into `quote_requests`
  (`status: 'requested'`) when configured. Same `ActionState` shape and demo
  fallback.

Both are designed for React 19 form actions (`useActionState`), include pending
state on the client, and toast the outcome.

### Auth

**`signIn(prev, formData)`**, **`signOut()`** — `src/server/actions/auth.ts`
- Supabase Auth email/password. Demo bypass when Supabase is unconfigured (Hub
  opens without auth — never ship unconfigured to production).

### Feature actions (authenticated)

**`updateBusinessSettings(input)`** — `src/features/settings/settings.actions.ts`
- Auth-guarded upsert of the `business_settings` JSONB row; validates against
  `businessSettingsSchema`; revalidates the settings cache tag.

**`applyTheme({ presetId | custom, applyContent })`** —
`src/features/theme/theme.actions.ts`
- Patches only the theme (and optional starter copy) within Business Settings,
  preserving everything else.

> As admin write-actions land (leads, reviews, gallery, posts, employees —
> `ROADMAP.md` v1.1), document each here with its input schema and effect.

### Conventions for new actions

- File: `*.actions.ts` (feature slice) or `src/server/actions/*.ts` (global).
- `"use server"`; validate arguments with a Zod schema first.
- Auth-guard anything non-public; check the Supabase session server-side.
- Return a typed, discriminated result; never throw to the client.
- After a write, `revalidatePath` / revalidate the relevant cache tag.
- Keep a demo-mode-safe path so the action degrades without Supabase.

---

## 2. System endpoints (framework-generated)

Not application APIs, but HTTP surfaces the app serves:
`sitemap.xml`, `robots.txt`, `opengraph-image` (edge, dynamic), `icon.svg`.

---

## 2a. Agency API — `/api/agency/v1/*` (implemented; read-only)

The **only** `route.ts` handlers in the app. A read-only, authenticated surface
a future Agency OS uses to observe a deployment. Built on the dormant connector
primitives in `src/lib/agency` (Phase 1); the routes and API layer are Phase 2.

**Endpoints (all `GET`, all authenticated):**

| Endpoint | Returns | Source |
|---|---|---|
| `/api/agency/v1/health` | Liveness + local status: `status`, `connectorEnabled`, deployment/org id, `uptimeSeconds`, `checks.database` (configured/not — a local env check, **not** a remote probe). | `getHealthReport()` |
| `/api/agency/v1/version` | `app`, `schema`, `connectorContract`, `runtime` — what the deployment *is*, for fleet/version awareness. | `getVersionInfo()` |
| `/api/agency/v1/capabilities` | Present product modules + integration capability flags (all `false` this phase). Negotiation surface. | `getCapabilities()` |
| `/api/agency/v1/metrics` | **Aggregate-only** operational metrics (lead/quote/review/content/team counts, status distributions, value rollups). | `buildMetricsSnapshot()` composing existing `src/services/*` |

**Guarantees & boundaries:**
- **Read-only.** No registration, commands, synchronization, or polling.
- **No customer data, ever.** Metrics are counts/rollups/distributions only —
  no names, emails, phones, messages, or per-record identifiers. The metrics
  service composes existing business services and discards the records after
  counting; it never queries Supabase directly and never re-implements logic.
- **Every response is Zod-validated** before it leaves the process, wrapped in a
  uniform envelope (`ok`, `resource`, `contractVersion`, `deploymentId`,
  `generatedAt`, `data`). Non-success uses an error envelope (`ok:false`,
  `status`, `message`).
- **Disabled deployments** (connector off) return `503` with
  `{ status: "disabled" }` uniformly — a benign, data-free signal.
- Handlers run on the Node runtime, `dynamic = "force-dynamic"`, `no-store`.

**Auth:** per-deployment shared secret in `AGENCY_INBOUND_API_KEY`, presented as
`Authorization: Bearer <key>` (or `x-agency-key`), compared in constant time
against a hashed value. This is a **separate lane** from human Supabase-cookie
auth — the caller is a machine peer, not a staff session. Missing/invalid ⇒
`401`. (HMAC request signing, replay defense, and key rotation are deferred to a
later phase — they matter most for mutating surfaces, which don't exist yet.)

---

## 2a-2. Management & diagnostics endpoints (implemented; read-only)

Phase 5 adds four authenticated, read-only endpoints so Agency OS can build a
deployment dashboard, monitoring, version management, and diagnostics **without
any database access**. They reuse the same pipeline, envelope, auth, and
validation as §2a (no duplication) and compose existing connector services.

| Endpoint | Returns | Agency OS use |
|---|---|---|
| `/api/agency/v1/status` | Compact: the single diagnostic `state`, connector mode, registration phase, last-contact time, uptime. | Dashboard list + uptime monitoring (poll frequently). |
| `/api/agency/v1/diagnostics` | Full: `state` + connector status + registration status + synchronization (outbox depth) + connection state + health. | Deployment diagnostics detail view. |
| `/api/agency/v1/metadata` | Deployment metadata + version metadata (incl. schema version) + build info + installed modules. | Dashboard card + version management. |
| `/api/agency/v1/self-test` | Per-check results (pass/warn/fail/skip) + overall. `?probe=1` adds a live Agency connectivity check. | Diagnostics / onboarding verification. |

**Diagnostic state** (`/status`, `/diagnostics`) is one of: `connector_disabled`,
`pending_registration`, `registered`, `healthy`, `degraded`, `disconnected`,
`authentication_failed`, `agency_unreachable` — derived locally from
registration state, live connection state (last outbound contact), and outbox
depth. This is the single field Agency OS keys dashboards and alerts off.

**Deployment timeline** is assembled by Agency OS from the events it receives
(`deployment.registered`, `deployment.heartbeat`, `health.changed`, …) plus
these snapshots — Business OS stores no history, so there is no timeline endpoint.

The capability flags in `/capabilities` now reflect what is built:
`registration`, `eventPublishing`, `metricsReporting`, `healthReporting`,
`diagnostics` = true; `inboundWebhooks`, `remoteConfig` = false.

---

## 2a-3. Provisioning identity — `NEXT_PUBLIC_BUSINESS_*` (inbound env contract)

When Agency OS provisions a clone it injects the client's identity as environment
variables at deploy time; `src/config/business-profile.ts` overlays them onto the
demo config (ADR-0006). This is a **contract shared with Agency OS** — the names
must match on both sides. All are optional; any unset value falls back to the
industry preset, then the demo default. `NEXT_PUBLIC_` so they reach client
components (they are non-secret identity, never keys).

| Variable | Overlays | Notes |
|---|---|---|
| `NEXT_PUBLIC_BUSINESS_NAME` | company/legal name, logo alt, SEO title | |
| `NEXT_PUBLIC_BUSINESS_PRESET` | palette + tagline/description + trust badges + starter services | must be an `industryPresets` id (e.g. `hvac`, `roofing`, `nail-salon`) |
| `NEXT_PUBLIC_BUSINESS_INDUSTRY` | industry label | defaults to the preset's label |
| `NEXT_PUBLIC_BUSINESS_TAGLINE` | hero headline | defaults to the preset's sample |
| `NEXT_PUBLIC_BUSINESS_DESCRIPTION` | hero + meta description | defaults to the preset's sample |
| `NEXT_PUBLIC_BUSINESS_PHONE` | phone (+ derived `tel:` E.164) | |
| `NEXT_PUBLIC_BUSINESS_EMAIL` | contact email | |
| `NEXT_PUBLIC_BUSINESS_STREET` / `_CITY` / `_STATE` / `_ZIP` | address text | map coordinates are left for Admin → Settings |
| `NEXT_PUBLIC_BUSINESS_PRIMARY_HSL` | brand `--primary` (HSL triple) | overrides the preset color |

With none set, the overlay is a no-op and the site is the detailing demo.

## 2b. Outbound self-registration (implemented)

The **first outbound call** in the codebase. On server start, a deployment
announces itself to Agency OS — the beginning of the "outbound-first" model in
§4. Lives in `src/lib/agency/registration`; triggered by the Next.js
`instrumentation` hook (`src/instrumentation.ts`).

- **Endpoint (outbound):** `POST {AGENCY_OS_BASE_URL}{AGENCY_OS_REGISTER_PATH}`
  (default path `/api/v1/deployments/register`).
- **Auth (outbound):** `Authorization: Bearer <AGENCY_OUTBOUND_API_KEY>` — a
  server-only secret Business OS presents to Agency OS (distinct from the inbound
  key in §2a). Plus `x-idempotency-key`, `x-business-os-deployment`, and
  `x-business-os-contract` headers.
- **Payload:** deployment identity, organization identity, version info, and the
  capability descriptor — composed from the connector primitives. **No customer
  data.**
- **Idempotent:** skipped when disabled/unconfigured or already registered with
  an unchanged payload (fingerprint hash); concurrent calls share one attempt.
- **Retryable:** transient failures (network/timeout/5xx/429) back off and retry
  (exponential + jitter, bounded); terminal 4xx (e.g. bad key) fail fast.
- **Non-blocking & fail-safe:** fire-and-forget, never awaited, never throws.
  Registration failure never delays or prevents startup; Business OS runs
  normally regardless.
- **State:** an in-process lifecycle (`idle → skipped | registering → registered
  | failed`); not persisted (Agency OS owns cross-restart idempotency via the
  idempotency key). See `DECISIONS.md` ADR-0012.

Not included (by design this phase): monitoring, polling, synchronization,
inbound commands, deployment automation, version updates.

---

## 2c. Event publishing (implemented; outbox)

A reusable, versioned event system for reporting domain/system events to Agency
OS. Lives in `src/lib/agency/events`. **Business logic calls only
`publishEvent(name, data, options?)`** and never learns how events are delivered.

- **Versioned events.** Each event has a Zod schema + version in the catalog
  (`events/registry.ts`), carried on the envelope (`specVersion` for the
  envelope format, `version` for the payload). Current catalog:
  `deployment.registered`, `deployment.updated`, `deployment.heartbeat`,
  `health.changed`, `lead.created`, `quote.created`, `appointment.created`,
  `review.received`, `backup.completed`. A periodic `deployment.heartbeat`
  (Phase 5) is emitted on an interval by the heartbeat scheduler when enabled —
  the "periodic health reporting" signal Agency OS uses for liveness/uptime.
- **`publishEvent()` contract:** validates the payload (Zod), wraps it in an
  envelope, writes to the **outbox**, kicks the dispatcher, and returns. It
  **never throws**, never blocks, is a **no-op when the connector is disabled**,
  and is **idempotent** (pass `idempotencyKey`, e.g. a domain id, to collapse
  duplicates).
- **Outbox + dispatcher.** `publishEvent` only enqueues. The dispatcher
  (`events/dispatcher.ts`) drains the outbox and delivers via the shared signed
  `POST` (`src/lib/agency/outbound.ts`) to
  `POST {AGENCY_OS_BASE_URL}{AGENCY_OS_EVENTS_PATH}` (default `/api/v1/events`),
  auth `Bearer <AGENCY_OUTBOUND_API_KEY>`, with `x-idempotency-key`,
  `x-event-name`, `x-event-version`, `x-business-os-deployment` headers.
- **Retry & backoff.** Transient failures (network/timeout/5xx/429) back off
  (exponential + jitter, bounded `maxAttempts`) and retry; terminal 4xx or
  exhausted attempts are **dead-lettered** (kept, marked `dead`). Retries are
  event-driven (a single self-terminating timer), not a poller.
- **Agency down ⇒ no impact.** Events wait in the outbox; Business OS operation
  is never interrupted. The default outbox is in-memory (per process) — see
  `DECISIONS.md` ADR-0013 for the durability trade-off and the future durable
  store.
- **No customer data.** Event payloads are operational only (ids, types,
  statuses, counts, ratings) — no names/emails/phones/messages.

**Usage (the entire business-logic surface):**
```ts
import { publishEvent } from "@/lib/agency/events";
publishEvent("lead.created", { source: "website" });
publishEvent("quote.created", { service }, { idempotencyKey: `quote:${id}` });
```
Wired as a demonstration in the contact and quote server actions.

---

## 3. Authentication & authorization

- **Auth:** Supabase Auth via `@supabase/ssr`. Sessions are refreshed in
  `middleware.ts`; `/admin` is guarded there and re-checked in the dashboard
  layout.
- **Public vs. staff:** enforced primarily by **RLS** (see `DATABASE.md`) —
  anon may insert leads/quotes/reviews and read only public marketing content;
  authenticated staff have full access.
- **Roles** (`admin`/`staff`/`readonly`) are defined but **not yet enforced**
  (`ROADMAP.md` v2.0). Don't assume role isolation in API design yet.
- **Secrets:** the service-role key is server-only (`SUPABASE_SERVICE_ROLE_KEY`),
  never `NEXT_PUBLIC_*`, never sent to the client.

---

## 4. Future: Agency OS communication (contract, client-side only)

Each client instance will communicate with a **separate Agency OS** (different
repository, different product). This repo owns **only the client-side seam** —
never Agency OS internals.

### Direction & shape (intended)

- **Outbound-first.** Self-registration on startup (§2b) and a versioned event
  system with an outbox (§2c) are both **implemented**. Business logic emits via
  `publishEvent()` and stays unaware of delivery; the outbox/dispatcher own
  transport, retries, and dead-lettering.
- **Inbound receiver.** A future authenticated route handler under `app/api/`
  (e.g. `app/api/agency/v1/webhooks/route.ts`) would accept Agency OS callbacks.
  It validates a signature, parses the payload with Zod, and applies changes
  **through the services layer**. This is the first *mutating* handler — the
  read-only Agency API (§2a) is already in place; the webhook receiver is not
  yet built.

### Principles for the contract

- **Versioned.** The Agency OS API is versioned independently (e.g. path or
  header versioning) so client instances and the Agency OS evolve without
  lockstep upgrades.
- **Authenticated & signed.** Every request carries a verifiable credential;
  inbound webhooks are signature-verified before processing.
- **Idempotent.** Webhook handlers tolerate retries/duplicates.
- **Least coupling.** The client instance functions fully even if the Agency OS
  is unreachable; sync is additive, never a hard dependency.
- **Per-tenant isolation.** Credentials and endpoints are per client instance;
  no shared secrets across clones.

### Webhook strategy (summary)

- Outbound events → Agency OS: signed POSTs, retried with backoff, logged.
- Inbound commands ← Agency OS: single verified receiver, Zod-validated, routed
  through services.
- Configuration (endpoint URL, signing secret) stored as server-only
  environment/config per client.

> Implement this only when scheduled (`ROADMAP.md` v2.0). Until then, keep the
> services layer as the clean seam so the contract can be added without
> reworking the app. **Do not document Agency OS internals here.**

---

## 5. Change checklist (for every API change)

1. New Server Action → add it to §1 with input schema, effect, and auth level.
2. New route handler → add it to §2/§4 with method, auth, and payload contract.
3. New external integration → document endpoint, auth, and versioning here.
4. Touching data flow → confirm it goes through `services/` (reads) or a
   validated action (writes); update `ARCHITECTURE.md` if the seam changes.
5. Update `CHANGELOG.md` when the change ships.
