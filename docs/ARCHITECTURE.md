# Architecture Report — LocalSite Template

_Generated from a full analysis of the repository at `ximia/webtemp` (branch
`claude/multi-industry-website-template-5ipfou`)._

- **Framework:** Next.js 15.1.3 (App Router) · React 19 · TypeScript 5.7 (strict)
- **Styling/UI:** Tailwind CSS 3.4 · shadcn-style primitives on Radix UI · Framer Motion 11
- **Backend:** Supabase (Postgres + Auth + Storage) via `@supabase/ssr`
- **Forms/validation:** React Hook Form 7 · Zod 3
- **Size:** ~9,100 LOC across `src` · 27 dependencies / 9 dev · 36 client components
- **Build status:** ✅ `next build` passes; all routes return 200; marketing pages statically generated

---

## 1. Folder Structure

```
webtemp/
├── middleware.ts                 # Supabase session refresh + /admin guard
├── next.config.mjs               # image remote patterns, package-import opt
├── tailwind.config.ts            # design tokens → CSS variables
├── package.json / package-lock.json
├── .env.example                  # required env vars (all optional at boot)
├── supabase/
│   ├── migrations/0001_init.sql  # schema + RLS
│   └── seed.sql                  # optional demo data
├── public/                       # site.webmanifest (+ client assets)
└── src/
    ├── app/                      # App Router routes
    │   ├── (marketing)/          # public site (shared navbar/footer layout)
    │   ├── admin/
    │   │   ├── login/            # auth page
    │   │   └── (dashboard)/      # guarded admin (sidebar layout)
    │   ├── layout.tsx            # root: fonts, providers, LocalBusiness JSON-LD
    │   ├── globals.css           # design tokens (light/dark), utilities
    │   ├── sitemap.ts / robots.ts / opengraph-image.tsx / icon.svg
    │   └── not-found.tsx         # global 404
    ├── components/
    │   ├── ui/         (24)      # reusable primitives
    │   ├── sections/   (11)      # homepage sections
    │   ├── shared/     (12)      # cross-cutting components
    │   ├── admin/      (14)      # dashboard components
    │   ├── forms/      (2)       # contact + quote (RHF + Zod)
    │   ├── layout/     (2)       # navbar, footer
    │   ├── motion/     (1)       # scroll-reveal helpers
    │   └── providers.tsx         # theme + tooltip + toaster
    ├── config/         (12)      # ⭐ all client-editable content
    ├── services/       (7)       # data access (Supabase + demo fallback)
    ├── server/actions/ (3)       # server actions (auth, contact, quote)
    ├── lib/            (9)       # utils, seo, validations, csv, supabase clients
    ├── hooks/          (1)       # use-toast
    └── types/          (2)       # content + database types
```

Separation of concerns is clean: **presentation** (`components`), **content**
(`config`), **data access** (`services`), **mutations** (`server/actions`),
**cross-cutting logic** (`lib`), and **types** are each isolated. A developer
can locate any concern in one place.

---

## 2. Routing Map

### Public (marketing) — 14 routes

| Route | File | Rendering |
|---|---|---|
| `/` | `(marketing)/page.tsx` | Static (SSG) |
| `/about` | `(marketing)/about/page.tsx` | Static |
| `/services` | `(marketing)/services/page.tsx` | Static |
| `/services/[slug]` | `services/[slug]/page.tsx` | SSG (`generateStaticParams`, 4 pages) |
| `/gallery` | `(marketing)/gallery/page.tsx` | Static |
| `/reviews` | `(marketing)/reviews/page.tsx` | Static |
| `/blog` | `(marketing)/blog/page.tsx` | Static |
| `/blog/[slug]` | `blog/[slug]/page.tsx` | SSG (3 pages) |
| `/careers` | `(marketing)/careers/page.tsx` | Static |
| `/careers/[slug]` | `careers/[slug]/page.tsx` | SSG (2 pages) |
| `/contact` | `(marketing)/contact/page.tsx` | Static |
| `/privacy`, `/terms` | legal pages | Static |
| `*` (404) | `not-found.tsx` | Static |

### Admin — 11 routes

