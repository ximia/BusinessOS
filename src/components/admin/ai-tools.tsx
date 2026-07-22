"use client";

import * as React from "react";
import {
  Sparkles,
  HelpCircle,
  Newspaper,
  Search,
  MapPin,
  Image as ImageIcon,
  MessageSquare,
  Wand2,
  Copy,
  Check,
  type LucideIcon,
} from "lucide-react";
import { GENERATORS, type Generator } from "@/features/ai/generators";
import { generateContent } from "@/features/ai/ai.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  "help-circle": HelpCircle,
  newspaper: Newspaper,
  search: Search,
  "map-pin": MapPin,
  image: ImageIcon,
  "message-square": MessageSquare,
};

const CATEGORY_LABELS: Record<Generator["category"], string> = {
  marketing: "Marketing",
  seo: "SEO",
  support: "Support",
};

export function AiTools({
  configured,
  providerLabel,
}: {
  configured: boolean;
  providerLabel: string;
}) {
  const { toast } = useToast();
  const [activeId, setActiveId] = React.useState(GENERATORS[0]!.id);
  const [inputs, setInputs] = React.useState<Record<string, string>>({});
  const [output, setOutput] = React.useState("");
  const [isDemo, setIsDemo] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const active = GENERATORS.find((g) => g.id === activeId)!;

  const selectGenerator = (id: string) => {
    setActiveId(id);
    setInputs({});
    setOutput("");
    setIsDemo(false);
  };

  const setField = (key: string, value: string) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const generate = async () => {
    setLoading(true);
    setOutput("");
    const res = await generateContent(active.id, inputs);
    setLoading(false);
    if (res.ok) {
      setOutput(res.output ?? "");
      setIsDemo(Boolean(res.demo));
      if (res.demo) {
        toast({ title: "Demo output", description: res.message });
      }
    } else {
      toast({ variant: "destructive", title: "Couldn't generate", description: res.message });
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const byCategory = (Object.keys(CATEGORY_LABELS) as Generator["category"][]).map(
    (cat) => ({ cat, items: GENERATORS.filter((g) => g.category === cat) })
  );

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            AI tools
          </h1>
          <p className="text-sm text-muted-foreground">
            Generate on-brand copy in seconds, then review and edit before you use it.
          </p>
        </div>
        <Badge variant={configured ? "success" : "muted"} className="gap-1.5">
          <Wand2 className="h-3.5 w-3.5" />
          {configured ? providerLabel : "Demo mode"}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Generator list */}
        <nav className="space-y-4">
          {byCategory.map(({ cat, items }) => (
            <div key={cat}>
              <p className="mb-1.5 px-1 text-xs font-semibold text-muted-foreground">
                {CATEGORY_LABELS[cat]}
              </p>
              <div className="space-y-1">
                {items.map((g) => {
                  const Icon = ICONS[g.icon] ?? Sparkles;
                  const active = g.id === activeId;
                  return (
                    <button
                      key={g.id}
                      onClick={() => selectGenerator(g.id)}
                      className={`flex w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        active ? "bg-primary/10 text-primary" : "hover:bg-accent"
                      }`}
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>
                        <span className="block font-medium">{g.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {g.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Form + output */}
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-semibold">{active.name}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{active.description}</p>

            <div className="mt-4 space-y-4">
              {active.fields.map((field) => (
                <div key={field.key}>
                  <Label htmlFor={`ai-${field.key}`}>
                    {field.label}
                    {field.required && <span className="text-destructive"> *</span>}
                  </Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      id={`ai-${field.key}`}
                      value={inputs[field.key] ?? ""}
                      placeholder={field.placeholder}
                      onChange={(e) => setField(field.key, e.target.value)}
                      className="mt-1.5 min-h-[88px]"
                    />
                  ) : field.type === "select" ? (
                    <Select
                      value={inputs[field.key] ?? field.options?.[0] ?? ""}
                      onValueChange={(val) => setField(field.key, val)}
                    >
                      <SelectTrigger id={`ai-${field.key}`} className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(field.options ?? []).map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={`ai-${field.key}`}
                      value={inputs[field.key] ?? ""}
                      placeholder={field.placeholder}
                      onChange={(e) => setField(field.key, e.target.value)}
                      className="mt-1.5"
                    />
                  )}
                  {field.help && (
                    <p className="mt-1 text-xs text-muted-foreground">{field.help}</p>
                  )}
                </div>
              ))}
            </div>

            <Button onClick={generate} disabled={loading} className="mt-5">
              <Wand2 className="h-4 w-4" />
              {loading ? "Generating…" : "Generate"}
            </Button>
          </div>

          {/* Output */}
          {(output || loading) && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">Result</h3>
                  {isDemo && (
                    <Badge variant="muted" className="text-[10px]">
                      Demo
                    </Badge>
                  )}
                </div>
                {output && (
                  <Button variant="outline" size="sm" onClick={copy}>
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> Copy
                      </>
                    )}
                  </Button>
                )}
              </div>
              {loading ? (
                <p className="text-sm text-muted-foreground">Thinking…</p>
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
                  {output}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
