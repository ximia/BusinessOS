"use client";

import * as React from "react";
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  Plus,
  RotateCcw,
  Eye,
  EyeOff,
  ExternalLink,
  Layout,
  Sparkles,
  Grid3x3,
  User,
  ListChecks,
  Images,
  MessageSquareQuote,
  MapPin,
  HelpCircle,
  Mail,
  Megaphone,
} from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  SECTION_CATALOG,
  HOME_SECTION_TYPES,
  DEFAULT_HOME_LAYOUT,
  newInstanceId,
  type HomeSectionInstance,
  type HomeSectionType,
} from "@/features/website/sections.catalog";
import { updateHomeLayout } from "@/features/website/website.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const ICONS: Record<HomeSectionType, LucideIcon> = {
  hero: Sparkles,
  logoStrip: Grid3x3,
  services: Layout,
  about: User,
  process: ListChecks,
  beforeAfter: Images,
  testimonials: MessageSquareQuote,
  serviceArea: MapPin,
  faq: HelpCircle,
  contact: Mail,
  cta: Megaphone,
};

const sameLayout = (a: HomeSectionInstance[], b: HomeSectionInstance[]) =>
  JSON.stringify(a) === JSON.stringify(b);

export function WebsiteBuilder({ initial }: { initial: HomeSectionInstance[] }) {
  const { toast } = useToast();
  const [layout, setLayout] = React.useState<HomeSectionInstance[]>(initial);
  const [saved, setSaved] = React.useState<HomeSectionInstance[]>(initial);
  const [saving, setSaving] = React.useState(false);
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [overIndex, setOverIndex] = React.useState<number | null>(null);

  const dirty = !sameLayout(layout, saved);
  const enabledCount = layout.filter((s) => s.enabled).length;

  const move = (from: number, to: number) => {
    if (to < 0 || to >= layout.length || from === to) return;
    setLayout((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item!);
      return next;
    });
  };

  const toggle = (id: string) =>
    setLayout((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );

  const duplicate = (index: number) =>
    setLayout((prev) => {
      const src = prev[index]!;
      const copy: HomeSectionInstance = {
        id: newInstanceId(src.type),
        type: src.type,
        enabled: src.enabled,
      };
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next;
    });

  const remove = (id: string) =>
    setLayout((prev) =>
      prev.length > 1 ? prev.filter((s) => s.id !== id) : prev
    );

  const addSection = (type: HomeSectionType) =>
    setLayout((prev) => [
      ...prev,
      { id: newInstanceId(type), type, enabled: true },
    ]);

  const reset = () => setLayout(DEFAULT_HOME_LAYOUT);

  const save = async () => {
    setSaving(true);
    const res = await updateHomeLayout(layout);
    setSaving(false);
    if (res.ok) {
      setSaved(layout);
      toast({ variant: "success", title: "Saved", description: res.message });
    } else {
      toast({ variant: "destructive", title: "Couldn't save", description: res.message });
    }
  };

  // Native drag-and-drop reordering.
  const onDrop = (target: number) => {
    if (dragIndex !== null) move(dragIndex, target);
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Website builder
          </h1>
          <p className="text-sm text-muted-foreground">
            Reorder, show/hide, and duplicate the sections on your homepage.
            {" "}
            {enabledCount} of {layout.length} shown.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3.5 text-sm font-medium hover:bg-accent"
          >
            <ExternalLink className="h-4 w-4" />
            Preview
          </Link>
          <Button size="sm" onClick={save} disabled={!dirty || saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4" />
              Add section
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>Add a section</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {HOME_SECTION_TYPES.map((type) => {
              const Icon = ICONS[type];
              return (
                <DropdownMenuItem key={type} onSelect={() => addSection(type)}>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span>{SECTION_CATALOG[type].label}</span>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          disabled={sameLayout(layout, DEFAULT_HOME_LAYOUT)}
        >
          <RotateCcw className="h-4 w-4" />
          Reset to default
        </Button>
      </div>

      {/* Section list */}
      <ul className="space-y-2">
        {layout.map((section, index) => {
          const meta = SECTION_CATALOG[section.type];
          const Icon = ICONS[section.type];
          const isOver = overIndex === index && dragIndex !== index;
          return (
            <li
              key={section.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => {
                e.preventDefault();
                setOverIndex(index);
              }}
              onDrop={() => onDrop(index)}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              className={`flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm transition-colors ${
                isOver ? "border-primary ring-1 ring-primary" : "border-border"
              } ${section.enabled ? "" : "opacity-60"} ${
                dragIndex === index ? "opacity-40" : ""
              }`}
            >
              <span
                className="cursor-grab text-muted-foreground active:cursor-grabbing"
                aria-hidden
              >
                <GripVertical className="h-5 w-5" />
              </span>

              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-[18px] w-[18px]" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{meta.label}</span>
                  {!section.enabled && (
                    <Badge variant="muted" className="text-[10px]">
                      Hidden
                    </Badge>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {meta.description}
                </p>
              </div>

              {/* Reorder (accessible fallback) */}
              <div className="hidden flex-col sm:flex">
                <button
                  aria-label={`Move ${meta.label} up`}
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  aria-label={`Move ${meta.label} down`}
                  disabled={index === layout.length - 1}
                  onClick={() => move(index, index + 1)}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              <button
                aria-label={section.enabled ? "Hide section" : "Show section"}
                onClick={() => toggle(section.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                {section.enabled ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
              <button
                aria-label={`Duplicate ${meta.label}`}
                onClick={() => duplicate(index)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                aria-label={`Remove ${meta.label}`}
                onClick={() => remove(section.id)}
                disabled={layout.length <= 1}
                className="text-muted-foreground hover:text-destructive disabled:opacity-30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          );
        })}
      </ul>

      {dirty && (
        <div className="sticky bottom-4 flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3 shadow-sm">
          <p className="text-sm text-muted-foreground">You have unsaved changes.</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setLayout(saved)}>
              Discard
            </Button>
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
