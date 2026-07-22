"use client";

import * as React from "react";
import {
  Download,
  Upload,
  Search,
  Phone,
  Mail,
  Tag,
  Plus,
  X,
  Archive,
  ArchiveRestore,
  Copy,
  Trash2,
  PhoneCall,
  CalendarClock,
  StickyNote,
  CheckCircle2,
  Circle,
  Clock,
  Users,
  UserCheck,
} from "lucide-react";
import type {
  Lead,
  LeadStatus,
  LeadSource,
  LeadNote,
  CallLog,
  FollowUp,
  CallOutcome,
} from "@/types/database";
import { toCsv, downloadCsv } from "@/lib/csv";
import { formatCurrency, timeAgo, formatDate, initials } from "@/lib/utils";
import {
  findDuplicateLeadIds,
  buildLeadTimeline,
  isOverdue,
  formatDuration,
} from "@/lib/leads";
import {
  updateLead,
  bulkUpdateLeads,
  addLeadNote,
  deleteLeadNote,
  logCall,
  scheduleFollowUp,
  setFollowUpCompleted,
  deleteFollowUp,
} from "@/server/actions/leads";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "quoted",
  "won",
  "lost",
];
const STATUS_FILTERS: (LeadStatus | "all")[] = ["all", ...STATUSES];
const SOURCES: LeadSource[] = [
  "website",
  "referral",
  "google",
  "social",
  "phone",
  "walk-in",
  "other",
];
const CALL_OUTCOMES: CallOutcome[] = [
  "connected",
  "voicemail",
  "no-answer",
  "callback",
  "busy",
];

type NotesMap = Record<string, LeadNote[]>;
type CallsMap = Record<string, CallLog[]>;
type FollowUpsMap = Record<string, FollowUp[]>;

