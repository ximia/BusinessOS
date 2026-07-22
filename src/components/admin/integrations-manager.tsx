"use client";

import * as React from "react";
import {
  LineChart,
  Tags,
  MapPin,
  CreditCard,
  MessageSquare,
  Calendar,
  Zap,
  Plug,
  ExternalLink,
  Check,
  Settings2,
  type LucideIcon,
} from "lucide-react";
import {
  INTEGRATION_CATALOG,
  CATEGORY_LABELS,
  SECRET_MASK,
  type IntegrationProvider,
  type IntegrationCategory,
} from "@/features/integrations/catalog";
import {
  saveIntegration,
  setIntegrationEnabled,
  disconnectIntegration,
} from "@/features/integrations/integrations.actions";
import type { Integration } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const ICONS: Record<string, LucideIcon> = {
  "line-chart": LineChart,
  tags: Tags,
  "map-pin": MapPin,
  "credit-card": CreditCard,
  "message-square": MessageSquare,
  calendar: Calendar,
  zap: Zap,
};

type IntegrationMap = Record<string, Integration>;

const CATEGORY_ORDER: IntegrationCategory[] = [
  "analytics",
  "payments",
  "communication",
  "scheduling",
  "automation",
];

export function IntegrationsManager({ initial }: { initial: Integration[] }) {
  const { toast } = useToast();
  const [state, setState] = React.useState<IntegrationMap>(() =>
    Object.fromEntries(initial.map((i) => [i.provider, i]))
  );
  const [editing, setEditing] = React.useState<IntegrationProvider | null>(null);

  const connectedCount = Object.values(state).filter(
    (i) => Object.keys(i.config).length > 0
  ).length;

  const upsertLocal = (provider: string, patch: Partial<Integration>) =>
    setState((prev) => ({
      ...prev,
      [provider]: {
        provider,
        enabled: prev[provider]?.enabled ?? false,
        config: prev[provider]?.config ?? {},
        updated_at: new Date().toISOString(),
        ...patch,
      },
    }));

  const handleToggle = async (provider: string, enabled: boolean) => {
    const before = state[provider];
    upsertLocal(provider, { enabled });
    const res = await setIntegrationEnabled(provider, enabled);
    if (!res.ok) {
      if (before) upsertLocal(provider, before);
      toast({ variant: "destructive", title: "Couldn't update", description: res.message });
    }
  };

  const handleDisconnect = async (provider: string) => {
    const before = state[provider];
    setState((prev) => {
      const next = { ...prev };
      delete next[provider];
      return next;
    });
    setEditing(null);
    const res = await disconnectIntegration(provider);
    if (res.ok) {
      toast({ title: "Disconnected", description: res.message });
    } else {
      if (before) setState((prev) => ({ ...prev, [provider]: before }));
      toast({ variant: "destructive", title: "Couldn't disconnect", description: res.message });
    }
  };

  const handleSave = async (
    provider: IntegrationProvider,
    values: { enabled: boolean; config: Record<string, string> }
  ) => {
    const res = await saveIntegration(provider.id, values);
    if (res.ok) {
      // Reflect the saved config locally, re-masking secrets we just sent.
      const masked: Record<string, string> = {};
      for (const field of provider.fields) {
        const v = (values.config[field.key] ?? "").trim();
        if (field.secret) {
          const existing = state[provider.id]?.config[field.key];
          if (v && v !== SECRET_MASK) masked[field.key] = SECRET_MASK;
          else if (existing) masked[field.key] = existing;
        } else if (v) {
          masked[field.key] = v;
        }
      }
      upsertLocal(provider.id, { enabled: values.enabled, config: masked });
      setEditing(null);
      toast({ variant: "success", title: "Saved", description: res.message });
    } else {
      toast({ variant: "destructive", title: "Couldn't save", description: res.message });
    }
    return res.ok;
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Integrations
        </h1>
        <p className="text-sm text-muted-foreground">
          Connect the tools you already use. {connectedCount} connected. Secret
          keys are stored securely and never shown again after saving.
        </p>
      </div>

      {CATEGORY_ORDER.map((category) => {
        const providers = INTEGRATION_CATALOG.filter((p) => p.category === category);
        if (!providers.length) return null;
        return (
          <section key={category}>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
              {CATEGORY_LABELS[category]}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {providers.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  integration={state[provider.id]}
                  onConfigure={() => setEditing(provider)}
                  onToggle={(enabled) => handleToggle(provider.id, enabled)}
                />
              ))}
            </div>
          </section>
        );
      })}

      {editing && (
        <ConfigureDialog
          provider={editing}
          integration={state[editing.id]}
          onClose={() => setEditing(null)}
          onSave={(values) => handleSave(editing, values)}
          onDisconnect={() => handleDisconnect(editing.id)}
        />
      )}
    </div>
  );
}

