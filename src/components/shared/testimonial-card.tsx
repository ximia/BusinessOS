import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/shared/star-rating";
import { initials } from "@/lib/utils";
import type { Testimonial } from "@/types/content";

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="flex h-full flex-col justify-between p-7">
      <div>
        <StarRating rating={testimonial.rating} />
        <blockquote className="mt-4 text-[15px] leading-relaxed text-foreground/90">
          “{testimonial.quote}”
        </blockquote>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <Avatar className="h-10 w-10">
          {testimonial.avatar && (
            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
          )}
          <AvatarFallback>{initials(testimonial.name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold">{testimonial.name}</p>
          {testimonial.role && (
            <p className="text-xs text-muted-foreground">{testimonial.role}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
