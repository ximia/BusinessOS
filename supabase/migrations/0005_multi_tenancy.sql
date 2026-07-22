-- =============================================================================
--  Multi-tenancy / white-label (Priority 11).
--
--  Turns the single-tenant schema into a multi-tenant one built on the nullable
--  `org_id` columns that 0001 already provisioned. After this migration:
--    - `organizations` holds each tenant (name, slug, custom domain, plan).
--    - `employees` link to an org (`org_id`) and an auth user (`user_id`).
--    - `current_org_id()` / `current_user_role()` resolve the caller's tenant
--      and role from their auth session.
--    - RLS is tightened from "any authenticated user" to org-scoped + role-aware
--      (readonly members can read but not write).
--
--  This is the production hardening step — run it once you actually need more
--  than one tenant. It is safe on a single-tenant install (everything lands in
--  the seeded default org). Idempotent where practical.
-- =============================================================================

-- ─── Organizations ──────────────────────────────────────────────────────────
create type org_plan as enum ('starter', 'pro', 'agency');

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  custom_domain text unique,
  plan org_plan not null default 'starter',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger organizations_updated before update on organizations
  for each row execute function set_updated_at();

-- Seed a default org and adopt every existing row into it.
insert into organizations (id, name, slug, plan)
values ('00000000-0000-0000-0000-000000000001', 'Default Workspace', 'default', 'pro')
on conflict (slug) do nothing;

-- ─── Employees ↔ auth users + org ───────────────────────────────────────────
alter table employees add column if not exists user_id uuid references auth.users (id);
create index if not exists employees_user_idx on employees (user_id);
create index if not exists employees_org_idx on employees (org_id);

-- Backfill org_id on every business table to the default org.
do $$
declare t text;
begin
  foreach t in array array[
    'employees','leads','quote_requests','reviews','gallery_images','posts'
  ] loop
    execute format(
      'update %I set org_id = ''00000000-0000-0000-0000-000000000001'' where org_id is null',
      t
    );
  end loop;
end $$;

-- ─── Tenant resolution helpers ──────────────────────────────────────────────
-- SECURITY DEFINER so they can read `employees` regardless of RLS.
create or replace function current_org_id()
returns uuid language sql stable security definer set search_path = public as $$
  select org_id from employees
  where user_id = auth.uid()
     or email = (auth.jwt() ->> 'email')
  limit 1
$$;

create or replace function current_user_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from employees
  where user_id = auth.uid()
     or email = (auth.jwt() ->> 'email')
  limit 1
$$;

-- Convenience: can the caller write (admin or staff, not readonly)?
create or replace function current_can_write()
returns boolean language sql stable as $$
  select coalesce(current_user_role() in ('admin', 'staff'), false)
$$;

-- ─── Org-scoped, role-aware RLS ─────────────────────────────────────────────
-- Replace the permissive "staff manage X" policies from 0001/0002/0004.
drop policy if exists "staff manage leads" on leads;
drop policy if exists "staff manage quotes" on quote_requests;
drop policy if exists "staff manage reviews" on reviews;
drop policy if exists "staff manage gallery" on gallery_images;
drop policy if exists "staff manage posts" on posts;
drop policy if exists "staff read employees" on employees;
drop policy if exists "admins manage employees" on employees;
drop policy if exists "staff manage business settings" on business_settings;
drop policy if exists "staff manage integrations" on integrations;

-- Parent tables: read within your org; write only if admin/staff.
do $$
declare t text;
begin
  foreach t in array array['leads','quote_requests','reviews','gallery_images','posts'] loop
    execute format($f$
      create policy "org read %1$s" on %1$s
        for select to authenticated using (org_id = current_org_id());
      create policy "org write %1$s" on %1$s
        for all to authenticated
        using (org_id = current_org_id() and current_can_write())
        with check (org_id = current_org_id() and current_can_write());
    $f$, t);
  end loop;
end $$;

-- Child activity tables have no org_id — scope them through their parent lead.
create policy "org read lead_notes" on lead_notes
  for select to authenticated
  using (lead_id in (select id from leads where org_id = current_org_id()));
create policy "org write lead_notes" on lead_notes
  for all to authenticated
  using (lead_id in (select id from leads where org_id = current_org_id()) and current_can_write())
  with check (lead_id in (select id from leads where org_id = current_org_id()) and current_can_write());

create policy "org read call_logs" on call_logs
  for select to authenticated
  using (lead_id in (select id from leads where org_id = current_org_id()));
create policy "org write call_logs" on call_logs
  for all to authenticated
  using (lead_id in (select id from leads where org_id = current_org_id()) and current_can_write())
  with check (lead_id in (select id from leads where org_id = current_org_id()) and current_can_write());

create policy "org read follow_ups" on follow_ups
  for select to authenticated
  using (lead_id in (select id from leads where org_id = current_org_id()));
create policy "org write follow_ups" on follow_ups
  for all to authenticated
  using (lead_id in (select id from leads where org_id = current_org_id()) and current_can_write())
  with check (lead_id in (select id from leads where org_id = current_org_id()) and current_can_write());

-- Employees: read your org; only admins manage the team.
create policy "org read employees" on employees
  for select to authenticated using (org_id = current_org_id());
create policy "admins manage employees" on employees
  for all to authenticated
  using (org_id = current_org_id() and current_user_role() = 'admin')
  with check (org_id = current_org_id() and current_user_role() = 'admin');

-- Business settings + integrations: read your org; admins manage.
alter table business_settings add column if not exists org_id uuid;
update business_settings set org_id = '00000000-0000-0000-0000-000000000001' where org_id is null;
create policy "org read settings" on business_settings
  for select to authenticated using (org_id = current_org_id());
create policy "admins manage settings" on business_settings
  for all to authenticated
  using (org_id = current_org_id() and current_user_role() = 'admin')
  with check (org_id = current_org_id() and current_user_role() = 'admin');

alter table integrations add column if not exists org_id uuid;
update integrations set org_id = '00000000-0000-0000-0000-000000000001' where org_id is null;
create policy "org read integrations" on integrations
  for select to authenticated using (org_id = current_org_id());
create policy "admins manage integrations" on integrations
  for all to authenticated
  using (org_id = current_org_id() and current_user_role() = 'admin')
  with check (org_id = current_org_id() and current_user_role() = 'admin');

-- Organizations: members read their own org; admins update it.
alter table organizations enable row level security;
create policy "members read own org" on organizations
  for select to authenticated using (id = current_org_id());
create policy "admins update own org" on organizations
  for update to authenticated
  using (id = current_org_id() and current_user_role() = 'admin')
  with check (id = current_org_id() and current_user_role() = 'admin');

-- NOTE: public (anon) policies from 0001 are unchanged — the marketing site
-- resolves its tenant by host in the app layer and sets org_id on inserts.
-- The public read policies (approved reviews, published posts, gallery) remain
-- global; scope them by host/org in a follow-up if you serve multiple brands
-- from one deployment.
