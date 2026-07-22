import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { mockEmployees } from "./mock-data";
import type { Employee } from "@/types/database";

export async function getEmployees(): Promise<Employee[]> {
  if (!isSupabaseConfigured()) return mockEmployees;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Names available for the "assigned employee" dropdown in the CRM. */
export async function getAssignableEmployees(): Promise<string[]> {
  const employees = await getEmployees();
  return employees.filter((e) => e.active).map((e) => e.full_name);
}
