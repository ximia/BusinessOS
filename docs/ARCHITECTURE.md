# ARCHITECTURE.md — Business OS

> The authoritative description of how this codebase is built. Update it in the
> **same change** whenever structure, routing, data flow, or cross-cutting
> patterns change. For the product story see `PRODUCT.md`; for the schema see
> `DATABASE.md`; for integration seams see `API.md`.

---

## What this is, architecturally

Business OS is a single Next.js application with two surfaces served from one
codebase and one database:

- **The Website** — public marketing frontend, statically generated.
- **The Business Hub** — authenticated operational backend at `/admin`,
  server-rendered on demand.

This repository is the **template**. Each client is an independent clone with
its own deployment, database, and domain. A future, separate **Agency OS**
communicates with each client instance through versioned APIs and webhooks
(see §9). The Agency OS is **not** part of this repo.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript 5.7 (strict,
`noUncheckedIndexedAccess`) · Tailwind CSS 3.4 · shadcn-style primitives on
Radix UI · Framer Motion 11 · Supabase (Postgres + Auth + Storage) via
`@supabase/ssr` · React Hook Form 7 · Zod 3 · Lucide. Deploys to Vercel with a
standard `next build`.

---

## 1. Folder structure

```
webtemp/
├── CLAUDE.md                     # operating manual (read first)
├── docs/                         # the documentation system (this file lives here)
├── middleware.ts                 # Supabase session refresh + /admin guard
├── next.config.mjs               # image remote patterns, package-import opt
├── tailwind.config.ts            # design tokens → CSS variables
├── .env.example                  # env vars (all optional at boot → demo mode)
├── supabase/
│   ├── migrations/
│   │   ├── 0001_init.sql         # core schema + RLS + enums
│   │   └── 0002_business_settings.sql  # jsonb settings singleton
│   └── seed.sql                  # optional demo data
├── public/                       # site.webmanifest (+ client assets)
└── src/
    ├── app/                      # App Router routes
    │   ├── (marketing)/          # public Website (shared navbar/footer layout)
    │   ├── admin/
    │   │   ├── login/            # auth page
    │   │   └── (dashboard)/      # guarded Business Hub (sidebar layout)
    │   ├── layout.tsx            # root: fonts, providers, LocalBusiness JSON-LD
    │   ├── globals.css           # design tokens (light/dark), utilities
    │   └── sitemap.ts / robots.ts / opengraph-image.tsx / icon.svg / not-found.tsx
    ├── components/
    │   ├── ui/         # reusable primitives (button, card, table, dialog, …)
    │   ├── sections/   # homepage sections (each reads from config)
    │   ├── shared/     # cross-cutting components (cards, sliders, CTAs, …)
    │   ├── admin/      # Business Hub components (sidebar, tables, editors, ⌘K)
    │   ├── forms/      # contact + quote (RHF + Zod)
    │   ├── layout/     # navbar, footer
    │   ├── motion/     # scroll-reveal helpers
    │   └── providers.tsx         # theme + tooltip + toaster
    ├── config/         # ⭐ compile-time client-editable content (barrel: index.ts)
    ├── features/       # self-contained feature slices (see §5)
    │   ├── settings/   # Business Settings (runtime config overrides)
    │   └── theme/      # Theme / Industry Studio
    ├── services/       # data access — the ONLY layer that reads data
    ├── server/actions/ # mutations via Server Actions (auth, contact, quote, …)
    ├── lib/            # utils, seo, validations, csv, icons, supabase clients
    ├── hooks/          # use-toast
    └── types/          # content (marketing) + database (DB) types
```

Separation of concerns is deliberate and strict: **presentation** (`components`),
**content** (`config` + `features/settings`), **data access** (`services`),
**mutations** (`server/actions`), **feature logic** (`features`),
**cross-cutting utilities** (`lib`), and **types** each live in one place.

---

## 2. Routing

Route groups keep the two surfaces cleanly separated under one `app/` tree.

### Website (`app/(marketing)/`) — statically generated

`/`, `/about`, `/services`, `/services/[slug]`, `/gallery`, `/reviews`, `/blog`,
`/blog/[slug]`, `/careers`, `/careers/[slug]`, `/contact`, `/privacy`, `/terms`,
and the global 404. Dynamic segments use `generateStaticParams` (SSG).

### Business Hub (`app/admin/`) — server-rendered, guarded

`/admin/login` (client form) and, under the `(dashboard)` group,
`/admin` (dashboard), `/admin/leads`, `/admin/quotes`, `/admin/reviews`,
`/admin/gallery`, `/admin/blog` (+ `/new`, `/[id]`), `/admin/employees`,
`/admin/theme`, `/admin/settings`. Navigation is data-driven from
`src/config/admin-nav.ts` (also feeds the ⌘K command palette).