| Route | File | Rendering |
|---|---|---|
| `/admin/login` | `admin/login/page.tsx` | Client (form) |
| `/admin` | `admin/(dashboard)/page.tsx` | Dynamic (server data) |
| `/admin/leads` | `.../leads/page.tsx` | Dynamic |
| `/admin/quotes` | `.../quotes/page.tsx` | Dynamic |
| `/admin/reviews` | `.../reviews/page.tsx` | Dynamic |
| `/admin/gallery` | `.../gallery/page.tsx` | Dynamic |
| `/admin/blog` | `.../blog/page.tsx` | Dynamic |
| `/admin/blog/new` | `.../blog/new/page.tsx` | Static (editor) |
| `/admin/blog/[id]` | `.../blog/[id]/page.tsx` | Dynamic (edit) |
| `/admin/employees` | `.../employees/page.tsx` | Dynamic |

### Metadata / system routes

`sitemap.xml`, `robots.txt`, `opengraph-image` (edge, dynamic), `icon.svg`.

### API routes

**None.** All mutations use **Server Actions** (`src/server/actions/*`) rather
than route handlers — the modern App Router pattern. (0 `route.ts` files.)

---

## 3. Component Inventory

**UI primitives (24)** — `button, card, badge, input, textarea, label,
separator, accordion, avatar, select, tabs, dialog, dropdown-menu, tooltip,
toast + toaster, skeleton, alert, table, breadcrumb, pagination, sheet,
command`. All are typed, forward-ref, variant-driven (CVA), and theme-aware.

**Homepage sections (11)** — `hero, logo-strip, about-section, services-section,
process-section, before-after-section, testimonials-section, service-area-
section, faq-section, contact-section, cta-section`. Each reads from `config`
and is independently reusable.

**Shared (12)** — `service-card, testimonial-card, star-rating, before-after-
slider (interactive), gallery-grid (filter + lightbox), page-header, section-
heading, logo, social-icons, field, legal-content, theme-toggle`.

**Admin (14)** — `sidebar, topbar, admin-chrome, command-menu (⌘K), stat-card,
bar-chart (dependency-free), status-badge, leads-table (+ detail drawer),
quotes-table, reviews-manager, gallery-manager, blog-editor, employees-manager`.

**Forms (2)** — `contact-form`, `quote-form` (RHF + Zod + honeypot + toast).

36 files carry `"use client"`; everything else is a Server Component.

---

## 4. Data & Content Layers

### Config system (`src/config`)
The heart of the "swap a client in 30 minutes" design. 12 files, barrel-exported
via `config/index.ts`: `site` (company, nav, hours, SEO, service areas),
`theme`, `services`, `process`, `testimonials`, `faq`, `gallery`, `team`,
`blog`, `careers`, `admin-nav`. Icons referenced by string key and resolved
through `lib/icons.ts` so config stays serializable/CMS-friendly.

### Services layer (`src/services`)
Read-side data access with a **graceful demo fallback**: each service checks
`isSupabaseConfigured()` and returns Supabase rows when credentials exist,
otherwise `mock-data.ts`. Services: `leads` (+ stats, CSV, filters), `quotes`,
`reviews` (+ approved→testimonial mapper), `gallery`, `posts` (+ published
mapper), `employees`. This is the seam for a future multi-tenant SaaS.

### Server actions (`src/server/actions`)
- `contact.ts` — validates, inserts into `leads`, honeypot drop, notify stub.
- `quote.ts` — validates, inserts into `quote_requests`.
- `auth.ts` — `signIn` / `signOut` via Supabase Auth (demo bypass when unconfigured).

### Validation (`src/lib/validations.ts`)
Zod schemas: `contact, quote, review, leadUpdate, post, login`.

---

## 5. Supabase Schema

**9 tables, 6 enums, 16 RLS policies, 2 `updated_at` triggers.**

| Table | Purpose | Key columns |
|---|---|---|
| `employees` | Team + roles | `role (user_role)`, `email`, `active`, `org_id` |
| `leads` | CRM pipeline | `status`, `source`, `assigned_to`, `tags[]`, `value` |
| `lead_notes` | Notes per lead | `lead_id → leads`, `author`, `body` |
| `call_logs` | Call history | `lead_id`, `outcome (call_outcome)`, `duration_seconds` |
| `follow_ups` | Scheduled follow-ups | `lead_id`, `due_at`, `completed` |
| `quote_requests` | Quote intake | `service`, `address`, `preferred_date`, `budget`, `photo_urls[]`, `status` |
| `reviews` | Testimonials | `rating (1–5)`, `approved`, `featured` |
| `gallery_images` | Portfolio | `category`, `storage_path`, `url`, `position` |
| `posts` | Blog CMS | `slug (unique)`, `status (post_status)`, SEO fields, `published_at` |

