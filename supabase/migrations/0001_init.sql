-- =============================================================================
--  Initial schema for the LocalSite template.
--  Run in the Supabase SQL editor, or via `supabase db push`.
--
--  Multi-tenant note: every business-data table carries a nullable `org_id`.
--  For a single client it stays null. To turn this into a multi-tenant SaaS,
--  populate `org_id`, add an `organizations` table + membership, and tighten
--  the RLS policies to `org_id = auth_org()`. The app's services layer is the
--  only code that needs to change.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ─── Employees / team ───────────────────────────────────────────────────────
create type user_role as enum ('admin', 'staff', 'readonly');

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  org_id uuid,
  full_name text not null,
  email text not null unique,
  role user_role not null default 'staff',
  avatar_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─── Leads / CRM ────────────────────────────────────────────────────────────
create type lead_status as enum
  ('new', 'contacted', 'qualified', 'quoted', 'won', 'lost');
create type lead_source as enum
  ('website', 'referral', 'google', 'social', 'phone', 'walk-in', 'other');

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  org_id uuid,
  name text not null,
  email text not null,
  phone text,
  message text,
  status lead_status not null default 'new',
  source lead_source not null default 'website',
  assigned_to text,
  tags text[] not null default '{}',
  value numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists leads_status_idx on leads (status);
create index if not exists leads_created_idx on leads (created_at desc);

create table if not exists lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  author text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create type call_outcome as enum
  ('connected', 'voicemail', 'no-answer', 'callback', 'busy');

create table if not exists call_logs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  outcome call_outcome not null,
  duration_seconds integer,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists follow_ups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  due_at timestamptz not null,
  note text not null,
  completed boolean not null default false
);

-- ─── Quote requests ─────────────────────────────────────────────────────────
create type quote_status as enum
  ('requested', 'reviewing', 'sent', 'accepted', 'declined');

create table if not exists quote_requests (
  id uuid primary key default gen_random_uuid(),
  org_id uuid,
  customer_name text not null,
  email text not null,
  phone text,
  service text not null,
  address text,
  preferred_date date,
  budget text,
  notes text,
  photo_urls text[] not null default '{}',
  status quote_status not null default 'requested',
  created_at timestamptz not null default now()
);

-- ─── Reviews ────────────────────────────────────────────────────────────────
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  org_id uuid,
  name text not null,
  rating smallint not null check (rating between 1 and 5),
  quote text not null,
  service text,
  approved boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─── Gallery ────────────────────────────────────────────────────────────────
create table if not exists gallery_images (
  id uuid primary key default gen_random_uuid(),
  org_id uuid,
  title text not null,
  category text not null,
  storage_path text not null,
  url text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- ─── Blog posts ─────────────────────────────────────────────────────────────
create type post_status as enum ('draft', 'scheduled', 'published');

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid,
  slug text not null unique,
  title text not null,
  excerpt text not null,
  content text not null,
  category text not null,
  cover_image text,
  status post_status not null default 'draft',
  author text not null,
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists posts_status_idx on posts (status);

-- ─── updated_at trigger ─────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated before update on leads
  for each row execute function set_updated_at();
create trigger posts_updated before update on posts
  for each row execute function set_updated_at();

-- =============================================================================
--  Row Level Security
--  - Public (anon) may INSERT leads, quote requests, and reviews (contact
--    forms) but never read them.
--  - Published posts, approved reviews, and gallery images are publicly
--    readable so the marketing site can render them.
--  - Authenticated staff may do everything (tighten per-role in your app or
--    with additional policies as needed).
-- =============================================================================
alter table employees enable row level security;
alter table leads enable row level security;
alter table lead_notes enable row level security;
alter table call_logs enable row level security;
alter table follow_ups enable row level security;
alter table quote_requests enable row level security;
alter table reviews enable row level security;
alter table gallery_images enable row level security;
alter table posts enable row level security;

-- Public inserts from website forms.
create policy "anon can submit leads" on leads
  for insert to anon with check (true);
create policy "anon can submit quotes" on quote_requests
  for insert to anon with check (true);
create policy "anon can submit reviews" on reviews
  for insert to anon with check (approved = false and featured = false);

-- Public reads for marketing content.
create policy "public reads approved reviews" on reviews
  for select to anon using (approved = true);
create policy "public reads published posts" on posts
  for select to anon using (status = 'published');
create policy "public reads gallery" on gallery_images
  for select to anon using (true);

-- Authenticated staff: full access.
create policy "staff manage leads" on leads
  for all to authenticated using (true) with check (true);
create policy "staff manage lead_notes" on lead_notes
  for all to authenticated using (true) with check (true);
create policy "staff manage call_logs" on call_logs
  for all to authenticated using (true) with check (true);
create policy "staff manage follow_ups" on follow_ups
  for all to authenticated using (true) with check (true);
create policy "staff manage quotes" on quote_requests
  for all to authenticated using (true) with check (true);
create policy "staff manage reviews" on reviews
  for all to authenticated using (true) with check (true);
create policy "staff manage gallery" on gallery_images
  for all to authenticated using (true) with check (true);
create policy "staff manage posts" on posts
  for all to authenticated using (true) with check (true);
create policy "staff read employees" on employees
  for select to authenticated using (true);
create policy "admins manage employees" on employees
  for all to authenticated using (true) with check (true);
