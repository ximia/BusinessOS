import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { mockLeads } from "./mock-data";
import type { Lead, LeadStatus } from "@/types/database";

export interface LeadFilters {
  search?: string;
  status?: LeadStatus | "all";
  assignee?: string;
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
  if (filters.assignee) {
    query = query.eq("assigned_to", filters.assignee);
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

  return {
    total: leads.length,
    newThisWeek: leads.filter(
      (l) => Date.now() - new Date(l.created_at).getTime() < 7 * 86400000
    ).length,
    byStatus,
    pipelineValue,
    wonValue,
  };
}

/** Apply filters in-memory (demo mode). */
function filterLeads(leads: Lead[], filters: LeadFilters): Lead[] {
  return leads.filter((l) => {
    if (filters.status && filters.status !== "all" && l.status !== filters.status)
      return false;
    if (filters.assignee && l.assigned_to !== filters.assignee) return false;
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