**Enums:** `user_role (admin/staff/readonly)`, `lead_status (new…lost)`,
`lead_source`, `call_outcome`, `quote_status`, `post_status
(draft/scheduled/published)`.

**RLS model:**
- Anon may **INSERT** leads, quote requests, reviews (contact forms) — no reads.
- Anon may **SELECT** approved reviews, published posts, gallery images.
- Authenticated users have **full access** to all tables.
- Every business table carries a nullable `org_id` for a future multi-tenant
  migration (documented in the SQL header).

**Storage:** Referenced (`gallery_images.storage_path`, `quote.photo_urls`) but
buckets are **not yet provisioned/wired** (see §7).

---

## 6. Features Implemented

**Marketing**
- ✅ Full homepage: hero, trust strip, services, about, process, interactive
  before/after slider, testimonials, service-area map, FAQ, contact form, CTA
- ✅ About (team), Services index + per-service detail pages
- ✅ Gallery (category filter + lightbox), Reviews (aggregate rating)
- ✅ Blog index + article pages, Careers index + job pages
- ✅ Privacy, Terms, branded 404
- ✅ Dark mode, scroll-reveal animations, responsive/mobile-first
- ✅ Accessibility: skip link, focus-visible rings, ARIA on slider/breadcrumbs,
  `prefers-reduced-motion` handling
- ✅ SEO: per-page metadata + canonical, JSON-LD (LocalBusiness / Service /
  FAQ), dynamic OG image, `sitemap.xml`, `robots.txt`, web manifest

**Admin**
- ✅ Supabase-auth login (+ open demo mode), route guard (middleware + layout)
- ✅ Dashboard: stat cards, leads-by-stage chart, revenue, recent leads
- ✅ CRM leads table: search, status/assignee filter, CSV export, detail drawer
- ✅ Quotes table + status workflow drawer
- ✅ Reviews moderation (approve / feature / hide, tabs)
- ✅ Gallery manager (reorder, delete, upload dropzone UI)
- ✅ Blog CRUD editor (Zod-validated, auto-slug, status)
- ✅ Employee/role management UI
- ✅ Command palette (⌘K) + single-key nav shortcuts

**Public form → DB:** contact and quote submissions persist to Supabase when
configured (RLS-safe anon insert).

---

## 7. Missing / Not-Yet-Wired Features

These are **staged** (UI + types + clients present) but not fully connected:

| Feature | State |
|---|---|
| **Admin write-persistence** | Lead status/notes/assignment, review approval, gallery reorder/delete, employee role changes update **client state only** — no Supabase write-back (no admin server actions yet). |
| **CSV import** | Parser exists (`lib/csv.ts`) and file input is wired to a toast; no insert action. |
| **Gallery upload** | Dropzone UI present; not connected to Supabase Storage + `gallery_images`. |
| **Quote photo uploads** | `photo_urls[]` in schema; form has no file input. |
| **Blog save** | Editor validates and toasts; no Supabase insert/update; no scheduled-publish job. |
| **Call logs / follow-ups** | Tables exist; **no admin UI** to create/list them (drawer shows demo notes only). |
| **Notifications** | New-lead email/Slack is a `console.info` stub (`LEAD_NOTIFICATION_EMAIL`). |
| **Employee invites** | Button toasts; not wired to Supabase Auth invitations. |
| **Role enforcement** | `admin/staff/readonly` defined but **not enforced** in UI or RLS (all authenticated users get full access). |
| **Multi-tenancy** | `org_id` columns present; no `organizations` table, membership, or tenant resolution. |
| **Pagination** | `Pagination` component built but **unused** — blog/reviews/gallery render all rows. |
| **Auth flows** | Only login/logout; no password reset, signup, or MFA. |
| **Analytics** | None integrated. |

---

## 8. Technical Debt

1. **Demo-vs-live branching is duplicated** across every service
   (`isSupabaseConfigured()` guard). Fine now; consider a repository adapter to
   centralize it before adding writes.
2. **Type duplication** between `types/content.ts` (marketing) and
   `types/database.ts` (DB) requires hand-written mappers (`Review→Testimonial`,
   `Post→BlogPost`). Acceptable, but drifts if columns change; consider
   `supabase gen types` + a single mapping module.
