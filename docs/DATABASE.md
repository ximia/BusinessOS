# DATABASE.md — Business OS

> The data model, its rules, and its future. Backed by
> `supabase/migrations/`. Update this file in the **same change** as any schema
> or RLS migration. The **services layer** (`src/services/*`) is the only code
> that reads these tables.

---

## Platform

- **Postgres via Supabase** (Auth + Storage alongside the DB).
- Access through `@supabase/ssr` clients in `src/lib/supabase/*`.
- **Migrations are append-only and numbered** in `supabase/migrations/`. Never
  edit a shipped migration — add a new one.
  - `0001_init.sql` — core schema, enums, RLS, `updated_at` triggers.
  - `0002_business_settings.sql` — JSONB settings singleton.
  - `0003_agency_connector_settings.sql` — admin-editable connector settings (staff-only).
- `supabase/seed.sql` — optional demo data.
- **Demo mode:** with no Supabase env, the app never touches Postgres and serves
  `src/services/mock-data.ts`. Every read path must keep this fallback.

---

## Current tables

### Operational (CRM) — `leads` and its children

**`leads`** — the CRM pipeline core.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `org_id` | uuid, nullable | reserved for multi-tenancy |
| `name` | text, not null | |
| `email` | text, not null | |
| `phone` | text | |
| `message` | text | |
| `status` | `lead_status` | default `new` |
| `source` | `lead_source` | default `website` |
| `assigned_to` | text | employee reference (free text today) |
| `tags` | text[] | default `{}` |
| `value` | numeric | estimated/won value |
| `created_at` / `updated_at` | timestamptz | `updated_at` via trigger |

Indexes: `leads_status_idx (status)`, `leads_created_idx (created_at desc)`.

**`lead_notes`** — notes per lead. `lead_id → leads (on delete cascade)`,
`author`, `body`, `created_at`.

**`call_logs`** — call history. `lead_id → leads (cascade)`,
`outcome (call_outcome)`, `duration_seconds`, `notes`, `created_at`.

**`follow_ups`** — scheduled follow-ups. `lead_id → leads (cascade)`, `due_at`,
`note`, `completed` (default false).

> `lead_notes`, `call_logs`, and `follow_ups` exist but have **no Business Hub
> UI yet** — they back the planned CRM depth in `ROADMAP.md` v1.1.

### Quotes — `quote_requests`

Quote intake. `id`, `org_id?`, `customer_name`, `email`, `phone?`, `service`,
`address?`, `preferred_date` (date), `budget?` (text), `notes?`, `photo_urls`
(text[], default `{}`), `status (quote_status)` default `requested`,
`created_at`.

### Reviews — `reviews`

`id`, `org_id?`, `name`, `rating` (smallint, **check 1–5**), `quote`, `service?`,
`approved` (default false), `featured` (default false), `created_at`. Approved
reviews map to marketing testimonials in the services layer.

### Gallery — `gallery_images`

`id`, `org_id?`, `title`, `category`, `storage_path`, `url`, `position`
(default 0), `created_at`. `storage_path`/`url` target Supabase Storage
(bucket not yet provisioned — `ROADMAP.md` v1.2).

### Blog — `posts`

`id`, `org_id?`, `slug` (**unique**), `title`, `excerpt`, `content`, `category`,
`cover_image?`, `status (post_status)` default `draft`, `author`, `seo_title?`,
`seo_description?`, `published_at?`, `created_at`, `updated_at` (via trigger).
Index: `posts_status_idx (status)`.

### Team — `employees`

`id`, `org_id?`, `full_name`, `email` (**unique**), `role (user_role)` default
`staff`, `avatar_url?`, `active` (default true), `created_at`.

### Settings — `business_settings` (migration 0002)

Single-row JSONB store for runtime overrides of the site config.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | default `'default'` — the single-tenant row |
| `org_id` | uuid, nullable | reserved for multi-tenancy |
| `data` | jsonb, not null | deep-merged over compile-time `siteConfig` |
| `updated_at` | timestamptz | |

Read/merged by `src/features/settings/settings.service.ts`; written by
`updateBusinessSettings()`.

### Agency connector — `agency_connector_settings` (migration 0003)

Single-row store for the deployment's admin-editable connector settings, layered
**over** the environment (blank ⇒ inherit env / auto-derived id). Only non-secret
fields; the shared API keys and Agency base URL stay in server-only env. Unlike
`business_settings` there is **no anon policy** — this operational config is never
exposed to the public site and is read server-side with the service-role client.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | default `'default'` — the single-tenant row |
| `org_id` | uuid, nullable | reserved for multi-tenancy |
| `enabled` | boolean, nullable | null ⇒ inherit `AGENCY_OS_ENABLED` |
| `deployment_id` | text, nullable | null ⇒ inherit env, else auto-derived |
| `organization_id` | text, nullable | null ⇒ inherit `BUSINESS_OS_ORG_ID` |
| `organization_slug` | text, nullable | null ⇒ inherit `BUSINESS_OS_ORG_SLUG` |
| `updated_at` | timestamptz | |

Read into the connector's sync config overlay by `src/lib/agency/settings.ts` +
`settings.loader.ts` (primed at startup / heartbeat / on save); managed by the
`/admin/agency` panel via `updateConnectorConnection()`.

