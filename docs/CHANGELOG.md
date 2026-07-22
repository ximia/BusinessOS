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
