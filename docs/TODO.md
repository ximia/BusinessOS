# TODO.md — Business OS Backlog

> A living backlog. `ROADMAP.md` sequences *releases*; this file is the granular
> pool of work behind them. Keep it honest — move items to `CHANGELOG.md` when
> shipped, and delete what's obsolete. Sections: **Immediate priorities**,
> **Technical debt**, **Future ideas**, **Research**, **Wishlist**.

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
- [ ] **Agency OS integration seam** — outbound webhooks + authenticated inbound
      receiver (see `API.md` §4, `DECISIONS.md` ADR-0005).
- [ ] **Connector server identity / authorized read context** — the read-only
      Agency API (`/api/agency/v1/metrics`) reads through `src/services/*` under
      RLS with only an API-key (machine) credential, so on a **Supabase-
      configured** deployment staff-only aggregates come back empty (correct in
      demo mode). Give the connector an authorized read path so live metrics
      work — without bypassing the services boundary, exposing PII, or weakening
      RLS. Design options in `DECISIONS.md` ADR-0011: (a) narrow audited
      service-role read scoped to aggregates, (b) dedicated read-only Postgres
      role + RLS policy for the connector, or (c) a machine/service session.
      Must be independently revocable.
- [ ] **Multi-location** — per-location address/hours/phone/map/reviews/landing.
- [ ] **Multi-tenancy / white-label** — `organizations`, membership, custom
      domains, per-tenant storage; built on the existing `org_id`.
- [ ] **AI tools** — provider-abstracted generators (service copy, FAQs, blog,
      meta, alt text, review replies, city pages).

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
