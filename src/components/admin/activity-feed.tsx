import { UserPlus, PhoneCall, FileText, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ActivityItem } from "@/services/analytics.service";
import { timeAgo } from "@/lib/utils";

const ICONS: Record<ActivityItem["kind"], LucideIcon> = {
  lead: UserPlus,
  call: PhoneCall,
  quote: FileText,
  review: Star,
};

const TONE: Record<ActivityItem["kind"], string> = {
  lead: "bg-primary/10 text-primary",
  call: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  quote: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  review: "bg-success/12 text-success",
};

/** Cross-entity recent activity list for the analytics dashboard. */
export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No recent activity.
      </p>
    );
  }
  return (
    <ul className="space-y-4">
      {items.map((item) => {
        const Icon = ICONS[item.kind];
        return (
          <li key={item.id} className="flex gap-3">
            <span
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TONE[item.kind]}`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {item.subtitle}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {timeAgo(item.at)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
