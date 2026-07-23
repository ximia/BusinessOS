# TODO.md — Business OS Backlog

> A living backlog. `ROADMAP.md` sequences *releases*; this file is the granular
> pool of work behind them. Keep it honest — move items to `CHANGELOG.md` when
> shipped, and delete what's obsolete. Sections: **Immediate priorities**,
> **Technical debt**, **Future ideas**, **Agency OS connector — deferred items &
> caveats**, **Research**, **Wishlist**.

---

## Immediate priorities (next up — v1.1 "the Hub becomes real")

Most Business Hub mutations currently update **client state only**. The theme of
the next release is persistence.

- [ ] **Admin write server actions** — `leads`, `reviews`, `gallery`, `posts`,
      `employees`. Replace client-only mutations; `revalidatePath`-backed. Add
      each to `API.md` §1.
- [ ] **CRM depth** — lead timeline / activity feed, notes, tags, assignment,
      pipeline stage changes, bulk actions, advanced filters, archived leads.
      (Tables `lead_notes`, `call_logs`, `follow_ups` exist; build the UI +
      actions.)
- [ ] **Call logs & follow-ups UI** — surface the existing tables in the lead
      drawer.
- [ ] **CSV import** — wire the existing parser (`lib/csv.ts`) to an insert
      action (currently parses → toast only).
- [ ] **Blog save/publish** — persist the editor to `posts`; handle
      `scheduled` → `published`.
- [ ] **Error/loading boundaries** — `error.tsx` / `loading.tsx` per Hub segment.
- [ ] **`useFormState` → `useActionState`** in `admin/login/page.tsx` (React 19).

---

## Technical debt

- [ ] **Demo-vs-live branch duplicated** across every service
      (`isSupabaseConfigured()` guard). Consider a repository adapter to
      centralize before write expansion.
- [ ] **Type duplication** between `types/content.ts` and `types/database.ts`
      needs hand-written mappers (`Review→Testimonial`, `Post→BlogPost`).
      Consider `supabase gen types` + a single mapping module.
- [ ] **Dead/overlapping code** — `createAdminClient()` (service-role) unused;
      `SeoConfig.ogImage` dead after dynamic OG; `leadsToCsv` overlaps
      `lib/csv.ts`.
- [ ] **Duplicated auth guard** — middleware **and** dashboard layout both check
      the session (defense-in-depth, but redundant; document or consolidate).
- [ ] **No tests, no CI** — 0 test files, no runner. See Research / `ROADMAP.md`.
- [ ] **Unbounded reads** — reviews/gallery/blog services fetch all rows; add
      `.limit()` + the existing `Pagination` primitive before real volume.
- [ ] **`Pagination` primitive unused** — wire it into blog/reviews/gallery.
- [ ] **Placeholder content** — `mapEmbedUrl`, legal copy, Unsplash imagery are
      demo stand-ins; each client must replace them (keep the template generic).

---

## Future ideas (later releases)

- [ ] **Supabase Storage** — gallery uploads + quote photo uploads; provision
      bucket, mirror RLS, upload via server action, `next/image` optimization.
- [ ] **Notifications** — real email provider (Resend/Postmark) for new
      leads/quotes, replacing the `console.info` stub.
- [ ] **Analytics dashboard redesign** (Stripe/Linear) — today's leads,
      conversion rate, quotes, popular services, traffic sources, activity.
- [ ] **Website Builder** — enable/disable/reorder/duplicate homepage sections
      (drag-drop), persisted to Business Settings.
- [ ] **Local SEO** — auto city × service landing pages, schema, sitemaps.
- [ ] **Integrations surface** — Google, GA/GTM, Calendly, etc., securely stored.
- [ ] **Role enforcement** — `admin`/`staff`/`readonly` in UI **and** RLS.
- [ ] **Client portal** — quote approval, documents, appointments, invoices,
      messages, profile (payments-ready).
- [ ] **Scheduling / appointments** module.
- [ ] **Agency OS connector — deferred work & caveats.** The connector
      (Phases 1–4) is built but has known limitations and unbuilt surfaces —
      tracked in their own section below.
- [ ] **Multi-location** — per-location address/hours/phone/map/reviews/landing.
- [ ] **Multi-tenancy / white-label** — `organizations`, membership, custom
      domains, per-tenant storage; built on the existing `org_id`.
- [ ] **AI tools** — provider-abstracted generators (service copy, FAQs, blog,
      meta, alt text, review replies, city pages).

---

## Agency OS connector — deferred items & caveats (Phases 1–4)

The connector foundation is built and dormant-safe, but several things are
intentionally deferred. Grouped by theme; each notes the phase/ADR it came from.
None of these affect independence, demo mode, or the no-customer-data guarantee.

### Durability & persistence
- [ ] **Durable event outbox** — the outbox is **in-memory per process**
      (Phase 4); undelivered events are lost if the process exits. Replace the
      default `OutboxStore` with a Supabase-backed durable store. Blocked on the
      machine write-context problem (ADR-0011). (`DECISIONS.md` ADR-0013.)
- [ ] **Persist registration state** — registration state is **in-memory**
      (Phase 3), so a deployment re-announces once per cold start. Persist it for
      true cross-restart idempotency. Same write-context dependency (ADR-0011,
      ADR-0012).
- [ ] **Outbox memory growth** — delivered/dead records are retained in the
      in-memory map for the process lifetime. Add pruning/TTL (or rely on the
      durable store) so long-lived processes don't accumulate.
