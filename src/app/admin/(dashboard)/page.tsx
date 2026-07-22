import Link from "next/link";
import { Users, FileText, Star, TrendingUp, ArrowRight } from "lucide-react";
import { getLeads, getLeadStats } from "@/services/leads.service";
import { getQuotes } from "@/services/quotes.service";
import { getReviews } from "@/services/reviews.service";
import { StatCard } from "@/components/admin/stat-card";
import { BarChart } from "@/components/admin/bar-chart";
import { LeadStatusBadge } from "@/components/admin/status-badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatCurrency, timeAgo } from "@/lib/utils";

export default async function AdminDashboard() {
  const [stats, leads, quotes, reviews] = await Promise.all([
    getLeadStats(),
    getLeads(),
    getQuotes(),
    getReviews(),
  ]);

  const pendingReviews = reviews.filter((r) => !r.approved).length;
  const openQuotes = quotes.filter((q) =>
    ["requested", "reviewing"].includes(q.status)
  ).length;

  const statusOrder = ["new", "contacted", "qualified", "quoted", "won", "lost"];
  const chartData = statusOrder.map((s) => ({
    label: s.slice(0, 3),
    value: stats.byStatus[s] ?? 0,
  }));

  const recentLeads = leads.slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total leads"
          value={stats.total}
          icon={Users}
          hint={`${stats.newThisWeek} new this week`}
        />
        <StatCard
          label="Open quotes"
          value={openQuotes}
          icon={FileText}
          hint={`${quotes.length} total`}
        />
        <StatCard
          label="Pipeline value"
          value={formatCurrency(stats.pipelineValue)}
          icon={TrendingUp}
          hint="Excludes won & lost"
        />
        <StatCard
          label="Pending reviews"
          value={pendingReviews}
          icon={Star}
          hint="Awaiting approval"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Leads by stage</h2>
              <p className="text-sm text-muted-foreground">
                Distribution across the pipeline
              </p>
            </div>
          </div>
          <BarChart data={chartData} />
        </div>

        {/* Won value */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="font-semibold">Revenue won</h2>
          <p className="mt-1 text-sm text-muted-foreground">Closed deals</p>
          <p className="mt-6 font-display text-4xl font-semibold tracking-tight text-success">
            {formatCurrency(stats.wonValue)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {stats.byStatus.won ?? 0} deals closed
          </p>
        </div>
      </div>

      {/* Recent leads */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between p-6">
          <div>
            <h2 className="font-semibold">Recent leads</h2>
            <p className="text-sm text-muted-foreground">Latest enquiries</p>
          </div>
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Service interest</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Value</TableHead>
              <TableHead className="text-right">Received</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentLeads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <div className="font-medium">{lead.name}</div>
                  <div className="text-xs text-muted-foreground">{lead.email}</div>
                </TableCell>
                <TableCell className="hidden max-w-xs truncate text-muted-foreground sm:table-cell">
                  {lead.message ?? "—"}
                </TableCell>
                <TableCell>
                  <LeadStatusBadge status={lead.status} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatCurrency(lead.value)}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {timeAgo(lead.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
