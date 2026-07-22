"use client";

import * as React from "react";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { signIn, type AuthState } from "@/server/actions/auth";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { siteConfig } from "@/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/field";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const [state, formAction] = useFormState<AuthState, FormData>(signIn, {});
  const demo = !isSupabaseConfigured();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-6">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to site
        </Link>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">
            Sign in
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {siteConfig.companyName} admin dashboard
          </p>

          {demo && (
            <Alert variant="info" className="mt-5">
              <AlertDescription>
                Demo mode — Supabase isn&apos;t configured, so any credentials
                will take you straight in.
              </AlertDescription>
            </Alert>
          )}

          {state.error && (
            <Alert variant="destructive" className="mt-5">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <form action={formAction} className="mt-6 space-y-4">
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                defaultValue={demo ? "elena@halcyondetailing.com" : ""}
                required
              />
            </Field>
            <Field label="Password" htmlFor="password">
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                defaultValue={demo ? "demo-password" : ""}
                required
              />
            </Field>
            <SubmitButton />
          </form>
        </div>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}
