import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config";
import { cn } from "@/lib/utils";

/**
 * Brand logo. Renders the configured image if `siteConfig.logo.src` is set,
 * otherwise a clean typographic wordmark — so the template looks finished
 * before a client uploads their logo.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight",
        className
      )}
      aria-label={siteConfig.companyName}
    >
      {siteConfig.logo.src ? (
        <Image
          src={siteConfig.logo.src}
          alt={siteConfig.logo.alt}
          width={140}
          height={32}
          className="h-8 w-auto"
          priority
        />
      ) : (
        <>
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground"
            aria-hidden
          >
            {siteConfig.companyName.charAt(0)}
          </span>
          <span>{siteConfig.companyName}</span>
        </>
      )}
    </Link>
  );
}
