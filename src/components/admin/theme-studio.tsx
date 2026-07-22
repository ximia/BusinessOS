"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Sparkles, Wand2 } from "lucide-react";
import type { IndustryPreset } from "@/features/theme/industries";
import { applyTheme } from "@/features/theme/theme.actions";
import { getIcon } from "@/lib/icons";
import { hexToHsl, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export function ThemeStudio({
  presets,
  currentPreset,
  demo,
}: {
  presets: IndustryPreset[];
  currentPreset: string;
  demo: boolean;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [selected, setSelected] = React.useState(
    presets.find((p) => p.id === currentPreset) ?? presets[0]!
  );
  const [applyContent, setApplyContent] = React.useState(false);
  const [customHex, setCustomHex] = React.useState("#1657cf");
  const [pending, startTransition] = React.useTransition();

  const previewColor = `hsl(${selected.primary})`;
  const BrandIcon = getIcon(selected.icon);

  const onApplyPreset = () =>
    startTransition(async () => {
      const res = await applyTheme({ presetId: selected.id, applyContent });
      toast({
        variant: res.ok ? "success" : "destructive",
        title: res.ok ? "Theme applied" : "Couldn't apply",
        description: res.message,
      });
      if (res.ok) router.refresh();
    });

  const onApplyCustom = () =>
    startTransition(async () => {
      const hsl = hexToHsl(customHex);
      const res = await applyTheme({ custom: { primary: hsl, primaryDark: hsl } });
      toast({
        variant: res.ok ? "success" : "destructive",
        title: res.ok ? "Color applied" : "Couldn't apply",
        description: res.message,
      });
      if (res.ok) router.refresh();
    });

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">
          Theme studio
        </h1>
        <p className="text-sm text-muted-foreground">
          Switch industries to re-skin the entire site — colors, icons, and
          starter copy — in one click.
        </p>
      </div>

      {demo && (
        <Alert variant="info">
          <AlertDescription>
            Demo mode — previews apply instantly; connect Supabase to publish
            theme changes across visits.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Industry grid */}
        <div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {presets.map((preset) => {
              const active = preset.id === selected.id;
              const Icon = getIcon(preset.icon);
              return (
                <button
                  key={preset.id}
                  onClick={() => setSelected(preset)}
                  className={cn(
                    "group relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all",
                    active
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: `hsl(${preset.primary})` }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-medium leading-tight">
                    {preset.label}
                  </span>
                  {active && (
                    <Check className="absolute right-3 top-3 h-4 w-4 text-primary" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom color */}
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-border p-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="color"
                value={customHex}
                onChange={(e) => setCustomHex(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent"
                aria-label="Custom brand color"
              />
              Custom brand color
            </label>
            <span className="text-xs text-muted-foreground">{hexToHsl(customHex)}</span>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={onApplyCustom}
              disabled={pending}
            >
              <Wand2 className="h-4 w-4" />
              Apply color
            </Button>
          </div>
        </div>

        {/* Live preview */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <div
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            style={{ ["--preview" as string]: previewColor }}
          >
            <div
              className="flex h-24 items-center gap-3 px-5"
              style={{ background: `linear-gradient(135deg, ${previewColor}, ${previewColor}22)` }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/90 text-foreground">
                <BrandIcon className="h-5 w-5" style={{ color: previewColor }} />
              </span>
              <span className="font-display text-sm font-semibold text-white">
                {selected.label}
              </span>
            </div>
            <div className="space-y-4 p-5">
              <p className="text-sm font-medium leading-snug">
                {selected.sampleTagline}
              </p>
              <button
                className="inline-flex h-9 items-center rounded-md px-4 text-sm font-medium text-white"
                style={{ backgroundColor: previewColor }}
              >
                Get a quote
              </button>
              <div className="grid gap-2">
                {selected.sampleServices.map((s) => {
                  const SIcon = getIcon(s.icon);
                  return (
                    <div
                      key={s.title}
                      className="flex items-center gap-2.5 rounded-lg border border-border p-2.5"
                    >
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-md"
                        style={{ backgroundColor: `${previewColor}1a`, color: previewColor }}
                      >
                        <SIcon className="h-4 w-4" />
                      </span>
                      <span className="text-xs font-medium">{s.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <label className="mt-4 flex items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={applyContent}
              onChange={(e) => setApplyContent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
            />
            <span>
              Also load starter copy
              <span className="block text-xs text-muted-foreground">
                Replaces tagline, description & trust badges with this
                industry&apos;s samples.
              </span>
            </span>
          </label>

          <Button className="mt-4 w-full" onClick={onApplyPreset} disabled={pending}>
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Apply {selected.label} theme
          </Button>
        </div>
      </div>
    </div>
  );
}
