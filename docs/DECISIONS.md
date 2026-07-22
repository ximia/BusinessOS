# DECISIONS.md — Architectural Decision Log

> A running record of significant, hard-to-reverse decisions and the reasoning
> behind them. Add an entry whenever you make a structural choice that a future
> maintainer would otherwise have to reverse-engineer. Newest at the top. Don't
> rewrite history — supersede an old decision with a new one.

**Format:** each entry has a status (Accepted / Superseded / Proposed), the
decision, the context, and the consequences.

---

## ADR-0012 — Outbound self-registration is fire-and-forget, retryable, and startup-triggered
**Status:** Accepted · 2026-07

**Decision:** Business OS registers itself with Agency OS via a single outbound
`POST` on server start, wired through the Next.js `instrumentation` hook. The
call is **fire-and-forget** (never awaited, never throws), **idempotent** (skips
when disabled/unconfigured or already registered with an unchanged payload
fingerprint; concurrent calls share one in-flight attempt), and **retryable**
(exponential backoff + jitter on transient failures; fast-fail on terminal 4xx).
Registration **state is in-memory**, per process.

**Context:** This is the first outbound dependency direction (Business OS →
Agency OS). The prime invariant is that Business OS must never depend on Agency
OS: registration cannot delay or prevent startup, and its failure must leave the
app fully operational. The Next `instrumentation` hook runs once at startup and
is the idiomatic place for this; but since Next awaits the hook, the hook must
only *kick off* registration (synchronously) and not await the network.

**Why in-memory state (not persisted):** persisting registration state would
require a machine write-context under RLS — the unresolved problem in ADR-0011 —
and true cross-restart idempotency belongs to the Agency OS endpoint anyway
(upsert by deployment id + idempotency key). Re-announcing once per cold start is
safe and cheap. A persistent backend can be added behind the state module later.

**Consequences:** Registration is opt-in (enabled + base URL + deployment id +
outbound key), carries no customer data, and uses a dedicated outbound secret
distinct from the inbound API key. On serverless, background retries may be cut
short by the platform after the response — acceptable for best-effort
registration (a later phase may add a durable trigger). Explicitly excluded this
phase: monitoring, polling, synchronization, inbound commands, deployment
automation, version updates. Payload fingerprinting uses a plain, dependency-free
hash (not `node:crypto`) so the registration module stays Edge-bundle-safe when
pulled in through the instrumentation hook.

---

## ADR-0011 — Agency API reads through the services layer under RLS; no elevated read context yet
**Status:** Accepted (with a known, deferred limitation) · 2026-07

**Decision:** The read-only Agency API (`/api/agency/v1/*`, Phase 2) composes the
existing `src/services/*` functions and does **not** introduce a service-role
(RLS-bypassing) read path. Requests authenticate with a per-deployment API key,
which is a machine-peer credential — **not** a Supabase staff session.

**Context:** The requirement was explicit: use existing services, never query
Supabase directly, never duplicate business logic. The services read via the
cookie-scoped Supabase client, which respects RLS. An API-key caller has no
staff session, so on a **Supabase-configured** deployment the services run under
the `anon`/no-session context — which RLS restricts to public data. Staff-only
tables (leads, quotes, employees…) therefore return empty in that context, so
`/metrics` reports zeros on a live deployment (it is fully correct in demo mode,
where services return mock data).

**Why we accepted it now:** the alternative — wiring `createAdminClient()`
(service-role, bypasses all RLS) into the metrics path — was explicitly out of
scope and is a security-sensitive decision that deserves its own design. Read-
only aggregate endpoints returning conservative/empty data on a live deployment
is a safe interim state; over-exposing via a bypass is not.

**Consequences / what must change later:** a dedicated **connector server
identity** is needed so the API can read authorized aggregates on a configured
deployment. Options to design when that phase lands: (a) a narrow, audited
service-role read used *only* by the metrics service, scoped to aggregate
queries; (b) a dedicated Postgres role / RLS policy granting the connector
read-only access to the specific tables; or (c) a Supabase machine/service
session. Whichever is chosen must keep the services layer as the boundary, must
never expose per-record PII, and must be independently revocable. Tracked in
`TODO.md`. This limitation does not affect independence, demo mode, or the
no-customer-data guarantee.

