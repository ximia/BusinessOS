-- =============================================================================
--  Business Settings — a single JSONB row that holds admin-edited overrides for
--  the site's company details, branding, SEO, and feature flags. The app deep-
--  merges this over the compile-time `siteConfig` defaults (see
--  src/features/settings). Single-tenant uses the 'default' row; `org_id` is
--  reserved for the future multi-tenant migration.
-- =============================================================================

create table if not exists business_settings (
  id text primary key default 'default',
  org_id uuid,
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table business_settings enable row level security;

-- Public site reads the effective settings to render (anon, read-only).
create policy "public reads business settings" on business_settings
  for select to anon using (true);

-- Authenticated staff may read and write.
create policy "staff manage business settings" on business_settings
  for all to authenticated using (true) with check (true);