---

## Enums

| Enum | Values |
|---|---|
| `user_role` | `admin`, `staff`, `readonly` |
| `lead_status` | `new`, `contacted`, `qualified`, `quoted`, `won`, `lost` |
| `lead_source` | `website`, `referral`, `google`, `social`, `phone`, `walk-in`, `other` |
| `call_outcome` | `connected`, `voicemail`, `no-answer`, `callback`, `busy` |
| `quote_status` | `requested`, `reviewing`, `sent`, `accepted`, `declined` |
| `post_status` | `draft`, `scheduled`, `published` |

Enum values are mirrored in `src/types/database.ts`. Change them together.

---

## Relationships

```
employees                       (standalone; assigned_to on leads is free text today)

leads ──1:N── lead_notes
      ──1:N── call_logs
      ──1:N── follow_ups        (all ON DELETE CASCADE)

quote_requests                  (standalone intake)
reviews                         (standalone; approved → marketing testimonials)
gallery_images                  (standalone; → Supabase Storage)
posts                           (standalone; slug unique)
business_settings               (singleton row id='default')
```

Foreign keys currently exist only from the lead-child tables to `leads`.
`assigned_to` is a text field, not yet an FK to `employees` — tightening this is
future CRM work.

---

## Naming conventions

- **snake_case** table and column names; **plural** table names.
- Primary keys are `id uuid` via `gen_random_uuid()` (except the
  `business_settings` text `id`).
- Timestamps are `timestamptz`, named `created_at` / `updated_at`.
- `updated_at` is maintained by the shared `set_updated_at()` trigger (currently
  on `leads` and `posts`) — attach it to any table that gains an `updated_at`.
- Enums are singular, snake_case, and mirrored in TypeScript.
- Every business table carries a nullable `org_id` (see Multi-tenancy).

---

## Indexes

- `leads_status_idx (status)` and `leads_created_idx (created_at desc)` — the
  common CRM filter/sort.
- `posts_status_idx (status)` — separates published from draft.
- **Add indexes with the query.** Before shipping any bounded/paginated list
  query, add the supporting index in the same migration. Unique constraints
  exist on `employees.email` and `posts.slug`.

---

## RLS philosophy

Row Level Security is the **backstop** — the database enforces access
regardless of the UI. Current model (single-tenant):

- **Anon (public site) may INSERT** into `leads`, `quote_requests`, and
  `reviews` (contact/review forms) — and **never read them**. The review insert
  policy additionally forces `approved = false and featured = false`, so the
  public can't self-approve.
- **Anon may SELECT** only public marketing content: approved reviews
  (`approved = true`), published posts (`status = 'published'`), and all
  `gallery_images`.
- **Authenticated staff have full access** to all operational tables.
  `employees` allows authenticated read and (currently) authenticated manage.
- **`business_settings`:** anon read-only (the site renders effective settings);
  authenticated read/write.

**Principle:** default to least privilege for `anon`; only expose what the
marketing site must render. Every new table ships with RLS enabled and explicit
policies in the same migration — never a table without RLS.

> **Not yet enforced:** the `user_role` distinction (`admin`/`staff`/`readonly`)
> is defined but every authenticated user currently gets full access. Per-role
> RLS is planned (`ROADMAP.md` v2.0). Do not assume role isolation exists today.

---

## Data ownership & the services seam

- **The services layer is the only reader.** `src/services/*` is the single seam
  between the app and the database. Cross-cutting concerns — demo fallback,
  future tenancy scoping, future Agency OS sync — belong here, not scattered in
  pages/components.
- **Each client instance owns its own database.** Clones do not share data; a
  client's data lives only in that client's Supabase project.
- Mutations flow through Server Actions (`src/server/actions/*` or a feature
  slice), which validate with Zod before writing.

---

## Multi-tenancy (future)

The schema is pre-seeded for it: **every business table has a nullable
`org_id`.** To go multi-tenant (`ROADMAP.md` "Future"):

1. Add an `organizations` table + a membership mapping users → orgs.
2. Populate `org_id` on inserts (resolve the org from subdomain/domain/session).
3. Tighten every RLS policy from `using (true)` to `org_id = <current org>` via
   an `auth_org()` helper.
4. Scope reads in the **services layer** — the only code that needs to change.

Do **not** remove `org_id`, and don't build tenancy speculatively before it's on
the roadmap — just keep the seam intact.

---

## Storage (planned)

`gallery_images.storage_path` and `quote_requests.photo_urls[]` reference
Supabase Storage, but buckets are **not yet provisioned or wired**. When added
(`ROADMAP.md` v1.2): create the bucket, apply storage RLS mirroring the table
policies, and upload through a server action — document the bucket + policy
here.

---

## Change checklist (do this for every schema change)

1. Add a new numbered migration in `supabase/migrations/` (never edit a shipped
   one). Enable RLS + write explicit policies for any new table.
2. Update `src/types/database.ts` (and any enum mirror).
3. Update the affected service in `src/services/*` and its demo data in
   `mock-data.ts`.
4. Add supporting indexes for new query patterns.
5. Update **this file** and, if relevant, `ARCHITECTURE.md` / `CHANGELOG.md`.
