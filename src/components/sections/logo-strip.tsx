import { siteConfig } from "@/config";
import { ShieldCheck } from "lucide-react";

/**
 * Understated trust strip beneath the hero. Uses factual badges from config —
 * no fabricated stats. Swap for real partner/certification logos per client.
 */
export function LogoStrip() {
  return (
    <section className="border-y border-border/70 bg-muted/20">
      <div className="container flex flex-wrap items-center justify-center gap-x-10 gap-y-4 py-6 text-sm text-muted-foreground">
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          Why owners choose us
        </span>
        {siteConfig.trustBadges.map((badge) => (
          <span key={badge} className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            {badge}
          </span>
        ))}
      </div>
    </section>
  );
}
