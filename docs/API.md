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

- **Outbound-first.** On meaningful events (new lead, quote requested, review
  submitted, etc.), the client instance **emits an authenticated webhook / API
  call** to the Agency OS. Emission happens through the services layer so the
  rest of the app stays unaware of it.
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
