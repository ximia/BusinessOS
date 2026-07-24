"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Error boundary for the Business Hub (admin dashboard) segment.
 *
 * Server-rendered admin pages load data through the services layer; when
 * Supabase is configured, a failing read (e.g. the schema hasn't been migrated,
 * or a row-level-security policy denies access) throws. Without this boundary the
 * user sees an opaque "Application error" white screen. This catches it, shows a
 * useful message, surfaces the error digest (which maps to the real error in the
 * server logs), and offers a retry.
 *
 * In production Next.js hides the underlying message from the client for
 * security — the real cause is in the deployment's server logs, keyed by the
 * `digest` shown below.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Ensure the full error reaches the server/hosting logs.
    console.error("[admin] dashboard render error", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="text-lg font-semibold text-card-foreground">
          Couldn&apos;t load this page
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The Business Hub couldn&apos;t load its data. This usually means the
          database isn&apos;t reachable or the schema hasn&apos;t been applied yet
          — check that Supabase is configured and that the migrations in{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            supabase/migrations
          </code>{" "}
          have been run.
        </p>
        {error.digest ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Error reference:{" "}
            <code className="rounded bg-muted px-1 py-0.5">{error.digest}</code>
          </p>
        ) : null}
        <div className="mt-6 flex justify-center">
          <Button onClick={reset} variant="default">
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
