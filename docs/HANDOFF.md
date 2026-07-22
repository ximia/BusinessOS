# Project Handoff / Context Brief

> **For a new chat session:** read this file + `docs/ARCHITECTURE.md`, then
> continue the roadmap below. Everything needed to resume is here.

## What this project is
A premium, config-driven **multi-industry local-business website + admin SaaS
starter** (Next.js). One codebase an agency clones per client; re-brand in ~30
min by editing config or using the admin. Demo content = a premium auto-detailing
studio ("Halcyon Detailing Co.").

- **Repo:** `ximia/webtemp`
- **Working branch:** `claude/multi-industry-website-template-5ipfou` (the repo's
  default branch; push here, never elsewhere).
- **Deploy:** Vercel (auto-detects Next.js; Framework Preset must be Next.js).

## Stack (current versions)
Next.js **15.5.21** (App Router) · React 19 · TypeScript 5.7 (strict,
`noUncheckedIndexedAccess`) · Tailwind 3.4 · shadcn-style Radix UI · Framer
Motion 11 · Supabase (`@supabase/ssr`) · React Hook Form + Zod · Lucide.

## Commands & gotchas
- `npm install`, `npm run dev`, `npm run build` (must stay green).
- **Runs in DEMO MODE with no env** — admin is open, services return
  `src/services/mock-data.ts`. With Supabase env set, it reads/writes real data.
- **Bash gotcha:** never pipe `npm run build` into `head`/`grep` (SIGPIPE kills
  the build midway). Redirect to a log file instead. Avoid `pkill` (disrupts the
  shell). Start test servers on a fresh `PORT=` each time via `run_in_background`.
- Chromium for screenshots: `playwright-core` in scratchpad,
  `executablePath: '/opt/pw-browsers/chromium'`.
- External Unsplash images don't load in the sandbox (render grey) — expected.

## Architecture essentials
- **Config-driven content:** `src/config/*` is the single source of truth
  (site, services, testimonials, faq, gallery, team, blog, careers, process,
  theme, admin-nav). Barrel: `src/config/index.ts`. Icons referenced by string
  key → resolved via `src/lib/icons.ts` (`iconMap`).
- **Services layer:** `src/services/*` reads Supabase when configured, else
  `mock-data.ts` (via `isSupabaseConfigured()`). Only place that touches data.
- **Server actions:** `src/server/actions/*` (contact, quote, auth).
- **Types:** `src/types/content.ts` (marketing) + `src/types/database.ts` (DB).
- **Folders:** `app/ components/{ui,sections,shared,admin,forms,layout,motion}
  features/ services/ server/ lib/ hooks/ config/ types/ supabase/`.
- Routes: marketing under `app/(marketing)/`, admin under
  `app/admin/(dashboard)/` + `app/admin/login`. No REST API routes — Server
  Actions only. Metadata: `sitemap.ts`, `robots.ts`, `opengraph-image.tsx`.

## Custom systems added on top (READ THESE before editing settings/theme)
### `src/features/settings/` — Business Settings (Priority 1)
- `settings.schema.ts` — Zod schema of the editable subset of `SiteConfig` +
  `mergeSettings(base, overrides)` (deep-merge) + `settingsFromConfig(config)`.
- `settings.service.ts` — `getSiteConfig()` = compile-time `siteConfig` merged
  with DB overrides. Uses a **cookieless `unstable_cache`** read so marketing
  pages stay static (ISR). `SETTINGS_CACHE_TAG` revalidated on save.
- `settings.actions.ts` — `updateBusinessSettings()` (auth-guarded upsert).
- `settings-provider.tsx` — `SettingsProvider` + `useSettings()` (client). The
  marketing layout resolves settings server-side and feeds this; client
  components (navbar, hero, floating/sticky CTAs) read live values via it.
  Server components use `getSiteConfig()`. Default fallback everywhere =
  `siteConfig`, so nothing breaks without a provider/DB.
- Admin editor: `components/admin/settings-editor.tsx` at `/admin/settings`.

### `src/features/theme/` — Theme / Industry Generator (Priority 3)
- `industries.ts` — 13 `IndustryPreset`s (palette HSL, icons, imagery, starter
  copy). Extensible: append entries.
- `brand-style.tsx` — `<BrandStyle theme>` injects `--primary`/`--ring` CSS-var
  overrides; rendered in BOTH marketing and admin `(dashboard)` layouts.
- `theme.actions.ts` — `applyTheme({presetId|custom, applyContent})` patches only
  the theme (and optional copy), preserving other settings.
- Admin: `components/admin/theme-studio.tsx` at `/admin/theme`.
- `SiteConfig` gained optional `features`, `theme`, `announcement`; defaults in
  `config/site.config.ts` + `config/theme.config.ts`. When adding a field to the
  settings schema, update `settingsFromConfig`, `mergeSettings`, AND preserve it
  in `settings-editor.tsx` onSubmit (`values.x = values.x ?? initial.x`).