- [ ] **Dead-letter handling** — events that exhaust retries or hit a terminal
      4xx are marked `dead` and kept, but there is **no inspection, requeue, or
      alerting** path. Add one when the durable outbox lands.

### Serverless robustness
- [ ] **Durable trigger / drain for serverless** — background work after the
      HTTP response (registration retries, event delivery) may be **cut short on
      serverless** platforms. If hosting serverless, add a durable drain trigger
      (drain-on-request, a queue, or a scheduled drain) rather than relying on
      post-response execution. (ADR-0012, ADR-0013.)

### Authorized read context
- [ ] **Connector server identity / authorized read context** — the read-only
      Agency API (`/api/agency/v1/metrics`) reads through `src/services/*` under
      RLS with only an API-key (machine) credential, so on a **Supabase-
      configured** deployment staff-only aggregates come back empty (correct in
      demo mode). Give the connector an authorized read path so live metrics
      work — without bypassing the services boundary, exposing PII, or weakening
      RLS. Options (ADR-0011): (a) narrow audited service-role read scoped to
      aggregates, (b) dedicated read-only Postgres role + RLS policy for the
      connector, or (c) a machine/service session. Must be independently
      revocable.

### Auth hardening (outbound + inbound)
- [ ] **HMAC request signing** — both directions currently use a bearer API key
      only (Phases 2–4). Add signed payloads (`timestamp + method + path + body`)
      so a leaked key can't be replayed/tampered. (`API.md` §5.)
- [ ] **Replay defense** — timestamp window + nonce cache on inbound requests.
- [ ] **Key rotation** — rotation with overlapping validity for inbound and
      outbound keys; assume every secret eventually leaks.
- [ ] **Mutual authentication** — each side authenticates the other (BOS signs
      outbound; Agency verifies, and vice-versa).

### Inbound / mutating surface (not built by design)
- [ ] **Authenticated inbound webhook receiver** — `app/api/agency/v1/webhooks`:
      signature-verified, timestamp-checked, **idempotent**, Zod-parsed, routed
      **through the services layer**. This is the first *mutating* handler.
      (`API.md` §4, `ARCHITECTURE.md` §9.)
- [ ] Inbound **commands / synchronization / registration-ack handling** —
      explicitly out of scope through Phase 4; design as part of the inbound
      contract.

### Event producers & catalog
- [ ] **Wire remaining event producers** — only `lead.created` and
      `quote.created` are wired (contact/quote actions). Add `review.received`
      (on review submit/approve), `deployment.updated` (on version/schema
      change), `health.changed` (needs a health signal), `appointment.created`
      (when scheduling exists), `backup.completed` (when backups exist).
- [ ] **Emit `deployment.registered` event** on successful registration (today
      registration POSTs directly; it could also publish the event for a uniform
      event stream).
- [ ] **Event schema evolution discipline** — bump an event's `version` in the
      catalog on any incompatible payload change; never repurpose a field.

### Fleet & platform (from the architecture review)
- [ ] **Tenancy-model decision** — clone-per-client vs. pooled multi-tenant is
      still unresolved (review R2). `org_id` remains unused in the schema/services
      (the connector derives org identity from env, not the DB). Decide and record
      in `DECISIONS.md`; the wrong default is a costly reversal.
- [ ] **Fleet upgrade / template propagation** (review R3) — thousands of
      independent clones become unpatchable without automated template sync +
      orchestrated redeploys. Agency OS owns orchestration, but Business OS must
      stay observable/targetable (version + schema exposed — done).
- [ ] **Migration runner + `schema_migrations` version table** (review R5) —
      migrations are hand-run SQL; unmanageable at fleet scale. Track applied
      schema version per deployment and expose it (partly done via `/version`).
- [ ] **Independence as an enforced invariant** (review R6) — currently upheld by
      discipline; add a test/lint rule that fails the build if Business OS gains a
      hard dependency on the connector/Agency OS.
- [ ] **`createAdminClient()` audit** — the service-role client (RLS-bypassing)
      will power the future inbound receiver / authorized reads; keep its usage
      narrow and audited (review R8).

---

## Research (decide before building)

- [ ] **Testing stack** — Vitest (units: services, mappers, Zod, `lib`) +
      Playwright (smoke: site render, lead submit, Hub in demo mode); GitHub
      Actions gate. Decide scope and where to draw the line.
- [ ] **Repository adapter** vs. keeping per-service guards — evaluate before the
      admin write expansion.
- [ ] **Codegen types** (`supabase gen types`) vs. hand-written DB types.
- [ ] **Agency OS contract** — versioning scheme (path vs. header), signing,
      idempotency, per-tenant credential storage.
- [ ] **Multi-tenancy resolution** — subdomain vs. custom domain vs. session;
      `auth_org()` RLS helper design.
- [ ] **Rate limiting / bot protection** for public actions beyond the honeypot.

---

## Wishlist (nice-to-have, unscheduled)

- [ ] `LazyMotion` + `m` components to trim Framer Motion from first-load JS.
- [ ] Bundle analyzer + committed Lighthouse budget (target 95+).
- [ ] Storybook (or similar) for the `components/ui` primitives.
- [ ] Auth flows: password reset, MFA.
- [ ] Per-client onboarding wizard (guided first-run setup in the Hub).
- [ ] Template ↔ clone update tooling (pull template improvements into clones).

---

## Conventions

- Keep items actionable and one-line where possible; link to the doc that owns
  the detail (`ROADMAP.md`, `DATABASE.md`, `API.md`).
- When you ship an item: check it off in the commit, move a summary to
  `CHANGELOG.md`, and update `ROADMAP.md` if a release milestone advanced.
