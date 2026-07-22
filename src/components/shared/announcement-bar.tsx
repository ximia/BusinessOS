"use client";

import * as React from "react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { useSettings } from "@/features/settings/settings-provider";

const STORAGE_KEY = "announcement-dismissed";

/**
 * Slim, dismissible announcement bar above the navbar. Enabled and edited from
 * Business Settings. Dismissal is remembered per message so a new message
 * re-appears. SSR-safe (hidden until mounted to avoid a flash + hydration gap).
 */
export function AnnouncementBar() {
  const { announcement } = useSettings();
  const [dismissed, setDismissed] = React.useState(true);

  React.useEffect(() => {
    if (!announcement?.enabled) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    setDismissed(stored === announcement.message);
  }, [announcement?.enabled, announcement?.message]);

  if (!announcement?.enabled || dismissed) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, announcement.message);
    setDismissed(true);
  };

  const body = (
    <span className="inline-flex items-center gap-1.5">
      {announcement.message}
      {announcement.href && announcement.linkLabel && (
        <span className="inline-flex items-center gap-1 font-semibold underline-offset-4 group-hover:underline">
          {announcement.linkLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      )}
    </span>
  );

  return (
    <div className="relative bg-primary text-primary-foreground">
      <div className="container flex min-h-10 items-center justify-center py-1.5 pr-8 text-center text-sm">
        {announcement.href ? (
          <Link href={announcement.href} className="group">
            {body}
          </Link>
        ) : (
          body
        )}
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-primary-foreground/80 transition-colors hover:bg-white/10 hover:text-primary-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
