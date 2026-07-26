"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Save,
  CheckCircle2,
  XCircle,
  RadioTower,
} from "lucide-react";

import {
  connectorConnectionSchema,
  type ConnectorConnectionInput,
} from "@/features/agency-connection/connection.schema";
import { updateConnectorConnection } from "@/features/agency-connection/connection.actions";
import type { ConnectionView } from "@/features/agency-connection/connection.service";
import { Field } from "@/components/shared/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/** Human labels for the connector's diagnostic state. */
const STATE_LABEL: Record<string, string> = {
  connector_disabled: "Paused",
  pending_registration: "Connecting…",
  registered: "Registered",
  healthy: "Connected",
  degraded: "Degraded",
  disconnected: "Disconnected",
  authentication_failed: "Auth failed",
  agency_unreachable: "Agency unreachable",
};

function ConfiguredRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {ok ? (
        <CheckCircle2 className="size-4 text-emerald-600" />
      ) : (
        <XCircle className="size-4 text-muted-foreground" />
      )}
      <span className={cn(!ok && "text-muted-foreground")}>{label}</span>
    </li>
  );
}

export function ConnectionEditor({
  initial,
  demo,
}: {
  initial: ConnectionView;
  demo: boolean;
}) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ConnectorConnectionInput>({
    resolver: zodResolver(connectorConnectionSchema),
    defaultValues: initial.form,
  });

  async function onSubmit(values: ConnectorConnectionInput) {
    const res = await updateConnectorConnection(values);
    toast({
      variant: res.ok ? "success" : "destructive",
      title: res.ok ? "Saved" : "Couldn't save",
      description: res.message,
    });
  }

  const autoId = initial.autoDerivedDeploymentId;
  const templateReady =
    initial.template.baseUrl &&
    initial.template.outboundKey &&
    initial.template.inboundKey;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <RadioTower className="size-5 text-primary" />
          <h1 className="text-xl font-semibold">Agency Connection</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Let your Agency OS console monitor this deployment. Change these here —
          no code edits, no redeploy. The secret keys are set once in the template
          and are shared across every site, so they never appear on this screen.
        </p>
      </header>

      {demo && (
        <Alert>
          <AlertDescription>
            Demo mode — changes won&apos;t persist until Supabase is configured.
          </AlertDescription>
        </Alert>
      )}

      {/* Live status */}
      {initial.status && (
        <div className="rounded-lg border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "size-2.5 rounded-full",
                  initial.status.state === "healthy" ||
                    initial.status.state === "registered"
                    ? "bg-emerald-500"
                    : initial.status.state === "connector_disabled"
                      ? "bg-muted-foreground"
                      : "bg-amber-500"
                )}
              />
              <span className="text-sm font-medium">
                {STATE_LABEL[initial.status.state] ?? initial.status.state}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Registration: {initial.status.registrationPhase}
              {initial.status.lastContactAt && (
                <>
                  {" · "}last contact{" "}
                  {new Date(initial.status.lastContactAt).toLocaleString()}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Template readiness (presence only, never values) */}
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-2 text-sm font-semibold">Template setup (shared)</h2>
        <ul className="space-y-1.5">
          <ConfiguredRow ok={initial.template.baseUrl} label="Agency OS URL configured" />
          <ConfiguredRow
            ok={initial.template.outboundKey}
            label="Reporting key configured (site → console)"
          />
          <ConfiguredRow
            ok={initial.template.inboundKey}
            label="Read key configured (console → site)"
          />
        </ul>
        {!templateReady && (
          <p className="mt-2 text-xs text-muted-foreground">
            Some shared settings aren&apos;t in this template&apos;s environment
            yet. Until they are, this deployment can&apos;t reach Agency OS even
            when switched on.
          </p>
        )}
      </div>

      {/* Editable settings */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-lg border bg-card p-4"
      >
        <Controller
          control={control}
          name="enabled"
          render={({ field }) => (
            <div className="flex items-center justify-between gap-4 rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Report to Agency OS</p>
                <p className="text-xs text-muted-foreground">
                  {field.value
                    ? "On — this site reports its status to your console."
                    : "Off — this site runs normally but stays hidden from the console."}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={field.value}
                onClick={() => field.onChange(!field.value)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors",
                  field.value ? "bg-primary" : "bg-muted-foreground/30",
                )}
              >
                <span className="sr-only">Report to Agency OS</span>
                <span
                  className={cn(
                    "inline-block size-5 transform rounded-full bg-white shadow transition-transform",
                    field.value ? "translate-x-5" : "translate-x-0.5",
                  )}
                />
              </button>
            </div>
          )}
        />

        <Field
          label="Deployment ID"
          htmlFor="deploymentId"
          error={errors.deploymentId?.message}
          hint="leave blank to use the automatic ID"
        >
          <Input
            id="deploymentId"
            placeholder={autoId ?? "auto"}
            {...register("deploymentId")}
          />
          {autoId && (
            <p className="text-xs text-muted-foreground">
              Automatic ID for this deployment:{" "}
              <code className="rounded bg-muted px-1 py-0.5">{autoId}</code>
            </p>
          )}
        </Field>

        <Field
          label="Business / organization ID"
          htmlFor="organizationId"
          error={errors.organizationId?.message}
          hint="optional"
        >
          <Input id="organizationId" {...register("organizationId")} />
        </Field>

        <Field
          label="Organization slug"
          htmlFor="organizationSlug"
          error={errors.organizationSlug?.message}
          hint="optional, human-friendly"
        >
          <Input
            id="organizationSlug"
            placeholder="acme-detailing"
            {...register("organizationSlug")}
          />
        </Field>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save connection
          </Button>
        </div>
      </form>
    </div>
  );
}
