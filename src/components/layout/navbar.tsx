"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, ChevronDown } from "lucide-react";
import { siteConfig } from "@/config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { themeConfig } from "@/config/theme.config";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/70 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav className="container flex h-16 items-center justify-between gap-4 md:h-18">
        <Logo />

        <div className="hidden items-center gap-1 lg:flex">
          {siteConfig.nav.map((link) =>
            link.children ? (
              <DropdownMenu key={link.label}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                      pathname.startsWith(link.href) && "text-foreground"
                    )}
                  >
                    {link.label}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {link.children.map((child) => (
                    <DropdownMenuItem key={child.href} asChild>
                      <Link href={child.href}>{child.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <NavItem
                key={link.href}
                href={link.href}
                active={pathname === link.href}
              >
                {link.label}
              </NavItem>
            )
          )}
        </div>

        <div className="flex items-center gap-2">
          {themeConfig.enableThemeToggle && (
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
          )}
          <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
            <a href={`tel:${siteConfig.phoneRaw}`}>
              <Phone className="h-4 w-4" />
              {siteConfig.phone}
            </a>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/contact">Get a quote</Link>
          </Button>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86%] max-w-sm p-0">
              <SheetHeader className="border-b">
                <SheetTitle className="text-left">
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 p-4">
                {siteConfig.nav.map((link) => (
                  <React.Fragment key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "rounded-md px-3 py-2.5 text-base font-medium transition-colors hover:bg-accent",
                        pathname === link.href && "bg-accent text-accent-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                    {link.children && (
                      <div className="ml-3 flex flex-col border-l pl-3">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setOpen(false)}
                            className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </React.Fragment>
                ))}
                <div className="mt-4 flex flex-col gap-2">
                  <Button asChild>
                    <Link href="/contact" onClick={() => setOpen(false)}>
                      Get a quote
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <a href={`tel:${siteConfig.phoneRaw}`}>
                      <Phone className="h-4 w-4" />
                      {siteConfig.phone}
                    </a>
                  </Button>
                  {themeConfig.enableThemeToggle && (
                    <div className="flex items-center justify-between rounded-md border px-3 py-2">
                      <span className="text-sm text-muted-foreground">Theme</span>
                      <ThemeToggle />
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

function NavItem({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
        active && "text-foreground"
      )}
    >
      {children}
    </Link>
  );
}