### Conversion kit (settings-driven, optional)
`components/shared/{announcement-bar,sticky-mobile-cta,floating-call-button}.tsx`
— all gated by settings flags, wired in the marketing layout.

### CRM expansion (Priority 4)
Built on the existing `leads` / `lead_notes` / `call_logs` / `follow_ups` tables.
- `server/actions/leads.ts` — auth-guarded write-actions (demo-safe no-ops):
  `updateLead`, `bulkUpdateLeads`, `addLeadNote`/`deleteLeadNote`, `logCall`,
  `scheduleFollowUp`/`setFollowUpCompleted`/`deleteFollowUp`. Each returns
  `{ ok, message, id? }` and revalidates `/admin/leads` + `/admin`.
- `lib/leads.ts` — client-safe pure helpers: `findDuplicateLeadIds`,
  `buildLeadTimeline`, `isOverdue`, `formatDuration`.
- `services/leads.service.ts` — richer `LeadFilters` (source/tag/archived),
  `getLeadNotesByLead`/`getCallLogsByLead`/`getFollowUpsByLead` (grouped),
  `getLeadDetail`, `getOpenFollowUps`; `getLeadStats` gained
  `openFollowUps`/`overdueFollowUps`.
- `components/admin/leads-table.tsx` — bulk select + bulk action bar
  (status/assign/archive/export), advanced filters (status/source/assignee/tag),
  active/archived views, duplicate flags, a follow-up reminders panel, and a
  tabbed drawer (Overview + Activity timeline) with note/call/follow-up quick
  actions and tag/value editors. Mutations are optimistic with rollback.
- `components/ui/checkbox.tsx` — new dependency-free checkbox primitive.
- Migration `supabase/migrations/0003_crm_expansion.sql` — adds `leads.archived`
  + activity-lookup indexes. Client keeps optimistic state; actions persist when
  Supabase is configured.

### Analytics dashboard (Priority 5)
- `services/analytics.service.ts` — `getDashboardAnalytics()` aggregates KPIs,
  a 14-day daily-leads series, leads-by-stage, revenue (won + weighted
  projection), traffic sources (lead-source mix), popular services (quote +
  review intent), and a cross-entity activity feed. All derived from real
  records, so it works in demo mode and against Supabase. Visitor/traffic
  numbers are labelled placeholders until a web-analytics provider is wired.
- Components: `components/admin/{trend-chart,progress-list,activity-feed}.tsx`
  (all dependency-free; `trend-chart` is an SVG area sparkline with hover).
  `app/admin/(dashboard)/page.tsx` is the redesigned Stripe/Linear layout.

### `src/features/website/` — Website Builder (Priority 2)
- `sections.catalog.ts` — pure metadata (no React): `HOME_SECTION_TYPES`,
  `SECTION_CATALOG`, `HomeSectionInstance`, `DEFAULT_HOME_LAYOUT`,
  `homeLayoutSchema`, `normalizeLayout`, `newInstanceId`. Safe on client+server.
- `website.actions.ts` — `updateHomeLayout(layout)`; merges over existing stored
  settings (never drops other fields), auth-guarded, demo-safe, revalidates.
- `SiteConfig.homeLayout?` added; wired through `settingsFromConfig`,
  `mergeSettings`, and preserved in `settings-editor.tsx` onSubmit.
- Rendering: `components/sections/section-renderer.tsx` maps section type →
  component; `app/(marketing)/page.tsx` renders enabled sections in stored order
  (falls back to `DEFAULT_HOME_LAYOUT`), staying statically generated.
- Admin: `components/admin/website-builder.tsx` at `/admin/website` (nav +
  ⌘K shortcut "W") — drag-drop reorder, up/down, show/hide, duplicate, remove,
  add-section menu, reset-to-default, unsaved-changes bar. NOTE: adding a section
  type requires updating BOTH `sections.catalog.ts` and `section-renderer.tsx`.

### `src/features/local-seo/` — Local SEO (Priority 9)
- `local-seo.ts` — pure, compile-time helpers over `serviceAreas` × `services`:
  `areas()`, `getAreaBySlug`, `nearbyAreas`, and templated copy generators
  (`cityIntro`, `cityServiceIntro`, `cityServiceFaq`, `localWhyUs`). Unique
  per-page copy from real config (no thin/duplicate content).
- Routes (all SSG via `generateStaticParams`):
  `app/(marketing)/areas/page.tsx` (hub), `areas/[city]/page.tsx` (city landing,
  lists all services), `areas/[city]/[service]/page.tsx` (the money pages —
  N areas × M services). Falls back to 404 for unknown slugs.
