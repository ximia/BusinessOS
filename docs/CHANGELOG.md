# CHANGELOG — Business OS

All notable changes to this project are recorded here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
(`MAJOR.MINOR.PATCH`). Dates are ISO-8601 (UTC).

> Update this file in the **same change** that ships a user-visible change. Add
> entries under **[Unreleased]**; move them under a version heading when the
> release is cut.

---

## [Unreleased]

### Added
- **Documentation foundation.** A formal `docs/` system establishing Business OS
  as the master template: `PRODUCT.md`, `ROADMAP.md`, `UI_GUIDELINES.md`,
  `CODING_STANDARDS.md`, `DATABASE.md`, `API.md`, `DECISIONS.md`, `CHANGELOG.md`,
  `TODO.md`, plus a root `CLAUDE.md` operating manual.
- **Agency Connector foundation (Phase 1, dormant).** `src/lib/agency` —
  configuration, deployment + organization identity, and health/version/
  capabilities services, all Zod-validated. Makes no network requests and is
  imported by nothing in the running app; Business OS behaves identically.
- **Agency API (Phase 2, read-only).** Authenticated route handlers at
  `app/api/agency/v1/*` — `GET health`, `version`, `capabilities`, `metrics`.
  Composes existing services, returns operational aggregates only (no customer
  data / PII), validates every response, and returns a `503 disabled` envelope
  when the connector is off. Auth via per-deployment `AGENCY_INBOUND_API_KEY`
  (bearer token, constant-time compare). No registration, commands, sync, or
  polling.
- **Agency self-registration (Phase 3, outbound).**
  `src/lib/agency/registration` — on server start (via `src/instrumentation.ts`)
  the deployment announces itself to Agency OS with an idempotent, retryable,
  **fire-and-forget** `POST`. Never awaited, never throws; registration failure
  never delays or prevents startup and Business OS runs normally. Composes
  connector identity/version/capabilities into the payload (no customer data);
  authenticates with `AGENCY_OUTBOUND_API_KEY`. Skipped entirely when the
  connector is disabled/unconfigured. No monitoring, polling, synchronization,
  commands, deployment automation, or version updates.
- **Agency event system (Phase 4, outbox).** `src/lib/agency/events` — a
  reusable, versioned, Zod-validated event system. Business logic calls only
  `publishEvent(name, data, options?)`; a per-process **outbox** + **dispatcher**
  own delivery with exponential backoff + jitter, idempotency, dead-lettering,
  and structured logging. Never throws, never blocks, no-op when disabled; if
  Agency OS is down, events queue and Business OS is unaffected. Event catalog:
  `deployment.registered/updated`, `health.changed`, `lead.created`,
  `quote.created`, `appointment.created`, `review.received`, `backup.completed`
  (operational payloads only — no PII). Demonstrated by wiring `lead.created`
  and `quote.created` into the contact/quote server actions.

### Changed
- **Product direction:** repositioned from "multi-industry website + admin
  template" to the **Business OS** — business software for local service
  businesses (Website frontend + Business Hub backend). See `docs/PRODUCT.md`
  and `docs/DECISIONS.md` (ADR-0008).
- **`docs/ARCHITECTURE.md`** rewritten to accurately reflect the current
  codebase and the Business OS / clone / Agency OS model; version and branch
  references corrected.

---

## [1.0.0] — 2026-07

The foundation: the premium template every client is cloned from.

### Added
- **Marketing Website** — homepage (hero, trust strip, services, about, process,
  before/after slider, testimonials, service-area map, FAQ, contact, CTA);
  About, Services + detail pages, Gallery (filter + lightbox), Reviews, Blog +
  posts, Careers + jobs, Privacy, Terms, branded 404.
- **SEO** — per-page metadata + canonicals, JSON-LD (LocalBusiness / Service /
  FAQ), dynamic Open Graph images, `sitemap.xml`, `robots.txt`, web manifest.
- **Business Hub (`/admin`)** — dashboard with stat cards and charts; CRM leads
  table (search, filters, detail drawer, CSV export); quotes workflow; reviews
  moderation; gallery manager; blog CRUD editor; employee management; ⌘K command
  palette and keyboard shortcuts.
- **Config-driven content** (`src/config/*`) and a **services layer** with
  graceful demo-data fallback (`isSupabaseConfigured()` → `mock-data.ts`).
- **Business Settings system** (`src/features/settings`) — runtime, admin-edited
  overrides of company details, branding, and feature flags, deep-merged over
  compile-time config; admin editor at `/admin/settings`. (Priority 1)
- **Theme / Industry Studio** (`src/features/theme`) — 13 industry presets;
  runtime re-skin via `<BrandStyle>`; `/admin/theme`. (Priority 3)
- **Conversion kit** — announcement bar, sticky mobile CTA, floating call
  button, all settings-gated.
- **Supabase schema** — `0001_init.sql` (9 tables, 6 enums, RLS, `updated_at`
  triggers) and `0002_business_settings.sql` (JSONB settings singleton); nullable
  `org_id` on every business table for future multi-tenancy; optional `seed.sql`.
- **Public forms → DB** — contact and quote submissions persist to Supabase when
  configured (RLS-scoped anon insert), with honeypot spam protection.
- **Accessibility & UX** — dark mode, skip links, focus states, reduced-motion
  handling, tasteful Framer Motion, mobile-first responsive layout.
- Initial docs: `README.md`, `docs/ARCHITECTURE.md` (report), `docs/HANDOFF.md`.

### Security
- Patched Next.js to **15.5.21**.

---

## Versioning guide

- **PATCH** — bug fixes and internal changes with no user-visible feature change.
- **MINOR** — backward-compatible features (most roadmap releases: v1.1, v1.2…).
- **MAJOR** — breaking changes to the template contract, schema, or public API
  (e.g. the Agency OS integration / multi-tenant cutover).

Each shipped release should map to a `ROADMAP.md` milestone. Database changes
ship as new numbered migrations (never edits to shipped ones) — note them here.