### System routes

`sitemap.xml`, `robots.txt`, `opengraph-image` (edge, dynamic), `icon.svg`.

### API routes

**None today.** All mutations use **Server Actions** — the modern App Router
pattern. Route handlers (`route.ts`) will be introduced only when an external
system genuinely requires an HTTP endpoint (notably the future Agency OS webhook
receiver — see §9 and `API.md`).

---

## 3. Rendering model

- **Website:** Server Components, statically generated. Client JS is limited to
  interactive islands (before/after slider, gallery lightbox, mobile nav, forms,
  CTAs). Business Settings are read server-side via a **cookieless cache** so
  pages stay static/ISR.
- **Business Hub:** Server Components fetch data per request; interactive tables,
  editors, and the command palette are client islands.
- **Default is server.** `"use client"` is reserved for genuine interactivity.

---

## 4. Authentication

- **Supabase Auth** via `@supabase/ssr`. Browser client (`lib/supabase/client.ts`),
  server client (`lib/supabase/server.ts`), and a middleware helper
  (`lib/supabase/middleware.ts`) keep sessions fresh.
- **`middleware.ts`** refreshes the session on every matched request and guards
  `/admin`. The dashboard layout re-checks the session (defense in depth).
- **Demo mode:** with no Supabase env configured, `isSupabaseConfigured()`
  returns false, the Hub opens without auth, and services return demo data. This
  is intentional for local exploration and **must not ship to production
  unconfigured**.
- Server actions `signIn` / `signOut` live in `server/actions/auth.ts`.

> Role enforcement (`admin` / `staff` / `readonly`) is defined in the schema but
> not yet enforced in UI or RLS — see `TODO.md` and `ROADMAP.md` v2.0.

---

## 5. Content, data & feature architecture

### Config system (`src/config/`) — compile-time content

The heart of "re-brand from config." Barrel-exported via `config/index.ts`:
`site`, `theme`, `services`, `process`, `testimonials`, `faq`, `gallery`,
`team`, `blog`, `careers`, `admin-nav`. Icons are referenced by **string key**
and resolved through `lib/icons.ts`, so config stays serializable and
CMS-friendly.

### Business Settings (`src/features/settings/`) — runtime content

Lets a non-technical admin override the editable subset of `siteConfig` at
runtime, stored as a single JSONB row (`business_settings`, id `default`).

- `settings.schema.ts` — Zod schema of editable fields + `mergeSettings()`
  (deep merge) + `settingsFromConfig()`.
- `settings.service.ts` — `getSiteConfig()` = compile-time `siteConfig`
  deep-merged with DB overrides, read through a **cookieless `unstable_cache`**
  so marketing pages remain static. Revalidated on save via `SETTINGS_CACHE_TAG`.
- `settings.actions.ts` — `updateBusinessSettings()` (auth-guarded upsert).
- `settings-provider.tsx` — `SettingsProvider` + `useSettings()` for client
  components; server components call `getSiteConfig()`. The default fallback is
  always `siteConfig`, so nothing breaks without a provider or DB.

### Theme / Industry Studio (`src/features/theme/`)

- `industries.ts` — industry presets (palette HSL, icons, imagery, starter copy).
  Extend by appending entries.
- `brand-style.tsx` — `<BrandStyle>` injects `--primary`/`--ring` CSS-variable
  overrides; rendered in **both** marketing and admin layouts.
- `theme.actions.ts` — `applyTheme()` patches only theme (and optional copy),
  preserving other settings.

> When adding a settings field: update `settingsFromConfig`, `mergeSettings`,
> the Zod schema, **and** preserve it in `settings-editor.tsx`'s submit
> (`values.x = values.x ?? initial.x`).

### Services layer (`src/services/`) — the only reader of data

Each service checks `isSupabaseConfigured()` and returns Supabase rows when
credentials exist, otherwise `mock-data.ts`. Services: `leads` (+ stats, CSV,
filters), `quotes`, `reviews` (+ approved→testimonial mapper), `gallery`,
`posts` (+ published mapper), `employees`. **This is the single seam** for
future multi-tenancy and Agency OS sync — nothing else touches the database on
read.

### Server Actions (`src/server/actions/`) — mutations

`contact.ts` (validate → insert `leads` → honeypot drop → notify stub),
`quote.ts` (validate → insert `quote_requests`), `auth.ts` (sign in/out).
Feature-local actions live in their feature slice (e.g. settings, theme).

