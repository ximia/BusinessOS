# Going live — Supabase, environment, auth & deploy

The app runs fully in **demo mode** with no configuration (seed data, open admin).
This guide connects it to a real Supabase backend and takes it to production.

Everything is optional and layered — you can wire up only what you need.

---

## 0. TL;DR

```bash
cp .env.example .env.local        # fill in the values below
# → create a Supabase project, run migrations 0001–0005 in order
# → create an auth user AND a matching `employees` row (see §4 — this is the #1 gotcha)
npm install && npm run build      # must pass
```

| What you get | Requires |
|---|---|
| Marketing site + demo admin | nothing (works out of the box) |
| Real data, auth-guarded admin | Supabase (§1–§4) |
| Gallery / quote photo uploads | Supabase Storage (§5) |
| Web analytics tags on the site | `NEXT_PUBLIC_GA_ID` / `GTM_ID` (§6) |
| AI content tools generate for real | `ANTHROPIC_API_KEY` (§7) |
| Multiple brands / custom domains | migration `0005` + DNS (§8) |

---

## 1. Create a Supabase project

1. Sign up at [supabase.com](https://supabase.com) and create a project.
2. Note the **Project URL** and the **anon** and **service_role** keys from
   **Project Settings → API**.

## 2. Run the migrations (in order)

Open **SQL Editor** and run each file from `supabase/migrations/` in sequence:

| File | Adds |
|---|---|
| `0001_init.sql` | Core schema: employees, leads (+ notes/calls/follow-ups), quotes, reviews, gallery, posts, enums, RLS, triggers |
| `0002_business_settings.sql` | `business_settings` JSONB singleton (admin-editable site config) |
| `0003_crm_expansion.sql` | `leads.archived` + activity indexes (CRM expansion) |
| `0004_integrations.sql` | `integrations` table (auth-only — stores provider secrets) |
| `0005_multi_tenancy.sql` | `organizations` + org/role-aware RLS. **Only run this when you want multi-tenancy / custom domains** — see §8 |

`supabase/seed.sql` (optional) loads demo rows so the admin isn't empty on first
sign-in. Skip it for a clean production start.

> Order matters — later migrations depend on tables/functions from earlier ones.

## 3. Environment variables

Copy `.env.example` → `.env.local` and fill in. Grouped by purpose:

```bash
# --- Supabase (required for real data) ---
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"   # public
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."                # public
SUPABASE_SERVICE_ROLE_KEY="eyJ..."                    # SERVER-ONLY — never expose

# --- Site ---
NEXT_PUBLIC_SITE_URL="https://www.yourclient.com"     # canonical URL (SEO/OG/sitemap)
LEAD_NOTIFICATION_EMAIL="owner@yourclient.com"        # optional

# --- Analytics (public IDs — safe in the browser) ---
NEXT_PUBLIC_GA_ID=""     # G-XXXXXXXXXX  (Google Analytics 4)
NEXT_PUBLIC_GTM_ID=""    # GTM-XXXXXXX   (Google Tag Manager)

# --- AI tools (server-only) ---
ANTHROPIC_API_KEY=""     # from console.anthropic.com — enables /admin/ai for real
AI_MODEL="claude-opus-4-8"
```

Rules of thumb: anything prefixed `NEXT_PUBLIC_` ships to the browser (public IDs
only); everything else is server-only and must never be committed.

The moment `NEXT_PUBLIC_SUPABASE_URL` + `ANON_KEY` are set, the app leaves demo
mode and reads/writes real data.

## 4. Create the admin user  ⚠️ read this

Two steps — **both are required**, and skipping the second is the most common
"my admin is empty / read-only" bug:

1. **Auth user** — Supabase **Authentication → Users → Add user** (email +
   password). This lets the person sign in at `/admin`.
2. **Employee row** — insert a matching row in `employees` so the app knows their
   **org and role**. After `0005`, RLS resolves the tenant/role from this row; no
   row ⇒ `current_org_id()` is null ⇒ they see nothing (or read-only).

   ```sql
   insert into employees (full_name, email, role, org_id, user_id, active)
   values (
     'Owner Name',
     'owner@yourclient.com',          -- must match the auth user's email
     'admin',
     '00000000-0000-0000-0000-000000000001',  -- the default org from 0005
     (select id from auth.users where email = 'owner@yourclient.com'),
     true
   );
   ```

   (Before running `0005`, only `role` matters — `org_id`/`user_id` are ignored.)

Roles: `admin` (everything), `staff` (read + write), `readonly` (view only). Manage
them from **/admin/organization**.

## 5. Storage (gallery & quote photo uploads)

The gallery/upload inputs are staged (they toast "ready to wire up"). To enable:

1. **Storage → New bucket** named `gallery` (public read).
2. Wire the dropzone in `components/admin/gallery-manager.tsx` to
   `supabase.storage.from('gallery').upload(...)`, then insert a `gallery_images`
   row with the returned public URL. Same pattern for quote photo uploads.

## 6. Analytics

Set `NEXT_PUBLIC_GA_ID` and/or `NEXT_PUBLIC_GTM_ID` (§3). `components/shared/
analytics-scripts.tsx` (already in the root layout) injects the tags when present.
Track/manage provider config from **/admin/integrations**.

## 7. AI tools

Set `ANTHROPIC_API_KEY` (server-only). `/admin/ai` then generates real copy via
Claude (`AI_MODEL`, default `claude-opus-4-8`) instead of demo output. The
provider is abstracted in `features/ai/provider.ts` — swap it for another LLM
without touching the generators or UI.

## 8. Multi-tenancy & custom domains (optional)

Run `0005_multi_tenancy.sql`, then:

1. Add rows to `organizations` (name, `slug`, optional `custom_domain`, plan).
2. Point each tenant's DNS at your deployment. The app resolves the active org
   per request by **subdomain** (`acme.yourapp.com` → slug `acme`) or
   **custom domain** (`www.acme.com` → `organizations.custom_domain`), falling
   back to the signed-in user's membership (`features/tenant/tenant.service.ts`).
3. Manage org identity, domain, and team roles at **/admin/organization**.

RLS is org-scoped and role-aware after `0005` (readonly members can't write).
Note: public marketing reads (approved reviews, published posts, gallery) remain
global — scope them by host/org if you serve multiple brands from one deployment
(documented in the migration).

## 9. Deploy to Vercel

1. Push to GitHub, **Import** the repo into Vercel.
2. Framework Preset must be **Next.js** (auto-detected).
3. Add every environment variable from §3 in **Project Settings → Environment
   Variables**.
4. Deploy. Build is a plain `next build` — no extra config.

For custom domains, add them in Vercel **Domains** and (for multi-tenant) mirror
them into `organizations.custom_domain`.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Admin still shows demo data | `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` not loaded — restart dev server after editing `.env.local` |
| Signed in but admin is empty / read-only | Missing `employees` row for the auth user, or its `org_id`/`email` don't match — see §4 |
| Contact/quote forms 403 | Anon insert policy missing — re-run `0001_init.sql` |
| Integration secret shows "••••" and won't change | Working as designed — leave blank to keep the stored value, type a new one to replace it |
| AI tools return "Demo output" | `ANTHROPIC_API_KEY` not set (server-side) |

## Legal & content

`/privacy` and `/terms` are **templates** — have counsel review before launch.
Keep trust badges factual per client; no fabricated statistics ship anywhere.
