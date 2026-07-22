"use client";

import * as React from "react";
import { Calendar, DollarSign, MapPin, Mail, Phone } from "lucide-react";
import type { QuoteRequest, QuoteStatus } from "@/types/database";
import { formatDate, timeAgo } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { QuoteStatusBadge } from "@/components/admin/status-badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

const STATUSES: QuoteStatus[] = [
  "requested",
  "reviewing",
  "sent",
  "accepted",
  "declined",
];

export function QuotesTable({ initialQuotes }: { initialQuotes: QuoteRequest[] }) {
  const { toast } = useToast();
  const [quotes, setQuotes] = React.useState(initialQuotes);
  const [selected, setSelected] = React.useState<QuoteRequest | null>(null);

  const setStatus = (id: string, status: QuoteStatus) => {
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
    toast({ title: "Quote updated", description: `Marked as ${status}.` });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 sm:p-6">
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden md:table-cell">Service</TableHead>
              <TableHead className="hidden lg:table-cell">Preferred date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Requested</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map((q) => (
              <TableRow
                key={q.id}
                className="cursor-pointer"
                onClick={() => setSelected(q)}
              >
                <TableCell>
                  <div className="font-medium">{q.customer_name}</div>
                  <div className="text-xs text-muted-foreground">{q.email}</div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{q.service}</TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {q.preferred_date ? formatDate(q.preferred_date) : "Flexible"}
                </TableCell>
                <TableCell>
                  <QuoteStatusBadge status={q.status} />
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {timeAgo(q.created_at)}
                </TableCell>
              </TableRow>
            ))}
            {quotes.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  No quote requests yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          {selected && (
            <>
              <SheetHeader className="px-6">
                <SheetTitle>{selected.customer_name}</SheetTitle>
                <Badge variant="muted" className="w-fit">
                  {selected.service}
                </Badge>
              </SheetHeader>
              <div className="space-y-5 p-6">
                <div className="space-y-2">
                  <a
                    href={`mailto:${selected.email}`}
                    className="flex items-center gap-2.5 rounded-lg border border-border px-3.5 py-2.5 text-sm hover:bg-accent"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {selected.email}
                  </a>
                  {selected.phone && (
                    <a
                      href={`tel:${selected.phone}`}
                      className="flex items-center gap-2.5 rounded-lg border border-border px-3.5 py-2.5 text-sm hover:bg-accent"
                    >
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {selected.phone}
                    </a>
                  )}
                </div>

                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <Detail icon={<Calendar className="h-4 w-4" />} label="Preferred">
                    {selected.preferred_date
                      ? formatDate(selected.preferred_date)
                      : "Flexible"}
                  </Detail>
                  <Detail icon={<DollarSign className="h-4 w-4" />} label="Budget">
                    {selected.budget ?? "Not specified"}
                  </Detail>
                  <Detail
                    icon={<MapPin className="h-4 w-4" />}
                    label="Address"
                    className="col-span-2"
                  >
                    {selected.address ?? "Not provided"}
                  </Detail>
                </dl>

                {selected.notes && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Notes</p>
                    <p className="mt-1.5 rounded-lg border border-border bg-muted/30 p-3 text-sm leading-relaxed">
                      {selected.notes}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Update status
                  </label>
                  <Select
                    value={selected.status}
                    onValueChange={(v) => setStatus(selected.id, v as QuoteStatus)}
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
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Detail({
  icon,
  label,
  children,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}
