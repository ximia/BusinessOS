import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { Service } from "@/types/content";

/**
 * Reusable service card. Used on the homepage grid and the /services index.
 */
export function ServiceCard({
  service,
  className,
}: {
  service: Service;
  className?: string;
}) {
  const Icon = getIcon(service.icon);

  return (
    <Link
      href={`/services/${service.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_18px_40px_-24px_hsl(var(--primary)/0.45)]",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="h-6 w-6" />
        </span>
        <ArrowUpRight className="h-5 w-5 text-muted-foreground/50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>

      <h3 className="mt-6 font-display text-xl font-semibold tracking-tight">
        {service.title}
      </h3>
      <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted-foreground">
        {service.excerpt}
      </p>

      {service.price && (
        <p className="mt-5 text-sm font-medium text-foreground">
          {service.price}
        </p>
      )}
    </Link>
  );
}