function ProviderCard({
  provider,
  integration,
  onConfigure,
  onToggle,
}: {
  provider: IntegrationProvider;
  integration?: Integration;
  onConfigure: () => void;
  onToggle: (enabled: boolean) => void;
}) {
  const Icon = ICONS[provider.icon] ?? Plug;
  const connected = integration && Object.keys(integration.config).length > 0;
  const enabled = integration?.enabled ?? false;

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        {connected ? (
          enabled ? (
            <Badge variant="success" className="gap-1">
              <Check className="h-3 w-3" /> Connected
            </Badge>
          ) : (
            <Badge variant="muted">Disabled</Badge>
          )
        ) : (
          <Badge variant="outline">Not connected</Badge>
        )}
      </div>
      <h3 className="mt-4 font-semibold">{provider.name}</h3>
      <p className="mt-1 flex-1 text-sm text-muted-foreground">
        {provider.description}
      </p>
      <div className="mt-5 flex items-center gap-2">
        <Button variant={connected ? "outline" : "default"} size="sm" onClick={onConfigure}>
          <Settings2 className="h-4 w-4" />
          {connected ? "Manage" : "Connect"}
        </Button>
        {connected && (
          <Switch
            checked={enabled}
            onChange={onToggle}
            label={`Enable ${provider.name}`}
          />
        )}
      </div>
    </div>
  );
}

function ConfigureDialog({
  provider,
  integration,
  onClose,
  onSave,
  onDisconnect,
}: {
  provider: IntegrationProvider;
  integration?: Integration;
  onClose: () => void;
  onSave: (values: { enabled: boolean; config: Record<string, string> }) => Promise<boolean>;
  onDisconnect: () => void;
}) {
  const connected = integration && Object.keys(integration.config).length > 0;
  const [values, setValues] = React.useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const f of provider.fields) {
      const stored = integration?.config[f.key];
      // Never prefill secret inputs; show them as empty with a "saved" hint.
      initial[f.key] = f.secret ? "" : stored ?? "";
    }
    return initial;
  });
  const [enabled, setEnabled] = React.useState(integration?.enabled ?? true);
  const [saving, setSaving] = React.useState(false);

  const secretSaved = (key: string) => integration?.config[key] === SECRET_MASK;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{provider.name}</DialogTitle>
          <DialogDescription>{provider.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {provider.fields.map((field) => (
            <div key={field.key}>
              <Label htmlFor={`f-${field.key}`}>
                {field.label}
                {field.required && <span className="text-destructive"> *</span>}
                {field.secret && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {secretSaved(field.key) ? "saved — leave blank to keep" : "encrypted at rest"}
                  </span>
                )}
              </Label>
              <Input
                id={`f-${field.key}`}
                type={field.type === "password" ? "password" : field.type === "url" ? "url" : "text"}
                value={values[field.key] ?? ""}
                placeholder={
                  field.secret && secretSaved(field.key) ? "••••••••" : field.placeholder
                }
                autoComplete="off"
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
                className="mt-1.5"
              />
              {field.help && (
                <p className="mt-1 text-xs text-muted-foreground">{field.help}</p>
              )}
            </div>
          ))}

          <label className="flex items-center gap-2.5 rounded-lg border border-border p-3 text-sm">
            <Switch checked={enabled} onChange={setEnabled} label="Enabled" />
            <span>Enabled</span>
          </label>

          <a
            href={provider.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {provider.name} setup docs
          </a>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {connected ? (
            <Button variant="ghost" size="sm" onClick={onDisconnect} className="text-destructive hover:text-destructive">
              Disconnect
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                await onSave({ enabled, config: values });
                setSaving(false);
              }}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Minimal accessible switch (dependency-free). */
function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        checked ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-background shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
