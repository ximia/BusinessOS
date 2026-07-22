"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { quoteSchema, type QuoteInput } from "@/lib/validations";
import { submitQuote } from "@/server/actions/quote";
import { services } from "@/config";
import { Field } from "@/components/shared/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function QuoteForm() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = React.useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuoteInput>({ resolver: zodResolver(quoteSchema) });

  async function onSubmit(values: QuoteInput) {
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.append(k, v ?? ""));
    const res = await submitQuote({ ok: false, message: "" }, fd);
    if (res.ok) {
      setSubmitted(true);
      reset();
      toast({ variant: "success", title: "Quote requested", description: res.message });
    } else {
      toast({ variant: "destructive", title: "Couldn't submit", description: res.message });
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-success/30 bg-success/5 p-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-success" />
        <h3 className="mt-4 font-display text-xl font-semibold">Request received</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          We&apos;ll review the details and send your quote within one business day.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
          Request another quote
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="customerName" required error={errors.customerName?.message}>
          <Input id="customerName" placeholder="Jane Doe" {...register("customerName")} />
        </Field>
        <Field label="Phone" htmlFor="phone" required error={errors.phone?.message}>
          <Input id="phone" type="tel" placeholder="(555) 000-0000" {...register("phone")} />
        </Field>
      </div>
      <Field label="Email" htmlFor="email" required error={errors.email?.message}>
        <Input id="email" type="email" placeholder="jane@email.com" {...register("email")} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Service" htmlFor="service" required error={errors.service?.message}>
          <select
            id="service"
            className="flex h-11 w-full rounded-md border border-input bg-background px-3.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            defaultValue=""
            {...register("service")}
          >
            <option value="" disabled>
              Choose a service…
            </option>
            {services.map((s) => (
              <option key={s.slug} value={s.title}>
                {s.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Preferred date" htmlFor="preferredDate" hint="Optional">
          <Input id="preferredDate" type="date" {...register("preferredDate")} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Address" htmlFor="address" hint="Optional">
          <Input id="address" placeholder="Where's the vehicle?" {...register("address")} />
        </Field>
        <Field label="Budget" htmlFor="budget" hint="Optional">
          <Input id="budget" placeholder="e.g. $300–$500" {...register("budget")} />
        </Field>
      </div>

      <Field label="Notes" htmlFor="notes" hint="Optional" error={errors.notes?.message}>
        <Textarea
          id="notes"
          placeholder="Vehicle make/model, condition, and anything specific you'd like addressed…"
          {...register("notes")}
        />
      </Field>

      <div className="hidden" aria-hidden>
        <label htmlFor="q-company">Company</label>
        <input id="q-company" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSubmitting ? "Submitting…" : "Request my quote"}
      </Button>
    </form>
  );
}