---

## ADR-0010 — Read-only, API-key-authenticated Agency API as the first route handlers
**Status:** Accepted · 2026-07

**Decision:** Expose Agency OS ↔ Business OS communication first as a **read-only**
API (`GET /api/agency/v1/{health,version,capabilities,metrics}`), authenticated
by a per-deployment bearer key with constant-time comparison, built on the
dormant Phase 1 connector. Mutating surfaces (webhooks, commands, registration,
sync) are deliberately excluded.

**Context:** Agency OS must be able to *observe* a fleet before it can *act* on
it. Reads are lower-risk than mutations and let the contract, envelope shape, and
auth lane stabilize first. A machine caller needs a credential that is separate
from human Supabase-cookie auth.

**Consequences:** These are the app's first `route.ts` handlers. Every response
is Zod-validated and wrapped in a uniform envelope; disabled deployments return a
`503 disabled` signal; endpoints expose operational aggregates only (no customer
data). Request signing (HMAC), replay defense, and key rotation are deferred —
they matter most for the mutating surfaces that don't yet exist (see `API.md`
§5). The versioned `/v1/` path lets the contract evolve without lockstep fleet
upgrades.

---

## ADR-0009 — Documentation is a first-class product deliverable
**Status:** Accepted · 2026-07

**Decision:** Maintain a formal `docs/` system (`PRODUCT`, `ROADMAP`,
`ARCHITECTURE`, `UI_GUIDELINES`, `CODING_STANDARDS`, `DATABASE`, `API`,
`DECISIONS`, `CHANGELOG`, `TODO`) plus a root `CLAUDE.md` operating manual, and
update the relevant doc in the **same change** as the code.

**Context:** This repository is the long-lived foundation that every client is
cloned from; institutional knowledge previously lived in an ad-hoc handoff note.
A commercial platform maintained for years needs durable, non-stale docs.

**Consequences:** Every code change carries a documentation responsibility (see
the matrix in `CLAUDE.md`). Stale docs are treated as bugs. Slightly more work
per change, far less knowledge loss over time.

---

## ADR-0008 — This repository is the Business OS template
**Status:** Accepted · 2026-07

**Decision:** Position this repo explicitly as the **Business OS** — business
software for local service businesses — and its master template. It is not an
agency dashboard, a website builder, or a generic template. The product is one
experience with two surfaces: the **Website** (marketing frontend) and the
**Business Hub** (operational backend).

**Context:** The codebase began as a "premium multi-industry website + admin
template." The product direction is now a cohesive business-software platform
where the website and the operational hub are one product.

**Consequences:** Docs, naming, and roadmap frame everything as Business OS.
"We sell business software, not websites" guides prioritization. The `/admin`
surface is understood as the Business Hub. `README.md`'s legacy "LocalSite"
framing is retained as the public quick-start but the canonical framing is here
and in `PRODUCT.md`.

---

## ADR-0007 — Separate Business OS and Agency OS repositories
**Status:** Accepted · 2026-07

**Decision:** The **Agency OS is a separate product in a separate repository.**
This repo contains only the Business OS (client-facing product) and, in future,
the **client-side seam** for talking to the Agency OS.

**Context:** The agency needs a central system to oversee and serve many
clients, but each client must remain independent and own their data. Merging the
two would couple client instances to agency infrastructure.

**Consequences:** No Agency OS internals are built or documented here — only
future-compatibility seams (`API.md` §4). The two systems can evolve and deploy
independently.

---

## ADR-0006 — Each client is an independent clone with independent deployment
**Status:** Accepted · 2026-07

**Decision:** Every client runs their **own clone** of this template, with its
own Supabase project, its own Vercel deployment, and its own domain. Clients
share no runtime infrastructure at the template level.

