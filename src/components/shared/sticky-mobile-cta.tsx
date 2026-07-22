"use client";

import * as React from "react";
import Link from "next/link";
import { Phone, ArrowRight } from "lucide-react";
import { useSettings } from "@/features/settings/settings-provider";
import { cn } from "@/lib/utils";

/**
 * Sticky bottom CTA bar for mobile — call + quote in one thumb-reach row.
 * Enabled via `features.stickyMobileCta`. Appears after scrolling and hides at
 * the very top so it never covers the hero CTAs.
 */
export function StickyMobileCta() {
  const site = useSettings();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 560);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!site.features?.stickyMobileCta) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur-md transition-transform duration-300 sm:hidden",
        visible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="flex gap-2">
        <a
          href={`tel:${site.phoneRaw}`}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-input bg-background text-sm font-medium"
        >
          <Phone className="h-4 w-4" />
          Call
        </a>
        <Link
          href="/contact"
          className="inline-flex h-11 flex-[1.4] items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground"
        >
          Get a quote
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
