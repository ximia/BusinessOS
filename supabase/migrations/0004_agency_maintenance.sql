-- =============================================================================
--  Agency command channel — maintenance flag.
--
--  Adds a maintenance switch to the connector settings so Agency OS can put a
--  site into "we'll be right back" mode via an authenticated command. Read
--  fail-safe (default false; any error ⇒ site stays up). See
--  src/features/agency-connection/maintenance.ts and src/lib/agency/commands.ts.
-- =============================================================================

alter table agency_connector_settings
  add column if not exists maintenance boolean not null default false;
