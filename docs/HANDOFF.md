# Project Handoff / Context Brief

> **⚠️ Historical brief.** This file is preserved for context but is no longer
> the authority. Start with [`CLAUDE.md`](../CLAUDE.md) and the [`docs/`](.)
> system ([PRODUCT](./PRODUCT.md), [ARCHITECTURE](./ARCHITECTURE.md),
> [ROADMAP](./ROADMAP.md), etc.). Where this file disagrees with those, they
> win. In particular: the product is now framed as the **Business OS**, and the
> working branch / roadmap below reflect an earlier session, not current
> guidance (see `ROADMAP.md`).

> **For a new chat session:** read this file + `docs/ARCHITECTURE.md`, then
> continue the roadmap below. Everything needed to resume is here.

## What this project is
A premium, config-driven **multi-industry local-business website + admin SaaS
starter** (Next.js). One codebase an agency clones per client; re-brand in ~30
min by editing config or using the admin. Demo content = a premium auto-detailing
studio ("Halcyon Detailing Co.").

- **Repo:** `ximia/BusinessOS` (formerly `ximia/webtemp`)
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
- Conversion kit (announcement, sticky CTA, floating call).
- Security: Next.js patched to 15.5.21.
- Docs: `README.md`, `docs/ARCHITECTURE.md`, this file.

## ⏭ Remaining roadmap (in priority order)
4. **CRM expansion** — lead timeline, activity feed, tasks, follow-up reminders,
   call logs, internal comments, tags, pipeline stages, bulk actions, advanced
   filters, duplicate detection, archived leads. (Tables `lead_notes`,
   `call_logs`, `follow_ups` already exist; build UI + admin write-actions.)
5. **Analytics dashboard** redesign (Stripe/Linear): today's leads, conversion
   rate, visitors, calls, quotes, appointments, revenue placeholder, activity,
   charts, popular services, traffic sources.
2. **Website Builder** — enable/disable/reorder/duplicate homepage sections
   (drag-drop), persist to settings; sections already modular in
   `components/sections/`.
9. **Local SEO** — auto city/service landing pages, schema, sitemaps.
7. **Integrations** page (Google, Stripe, Twilio, Calendly, GA, GTM, Zapier…),
   securely stored config.
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
> Priority 4 (CRM expansion). Keep the build green and preserve existing
> functionality."
