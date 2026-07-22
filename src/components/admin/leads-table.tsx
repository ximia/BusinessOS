"use client";

import * as React from "react";
import { Download, Upload, Search, Phone, Mail, Tag, Plus } from "lucide-react";
import type { Lead, LeadStatus } from "@/types/database";
import { toCsv, downloadCsv } from "@/lib/csv";
import { formatCurrency, timeAgo, formatDate, initials } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LeadStatusBadge } from "@/components/admin/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

const STATUSES: (LeadStatus | "all")[] = [
  "all",
  "new",
  "contacted",
  "qualified",
  "quoted",
  "won",
  "lost",
];

export function LeadsTable({
  initialLeads,
  employees,
}: {
  initialLeads: Lead[];
  employees: string[];
}) {
  const { toast } = useToast();
  const [leads, setLeads] = React.useState(initialLeads);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<LeadStatus | "all">("all");
  const [selected, setSelected] = React.useState<Lead | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const filtered = React.useMemo(() => {
    return leads.filter((l) => {
      if (status !== "all" && l.status !== status) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [leads, search, status]);

  const updateLead = (id: string, patch: Partial<Lead>) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    setSelected((prev) => (prev && prev.id === id ? { ...prev, ...patch } : prev));
  };

  const handleExport = () => {
    const csv = toCsv(filtered, [
      "name",
      "email",
      "phone",
      "status",
      "source",
      "assigned_to",
      "tags",
      "value",
      "created_at",
    ]);
    downloadCsv(`leads-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    toast({ title: "Exported", description: `${filtered.length} leads downloaded.` });
  };

  const handleImportClick = () => fileRef.current?.click();

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 sm:p-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, email, tag…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as LeadStatus | "all")}>
            <SelectTrigger className="sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s === "all" ? "All statuses" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={() =>
              toast({
                title: "Import ready to wire up",
                description:
                  "CSV parsing is included (lib/csv.ts). Connect it to your insert action to go live.",
              })
            }
          />
          <Button variant="outline" size="sm" onClick={handleImportClick}>
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "lead" : "leads"}
      </p>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden lg:table-cell">Source</TableHead>
              <TableHead className="hidden md:table-cell">Assigned</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Value</TableHead>
              <TableHead className="text-right">Received</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((lead) => (
              <TableRow
                key={lead.id}
                className="cursor-pointer"
                onClick={() => setSelected(lead)}
              >
                <TableCell>
                  <div className="font-medium">{lead.name}</div>
                  <div className="text-xs text-muted-foreground">{lead.email}</div>
                </TableCell>
                <TableCell className="hidden capitalize text-muted-foreground lg:table-cell">
                  {lead.source}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {lead.assigned_to ? (
                    <span className="text-sm">{lead.assigned_to}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  <LeadStatusBadge status={lead.status} />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {formatCurrency(lead.value)}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {timeAgo(lead.created_at)}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  No leads match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <LeadDrawer
        lead={selected}
        employees={employees}
        onClose={() => setSelected(null)}
        onUpdate={updateLead}
      />
    </div>
  );
}

function LeadDrawer({
  lead,
  employees,
  onClose,
  onUpdate,
}: {
  lead: Lead | null;
  employees: string[];
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<Lead>) => void;
}) {
  const { toast } = useToast();
  const [note, setNote] = React.useState("");
  const [notes, setNotes] = React.useState<{ body: string; at: string }[]>([]);

  React.useEffect(() => {
    // Reset demo notes when switching leads.
    setNotes([]);
    setNote("");
  }, [lead?.id]);

  if (!lead) return null;

  return (
    <Sheet open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="px-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11">
              <AvatarFallback>{initials(lead.name)}</AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle>{lead.name}</SheetTitle>
              <p className="text-sm text-muted-foreground capitalize">
                via {lead.source} · {formatDate(lead.created_at)}
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 p-6">
          {/* Contact */}
          <div className="grid grid-cols-1 gap-2">
            <a
              href={`mailto:${lead.email}`}
              className="flex items-center gap-2.5 rounded-lg border border-border px-3.5 py-2.5 text-sm hover:bg-accent"
            >
              <Mail className="h-4 w-4 text-muted-foreground" />
              {lead.email}
            </a>
            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                className="flex items-center gap-2.5 rounded-lg border border-border px-3.5 py-2.5 text-sm hover:bg-accent"
              >
                <Phone className="h-4 w-4 text-muted-foreground" />
                {lead.phone}
              </a>
            )}
          </div>

          {/* Status & assignment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select
                value={lead.status}
                onValueChange={(v) => {
                  onUpdate(lead.id, { status: v as LeadStatus });
                  toast({ title: "Status updated", description: `Marked as ${v}.` });
                }}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.filter((s) => s !== "all").map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Assigned</label>
              <Select
                value={lead.assigned_to ?? "unassigned"}
                onValueChange={(v) =>
                  onUpdate(lead.id, {
                    assigned_to: v === "unassigned" ? null : v,
                  })
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {employees.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Message */}
          {lead.message && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Original message
              </label>
              <p className="mt-1.5 rounded-lg border border-border bg-muted/30 p-3 text-sm leading-relaxed">
                {lead.message}
              </p>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Tag className="h-3.5 w-3.5" /> Tags
            </label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {lead.tags.length ? (
                lead.tags.map((t) => (
                  <Badge key={t} variant="muted">
                    {t}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No tags</span>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Notes</label>
            <div className="mt-1.5 space-y-2">
              {notes.map((n, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-3 text-sm">
                  <p>{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{n.at}</p>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note…"
                className="min-h-[64px]"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              disabled={!note.trim()}
              onClick={() => {
                setNotes((prev) => [
                  { body: note.trim(), at: "Just now" },
                  ...prev,
                ]);
                setNote("");
              }}
            >
              <Plus className="h-4 w-4" />
              Add note
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
