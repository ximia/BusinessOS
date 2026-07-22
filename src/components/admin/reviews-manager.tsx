"use client";

import * as React from "react";
import { Check, EyeOff, Star } from "lucide-react";
import type { Review } from "@/types/database";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/shared/star-rating";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export function ReviewsManager({ initialReviews }: { initialReviews: Review[] }) {
  const { toast } = useToast();
  const [reviews, setReviews] = React.useState(initialReviews);

  const patch = (id: string, changes: Partial<Review>, message: string) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...changes } : r)));
    toast({ title: message });
  };

  const pending = reviews.filter((r) => !r.approved);
  const approved = reviews.filter((r) => r.approved);

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 sm:p-6">
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending{pending.length > 0 && ` (${pending.length})`}
          </TabsTrigger>
          <TabsTrigger value="approved">Published ({approved.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pending.length === 0 ? (
            <EmptyState message="No reviews waiting for approval." />
          ) : (
            pending.map((r) => (
              <ReviewCard
                key={r.id}
                review={r}
                onApprove={() =>
                  patch(r.id, { approved: true }, "Review published")
                }
                onFeature={() =>
                  patch(r.id, { featured: !r.featured }, "Updated")
                }
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approved.length === 0 ? (
            <EmptyState message="No published reviews yet." />
          ) : (
            approved.map((r) => (
              <ReviewCard
                key={r.id}
                review={r}
                onHide={() =>
                  patch(r.id, { approved: false, featured: false }, "Review hidden")
                }
                onFeature={() =>
                  patch(
                    r.id,
                    { featured: !r.featured },
                    r.featured ? "Removed from featured" : "Featured on site"
                  )
                }
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReviewCard({
  review,
  onApprove,
  onHide,
  onFeature,
}: {
  review: Review;
  onApprove?: () => void;
  onHide?: () => void;
  onFeature?: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{review.name}</p>
            {review.featured && (
              <Badge variant="default" className="gap-1">
                <Star className="h-3 w-3 fill-current" />
                Featured
              </Badge>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <StarRating rating={review.rating} size={14} />
            {review.service && (
              <span className="text-xs text-muted-foreground">· {review.service}</span>
            )}
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDate(review.created_at)}
        </span>
      </div>

      <p className="mt-3 text-[15px] leading-relaxed text-foreground/90">
        “{review.quote}”
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {onApprove && (
          <Button size="sm" onClick={onApprove}>
            <Check className="h-4 w-4" />
            Approve & publish
          </Button>
        )}
        {onFeature && (
          <Button size="sm" variant="outline" onClick={onFeature}>
            <Star className="h-4 w-4" />
            {review.featured ? "Unfeature" : "Feature"}
          </Button>
        )}
        {onHide && (
          <Button size="sm" variant="ghost" onClick={onHide}>
            <EyeOff className="h-4 w-4" />
            Hide
          </Button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
      {message}
    </div>
  );
}
