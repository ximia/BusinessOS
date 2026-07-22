import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { mockQuotes } from "./mock-data";
import type { QuoteRequest } from "@/types/database";

export async function getQuotes(): Promise<QuoteRequest[]> {
  if (!isSupabaseConfigured()) return mockQuotes;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quote_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getQuoteById(id: string): Promise<QuoteRequest | null> {
  if (!isSupabaseConfigured()) {
    return mockQuotes.find((q) => q.id === id) ?? null;
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("quote_requests")
    .select("*")
    .eq("id", id)
    .single();
  return data ?? null;
}
