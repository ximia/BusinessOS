"use server";

import { contactSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { publishEvent } from "@/lib/agency/events";

export type ActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

/**
 * Handles a public contact-form submission. Persists to Supabase `leads` when
 * configured; always returns a friendly result. In production you'd also fire
 * an email/Slack notification here (see LEAD_NOTIFICATION_EMAIL).
 */
export async function submitContact(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    message: formData.get("message"),
    company: formData.get("company") ?? "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  // Honeypot tripped — pretend success, drop silently.
  if (parsed.data.company) {
    return { ok: true, message: "Thanks — we'll be in touch shortly." };
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("leads").insert({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        message: parsed.data.message,
        status: "new",
        source: "website",
        tags: [],
      });
      if (error) throw error;
      await notifyOwner(parsed.data.name, parsed.data.email);
    } catch (err) {
      console.error("[contact] insert failed", err);
      return {
        ok: false,
        message: "Something went wrong on our end. Please call us instead.",
      };
    }
  }

  // Announce the lead to Agency OS (optional, non-blocking, no PII). No-op when
  // the connector is disabled; never throws or delays this response.
  publishEvent("lead.created", { source: "website" });

  return {
    ok: true,
    message: "Thanks — we've got your message and will reply within a day.",
  };
}

async function notifyOwner(name: string, email: string) {
  // Wire up your email provider (Resend, Postmark, etc.) here.
  const to = process.env.LEAD_NOTIFICATION_EMAIL;
  if (!to) return;
  console.info(`[contact] new lead from ${name} <${email}> → notify ${to}`);
}