- JSON-LD helpers added to `lib/seo.ts`: `breadcrumbJsonLd`, plus optional
  `areaServed` params on `serviceJsonLd` / `localBusinessJsonLd` (backward
  compatible). City×service pages emit Service + FAQPage + BreadcrumbList;
  city pages emit LocalBusiness + BreadcrumbList — all in the initial HTML.
- Discovery/internal linking: homepage `service-area-section.tsx` links each
  area to its landing page + "see all"; `sitemap.ts` includes the hub, all city
  pages, and all city×service pages.

### `src/features/integrations/` — Integrations (Priority 7)
- **Security model:** secrets live in a NEW `integrations` table with
  **auth-only RLS** (no anon policy — unlike anon-readable `business_settings`),
  so credentials never reach the public anon key. Migration `0004_integrations`.
- `catalog.ts` — pure provider metadata + field specs; fields flagged `secret`
  are masked. `SECRET_MASK` sentinel means "unchanged".
- `services/integrations.service.ts` — `getIntegrations()` (auth read, demo
  fallback `mockIntegrations`) and `getMaskedIntegrations()` which strips secret
  values before anything reaches a Client Component.
- `integrations.actions.ts` — `saveIntegration` (preserves stored secrets when
  the input is blank/masked), `setIntegrationEnabled`, `disconnectIntegration`.
- Admin: `components/admin/integrations-manager.tsx` at `/admin/integrations`
  (nav + ⌘K "I") — provider cards by category, status badges, enable switch,
  configure dialog (secret inputs never prefilled), disconnect.
- Public wire-up: `components/shared/analytics-scripts.tsx` (in root layout)
  injects GA4/GTM from PUBLIC env vars `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_GTM_ID`
  (see `.env.example`). NOTE: adding a provider = update `catalog.ts` only.

## Supabase
Migrations in `supabase/migrations/`: `0001_init.sql` (9 tables + RLS + enums),
`0002_business_settings.sql` (jsonb singleton row id='default'). `seed.sql`
optional. Every business table has a nullable `org_id` for future multi-tenancy.
To go live: run migrations, set env (`.env.example`), create an auth user.

## ✅ Done so far
- Full marketing site (all sections + pages), admin dashboard (CRM leads,
  quotes, reviews, gallery, blog, employees), SEO (JSON-LD, sitemap, robots,
  dynamic OG), a11y, dark mode.
- **P1** Business Settings system + admin editor.
- **P3** Theme/Industry Generator.
- **P4** CRM expansion (notes/comments, call logs, follow-up tasks + reminders,
  tags, pipeline stages, bulk actions, advanced filters, duplicate detection,
  archived leads, activity timeline) + write-actions.
- **P5** Analytics dashboard redesign (Stripe/Linear): KPI + mini-metric tiles,
  14-day leads trend chart, leads-by-stage, revenue (won + weighted projection),
  cross-entity activity feed, traffic sources, popular services.
- **P2** Website Builder — reorder / show-hide / duplicate / remove homepage
  sections (drag-drop + accessible controls), persisted to settings; homepage
  renders from the stored layout.
- **P9** Local SEO — auto-generated city + city×service landing pages (SSG) with
  localized copy, JSON-LD (Service / LocalBusiness / FAQPage / BreadcrumbList),
  internal linking, and full sitemap coverage.
- **P7** Integrations — securely stored provider config (auth-only table, masked
  secrets) admin page for GA4, GTM, Google Business, Stripe, Twilio, Calendly,
  Zapier; plus GA4/GTM public tag injection via env vars.
- Conversion kit (announcement, sticky CTA, floating call).
- Security: Next.js patched to 15.5.21.
- Docs: `README.md`, `docs/ARCHITECTURE.md`, this file.

## ⏭ Remaining roadmap (in priority order)
8. **AI tools** — provider-abstracted generators (service copy, FAQs, blog, meta,
   alt text, review replies, city pages).
10. **Multi-location** — per-location address/hours/phone/map/reviews/landing.
6. **Client portal** — quotes approve, documents, appointments, invoices,
   messages, profile (payments-ready).
11. **White-label / multi-tenancy** — orgs, custom domains, roles, separate
   storage (build on `org_id`).
- Ongoing per feature: UI polish, a11y, perf (target 95+ Lighthouse), remove the
  staged "wire-up" TODOs (admin writes, uploads, notifications, CSV import).

## Working rules (keep these)
Extend, don't rewrite. Never break existing features. Every new feature optional
& configurable via settings. Keep TS strict & the build green. Mobile-first,
accessible, SEO-friendly, static where possible. Commit per feature with the
standard footer, push to the working branch. Don't create PRs unless asked.
Don't put the model identifier in commits/PRs.

## How to resume in a new chat
> "Read `docs/HANDOFF.md` and `docs/ARCHITECTURE.md`, then continue with
> Priority 8 (AI tools — provider-abstracted generators for service copy, FAQs,
> blog, meta, alt text, review replies, city pages). Keep the build green and
> preserve existing functionality."
