import { getLeads, getCallLogsByLead, getOpenFollowUps } from "./leads.service";
import { getQuotes } from "./quotes.service";
import { getReviews } from "./reviews.service";
import type { Lead } from "@/types/database";

export interface RankedDatum {
  label: string;
  value: number;
  pct: number;
}

export interface ActivityItem {
  id: string;
  kind: "lead" | "call" | "quote" | "review";
  at: string;
  title: string;
  subtitle: string;
}

export interface DashboardAnalytics {
  kpis: {
    todayLeads: number;
    leadsWeek: number;
    /** Percent change in weekly leads vs. the prior 7 days (null if no base). */
    leadsWeekTrend: number | null;
    conversionRate: number;
    wonValue: number;
    pipelineValue: number;
    /** Soft projection: won + pipeline weighted by conversion rate. */
    projectedRevenue: number;
    callsWeek: number;
    openFollowUps: number;
    overdueFollowUps: number;
    openQuotes: number;
    quoteAcceptRate: number;
    pendingReviews: number;
    avgRating: number;
    /** Placeholder until a web-analytics provider is wired (see roadmap). */
    visitorsPlaceholder: number | null;
  };
  leadsByStage: { label: string; value: number }[];
  dailyLeads: { date: string; label: string; value: number }[];
  trafficSources: RankedDatum[];
  popularServices: RankedDatum[];
  activity: ActivityItem[];
  recentLeads: Lead[];
}

const DAY = 86400000;
const STATUS_ORDER = ["new", "contacted", "qualified", "quoted", "won", "lost"];

/**
 * Aggregate the admin analytics dashboard from the CRM data. Everything is
 * derived from real records (leads, quotes, reviews, calls, follow-ups) so it
 * works in demo mode and against Supabase alike. Web-analytics style metrics
 * (visitors, traffic) are labelled placeholders until a provider is connected.
 */
