"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";

/**
 * CRM write-actions (Priority 4). Auth-guarded when Supabase is configured;
 * friendly no-ops in demo mode so the admin is fully explorable out of the box.
 * The client keeps optimistic state either way, so the UI stays responsive.
 */

export type LeadActionState = {
  ok: boolean;
  message: string;
  /** id of a newly created row (note / call / follow-up), when applicable. */
  id?: string;
};

const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "quoted",
  "won",
  "lost",
] as const;

const CALL_OUTCOMES = [
  "connected",
  "voicemail",
  "no-answer",
  "callback",
  "busy",
] as const;

const leadPatchSchema = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  assigned_to: z.string().trim().min(1).nullable().optional(),
  tags: z.array(z.string().trim().min(1)).max(20).optional(),
  value: z.number().nonnegative().nullable().optional(),
  archived: z.boolean().optional(),
});

/** Guard: returns an error state string when not permitted, else null. */
async function requireAuth(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? null : "You must be signed in.";
}

function demoOk(message: string, id?: string): LeadActionState {
  return { ok: true, message, id };
}

async function persist(
  run: (supabase: Awaited<ReturnType<typeof createClient>>) => Promise<void>,
  success: string
): Promise<LeadActionState> {
  const authError = await requireAuth();
  if (authError) return { ok: false, message: authError };
  try {
    const supabase = await createClient();
    await run(supabase);
    revalidatePath("/admin/leads");
    revalidatePath("/admin");
    return { ok: true, message: success };
  } catch (err) {
    console.error("[leads] action failed", err);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}

// ─── Lead fields (status / assignment / tags / value / archive) ─────────────

export async function updateLead(
  leadId: string,
  patch: unknown
): Promise<LeadActionState> {
  const parsed = leadPatchSchema.safeParse(patch);
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields." };
  }
  if (!isSupabaseConfigured()) return demoOk("Saved locally (demo mode).");

  return persist(async (supabase) => {
    const { error } = await supabase
      .from("leads")
      .update(parsed.data)
      .eq("id", leadId);
    if (error) throw error;
  }, "Lead updated.");
}

/** Apply the same patch to many leads at once (bulk actions). */
export async function bulkUpdateLeads(
  leadIds: string[],
  patch: unknown
): Promise<LeadActionState> {
  const parsed = leadPatchSchema.safeParse(patch);
  if (!parsed.success || leadIds.length === 0) {
    return { ok: false, message: "Nothing to update." };
  }
  if (!isSupabaseConfigured())
    return demoOk(`Updated ${leadIds.length} lead(s) (demo mode).`);

  return persist(async (supabase) => {
    const { error } = await supabase
      .from("leads")
      .update(parsed.data)
      .in("id", leadIds);
    if (error) throw error;
  }, `Updated ${leadIds.length} lead(s).`);
}

// ─── Notes (internal comments) ──────────────────────────────────────────────

const noteSchema = z.object({
  body: z.string().trim().min(1, "Note can't be empty.").max(4000),
  author: z.string().trim().min(1).max(120).optional(),
});

export async function addLeadNote(
  leadId: string,
  input: unknown
): Promise<LeadActionState> {
  const parsed = noteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid note." };
  }
  if (!isSupabaseConfigured())
    return demoOk("Note added (demo mode).", randomUUID());

  const authError = await requireAuth();
  if (authError) return { ok: false, message: authError };
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("lead_notes")
      .insert({
        lead_id: leadId,
        author: parsed.data.author ?? user?.email ?? "Staff",
        body: parsed.data.body,
      })
      .select("id")
      .single();
    if (error) throw error;
    revalidatePath("/admin/leads");
    return { ok: true, message: "Note added.", id: data?.id };
  } catch (err) {
    console.error("[leads] addLeadNote failed", err);
    return { ok: false, message: "Couldn't add the note. Please try again." };
  }
}

export async function deleteLeadNote(noteId: string): Promise<LeadActionState> {
  if (!isSupabaseConfigured()) return demoOk("Note removed (demo mode).");
  return persist(async (supabase) => {
    const { error } = await supabase.from("lead_notes").delete().eq("id", noteId);
    if (error) throw error;
  }, "Note removed.");
}

// ─── Call logs ──────────────────────────────────────────────────────────────

const callSchema = z.object({
  outcome: z.enum(CALL_OUTCOMES),
  duration_seconds: z.number().int().nonnegative().nullable().optional(),
  notes: z.string().trim().max(4000).nullable().optional(),
});

export async function logCall(
  leadId: string,
  input: unknown
): Promise<LeadActionState> {
  const parsed = callSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Please choose a call outcome." };
  }
  if (!isSupabaseConfigured())
    return demoOk("Call logged (demo mode).", randomUUID());

  const authError = await requireAuth();
  if (authError) return { ok: false, message: authError };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("call_logs")
      .insert({
        lead_id: leadId,
        outcome: parsed.data.outcome,
        duration_seconds: parsed.data.duration_seconds ?? null,
        notes: parsed.data.notes ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;
    revalidatePath("/admin/leads");
    return { ok: true, message: "Call logged.", id: data?.id };
  } catch (err) {
    console.error("[leads] logCall failed", err);
    return { ok: false, message: "Couldn't log the call. Please try again." };
  }
}

// ─── Follow-ups (tasks / reminders) ─────────────────────────────────────────

const followUpSchema = z.object({
  due_at: z.string().datetime().or(z.string().min(1)),
  note: z.string().trim().min(1, "Add a short note.").max(2000),
});

export async function scheduleFollowUp(
  leadId: string,
  input: unknown
): Promise<LeadActionState> {
  const parsed = followUpSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid follow-up." };
  }
  const dueAt = new Date(parsed.data.due_at);
  if (Number.isNaN(dueAt.getTime())) {
    return { ok: false, message: "Please pick a valid date." };
  }
  if (!isSupabaseConfigured())
    return demoOk("Follow-up scheduled (demo mode).", randomUUID());

  const authError = await requireAuth();
  if (authError) return { ok: false, message: authError };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("follow_ups")
      .insert({
        lead_id: leadId,
        due_at: dueAt.toISOString(),
        note: parsed.data.note,
      })
      .select("id")
      .single();
    if (error) throw error;
    revalidatePath("/admin/leads");
    revalidatePath("/admin");
    return { ok: true, message: "Follow-up scheduled.", id: data?.id };
  } catch (err) {
    console.error("[leads] scheduleFollowUp failed", err);
    return { ok: false, message: "Couldn't schedule the follow-up." };
  }
}

export async function setFollowUpCompleted(
  followUpId: string,
  completed: boolean
): Promise<LeadActionState> {
  if (!isSupabaseConfigured())
    return demoOk(completed ? "Marked done (demo mode)." : "Reopened (demo mode).");
  return persist(async (supabase) => {
    const { error } = await supabase
      .from("follow_ups")
      .update({ completed })
      .eq("id", followUpId);
    if (error) throw error;
  }, completed ? "Follow-up completed." : "Follow-up reopened.");
}

export async function deleteFollowUp(
  followUpId: string
): Promise<LeadActionState> {
  if (!isSupabaseConfigured()) return demoOk("Follow-up removed (demo mode).");
  return persist(async (supabase) => {
    const { error } = await supabase
      .from("follow_ups")
      .delete()
      .eq("id", followUpId);
    if (error) throw error;
  }, "Follow-up removed.");
}
