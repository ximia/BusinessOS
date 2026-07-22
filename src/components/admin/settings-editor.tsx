"use client";

import * as React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import {
  businessSettingsSchema,
  type BusinessSettings,
} from "@/features/settings/settings.schema";
import { updateBusinessSettings } from "@/features/settings/settings.actions";
import { Field } from "@/components/shared/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const SOCIAL_PLATFORMS = [
  "facebook",
  "instagram",
  "x",
  "linkedin",
  "youtube",
  "tiktok",
  "google",
] as const;

export function SettingsEditor({
  initial,
  demo,
}: {
  initial: BusinessSettings;
  demo: boolean;
}) {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<BusinessSettings>({
    resolver: zodResolver(businessSettingsSchema),
    defaultValues: initial,
  });

  const hours = useFieldArray({ control, name: "hours" });
  const socials = useFieldArray({ control, name: "socials" });

  const [keywords, setKeywords] = React.useState(
    initial.seo.keywords.join(", ")
  );
  const [badges, setBadges] = React.useState(initial.trustBadges.join("\n"));

  async function onSubmit(values: BusinessSettings) {
    values.seo.keywords = keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    values.trustBadges = badges
      .split("\n")
      .map((b) => b.trim())
      .filter(Boolean);
    // Preserve fields managed elsewhere (Theme studio) so a settings save never
    // drops them.
    values.theme = values.theme ?? initial.theme;
    values.features = values.features ?? initial.features;

    const res = await updateBusinessSettings(values);
    if (res.ok) {
      toast({ variant: "success", title: "Saved", description: res.message });
    } else {
      toast({ variant: "destructive", title: "Couldn't save", description: res.message });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight">
            Business settings
          </h1>
          <p className="text-sm text-muted-foreground">
            One source of truth for everything the public site displays.
          </p>
        </div>
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </div>

      {demo && (
        <Alert variant="info" className="mb-6">
          <AlertDescription>
            Demo mode — changes validate and preview but won&apos;t persist until
            Supabase is connected. The schema and save flow are fully wired.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="business">
        <TabsList className="flex-wrap">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="contact">Contact & Hours</TabsTrigger>
          <TabsTrigger value="branding">Branding & Social</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        {/* BUSINESS */}
        <TabsContent value="business">
          <Card>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Company name" htmlFor="companyName" required error={errors.companyName?.message}>
                <Input id="companyName" {...register("companyName")} />
              </Field>
              <Field label="Legal name" htmlFor="legalName" required error={errors.legalName?.message}>
                <Input id="legalName" {...register("legalName")} />
              </Field>
            </div>
            <Field label="Tagline" htmlFor="tagline" required error={errors.tagline?.message}>
              <Input id="tagline" {...register("tagline")} />
            </Field>
            <Field label="Description" htmlFor="description" required error={errors.description?.message}>
              <Textarea id="description" {...register("description")} className="min-h-[100px]" />
            </Field>
            <Field label="Industry" htmlFor="industry" required error={errors.industry?.message}>
              <Input id="industry" {...register("industry")} />
            </Field>
          </Card>
        </TabsContent>

        {/* CONTACT & HOURS */}
        <TabsContent value="contact">
          <Card>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Phone (display)" htmlFor="phone" required error={errors.phone?.message}>
                <Input id="phone" {...register("phone")} placeholder="(555) 000-0000" />
              </Field>
              <Field label="Phone (tel: link)" htmlFor="phoneRaw" required hint="E.164" error={errors.phoneRaw?.message}>
                <Input id="phoneRaw" {...register("phoneRaw")} placeholder="+15550000000" />
              </Field>
            </div>
            <Field label="Email" htmlFor="email" required error={errors.email?.message}>
              <Input id="email" type="email" {...register("email")} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Street" htmlFor="street" error={errors.address?.street?.message}>
                <Input id="street" {...register("address.street")} />
              </Field>
              <Field label="City" htmlFor="city" error={errors.address?.city?.message}>
                <Input id="city" {...register("address.city")} />
              </Field>
              <Field label="State" htmlFor="state" error={errors.address?.state?.message}>
                <Input id="state" {...register("address.state")} />
              </Field>
              <Field label="ZIP" htmlFor="zip" error={errors.address?.zip?.message}>
                <Input id="zip" {...register("address.zip")} />
              </Field>
            </div>
            <Field label="After-hours note" htmlFor="emergencyNote" hint="Optional">
              <Input id="emergencyNote" {...register("emergencyNote")} />
            </Field>

            <FieldArrayHeader
              title="Business hours"
              onAdd={() => hours.append({ day: "", hours: "" })}
            />
            <div className="space-y-2">
              {hours.fields.map((f, i) => (
                <div key={f.id} className="flex gap-2">
                  <Input
                    aria-label="Day"
                    placeholder="Mon – Fri"
                    {...register(`hours.${i}.day` as const)}
                  />
                  <Input
                    aria-label="Hours"
                    placeholder="8:00 AM – 6:00 PM"
                    {...register(`hours.${i}.hours` as const)}
                  />
                  <RemoveButton onClick={() => hours.remove(i)} />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* BRANDING & SOCIAL */}
        <TabsContent value="branding">
          <Card>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Logo URL" htmlFor="logoSrc" hint="Blank = wordmark">
                <Input id="logoSrc" {...register("logo.src")} placeholder="https://…" />
              </Field>
              <Field label="Logo alt text" htmlFor="logoAlt" error={errors.logo?.alt?.message}>
                <Input id="logoAlt" {...register("logo.alt")} />
              </Field>
            </div>
            <Field label="Trust badges" htmlFor="badges" hint="One per line — keep factual">
              <Textarea
                id="badges"
                value={badges}
                onChange={(e) => setBadges(e.target.value)}
                className="min-h-[90px]"
              />
            </Field>
            <Field label="Map embed URL" htmlFor="mapEmbedUrl" hint="Google Maps → Share → Embed">
              <Input id="mapEmbedUrl" {...register("mapEmbedUrl")} />
            </Field>

            <FieldArrayHeader
              title="Social links"
              onAdd={() => socials.append({ platform: "instagram", href: "" })}
            />
            <div className="space-y-2">
              {socials.fields.map((f, i) => (
                <div key={f.id} className="flex gap-2">
                  <Controller
                    control={control}
                    name={`socials.${i}.platform` as const}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SOCIAL_PLATFORMS.map((p) => (
                            <SelectItem key={p} value={p} className="capitalize">
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Input
                    aria-label="URL"
                    placeholder="https://…"
                    {...register(`socials.${i}.href` as const)}
                  />
                  <RemoveButton onClick={() => socials.remove(i)} />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo">
          <Card>
            <Field label="SEO title" htmlFor="seoTitle" error={errors.seo?.title?.message}>
              <Input id="seoTitle" {...register("seo.title")} />
            </Field>
            <Field label="Meta description" htmlFor="seoDesc" hint="≤ 160 chars" error={errors.seo?.description?.message}>
              <Textarea id="seoDesc" {...register("seo.description")} className="min-h-[80px]" />
            </Field>
            <Field label="Keywords" htmlFor="keywords" hint="Comma-separated">
              <Input
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </Field>
          </Card>
        </TabsContent>

        {/* FEATURES */}
        <TabsContent value="features">
          <Card>
            <Toggle
              label="Floating call button"
              description="Show a tap-to-call button on mobile after scrolling."
              checked={watch("features.floatingCallButton")}
              onChange={(v) => setValue("features.floatingCallButton", v, { shouldDirty: true })}
            />
            <Toggle
              label="Sticky mobile CTA"
              description="Reserved for an upcoming sticky quote bar on mobile."
              checked={watch("features.stickyMobileCta")}
              onChange={(v) => setValue("features.stickyMobileCta", v, { shouldDirty: true })}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
      {children}
    </div>
  );
}

function FieldArrayHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between border-t border-border pt-5">
      <span className="text-sm font-medium">{title}</span>
      <Button type="button" size="sm" variant="outline" onClick={onAdd}>
        <Plus className="h-4 w-4" />
        Add
      </Button>
    </div>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      onClick={onClick}
      aria-label="Remove"
      className="shrink-0 text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-background shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}