export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const [leads, quotes, reviews, callsByLead, openFollowUps] = await Promise.all([
    getLeads(),
    getQuotes(),
    getReviews(),
    getCallLogsByLead(),
    getOpenFollowUps(),
  ]);

  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // ── Lead volume & trend ──────────────────────────────────────────────────
  const todayLeads = leads.filter(
    (l) => new Date(l.created_at).getTime() >= startOfToday.getTime()
  ).length;
  const leadsWeek = leads.filter(
    (l) => now - new Date(l.created_at).getTime() < 7 * DAY
  ).length;
  const leadsPrevWeek = leads.filter((l) => {
    const age = now - new Date(l.created_at).getTime();
    return age >= 7 * DAY && age < 14 * DAY;
  }).length;
  const leadsWeekTrend =
    leadsPrevWeek === 0
      ? leadsWeek > 0
        ? 100
        : null
      : Math.round(((leadsWeek - leadsPrevWeek) / leadsPrevWeek) * 100);

  // ── Pipeline & revenue ───────────────────────────────────────────────────
  const won = leads.filter((l) => l.status === "won");
  const conversionRate = leads.length
    ? Math.round((won.length / leads.length) * 100)
    : 0;
  const wonValue = won.reduce((s, l) => s + (l.value ?? 0), 0);
  const pipelineValue = leads
    .filter((l) => !["won", "lost"].includes(l.status))
    .reduce((s, l) => s + (l.value ?? 0), 0);
  const projectedRevenue = Math.round(
    wonValue + pipelineValue * (conversionRate / 100)
  );

  // ── Calls ────────────────────────────────────────────────────────────────
  const allCalls = Object.values(callsByLead).flat();
  const callsWeek = allCalls.filter(
    (c) => now - new Date(c.created_at).getTime() < 7 * DAY
  ).length;

  // ── Quotes & reviews ─────────────────────────────────────────────────────
  const openQuotes = quotes.filter((q) =>
    ["requested", "reviewing", "sent"].includes(q.status)
  ).length;
  const acceptedQuotes = quotes.filter((q) => q.status === "accepted").length;
  const quoteAcceptRate = quotes.length
    ? Math.round((acceptedQuotes / quotes.length) * 100)
    : 0;
  const pendingReviews = reviews.filter((r) => !r.approved).length;
  const approvedReviews = reviews.filter((r) => r.approved);
  const avgRating = approvedReviews.length
    ? Math.round(
        (approvedReviews.reduce((s, r) => s + r.rating, 0) /
          approvedReviews.length) *
          10
      ) / 10
    : 0;

  const overdueFollowUps = openFollowUps.filter(
    (f) => new Date(f.due_at).getTime() < now
  ).length;

  // ── Leads by stage ───────────────────────────────────────────────────────
  const byStatus = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  }, {});
  const leadsByStage = STATUS_ORDER.map((s) => ({
    label: s.slice(0, 3),
    value: byStatus[s] ?? 0,
  }));

  // ── Daily leads (last 14 days) ───────────────────────────────────────────
  const dailyLeads = Array.from({ length: 14 }, (_, i) => {
    const dayStart = new Date(startOfToday.getTime() - (13 - i) * DAY);
    const dayEnd = dayStart.getTime() + DAY;
    const value = leads.filter((l) => {
      const t = new Date(l.created_at).getTime();
      return t >= dayStart.getTime() && t < dayEnd;
    }).length;
    return {
      date: dayStart.toISOString(),
      label: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
      value,
    };
  });

  // ── Traffic sources (lead source distribution) ───────────────────────────
  const trafficSources = rank(leads.map((l) => l.source));

  // ── Popular services (quote + review intent) ─────────────────────────────
  const serviceLabels = [
    ...quotes.map((q) => q.service),
    ...reviews.map((r) => r.service).filter((s): s is string => Boolean(s)),
  ];
  const popularServices = rank(serviceLabels).slice(0, 6);

  // ── Activity feed ────────────────────────────────────────────────────────
  const activity: ActivityItem[] = [
    ...leads.map((l) => ({
      id: `lead-${l.id}`,
      kind: "lead" as const,
      at: l.created_at,
      title: `New lead — ${l.name}`,
      subtitle: `via ${l.source}`,
    })),
    ...allCalls.map((c) => ({
      id: `call-${c.id}`,
      kind: "call" as const,
      at: c.created_at,
      title: `Call logged — ${c.outcome}`,
      subtitle: c.notes ?? "No notes",
    })),
    ...quotes.map((q) => ({
      id: `quote-${q.id}`,
      kind: "quote" as const,
      at: q.created_at,
      title: `Quote ${q.status} — ${q.customer_name}`,
      subtitle: q.service,
    })),
    ...reviews.map((r) => ({
      id: `review-${r.id}`,
      kind: "review" as const,
      at: r.created_at,
      title: `${r.rating}★ review — ${r.name}`,
      subtitle: r.approved ? "Approved" : "Awaiting approval",
    })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 8);

  return {
    kpis: {
      todayLeads,
      leadsWeek,
      leadsWeekTrend,
      conversionRate,
      wonValue,
      pipelineValue,
      projectedRevenue,
      callsWeek,
      openFollowUps: openFollowUps.length,
      overdueFollowUps,
      openQuotes,
      quoteAcceptRate,
      pendingReviews,
      avgRating,
      visitorsPlaceholder: null,
    },
    leadsByStage,
    dailyLeads,
    trafficSources,
    popularServices,
    activity,
    recentLeads: leads.slice(0, 5),
  };
}

/** Count occurrences of each label and return ranked with percentages. */
function rank(labels: string[]): RankedDatum[] {
  const counts = labels.reduce<Record<string, number>>((acc, label) => {
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});
  const total = labels.length || 1;
  return Object.entries(counts)
    .map(([label, value]) => ({
      label,
      value,
      pct: Math.round((value / total) * 100),
    }))
    .sort((a, b) => b.value - a.value);
}
