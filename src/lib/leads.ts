/**
 * Client-safe CRM helpers (no server imports). Pure functions used by both the
 * services layer and the admin UI so behaviour stays consistent.
 */
import type {
  Lead,
  LeadActivity,
  LeadDetail,
} from "@/types/database";

/** Normalise a phone number to digits only, for loose matching. */
function digits(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

/**
 * Detect likely-duplicate leads by matching email (case-insensitive) or phone
 * (digits only). Returns the set of lead ids that share a key with at least one
 * other lead, so the UI can flag them for review/merge.
 */
export function findDuplicateLeadIds(leads: Lead[]): Set<string> {
  const byKey = new Map<string, string[]>();
  for (const lead of leads) {
    const keys: string[] = [];
    const email = lead.email.trim().toLowerCase();
    if (email) keys.push(`e:${email}`);
    const phone = digits(lead.phone);
    if (phone.length >= 7) keys.push(`p:${phone}`);
    for (const key of keys) {
      const list = byKey.get(key) ?? [];
      list.push(lead.id);
      byKey.set(key, list);
    }
  }

  const dupes = new Set<string>();
  for (const ids of byKey.values()) {
    if (ids.length > 1) ids.forEach((id) => dupes.add(id));
  }
  return dupes;
}

/**
 * Merge a lead's notes, call logs, and follow-ups (plus a synthesized "created"
 * event) into a single reverse-chronological activity timeline.
 */
export function buildLeadTimeline(
  lead: Lead,
  detail: LeadDetail
): LeadActivity[] {
  const items: LeadActivity[] = [];

  items.push({
    kind: "created",
    id: `created-${lead.id}`,
    at: lead.created_at,
    source: lead.source,
  });

  for (const note of detail.notes) {
    items.push({
      kind: "note",
      id: note.id,
      at: note.created_at,
      author: note.author,
      body: note.body,
    });
  }

  for (const call of detail.calls) {
    items.push({
      kind: "call",
      id: call.id,
      at: call.created_at,
      outcome: call.outcome,
      durationSeconds: call.duration_seconds,
      notes: call.notes,
    });
  }

  for (const followUp of detail.followUps) {
    items.push({
      kind: "follow_up",
      id: followUp.id,
      at: followUp.created_at,
      dueAt: followUp.due_at,
      note: followUp.note,
      completed: followUp.completed,
    });
  }

  return items.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );
}

/** Whether a follow-up is open and its due date has passed. */
export function isOverdue(dueAt: string, completed: boolean): boolean {
  return !completed && new Date(dueAt).getTime() < Date.now();
}

/** Human label for a call duration in seconds (e.g. "7m 0s"). */
export function formatDuration(seconds: number | null): string {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