### Types (`src/types/`)

`content.ts` (marketing/domain) and `database.ts` (hand-written DB types).
Mappers bridge the two (`Review → Testimonial`, `Post → BlogPost`). If you later
run `supabase gen types`, the services layer is the only code that must change.

---

## 6. Supabase

Postgres + Auth + Storage. Schema in `supabase/migrations/`:
`0001_init.sql` (core tables, enums, RLS, `updated_at` triggers) and
`0002_business_settings.sql` (JSONB settings singleton). `seed.sql` is optional
demo data. Every business table carries a nullable `org_id` reserved for
multi-tenancy. Full details — tables, enums, relationships, RLS philosophy — in
`DATABASE.md`.

**Storage** is referenced (`gallery_images.storage_path`, `quote.photo_urls`)
but buckets are not yet provisioned/wired (`ROADMAP.md` v1.2).

---

## 7. Design system

- **Design tokens are CSS variables** in `src/app/globals.css` (light + dark),
  consumed through Tailwind as `hsl(var(--token))`. Re-brand by editing tokens,
  never by hardcoding colors.
- **UI primitives** in `components/ui/*` are typed, forward-ref, variant-driven
  (CVA), theme-aware Radix-based components.
- The runtime theme layer (`<BrandStyle>`) overrides `--primary`/`--ring` per
  client/industry without touching classes.

Full visual language, component conventions, and accessibility rules live in
`UI_GUIDELINES.md`.

---

## 8. Build, configuration & deployment

- **Scripts:** `dev`, `build`, `start`, `lint`, `typecheck`. `build` and
  `typecheck` must stay green.
- **Configuration is environment-driven** (`.env.example`): Supabase URL + anon
  key (public), service-role key (server-only), site URL, lead-notification
  email. **All optional at boot** → demo mode.
- **Deployment:** Vercel auto-detects Next.js; add env vars and deploy. The
  build is standard with no extra steps. Each client clone deploys
  independently to its own project and domain.

---

## 9. Future: Agency OS communication (seam only)

Each client instance will eventually communicate with a **separate Agency OS**
over secure, versioned APIs and webhooks. Architecturally this repo only owns
the **client-side seam**:

- **Read-only API (built):** an authenticated, versioned, read-only surface at
  `app/api/agency/v1/*` (`health`, `version`, `capabilities`, `metrics`) lets
  Agency OS observe a deployment. It exposes operational aggregates only — never
  customer data — and is built on the dormant connector in `src/lib/agency`.
- **Outbound-first (future):** the client instance reports events (new lead,
  quote, etc.) to the Agency OS via authenticated webhooks/API calls.
- **Inbound receiver (future):** a route handler under `app/api/agency/v1/` will
  accept authenticated Agency OS callbacks — the first *mutating* handler.
- **The services layer is the boundary.** Read/sync logic goes through
  `src/services/*`, keeping the rest of the app unaware of the Agency OS.
- **Versioned + authenticated.** See `API.md` for the contract.

Do **not** implement or document Agency OS internals here — only this client-side
compatibility surface.

---

## 10. Versioning philosophy

- **The product** follows semantic versioning, tracked in `CHANGELOG.md` and
  planned by release in `ROADMAP.md`.
- **The database** evolves through append-only, numbered migrations in
  `supabase/migrations/` — never edit a shipped migration; add a new one.
- **The Agency OS API** (when built) will be independently versioned so client
  instances and the Agency OS can evolve without lockstep upgrades.
- **The template ↔ clone relationship:** clones may diverge; improvements to the
  template are pulled forward deliberately, not automatically.

---

## 11. Design philosophy (architectural values)

- **Config over code** — content lives in config/settings, not JSX.
- **One reader of data** — the services layer, so cross-cutting concerns
  (tenancy, sync, caching) have a single home.
- **Static where possible, server where necessary** — performance is the default.
- **Optional and configurable** — every feature degrades safely; demo mode
  always works.
- **Extend, don't rewrite** — this is a long-lived foundation.
- **Type-safe and validated end to end** — strict TS, Zod at trust boundaries.

---

## 12. Known gaps (kept honest)

Staged but not fully wired — tracked in `TODO.md`, scheduled in `ROADMAP.md`:

- Most admin mutations update client state only (no write-back yet).
- Storage uploads (gallery, quote photos) not connected.
- Notifications are a `console.info` stub.
- CSV import parses but does not insert.
- Role-based authorization not enforced (all authenticated users → full access).
- No error/loading boundaries per segment; no test suite or CI yet.
- Some reads are unbounded (add `.limit()` + pagination before real volume).
