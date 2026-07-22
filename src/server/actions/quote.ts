"use server";

import { quoteSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import type { ActionState } from "./contact";

/** Handles a public quote-request submission. */
export async function submitQuote(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = quoteSchema.safeParse({
    customerName: formData.get("customerName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    service: formData.get("service"),
    address: formData.get("address") ?? "",
    preferredDate: formData.get("preferredDate") ?? "",
    budget: formData.get("budget") ?? "",
    notes: formData.get("notes") ?? "",
    company: formData.get("company") ?? "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  if (parsed.data.company) {
    return { ok: true, message: "Thanks — we'll send your quote shortly." };
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("quote_requests").insert({
        customer_name: parsed.data.customerName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        service: parsed.data.service,
        address: parsed.data.address || null,
        preferred_date: parsed.data.preferredDate || null,
        budget: parsed.data.budget || null,
        notes: parsed.data.notes || null,
        photo_urls: [],
        status: "requested",
      });
      if (error) throw error;
    } catch (err) {
      console.error("[quote] insert failed", err);
      return {
        ok: false,
        message: "Something went wrong. Please call us and we'll sort it out.",
      };
    }
  }

  return {
    ok: true,
    message: "Request received — we'll get you a quote within one business day.",
  };
}
