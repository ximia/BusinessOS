import { Badge } from "@/components/ui/badge";
import type { LeadStatus, QuoteStatus } from "@/types/database";

const leadVariants: Record<
  LeadStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  new: "default",
  contacted: "secondary",
  qualified: "secondary",
  quoted: "default",
  won: "success",
  lost: "muted",
};

const quoteVariants: Record<
  QuoteStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  requested: "default",
  reviewing: "secondary",
  sent: "default",
  accepted: "success",
  declined: "muted",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant={leadVariants[status]} className="capitalize">
      {status}
    </Badge>
  );
}

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  return (
    <Badge variant={quoteVariants[status]} className="capitalize">
      {status}
    </Badge>
  );
}
