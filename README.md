# LocalSite — Premium Multi-Industry Business Template

A production-grade website **and** admin dashboard template for local service
businesses — mechanics, detailers, roofers, electricians, plumbers, HVAC, salons,
barbershops, dentists, landscapers, and more. Built to be re-branded for a new
client in **under 30 minutes** by editing config, not code.

> Demo content models a premium auto-detailing studio. Swap the config and it
> becomes any local trade.

---

## ✨ What's inside

**Marketing site**
- Homepage: hero, trust strip, services, about, process, before/after slider,
  testimonials, service-area map, FAQ, contact form, CTA
- Pages: About, Services + individual service pages, Gallery (filterable +
  lightbox), Reviews, Blog + posts, Careers + job pages, Privacy, Terms, 404
- Fully responsive, dark-mode, accessible (skip links, focus states, reduced
  motion), tasteful Framer Motion animations
- SEO: per-page metadata, JSON-LD (LocalBusiness / Service / FAQ), dynamic Open
  Graph images, `sitemap.xml`, `robots.txt`

**Admin dashboard** (`/admin`) — Linear/Vercel-style, not Bootstrap
- CRM: leads table with search, status/assignee filters, detail drawer, notes,
  tags, CSV import/export
- Quote requests, Reviews moderation (approve/feature), Gallery manager,
  Blog CRUD editor, Employee/role management
- Command palette (⌘K), keyboard shortcuts, charts, beautiful tables
- Supabase auth-guarded; runs in **demo mode** with seed data until you connect
  Supabase

**Architecture**
- Config-driven content (`src/config`) — one place per concern
- Clean service layer (`src/services`) with graceful demo-data fallback
- Reusable UI primitives (`src/components/ui`) + shared components
- Strong typing throughout, Zod-validated forms and mutations
- Structured so it can later become a multi-tenant SaaS (see below)

---

## 🧱 Tech stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn-style UI (Radix) ·
Framer Motion · Supabase (auth, DB, storage) · React Hook Form · Zod ·
Lucide icons · Vercel-ready.

---

## 🚀 Quick start

```bash
npm install
cp .env.example .env.local   # optional — the site runs without it (demo mode)
npm run dev                  # http://localhost:3000  ·  admin at /admin
```

Without Supabase credentials the app runs in **demo mode**: the admin dashboard
is open and populated with realistic seed data so you can explore everything
immediately.

---

## ⏱️ Re-brand for a new client in ~30 minutes

Everything a client needs lives in **`src/config/`** — you rarely touch JSX.

| Step | Edit | What changes |
|------|------|--------------|
| 1. Company info | `config/site.config.ts` | Name, phone, email, address, hours, nav, footer, socials, service areas, SEO |
| 2. Brand colors | `app/globals.css` (`:root` / `.dark`) | Whole palette via CSS variables |
| 3. Fonts | `app/layout.tsx` | Swap the two `next/font` imports |
| 4. Services | `config/services.config.ts` | Cards, `/services`, detail pages, quote dropdown |
| 5. Testimonials | `config/testimonials.config.ts` | Homepage + reviews |
| 6. FAQ | `config/faq.config.ts` | FAQ section + schema |
| 7. Gallery | `config/gallery.config.ts` | Gallery + before/after |
| 8. Team | `config/team.config.ts` | About page team |
| 9. Blog / Careers | `config/blog.config.ts`, `config/careers.config.ts` | Blog & jobs |
| 10. Logo | drop a file in `/public`, set `logo.src` | Navbar/footer (falls back to a wordmark) |
| 11. Map | `site.config.ts` → `mapEmbedUrl` | Service-area map |
| 12. Deploy | Vercel + env vars | Live |

Icons are referenced by string key and resolved via `src/lib/icons.ts` — add
new ones there.

---

## 🗂️ Project structure

```
src/
├── app/
│   ├── (marketing)/        # Public site (shares navbar/footer layout)
│   │   ├── page.tsx        # Homepage
│   │   ├── about, services, gallery, reviews, blog, careers, contact, …
│   ├── admin/
│   │   ├── login/          # Auth
│   │   └── (dashboard)/    # Guarded admin (sidebar layout)
│   ├── layout.tsx          # Root: fonts, providers, JSON-LD
│   ├── sitemap.ts, robots.ts, opengraph-image.tsx, icon.svg
├── components/
│   ├── ui/                 # Reusable primitives (button, card, table, …)
│   ├── sections/           # Homepage sections
│   ├── forms/              # Contact & quote forms (RHF + Zod)
│   ├── admin/              # Dashboard components
│   ├── layout/             # Navbar, footer
│   ├── shared/, motion/    # Cross-cutting components
├── config/                 # ⭐ All client-editable content
├── services/               # Data access (Supabase + demo fallback)
├── server/actions/         # Server actions (form submits, auth)
├── lib/                    # utils, seo, validations, csv, supabase clients
├── hooks/                  # use-toast
└── types/                  # content + database types
supabase/                   # SQL migration + seed
```

---

## 🔌 Connect Supabase (go live)

**Full walkthrough: [`docs/SETUP.md`](docs/SETUP.md)** — Supabase project,
migrations, env vars, admin user, storage, analytics, AI keys, multi-tenancy, and
Vercel deploy, with a troubleshooting table.

Quick version:

1. Create a project at [supabase.com](https://supabase.com).
2. Run every migration in `supabase/migrations/` **in order** (`0001` →
   `0005`); `0005` is opt-in for multi-tenancy. `seed.sql` is optional demo data.
3. Fill in `.env.local` (see `.env.example` — Supabase, site URL, analytics, AI).
4. Create an auth user **and a matching `employees` row** (email + role + org) —
   the app resolves tenant/role from that row, so skipping it leaves the admin
   empty/read-only. Details in `docs/SETUP.md` §4.

Contact and quote forms write to the `leads` / `quote_requests` tables
automatically (public insert is allowed by RLS; reads are staff-only).

---

## 🖼️ Images & performance

- All images use `next/image`. Add remote hosts in `next.config.mjs`.
- Server Components by default; client components only where interactivity needs
  it. Marketing pages are statically generated.
- Wire the gallery/blog upload inputs to **Supabase Storage** for automatic
  optimization (hooks are in place in the admin components).

---

## 🏢 Multi-tenant / white-label

Multi-tenancy is **built in** (opt-in). Migration `0005_multi_tenancy.sql` adds an
`organizations` table and tightens RLS to be org-scoped and role-aware, resolving
the active tenant per request by subdomain, custom domain, or membership
(`src/features/tenant/`). Manage orgs, custom domains, and team roles from
**/admin/organization**. Turn it on by running `0005` and adding your org rows —
see [`docs/SETUP.md`](docs/SETUP.md) §8. Single-tenant installs can ignore it
entirely.

---

## 📦 Deploy to Vercel

Push to GitHub, import into Vercel, add the environment variables, deploy. The
build is standard `next build` with no extra configuration.

---

## 📝 Notes

- Legal pages (`/privacy`, `/terms`) are **templates** — have them reviewed by
  counsel before launch.
- No fabricated statistics are used anywhere; trust signals come from config and
  should be factual for each client.
