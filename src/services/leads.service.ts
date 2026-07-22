import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import {
  mockLeads,
  mockLeadNotes,
  mockCallLogs,
  mockFollowUps,
} from "./mock-data";
import type {
  Lead,
  LeadStatus,
  LeadSource,
  LeadNote,
  CallLog,
  FollowUp,
  LeadDetail,
} from "@/types/database";

export interface LeadFilters {
  search?: string;
  status?: LeadStatus | "all";
  source?: LeadSource | "all";
  assignee?: string;
  tag?: string;
  /** Include archived leads. When false/undefined, archived leads are hidden. */
  includeArchived?: boolean;
  /** Return only archived leads (the "Archived" view). */
  archivedOnly?: boolean;
}

/**
 * Leads / CRM data access. Reads from Supabase when configured; otherwise
 * returns demo data so the dashboard is explorable out of the box.
 */
export async function getLeads(filters: LeadFilters = {}): Promise<Lead[]> {
  if (!isSupabaseConfigured()) {
    return filterLeads(mockLeads, filters);
  }

  const supabase = await createClient();
  let query = supabase.from("leads").select("*").order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.source && filters.source !== "all") {
    query = query.eq("source", filters.source);
  }
  if (filters.assignee) {
    query = query.eq("assigned_to", filters.assignee);
  }
  if (filters.tag) {
    query = query.contains("tags", [filters.tag]);
  }
  if (filters.archivedOnly) {
    query = query.eq("archived", true);
  } else if (!filters.includeArchived) {
    query = query.eq("archived", false);
  }
  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getLeadById(id: string): Promise<Lead | null> {
  if (!isSupabaseConfigured()) {
    return mockLeads.find((l) => l.id === id) ?? null;
  }
  const supabase = await createClient();
  const { data } = await supabase.from("leads").select("*").eq("id", id).single();
  return data ?? null;
}

export async function getLeadStats() {
  const leads = await getLeads();
  const byStatus = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  }, {});
  const pipelineValue = leads
    .filter((l) => !["won", "lost"].includes(l.status))
    .reduce((sum, l) => sum + (l.value ?? 0), 0);
  const wonValue = leads
    .filter((l) => l.status === "won")
    .reduce((sum, l) => sum + (l.value ?? 0), 0);

  const followUps = await getOpenFollowUps();

  return {
    total: leads.length,
    newThisWeek: leads.filter(
      (l) => Date.now() - new Date(l.created_at).getTime() < 7 * 86400000
    ).length,
    byStatus,
    pipelineValue,
    wonValue,
    openFollowUps: followUps.length,
    overdueFollowUps: followUps.filter(
      (f) => new Date(f.due_at).getTime() < Date.now()
    ).length,
  };
}

// ─── Per-lead activity (notes / calls / follow-ups) ─────────────────────────

/** All notes, keyed by lead id, for hydrating the leads table drawers. */
export async function getLeadNotesByLead(): Promise<Record<string, LeadNote[]>> {
  const rows = await fetchActivity<LeadNote>("lead_notes", mockLeadNotes, {
    column: "created_at",
    ascending: false,
  });
  return groupBy(rows, (r) => r.lead_id);
}

export async function getCallLogsByLead(): Promise<Record<string, CallLog[]>> {
  const rows = await fetchActivity<CallLog>("call_logs", mockCallLogs, {
    column: "created_at",
    ascending: false,
  });
  return groupBy(rows, (r) => r.lead_id);
}

export async function getFollowUpsByLead(): Promise<Record<string, FollowUp[]>> {
  const rows = await fetchActivity<FollowUp>("follow_ups", mockFollowUps, {
    column: "due_at",
    ascending: true,
  });
  return groupBy(rows, (r) => r.lead_id);
}

/** Full activity for a single lead (used by `getLeadById` detail pages). */
export async function getLeadDetail(leadId: string): Promise<LeadDetail> {
  if (!isSupabaseConfigured()) {
    return {
      notes: mockLeadNotes.filter((n) => n.lead_id === leadId),
      calls: mockCallLogs.filter((c) => c.lead_id === leadId),
      followUps: mockFollowUps.filter((f) => f.lead_id === leadId),
    };
  }
  const supabase = await createClient();
  const [notes, calls, followUps] = await Promise.all([
    supabase.from("lead_notes").select("*").eq("lead_id", leadId).order("created_at", { ascending: false }),
    supabase.from("call_logs").select("*").eq("lead_id", leadId).order("created_at", { ascending: false }),
    supabase.from("follow_ups").select("*").eq("lead_id", leadId).order("due_at", { ascending: true }),
  ]);
  return {
    notes: notes.data ?? [],
    calls: calls.data ?? [],
    followUps: followUps.data ?? [],
  };
}

/** Open (incomplete) follow-ups across all leads, for the reminders panel. */
export async function getOpenFollowUps(): Promise<FollowUp[]> {
  if (!isSupabaseConfigured()) {
    return mockFollowUps
      .filter((f) => !f.completed)
      .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("follow_ups")
    .select("*")
    .eq("completed", false)
    .order("due_at", { ascending: true });
  return data ?? [];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function fetchActivity<T>(
  table: "lead_notes" | "call_logs" | "follow_ups",
  fallback: T[],
  order: { column: string; ascending: boolean }
): Promise<T[]> {
  if (!isSupabaseConfigured()) return fallback;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order(order.column, { ascending: order.ascending });
  if (error) throw new Error(error.message);
  return (data as T[]) ?? [];
}

function groupBy<T>(rows: T[], key: (row: T) => string): Record<string, T[]> {
  return rows.reduce<Record<string, T[]>>((acc, row) => {
    const k = key(row);
    (acc[k] ??= []).push(row);
    return acc;
  }, {});
}

/** Apply filters in-memory (demo mode). */
function filterLeads(leads: Lead[], filters: LeadFilters): Lead[] {
  return leads.filter((l) => {
    if (filters.archivedOnly) {
      if (!l.archived) return false;
    } else if (!filters.includeArchived && l.archived) {
      return false;
    }
    if (filters.status && filters.status !== "all" && l.status !== filters.status)
      return false;
    if (filters.source && filters.source !== "all" && l.source !== filters.source)
      return false;
    if (filters.assignee && l.assigned_to !== filters.assignee) return false;
    if (filters.tag && !l.tags.includes(filters.tag)) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !l.name.toLowerCase().includes(q) &&
        !l.email.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });
}

/** Serialise leads to CSV for export. */
export function leadsToCsv(leads: Lead[]): string {
  const headers = [
    "id",
    "name",
    "email",
    "phone",
    "status",
    "source",
    "assigned_to",
    "tags",
    "value",
    "created_at",
  ];
  const rows = leads.map((l) =>
    [
      l.id,
      l.name,
      l.email,
      l.phone ?? "",
      l.status,
      l.source,
      l.assigned_to ?? "",
      l.tags.join("|"),
      l.value ?? "",
      l.created_at,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}
