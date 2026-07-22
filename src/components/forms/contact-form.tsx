"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { contactSchema, type ContactInput } from "@/lib/validations";
import { submitContact } from "@/server/actions/contact";
import { Field } from "@/components/shared/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function ContactForm() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = React.useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(values: ContactInput) {
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.append(k, v ?? ""));
    const res = await submitContact({ ok: false, message: "" }, fd);
    if (res.ok) {
      setSubmitted(true);
      reset();
      toast({ variant: "success", title: "Message sent", description: res.message });
    } else {
      toast({ variant: "destructive", title: "Couldn't send", description: res.message });
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-success/30 bg-success/5 p-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-success" />
        <h3 className="mt-4 font-display text-xl font-semibold">Thank you</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          We&apos;ve received your message and will get back to you within one
          business day.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="name" required error={errors.name?.message}>
          <Input id="name" placeholder="Jane Doe" {...register("name")} />
        </Field>
        <Field label="Email" htmlFor="email" required error={errors.email?.message}>
          <Input id="email" type="email" placeholder="jane@email.com" {...register("email")} />
        </Field>
      </div>
      <Field label="Phone" htmlFor="phone" hint="Optional" error={errors.phone?.message}>
        <Input id="phone" type="tel" placeholder="(555) 000-0000" {...register("phone")} />
      </Field>
      <Field label="How can we help?" htmlFor="message" required error={errors.message?.message}>
        <Textarea
          id="message"
          placeholder="Tell us about your vehicle and what you're looking for…"
          {...register("message")}
        />
      </Field>

      {/* Honeypot: hidden from users, catches bots. */}
      <div className="hidden" aria-hidden>
        <label htmlFor="company">Company</label>
        <input id="company" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSubmitting ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
