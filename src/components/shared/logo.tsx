import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config";
import { cn } from "@/lib/utils";

/**
 * Brand logo. Renders the configured image if a logo `src` is set, otherwise a
 * clean typographic wordmark — so the template looks finished before a client
 * uploads their logo. Values default to `siteConfig` but can be overridden with
 * live Business Settings (passed by the navbar/footer).
 */
export function Logo({
  className,
  name = siteConfig.companyName,
  src = siteConfig.logo.src,
  alt = siteConfig.logo.alt,
}: {
  className?: string;
  name?: string;
  src?: string;
  alt?: string;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight",
        className
      )}
      aria-label={name}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
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
            {name.charAt(0)}
          </span>
          <span>{name}</span>
        </>
      )}
    </Link>
  );
}