**Context:** Local businesses need data ownership, isolation, and the ability to
operate independently. It also lets clones diverge as needed.

**Consequences:** Simple per-client mental model and strong isolation, at the
cost of many deployments to manage (a problem the Agency OS will address).
Template improvements are pulled forward into clones deliberately, not
automatically. Multi-tenancy remains optional and future (ADR-0004).

---

## ADR-0005 — Future Agency OS communication via versioned APIs + webhooks
**Status:** Accepted (design intent) · 2026-07

**Decision:** Client instances will communicate with the Agency OS over
**secure, versioned, authenticated APIs and webhooks** — outbound-first, with a
single authenticated inbound receiver. All sync flows through the services
layer.

**Context:** The Agency OS must observe and serve clients without coupling to
their internals or sharing data across clients.

**Consequences:** The services layer is preserved as the clean integration seam;
the first-ever REST route handler will be the webhook receiver. Independent
versioning avoids lockstep upgrades. Not yet implemented — see `ROADMAP.md`
v2.0 and `API.md` §4.

---

## ADR-0004 — Multi-tenancy is designed-for but deferred (`org_id` seam)
**Status:** Accepted · (from initial schema)

**Decision:** Ship single-tenant, but give **every business table a nullable
`org_id`** so a future multi-tenant migration only needs an `organizations`
table, membership, tenant resolution, and tightened RLS — with the services
layer as the only code to change.

**Context:** Multi-tenancy is a real future need (white-label), but building it
prematurely would add complexity every client pays for now.

**Consequences:** Near-zero present cost, a clear future path. `org_id` must not
be removed. Don't build tenancy speculatively before it's scheduled.

---

## ADR-0003 — Config + Business Settings as the content model
**Status:** Accepted

**Decision:** Client content lives in **compile-time config** (`src/config/*`,
string-keyed icons) deep-merged with **runtime Business Settings**
(`business_settings` JSONB, `src/features/settings`). Components read content;
they don't embed it.

**Context:** The template must re-brand per client in minutes, and
non-technical admins must edit core details at runtime — without redeploys or
touching JSX.

**Consequences:** A re-brand is a config/settings change, not a code change.
Settings are read cookieless so marketing pages stay static/ISR. Adding a
settings field requires updating schema + merge + editor together (documented in
`ARCHITECTURE.md`).

---

## ADR-0002 — Services layer is the single reader; demo mode via mock data
**Status:** Accepted

**Decision:** All data reads go through `src/services/*`, which returns Supabase
rows when configured and `src/services/mock-data.ts` otherwise
(`isSupabaseConfigured()`). No page or component reads the database directly.

**Context:** The app must run and demo with zero configuration, and cross-cutting
concerns (tenancy, future Agency OS sync, caching) need one home.

**Consequences:** Demo mode always works; the services layer is the seam for
tenancy and sync. Cost: a demo/live branch in each service (accepted; a
repository adapter may centralize it before heavy write expansion).

---

## ADR-0001 — Next.js App Router, Server Components, Server Actions
**Status:** Accepted

**Decision:** Build on Next.js 15 App Router with **Server Components by
default** and **Server Actions for mutations** — no REST route handlers unless an
external system requires one. TypeScript strict; Tailwind + Radix/shadcn-style
primitives; Supabase for Auth/DB/Storage.

**Context:** A modern, performant, statically-optimizable marketing site plus a
server-rendered operational hub, with minimal API surface and strong typing.

**Consequences:** Marketing pages are static/ISR; the Hub is server-rendered;
the API surface stays tiny and typed. The one anticipated route handler is the
future Agency OS webhook receiver (ADR-0005).

---

## How to add an entry

1. Use the next `ADR-00NN` number; put it at the top.
2. State the **decision**, the **context/why**, and the **consequences**.
3. Set a status. To reverse a decision, add a new ADR and mark the old one
   **Superseded by ADR-00NN** — never delete it.
