-- =============================================================================
--  Priority 4 — CRM expansion.
--
--  The lead activity tables (`lead_notes`, `call_logs`, `follow_ups`) already
--  exist from 0001_init.sql. This migration only adds the small pieces the
--  expanded CRM UI needs on top:
--    - `leads.archived`  — soft-archive without deleting history.
--    - Helpful indexes for the per-lead activity lookups the drawer performs.
--
--  Idempotent: safe to run more than once.
-- =============================================================================

-- ─── Archived leads ─────────────────────────────────────────────────────────
alter table leads
  add column if not exists archived boolean not null default false;

create index if not exists leads_archived_idx on leads (archived);

-- ─── Activity-lookup indexes ────────────────────────────────────────────────
-- The lead drawer loads notes / calls / follow-ups by lead_id; the follow-up
-- reminders panel scans open follow-ups by due date.
create index if not exists lead_notes_lead_idx on lead_notes (lead_id, created_at desc);
create index if not exists call_logs_lead_idx on call_logs (lead_id, created_at desc);
create index if not exists follow_ups_lead_idx on follow_ups (lead_id, due_at);
create index if not exists follow_ups_open_idx on follow_ups (completed, due_at);
