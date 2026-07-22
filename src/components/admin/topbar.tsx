"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, ExternalLink } from "lucide-react";
import { adminNav } from "@/config/admin-nav";
import { signOut } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * Admin top bar: mobile nav, a ⌘K search affordance, theme toggle, and a link
 * back to the live site. The command palette itself lives in CommandMenu.
 */
export function Topbar({ onOpenCommand }: { onOpenCommand?: () => void }) {
  const pathname = usePathname();
  const current = adminNav.find((i) =>
    i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href)
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile nav */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="border-b">
              <SheetTitle>Admin</SheetTitle>
            </SheetHeader>
            <nav className="space-y-1 p-3">
              {adminNav.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent"
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px]" />
                    {item.label}
                  </Link>
                );
              })}
              <form action={signOut} className="pt-2">
                <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent">
                  Sign out
                </button>
              </form>
            </nav>
          </SheetContent>
        </Sheet>

        <h1 className="font-display text-lg font-semibold">
          {current?.label ?? "Admin"}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenCommand}
          className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:flex"
        >
          <Search className="h-4 w-4" />
          <span>Search…</span>
          <kbd className="ml-2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium">
            ⌘K
          </kbd>
        </button>
        <ThemeToggle />
        <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
          <Link href="/" target="_blank">
            <ExternalLink className="h-4 w-4" />
            View site
          </Link>
        </Button>
      </div>
    </header>
  );
}