3. **`useFormState` (deprecated)** in `admin/login/page.tsx` — React 19 prefers
   `useActionState` from `react`. Works today; will warn.
4. **Unused code:** `createAdminClient()` (service-role) is defined but never
   used; `SeoConfig.ogImage` is now dead after the dynamic-OG change;
   `leadsToCsv` in the service overlaps `lib/csv.ts`.
5. **Duplicated auth guard** — middleware **and** the dashboard layout both check
   the session (defense-in-depth, but redundant).
6. **No test suite** — 0 test files, no runner configured. No CI.
7. **No error/loading boundaries** — no `error.tsx` / `loading.tsx` per segment;
   a failed Supabase read throws to the nearest boundary (none → 500).
8. **Placeholder content** — `mapEmbedUrl`, legal copy, and Unsplash images are
   demo stand-ins that must be replaced per client (documented).
9. **No rate limiting** on public server actions (honeypot only).

---

## 9. Performance Analysis

**Strengths**
- Marketing pages are **statically generated**; admin is server-rendered on demand.
- **Server Components by default**; client JS limited to interactive islands (36 files).
- `next/image` everywhere with `sizes`, AVIF/WebP, and hero `priority`.
- `optimizePackageImports: ["lucide-react"]` trims icon imports.
- Dependency-free admin `BarChart` (no charting lib).
- Shared First-Load JS ≈ **105 kB**; homepage ≈ **200 kB** (reasonable for the animation-rich hero).

**Concerns / opportunities**
1. **Framer Motion weight** — imported directly (not `LazyMotion`/`m`), so the
   full API ships. Homepage first-load (~200 kB) is driven largely by this.
   Switching to `LazyMotion` + `m` components could cut a meaningful chunk.
2. **Scroll-reveal + no-JS** — `whileInView` renders content at `opacity:0` in
   SSR HTML; text is present for SEO/crawlers, but with JS disabled below-the-
   fold content stays invisible. Also causes blank regions in full-page
   screenshots/print.
3. **Unbounded reads** — reviews/gallery/blog services fetch **all** rows. Fine
   at demo scale; add `.limit()` + the existing `Pagination` before real volume.
4. **Third-party embeds** — Google Maps `iframe` (lazy-loaded) and remote
   Unsplash images add external requests; self-host/optimize client photos.
5. **OG image** runs on the **edge runtime** and regenerates per request; add
   caching/`revalidate` if it's hit often.
6. **No bundle analyzer / Lighthouse run** committed — targets (95+) are designed
   for but not yet measured.

---

## 10. Security Notes

- ✅ Public inserts are RLS-scoped (anon can write leads/quotes/reviews, never read).
- ✅ Service-role key is server-only (`SUPABASE_SERVICE_ROLE_KEY`, not `NEXT_PUBLIC_`).
- ✅ Honeypot fields on both public forms.
- ⚠️ **Role-based authorization not enforced** — any authenticated user has full
  DB access; tighten RLS per role before production multi-user use.
- ⚠️ **No rate limiting / CAPTCHA** on public actions beyond the honeypot.
- ⚠️ Admin route protection depends on Supabase being configured — in demo mode
  the dashboard is intentionally open (must not ship to production unconfigured).

---

## 11. Recommended Next Steps (priority order)

1. **Wire admin writes** — add `server/actions/{leads,reviews,gallery,posts,
   employees}.ts` and swap client-only mutations for `revalidatePath`-backed
   actions. (Unblocks the whole dashboard for real use.)
2. **Enforce roles** — RLS policies keyed off an `employees.role` lookup +
   UI gating for `readonly`.
3. **Storage** — provision a `gallery` bucket, wire upload + `next/image` optimization; add quote photo uploads.
4. **Notifications** — implement the email provider (Resend/Postmark) in the contact/quote actions.
5. **Hardening** — `error.tsx`/`loading.tsx` per segment, rate limiting, swap `useFormState`→`useActionState`.
6. **Perf** — adopt `LazyMotion`, add `.limit()` + pagination, run Lighthouse/bundle analyzer.
7. **Tests + CI** — Vitest/Playwright smoke tests, GitHub Actions build gate.
8. **Multi-tenant** (when needed) — `organizations` + membership, populate `org_id`, tenant resolution in services.