export function LeadsTable({
  initialLeads,
  employees,
  notesByLead,
  callsByLead,
  followUpsByLead,
}: {
  initialLeads: Lead[];
  employees: string[];
  notesByLead: NotesMap;
  callsByLead: CallsMap;
  followUpsByLead: FollowUpsMap;
}) {
  const { toast } = useToast();
  const [leads, setLeads] = React.useState(initialLeads);
  const [notes, setNotes] = React.useState<NotesMap>(notesByLead);
  const [calls, setCalls] = React.useState<CallsMap>(callsByLead);
  const [followUps, setFollowUps] = React.useState<FollowUpsMap>(followUpsByLead);

  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<LeadStatus | "all">("all");
  const [source, setSource] = React.useState<LeadSource | "all">("all");
  const [assignee, setAssignee] = React.useState<string>("all");
  const [tag, setTag] = React.useState<string>("all");
  const [view, setView] = React.useState<"active" | "archived">("active");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [openLeadId, setOpenLeadId] = React.useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const duplicateIds = React.useMemo(
    () => findDuplicateLeadIds(leads),
    [leads]
  );
  const allTags = React.useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => l.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [leads]);

  const filtered = React.useMemo(() => {
    return leads.filter((l) => {
      if (view === "active" ? l.archived : !l.archived) return false;
      if (status !== "all" && l.status !== status) return false;
      if (source !== "all" && l.source !== source) return false;
      if (assignee !== "all") {
        if (assignee === "unassigned" ? l.assigned_to : l.assigned_to !== assignee)
          return false;
      }
      if (tag !== "all" && !l.tags.includes(tag)) return false;
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
  }, [leads, view, status, source, assignee, tag, search]);

  // Keep selection within the currently-visible set.
  const filteredIds = React.useMemo(
    () => new Set(filtered.map((l) => l.id)),
    [filtered]
  );
  const visibleSelected = React.useMemo(
    () => [...selectedIds].filter((id) => filteredIds.has(id)),
    [selectedIds, filteredIds]
  );

  const openLead = leads.find((l) => l.id === openLeadId) ?? null;

  // ─── Lead mutations ───────────────────────────────────────────────────────
  const patchLeadLocal = (id: string, patch: Partial<Lead>) =>
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const applyPatch = async (id: string, patch: Partial<Lead>) => {
    const before = leads.find((l) => l.id === id);
    patchLeadLocal(id, patch);
    const res = await updateLead(id, patch);
    if (!res.ok) {
      if (before) patchLeadLocal(id, before);
      toast({ title: "Couldn't save", description: res.message, variant: "destructive" });
    }
  };

  const applyBulk = async (patch: Partial<Lead>, label: string) => {
    const ids = visibleSelected;
    if (!ids.length) return;
    const snapshot = new Map(ids.map((id) => [id, leads.find((l) => l.id === id)!]));
    setLeads((prev) =>
      prev.map((l) => (ids.includes(l.id) ? { ...l, ...patch } : l))
    );
    const res = await bulkUpdateLeads(ids, patch);
    if (res.ok) {
      toast({ title: label, description: `${ids.length} lead(s) updated.` });
      setSelectedIds(new Set());
    } else {
      setLeads((prev) => prev.map((l) => snapshot.get(l.id) ?? l));
      toast({ title: "Bulk update failed", description: res.message, variant: "destructive" });
    }
  };

  // ─── Activity mutations ───────────────────────────────────────────────────
  const handleAddNote = async (leadId: string, body: string) => {
    const res = await addLeadNote(leadId, { body });
    if (res.ok && res.id) {
      const note: LeadNote = {
        id: res.id,
        lead_id: leadId,
        author: "You",
        body,
        created_at: new Date().toISOString(),
      };
      setNotes((prev) => ({ ...prev, [leadId]: [note, ...(prev[leadId] ?? [])] }));
    } else if (!res.ok) {
      toast({ title: "Couldn't add note", description: res.message, variant: "destructive" });
    }
    return res.ok;
  };

  const handleDeleteNote = async (leadId: string, noteId: string) => {
    const prev = notes[leadId] ?? [];
    setNotes((p) => ({ ...p, [leadId]: prev.filter((n) => n.id !== noteId) }));
    const res = await deleteLeadNote(noteId);
    if (!res.ok) {
      setNotes((p) => ({ ...p, [leadId]: prev }));
      toast({ title: "Couldn't remove note", description: res.message, variant: "destructive" });
    }
  };

  const handleLogCall = async (
    leadId: string,
    input: { outcome: CallOutcome; duration_seconds: number | null; notes: string | null }
  ) => {
    const res = await logCall(leadId, input);
    if (res.ok && res.id) {
      const call: CallLog = {
        id: res.id,
        lead_id: leadId,
        outcome: input.outcome,
        duration_seconds: input.duration_seconds,
        notes: input.notes,
        created_at: new Date().toISOString(),
      };
      setCalls((prev) => ({ ...prev, [leadId]: [call, ...(prev[leadId] ?? [])] }));
    } else if (!res.ok) {
      toast({ title: "Couldn't log call", description: res.message, variant: "destructive" });
    }
    return res.ok;
  };

  const handleScheduleFollowUp = async (
    leadId: string,
    input: { due_at: string; note: string }
  ) => {
    const res = await scheduleFollowUp(leadId, input);
    if (res.ok && res.id) {
      const fu: FollowUp = {
        id: res.id,
        lead_id: leadId,
        due_at: new Date(input.due_at).toISOString(),
        note: input.note,
        completed: false,
        created_at: new Date().toISOString(),
      };
      setFollowUps((prev) => ({
        ...prev,
        [leadId]: [...(prev[leadId] ?? []), fu].sort(
          (a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
        ),
      }));
    } else if (!res.ok) {
      toast({ title: "Couldn't schedule", description: res.message, variant: "destructive" });
    }
    return res.ok;
  };

  const handleToggleFollowUp = async (leadId: string, id: string, completed: boolean) => {
    setFollowUps((prev) => ({
      ...prev,
      [leadId]: (prev[leadId] ?? []).map((f) =>
        f.id === id ? { ...f, completed } : f
      ),
    }));
    const res = await setFollowUpCompleted(id, completed);
    if (!res.ok) {
      setFollowUps((prev) => ({
        ...prev,
        [leadId]: (prev[leadId] ?? []).map((f) =>
          f.id === id ? { ...f, completed: !completed } : f
        ),
      }));
      toast({ title: "Couldn't update", description: res.message, variant: "destructive" });
    }
  };

  const handleDeleteFollowUp = async (leadId: string, id: string) => {
    const prev = followUps[leadId] ?? [];
    setFollowUps((p) => ({ ...p, [leadId]: prev.filter((f) => f.id !== id) }));
    const res = await deleteFollowUp(id);
    if (!res.ok) {
      setFollowUps((p) => ({ ...p, [leadId]: prev }));
      toast({ title: "Couldn't remove", description: res.message, variant: "destructive" });
    }
  };

  // ─── CSV ──────────────────────────────────────────────────────────────────
  const exportRows = (rows: Lead[]) => {
    const csv = toCsv(rows, [
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
    toast({ title: "Exported", description: `${rows.length} leads downloaded.` });
  };

  // ─── Selection ────────────────────────────────────────────────────────────
  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const allVisibleSelected =
    filtered.length > 0 && visibleSelected.length === filtered.length;
  const toggleSelectAll = () =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) filtered.forEach((l) => next.delete(l.id));
      else filtered.forEach((l) => next.add(l.id));
      return next;
    });

  const archivedCount = leads.filter((l) => l.archived).length;

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 sm:p-6">
      <RemindersPanel
        leads={leads}
        followUps={followUps}
        onOpenLead={(id) => setOpenLeadId(id)}
        onToggle={handleToggleFollowUp}
      />

      {/* View tabs + import/export */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-lg border border-border bg-card p-0.5 text-sm">
          <button
            onClick={() => setView("active")}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              view === "active" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setView("archived")}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              view === "archived" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Archived{archivedCount ? ` (${archivedCount})` : ""}
          </button>
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
                  "CSV parsing is included (lib/csv.ts). Connect it to an insert action to go live.",
              })
            }
          />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportRows(filtered)}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, email, tag…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <FilterSelect
          value={status}
          onChange={(v) => setStatus(v as LeadStatus | "all")}
          options={STATUS_FILTERS.map((s) => ({
            value: s,
            label: s === "all" ? "All statuses" : s,
          }))}
        />
        <FilterSelect
          value={source}
          onChange={(v) => setSource(v as LeadSource | "all")}
          options={[
            { value: "all", label: "All sources" },
            ...SOURCES.map((s) => ({ value: s, label: s })),
          ]}
        />
        <FilterSelect
          value={assignee}
          onChange={setAssignee}
          options={[
            { value: "all", label: "Anyone" },
            { value: "unassigned", label: "Unassigned" },
            ...employees.map((e) => ({ value: e, label: e })),
          ]}
        />
        {allTags.length > 0 && (
          <FilterSelect
            value={tag}
            onChange={setTag}
            options={[
              { value: "all", label: "All tags" },
              ...allTags.map((t) => ({ value: t, label: t })),
            ]}
          />
        )}
      </div>

      {/* Bulk action bar */}
      {visibleSelected.length > 0 && (
        <BulkActionBar
          count={visibleSelected.length}
          employees={employees}
          view={view}
          onClear={() => setSelectedIds(new Set())}
          onStatus={(s) => applyBulk({ status: s }, "Status updated")}
          onAssign={(a) =>
            applyBulk({ assigned_to: a === "unassigned" ? null : a }, "Reassigned")
          }
          onArchive={(archived) =>
            applyBulk({ archived }, archived ? "Archived" : "Restored")
          }
          onExport={() =>
            exportRows(leads.filter((l) => visibleSelected.includes(l.id)))
          }
        />
      )}

      <p className="text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "lead" : "leads"}
        {visibleSelected.length > 0 && ` · ${visibleSelected.length} selected`}
      </p>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  aria-label="Select all"
                  checked={allVisibleSelected}
                  indeterminate={visibleSelected.length > 0 && !allVisibleSelected}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
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
                data-state={selectedIds.has(lead.id) ? "selected" : undefined}
                onClick={() => setOpenLeadId(lead.id)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    aria-label={`Select ${lead.name}`}
                    checked={selectedIds.has(lead.id)}
                    onCheckedChange={() => toggleSelect(lead.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 font-medium">
                    {lead.name}
                    {duplicateIds.has(lead.id) && (
                      <span title="Possible duplicate">
                        <Copy className="h-3.5 w-3.5 text-amber-500" />
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{lead.email}</div>
                  {lead.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {lead.tags.slice(0, 3).map((t) => (
                        <Badge key={t} variant="muted" className="text-[10px]">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
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
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  {view === "archived"
                    ? "No archived leads."
                    : "No leads match your filters."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <LeadDrawer
        lead={openLead}
        employees={employees}
        notes={openLead ? notes[openLead.id] ?? [] : []}
        calls={openLead ? calls[openLead.id] ?? [] : []}
        followUps={openLead ? followUps[openLead.id] ?? [] : []}
        isDuplicate={openLead ? duplicateIds.has(openLead.id) : false}
        onClose={() => setOpenLeadId(null)}
        onPatch={applyPatch}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
        onLogCall={handleLogCall}
        onScheduleFollowUp={handleScheduleFollowUp}
        onToggleFollowUp={handleToggleFollowUp}
        onDeleteFollowUp={handleDeleteFollowUp}
      />
    </div>
  );
}

// ─── Filter select ───────────────────────────────────────────────────────────
function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="capitalize sm:w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="capitalize">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ─── Bulk action bar ─────────────────────────────────────────────────────────
function BulkActionBar({
  count,
  employees,
  view,
  onClear,
  onStatus,
  onAssign,
  onArchive,
  onExport,
}: {
  count: number;
  employees: string[];
  view: "active" | "archived";
  onClear: () => void;
  onStatus: (s: LeadStatus) => void;
  onAssign: (a: string) => void;
  onArchive: (archived: boolean) => void;
  onExport: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-2.5">
      <span className="px-1 text-sm font-medium">{count} selected</span>
      <Select onValueChange={(v) => onStatus(v as LeadStatus)}>
        <SelectTrigger className="h-8 w-auto gap-1.5 text-sm">
          <span className="text-muted-foreground">Set status</span>
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s} className="capitalize">
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select onValueChange={onAssign}>
        <SelectTrigger className="h-8 w-auto gap-1.5 text-sm">
          <UserCheck className="h-3.5 w-3.5" />
          <span className="text-muted-foreground">Assign</span>
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
      {view === "active" ? (
        <Button variant="outline" size="sm" onClick={() => onArchive(true)}>
          <Archive className="h-4 w-4" />
          Archive
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={() => onArchive(false)}>
          <ArchiveRestore className="h-4 w-4" />
          Restore
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={onExport}>
        <Download className="h-4 w-4" />
        Export
      </Button>
      <Button variant="ghost" size="sm" onClick={onClear} className="ml-auto">
        <X className="h-4 w-4" />
        Clear
      </Button>
    </div>
  );
}

// ─── Reminders panel ─────────────────────────────────────────────────────────
function RemindersPanel({
  leads,
  followUps,
  onOpenLead,
  onToggle,
}: {
  leads: Lead[];
  followUps: FollowUpsMap;
  onOpenLead: (id: string) => void;
  onToggle: (leadId: string, id: string, completed: boolean) => void;
}) {
  const leadName = (id: string) => leads.find((l) => l.id === id)?.name ?? "Lead";
  const open = React.useMemo(() => {
    const rows: (FollowUp & { leadName: string })[] = [];
    for (const [leadId, list] of Object.entries(followUps)) {
      for (const f of list) {
        if (!f.completed) rows.push({ ...f, leadName: leadName(leadId) });
      }
    }
    return rows.sort(
      (a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followUps, leads]);

  if (open.length === 0) return null;
  const overdue = open.filter((f) => isOverdue(f.due_at, false)).length;

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">Follow-up reminders</h2>
        {overdue > 0 && (
          <Badge variant="destructive" className="text-[10px]">
            {overdue} overdue
          </Badge>
        )}
      </div>
      <ul className="space-y-1.5">
        {open.slice(0, 5).map((f) => {
          const late = isOverdue(f.due_at, false);
          return (
            <li
              key={f.id}
              className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 text-sm hover:bg-accent"
            >
              <button
                aria-label="Mark done"
                onClick={() => onToggle(f.lead_id, f.id, true)}
                className="text-muted-foreground transition-colors hover:text-success"
              >
                <Circle className="h-4 w-4" />
              </button>
              <button
                onClick={() => onOpenLead(f.lead_id)}
                className="flex flex-1 items-center gap-2 text-left"
              >
                <span className="font-medium">{f.leadName}</span>
                <span className="truncate text-muted-foreground">{f.note}</span>
              </button>
              <span
                className={`flex shrink-0 items-center gap-1 text-xs ${
                  late ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                <Clock className="h-3 w-3" />
                {timeAgo(f.due_at)}
              </span>
            </li>
          );
        })}
      </ul>
      {open.length > 5 && (
        <p className="mt-2 text-xs text-muted-foreground">
          +{open.length - 5} more open follow-up(s)
        </p>
      )}
    </div>
  );
}

// ─── Lead drawer ─────────────────────────────────────────────────────────────
function LeadDrawer({
  lead,
  employees,
  notes,
  calls,
  followUps,
  isDuplicate,
  onClose,
  onPatch,
  onAddNote,
  onDeleteNote,
  onLogCall,
  onScheduleFollowUp,
  onToggleFollowUp,
  onDeleteFollowUp,
}: {
  lead: Lead | null;
  employees: string[];
  notes: LeadNote[];
  calls: CallLog[];
  followUps: FollowUp[];
  isDuplicate: boolean;
  onClose: () => void;
  onPatch: (id: string, patch: Partial<Lead>) => void;
  onAddNote: (leadId: string, body: string) => Promise<boolean>;
  onDeleteNote: (leadId: string, noteId: string) => void;
  onLogCall: (
    leadId: string,
    input: { outcome: CallOutcome; duration_seconds: number | null; notes: string | null }
  ) => Promise<boolean>;
  onScheduleFollowUp: (
    leadId: string,
    input: { due_at: string; note: string }
  ) => Promise<boolean>;
  onToggleFollowUp: (leadId: string, id: string, completed: boolean) => void;
  onDeleteFollowUp: (leadId: string, id: string) => void;
}) {
  const { toast } = useToast();

  if (!lead) return null;
  const timeline = buildLeadTimeline(lead, { notes, calls, followUps });

  return (
    <Sheet open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="px-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11">
              <AvatarFallback>{initials(lead.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <SheetTitle className="flex items-center gap-2">
                {lead.name}
                {lead.archived && <Badge variant="muted">Archived</Badge>}
              </SheetTitle>
              <p className="text-sm capitalize text-muted-foreground">
                via {lead.source} · {formatDate(lead.created_at)}
              </p>
            </div>
          </div>
          {isDuplicate && (
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
              <Copy className="h-3.5 w-3.5" />
              Possible duplicate — another lead shares this email or phone.
            </div>
          )}
        </SheetHeader>

        <div className="p-6">
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

          <Tabs defaultValue="overview" className="mt-5">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">
                Activity{timeline.length ? ` (${timeline.length})` : ""}
              </TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Status</label>
                  <Select
                    value={lead.status}
                    onValueChange={(v) => onPatch(lead.id, { status: v as LeadStatus })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
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
                      onPatch(lead.id, { assigned_to: v === "unassigned" ? null : v })
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

              <ValueEditor
                value={lead.value}
                onSave={(value) => onPatch(lead.id, { value })}
              />

              <TagEditor
                tags={lead.tags}
                onChange={(tags) => onPatch(lead.id, { tags })}
              />

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

              <div className="flex items-center justify-between border-t border-border pt-4">
                {lead.archived ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onPatch(lead.id, { archived: false });
                      toast({ title: "Restored", description: `${lead.name} moved back to active.` });
                    }}
                  >
                    <ArchiveRestore className="h-4 w-4" />
                    Restore lead
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onPatch(lead.id, { archived: true });
                      toast({ title: "Archived", description: `${lead.name} archived.` });
                      onClose();
                    }}
                  >
                    <Archive className="h-4 w-4" />
                    Archive lead
                  </Button>
                )}
              </div>
            </TabsContent>

            {/* Activity */}
            <TabsContent value="activity" className="space-y-5">
              <QuickActions
                leadId={lead.id}
                onAddNote={onAddNote}
                onLogCall={onLogCall}
                onScheduleFollowUp={onScheduleFollowUp}
              />

              {followUps.some((f) => !f.completed) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Open follow-ups
                  </label>
                  {followUps
                    .filter((f) => !f.completed)
                    .map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center gap-2 rounded-lg border border-border p-2.5 text-sm"
                      >
                        <button
                          aria-label="Complete follow-up"
                          onClick={() => onToggleFollowUp(lead.id, f.id, true)}
                          className="text-muted-foreground hover:text-success"
                        >
                          <Circle className="h-4 w-4" />
                        </button>
                        <div className="flex-1">
                          <p>{f.note}</p>
                          <p
                            className={`text-xs ${
                              isOverdue(f.due_at, false)
                                ? "text-destructive"
                                : "text-muted-foreground"
                            }`}
                          >
                            Due {formatDate(f.due_at)} · {timeAgo(f.due_at)}
                          </p>
                        </div>
                        <button
                          aria-label="Delete follow-up"
                          onClick={() => onDeleteFollowUp(lead.id, f.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                </div>
              )}

              <Timeline
                items={timeline}
                onDeleteNote={(id) => onDeleteNote(lead.id, id)}
                onToggleFollowUp={(id, completed) =>
                  onToggleFollowUp(lead.id, id, completed)
                }
              />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Value editor ────────────────────────────────────────────────────────────
function ValueEditor({
  value,
  onSave,
}: {
  value: number | null;
  onSave: (value: number | null) => void;
}) {
  const [draft, setDraft] = React.useState(value?.toString() ?? "");
  React.useEffect(() => setDraft(value?.toString() ?? ""), [value]);
  const parsed = draft.trim() === "" ? null : Number(draft);
  const dirty = (value ?? null) !== (parsed ?? null) && (parsed === null || !Number.isNaN(parsed));

  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">Deal value (USD)</label>
      <div className="mt-1.5 flex gap-2">
        <Input
          type="number"
          min={0}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="—"
        />
        {dirty && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSave(parsed !== null && Number.isNaN(parsed) ? null : parsed)}
          >
            Save
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Tag editor ──────────────────────────────────────────────────────────────
function TagEditor({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [draft, setDraft] = React.useState("");
  const add = () => {
    const t = draft.trim().toLowerCase();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setDraft("");
  };
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Tag className="h-3.5 w-3.5" /> Tags
      </label>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <Badge key={t} variant="muted" className="gap-1 pr-1">
            {t}
            <button
              aria-label={`Remove ${t}`}
              onClick={() => onChange(tags.filter((x) => x !== t))}
              className="rounded-full p-0.5 hover:bg-foreground/10"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {tags.length === 0 && (
          <span className="text-sm text-muted-foreground">No tags</span>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Add a tag…"
          className="h-9"
        />
        <Button size="sm" variant="outline" onClick={add} disabled={!draft.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Quick actions (note / call / follow-up) ─────────────────────────────────
function QuickActions({
  leadId,
  onAddNote,
  onLogCall,
  onScheduleFollowUp,
}: {
  leadId: string;
  onAddNote: (leadId: string, body: string) => Promise<boolean>;
  onLogCall: (
    leadId: string,
    input: { outcome: CallOutcome; duration_seconds: number | null; notes: string | null }
  ) => Promise<boolean>;
  onScheduleFollowUp: (
    leadId: string,
    input: { due_at: string; note: string }
  ) => Promise<boolean>;
}) {
  const [tab, setTab] = React.useState<"note" | "call" | "follow">("note");
  const [note, setNote] = React.useState("");
  const [outcome, setOutcome] = React.useState<CallOutcome>("connected");
  const [callMinutes, setCallMinutes] = React.useState("");
  const [callNote, setCallNote] = React.useState("");
  const [dueAt, setDueAt] = React.useState("");
  const [followNote, setFollowNote] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const trigger = (v: typeof tab, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setTab(v)}
      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
        tab === v ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-3">
      <div className="mb-2 flex gap-1">
        {trigger("note", <StickyNote className="h-3.5 w-3.5" />, "Note")}
        {trigger("call", <PhoneCall className="h-3.5 w-3.5" />, "Log call")}
        {trigger("follow", <CalendarClock className="h-3.5 w-3.5" />, "Follow-up")}
      </div>

      {tab === "note" && (
        <div className="space-y-2">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add an internal note…"
            className="min-h-[64px]"
          />
          <Button
            size="sm"
            disabled={!note.trim() || busy}
            onClick={async () => {
              setBusy(true);
              const ok = await onAddNote(leadId, note.trim());
              setBusy(false);
              if (ok) setNote("");
            }}
          >
            <Plus className="h-4 w-4" />
            Add note
          </Button>
        </div>
      )}

      {tab === "call" && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Select value={outcome} onValueChange={(v) => setOutcome(v as CallOutcome)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CALL_OUTCOMES.map((o) => (
                  <SelectItem key={o} value={o} className="capitalize">
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={0}
              value={callMinutes}
              onChange={(e) => setCallMinutes(e.target.value)}
              placeholder="Minutes"
            />
          </div>
          <Textarea
            value={callNote}
            onChange={(e) => setCallNote(e.target.value)}
            placeholder="Call notes (optional)…"
            className="min-h-[52px]"
          />
          <Button
            size="sm"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              const mins = Number(callMinutes);
              const ok = await onLogCall(leadId, {
                outcome,
                duration_seconds:
                  callMinutes.trim() && !Number.isNaN(mins) ? Math.round(mins * 60) : null,
                notes: callNote.trim() || null,
              });
              setBusy(false);
              if (ok) {
                setCallMinutes("");
                setCallNote("");
              }
            }}
          >
            <PhoneCall className="h-4 w-4" />
            Log call
          </Button>
        </div>
      )}

      {tab === "follow" && (
        <div className="space-y-2">
          <Input
            type="datetime-local"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
          />
          <Textarea
            value={followNote}
            onChange={(e) => setFollowNote(e.target.value)}
            placeholder="What's the follow-up?"
            className="min-h-[52px]"
          />
          <Button
            size="sm"
            disabled={!dueAt || !followNote.trim() || busy}
            onClick={async () => {
              setBusy(true);
              const ok = await onScheduleFollowUp(leadId, {
                due_at: dueAt,
                note: followNote.trim(),
              });
              setBusy(false);
              if (ok) {
                setDueAt("");
                setFollowNote("");
              }
            }}
          >
            <CalendarClock className="h-4 w-4" />
            Schedule
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Timeline ────────────────────────────────────────────────────────────────
function Timeline({
  items,
  onDeleteNote,
  onToggleFollowUp,
}: {
  items: ReturnType<typeof buildLeadTimeline>;
  onDeleteNote: (id: string) => void;
  onToggleFollowUp: (id: string, completed: boolean) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No activity yet. Add a note or log a call above.
      </p>
    );
  }
  return (
    <ol className="relative space-y-4 border-l border-border pl-5">
      {items.map((item) => (
        <li key={`${item.kind}-${item.id}`} className="relative">
          <span className="absolute -left-[27px] flex h-5 w-5 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
            <TimelineIcon kind={item.kind} />
          </span>
          <div className="text-sm">
            {item.kind === "created" && (
              <p className="text-muted-foreground">
                Lead created via <span className="capitalize">{item.source}</span>
              </p>
            )}
            {item.kind === "note" && (
              <div className="group rounded-lg border border-border bg-card p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="whitespace-pre-wrap">{item.body}</p>
                  <button
                    aria-label="Delete note"
                    onClick={() => onDeleteNote(item.id)}
                    className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.author}</p>
              </div>
            )}
            {item.kind === "call" && (
              <div className="rounded-lg border border-border bg-card p-2.5">
                <p className="capitalize">
                  Call · {item.outcome}
                  {item.durationSeconds != null && (
                    <span className="text-muted-foreground">
                      {" "}
                      · {formatDuration(item.durationSeconds)}
                    </span>
                  )}
                </p>
                {item.notes && (
                  <p className="mt-1 text-muted-foreground">{item.notes}</p>
                )}
              </div>
            )}
            {item.kind === "follow_up" && (
              <div className="rounded-lg border border-border bg-card p-2.5">
                <div className="flex items-center gap-2">
                  <button
                    aria-label="Toggle follow-up"
                    onClick={() => onToggleFollowUp(item.id, !item.completed)}
                    className={item.completed ? "text-success" : "text-muted-foreground hover:text-success"}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </button>
                  <p className={item.completed ? "text-muted-foreground line-through" : ""}>
                    {item.note}
                  </p>
                </div>
                <p className="mt-1 pl-6 text-xs text-muted-foreground">
                  Due {formatDate(item.dueAt)}
                </p>
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{timeAgo(item.at)}</p>
        </li>
      ))}
    </ol>
  );
}

function TimelineIcon({ kind }: { kind: string }) {
  const cls = "h-3 w-3";
  if (kind === "note") return <StickyNote className={cls} />;
  if (kind === "call") return <PhoneCall className={cls} />;
  if (kind === "follow_up") return <CalendarClock className={cls} />;
  return <Users className={cls} />;
}
