"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { getActiveOrg, getActiveMemberRole } from "./tenant.service";
import { can, type Capability } from "./roles";
import type { UserRole } from "@/types/database";

/**
 * Workspace / membership write-actions (Multi-tenancy). Role-guarded: the
 * signed-in member must hold the required capability. Demo mode is a friendly
 * no-op. RLS (migration 0005) enforces the same rules server-side.
 */

export type TenantActionState = { ok: boolean; message: string };

async function requireCapability(cap: Capability): Promise<string | null> {
  if (!isSupabaseConfigured()) return null; // demo: allow
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "You must be signed in.";
  const role = await getActiveMemberRole();
  if (!can(role, cap)) return "You don't have permission to do that.";
  return null;
}

const orgSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  custom_domain: z
    .string()
    .trim()
    .max(255)
    .regex(/^[a-z0-9.-]*$/i, "Enter a valid domain.")
    .nullable()
    .optional(),
});

/** Update the active org's name / custom domain (admin only). */
export async function updateOrganization(
  patch: unknown
): Promise<TenantActionState> {
  const parsed = orgSchema.safeParse(patch);
  if (!parsed.success) return { ok: false, message: "Please check the fields." };

  const denied = await requireCapability("manage_settings");
  if (denied) return { ok: false, message: denied };

  if (!isSupabaseConfigured()) {
    return { ok: true, message: "Saved locally (demo mode)." };
  }
  try {
    const org = await getActiveOrg();
    const supabase = await createClient();
    const { error } = await supabase
      .from("organizations")
      .update({
        ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
        ...(parsed.data.custom_domain !== undefined
          ? { custom_domain: parsed.data.custom_domain || null }
          : {}),
      })
      .eq("id", org.id);
    if (error) throw error;
    revalidatePath("/admin/organization");
    return { ok: true, message: "Workspace updated." };
  } catch (err) {
    console.error("[tenant] updateOrganization failed", err);
    return { ok: false, message: "Couldn't save. Please try again." };
  }
}

const ROLES: readonly UserRole[] = ["admin", "staff", "readonly"];

/** Change a member's role (admin only). */
export async function setMemberRole(
  employeeId: string,
  role: unknown
): Promise<TenantActionState> {
  if (typeof role !== "string" || !ROLES.includes(role as UserRole)) {
    return { ok: false, message: "Unknown role." };
  }
  const denied = await requireCapability("manage_members");
  if (denied) return { ok: false, message: denied };

  if (!isSupabaseConfigured()) {
    return { ok: true, message: `Role set to ${role} (demo mode).` };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("employees")
      .update({ role })
      .eq("id", employeeId);
    if (error) throw error;
    revalidatePath("/admin/organization");
    return { ok: true, message: "Role updated." };
  } catch (err) {
    console.error("[tenant] setMemberRole failed", err);
    return { ok: false, message: "Couldn't update the role." };
  }
}
