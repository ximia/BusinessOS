# ROADMAP.md — Business OS

> Organized by **release**, not by loose feature list. Each release is a
> coherent, shippable step toward the product in `PRODUCT.md`. Priorities change;
> when they do, update this file. Completed releases are recorded in
> `CHANGELOG.md`.

---

## Guiding sequence

1. **Make the template solid** — the foundation every client is cloned from.
2. **Complete the operate loop** — the Business Hub must persist real work, not
   just render demo state.
3. **Complete the grow loop** — website capture feeds the Hub; Hub content feeds
   the website, automatically.
4. **Open the seams** — the API/webhook contract that lets each client instance
   talk to the (separate) Agency OS.
5. **Scale** — multi-location, then multi-tenant.

---

## v1.0 — Foundation & template (current state)

**Status: shipped / in place.** The premium template that clients are cloned
from.

- Full marketing website: homepage (all sections), about, services + detail
  pages, gallery, reviews, blog + posts, careers + jobs, contact, privacy,
  terms, 404.
- SEO: per-page metadata, JSON-LD (LocalBusiness / Service / FAQ), dynamic OG
  images, `sitemap.xml`, `robots.txt`, web manifest.
- Business Hub (`/admin`): dashboard, leads/CRM table, quotes, reviews
  moderation, gallery manager, blog editor, employees — command palette,
  charts, premium tables.
- Config-driven content (`src/config/*`) + services layer with demo fallback.
- **Business Settings** system + admin editor (runtime company details,
  branding, feature flags).
- **Theme / Industry Studio** (13 industry presets, runtime re-skin).
- Conversion kit: announcement bar, sticky mobile CTA, floating call button.
- Public forms (contact, quote) persist to Supabase when configured.
- Documentation foundation (this `docs/` system + `CLAUDE.md`).

**Known gaps carried forward:** admin writes are partly client-state-only;
uploads, notifications, CSV import, and role enforcement are staged but not
fully wired (tracked in `TODO.md`).

---

## v1.1 — The Business Hub becomes real

**Theme: persistence.** Everything you do in the Hub is saved.

- Admin write server actions for leads, reviews, gallery, posts, employees
  (replace client-only mutations; `revalidatePath`-backed).
- CRM depth: lead timeline / activity feed, notes, tags, assignment, follow-up
  reminders, call logs, pipeline stages, bulk actions, advanced filters,
  archived leads. (Tables `lead_notes`, `call_logs`, `follow_ups` already
  exist.)
- CSV import wired to inserts; blog save/publish persisted.
- Error/loading boundaries per segment; `useFormState` → `useActionState`.

---

## v1.2 — Content & conversion loop

**Theme: the website and Hub feed each other.**

- Supabase Storage: gallery uploads and quote photo uploads, `next/image`
  optimization.
- Reviews collection → moderation → publish loop closed end to end.
- Notifications: real email provider (e.g. Resend/Postmark) for new
  leads/quotes, replacing the console stub.
- Analytics dashboard redesign (Stripe/Linear feel): today's leads, conversion
  rate, quotes, popular services, traffic sources, activity.
- Performance pass: `LazyMotion`, query limits + pagination, Lighthouse budget.

---

## v1.3 — Website Builder & Local SEO

**Theme: the business shapes its own site.**

- Website Builder: enable / disable / reorder / duplicate homepage sections,
  persisted to Business Settings (sections are already modular).
- Local SEO: auto-generated city × service landing pages, schema, sitemaps.
- Integrations surface (config-only, securely stored): Google, GA/GTM,
  Calendly, and similar.

---

## v2.0 — Operations backend & the Agency OS seam

**Theme: this becomes a true operations platform, and opens its edges.**

- Client portal: quote approval, documents, appointments, invoices, messages,
  profile (payments-ready).
- Scheduling / appointments as a first-class module.
- **Agency OS integration contract** — the secure API + webhook seam each client
  instance uses to communicate with the separate Agency OS. Versioned,
  authenticated, outbound-first. (The Agency OS itself is a different repo and
  is out of scope here — see `API.md` and `DECISIONS.md`.)
  - **Built (Phases 1–4):** dormant connector foundation + identity (P1),
    read-only Agency API (P2), outbound self-registration (P3), versioned event
    system + outbox (P4).
  - **Remaining for the contract:** durable outbox + persisted registration
    state, authorized read context (ADR-0011), auth hardening (HMAC signing,
    replay defense, key rotation, mutual auth), the inbound webhook receiver
    (first mutating handler), and the remaining event producers. All enumerated
    under **"Agency OS connector — deferred items & caveats"** in `TODO.md`.
- Role enforcement in UI and RLS (`admin` / `staff` / `readonly`).

---

## Future (not yet scheduled)

- **Multi-location:** per-location address/hours/phone/map/reviews/landing.
- **Multi-tenancy / white-label:** organizations, membership, custom domains,
  per-tenant storage — built on the existing nullable `org_id`.
- **AI tools:** provider-abstracted generators (service copy, FAQs, blog, meta,
  alt text, review replies, city pages).
- **Payments & invoicing** depth beyond the portal.
- Testing + CI as a standing gate (Vitest/Playwright smoke tests, GitHub
  Actions build check).
- **Fleet management** (architecture-review findings) — template propagation /
  orchestrated upgrades across many clones, a migration runner + per-deployment
  `schema_migrations` version, and independence enforced as a build-time
  invariant. Detailed in `TODO.md`.
- **Durable connector infrastructure** — Supabase-backed event outbox + persisted
  registration state + a serverless-safe drain trigger (see `TODO.md`).

---

## How to use this file

- Pick the **lowest unshipped release** and work top-down within it.
- When a release ships, move its summary to `CHANGELOG.md` and mark it here.
- When priorities shift, re-order releases here and note *why* in `DECISIONS.md`
  if the change is structural.
