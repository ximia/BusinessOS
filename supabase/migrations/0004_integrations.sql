-- =============================================================================
--  Integrations (Priority 7) — securely stored third-party provider config.
--
--  SECURITY: unlike `business_settings` (which is anon-readable so the public
--  site can render it), this table has NO anon policy. Only authenticated staff
--  can read or write it, so secret API keys stored in `config` are never
--  exposed through the public anon key. Server actions further mask secret
--  fields before returning config to the admin UI.
--
--  Single-tenant uses one row per provider; `org_id` is reserved for the future
--  multi-tenant migration.
-- =============================================================================

create table if not exists integrations (
  provider text primary key,
  org_id uuid,
  enabled boolean not null default false,
  config jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table integrations enable row level security;

-- Authenticated staff only — no anon access (protects secret keys).
create policy "staff manage integrations" on integrations
  for all to authenticated using (true) with check (true);

create trigger integrations_updated before update on integrations
  for each row execute function set_updated_at();
