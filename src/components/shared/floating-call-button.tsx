"use client";

import * as React from "react";
import { Phone } from "lucide-react";
import { useSettings } from "@/features/settings/settings-provider";
import { cn } from "@/lib/utils";

/**
 * Optional floating call button (mobile-first conversion aid). Rendered only
 * when `features.floatingCallButton` is enabled in Business Settings, and
 * hidden on the largest screens where the header CTA is always visible.
 */
export function FloatingCallButton() {
  const site = useSettings();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!site.features?.floatingCallButton) return null;

  return (
    <a
      href={`tel:${site.phoneRaw}`}
      aria-label={`Call ${site.companyName}`}
      className={cn(
        "fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:hidden",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      )}
    >
      <Phone className="h-5 w-5" />
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40 [animation-duration:2.5s]" aria-hidden />
    </a>
  );
}
