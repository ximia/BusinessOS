import Link from "next/link";
import {
  Users,
  TrendingUp,
  DollarSign,
  Target,
  PhoneCall,
  FileText,
  CalendarClock,
  Star,
  ArrowRight,
  Activity,
} from "lucide-react";
import { getDashboardAnalytics } from "@/services/analytics.service";
import { StatCard } from "@/components/admin/stat-card";
import { BarChart } from "@/components/admin/bar-chart";
import { TrendChart } from "@/components/admin/trend-chart";
import { ProgressList } from "@/components/admin/progress-list";
import { ActivityFeed } from "@/components/admin/activity-feed";
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
  const {
    kpis,
    leadsByStage,
    dailyLeads,
    trafficSources,
    popularServices,
    activity,
    recentLeads,
  } = await getDashboardAnalytics();

  const trend =
    kpis.leadsWeekTrend == null
      ? undefined
      : {
          value: `${kpis.leadsWeekTrend >= 0 ? "+" : ""}${kpis.leadsWeekTrend}% vs last week`,
          positive: kpis.leadsWeekTrend >= 0,
        };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Overview
        </h1>
        <p className="text-sm text-muted-foreground">
          Your pipeline, revenue, and activity at a glance.
        </p>
      </div>

      {/* Primary KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Leads today"
          value={kpis.todayLeads}
          icon={Users}
          hint="Since midnight"
        />
        <StatCard
          label="New this week"
          value={kpis.leadsWeek}
          icon={TrendingUp}
          trend={trend}
          hint={trend ? undefined : "vs last week"}
        />
        <StatCard
          label="Conversion rate"
          value={`${kpis.conversionRate}%`}
          icon={Target}
          hint="Won of all leads"
        />
        <StatCard
          label="Revenue won"
          value={formatCurrency(kpis.wonValue)}
          icon={DollarSign}
          hint="Closed deals"
        />
      </div>

      {/* Secondary metrics strip */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border shadow-sm sm:grid-cols-3 lg:grid-cols-6">
        <MiniStat icon={DollarSign} label="Pipeline" value={formatCurrency(kpis.pipelineValue)} />
        <MiniStat icon={PhoneCall} label="Calls (7d)" value={kpis.callsWeek} />
        <MiniStat
          icon={FileText}
          label="Open quotes"
          value={kpis.openQuotes}
          hint={`${kpis.quoteAcceptRate}% accepted`}
        />
        <MiniStat
          icon={CalendarClock}
          label="Follow-ups"
          value={kpis.openFollowUps}
          hint={kpis.overdueFollowUps ? `${kpis.overdueFollowUps} overdue` : "On track"}
          alert={kpis.overdueFollowUps > 0}
        />
        <MiniStat icon={Star} label="Pending reviews" value={kpis.pendingReviews} />
        <MiniStat
          icon={Star}
          label="Avg rating"
          value={kpis.avgRating ? kpis.avgRating.toFixed(1) : "—"}
        />
      </div>

      {/* Trend + revenue */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="Leads over time"
          subtitle="New enquiries, last 14 days"
        >
          <TrendChart data={dailyLeads} />
        </Panel>
        <Panel title="Revenue" subtitle="Closed & projected">
          <p className="mt-2 font-display text-4xl font-semibold tracking-tight text-success">
            {formatCurrency(kpis.wonValue)}
          </p>
          <p className="text-sm text-muted-foreground">Won to date</p>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Open pipeline</dt>
              <dd className="font-medium">{formatCurrency(kpis.pipelineValue)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">
                Projected
                <span className="ml-1 text-xs">(weighted)</span>
              </dt>
              <dd className="font-medium">{formatCurrency(kpis.projectedRevenue)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">
            Projection = won + pipeline × conversion rate. Connect a payments
            provider for actuals.
          </p>
        </Panel>
      </div>

      {/* Pipeline + activity */}
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Panel title="Leads by stage" subtitle="Distribution across the pipeline">
          <BarChart data={leadsByStage} height={220} />
        </Panel>
        <Panel
          title="Recent activity"
          subtitle="Leads, calls, quotes & reviews"
          icon={Activity}
        >
          <ActivityFeed items={activity} />
        </Panel>
      </div>

      {/* Traffic + services */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Traffic sources" subtitle="Where leads come from">
          <ProgressList rows={trafficSources} empty="No leads yet" />
          <p className="mt-4 text-xs text-muted-foreground">
            Derived from lead source. Connect Google Analytics for full site
            visitor traffic.
          </p>
        </Panel>
        <Panel title="Popular services" subtitle="Most-requested work">
          <ProgressList rows={popularServices} empty="No quotes or reviews yet" />
        </Panel>
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

function Panel({
  title,
  subtitle,
  icon: Icon,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-card p-6 shadow-sm ${className ?? ""}`}
    >
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      {children}
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  hint,
  alert,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  hint?: string;
  alert?: boolean;
}) {
  return (
    <div className="bg-card p-4">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1.5 font-display text-xl font-semibold tracking-tight">
        {value}
      </p>
      {hint && (
        <p
          className={`mt-0.5 text-xs ${alert ? "text-destructive" : "text-muted-foreground"}`}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
