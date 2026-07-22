import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { mockOrganizations } from "@/services/mock-data";
import type { Organization, UserRole } from "@/types/database";
import { normalizeHost, slugFromHost } from "./tenant";

/** The org used in demo mode and as the fallback when resolution fails. */
export const DEMO_ORG: Organization = mockOrganizations[0]!;

/**
 * Resolve the active organization for this request. Demo mode returns the demo
 * org. With Supabase configured, it resolves by (1) subdomain slug, (2) custom
 * domain match, then (3) the signed-in user's membership — falling back to the
 * demo org so the admin is never left without a tenant context.
 */
export async function getActiveOrg(): Promise<Organization> {
  if (!isSupabaseConfigured()) return DEMO_ORG;

  const host = (await headers()).get("host");
  const supabase = await createClient();

  const slug = slugFromHost(host);
  if (slug) {
    const { data } = await supabase
      .from("organizations")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (data) return data;
  }

  const bareHost = normalizeHost(host);
  if (bareHost) {
    const { data } = await supabase
      .from("organizations")
      .select("*")
      .eq("custom_domain", bareHost)
      .maybeSingle();
    if (data) return data;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.email) {
    const { data: member } = await supabase
      .from("employees")
      .select("org_id")
      .eq("email", user.email)
      .maybeSingle();
    if (member?.org_id) {
      const { data } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", member.org_id)
        .maybeSingle();
      if (data) return data;
    }
  }

  return DEMO_ORG;
}

/** All organizations (agency view). Demo returns the mock list. */
export async function getOrganizations(): Promise<Organization[]> {
  if (!isSupabaseConfigured()) return mockOrganizations;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * The signed-in user's role, for UI gating. Demo mode returns "admin" so the
 * whole workspace is explorable; unauthenticated live users get "readonly".
 */
export async function getActiveMemberRole(): Promise<UserRole> {
  if (!isSupabaseConfigured()) return "admin";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return "readonly";
  const { data } = await supabase
    .from("employees")
    .select("role")
    .eq("email", user.email)
    .maybeSingle();
  return (data?.role as UserRole) ?? "readonly";
}
