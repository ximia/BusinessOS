-- =============================================================================
--  Agency Connector Settings — a single row that lets a non-technical admin
--  manage this deployment's connector identity from the Business Hub, instead
--  of editing environment variables and redeploying. Read server-side only and
--  deep-layered OVER the environment: any column left NULL inherits the env
--  value (or an auto-derived default). See src/lib/agency/settings.ts.
--
--  Only NON-SECRET fields live here (enable flag + identity). The shared API
--  keys and the Agency OS base URL stay in server-only environment variables —
--  they are identical across the whole fleet and never belong in a table the
--  admin UI can read. Single-tenant uses the 'default' row; `org_id` is the
--  reserved multi-tenant seam.
-- =============================================================================

create table if not exists agency_connector_settings (
  id text primary key default 'default',
  org_id uuid,
  -- NULL ⇒ inherit the AGENCY_OS_ENABLED env master switch.
  enabled boolean,
  -- NULL ⇒ inherit BUSINESS_OS_DEPLOYMENT_ID, else an auto-derived id.
  deployment_id text,
  -- NULL ⇒ inherit BUSINESS_OS_ORG_ID / BUSINESS_OS_ORG_SLUG.
  organization_id text,
  organization_slug text,
  updated_at timestamptz not null default now()
);

alter table agency_connector_settings enable row level security;

-- Authenticated staff may read and write. There is deliberately NO anon policy:
-- unlike business_settings, this operational config is never exposed to the
-- public site. Server code reads it with the service-role client.
create policy "staff manage connector settings" on agency_connector_settings
  for all to authenticated using (true) with check (true);
