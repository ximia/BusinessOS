import Link from "next/link";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { siteConfig } from "@/config";
import { Logo } from "@/components/shared/logo";
import { SocialIcons } from "@/components/shared/social-icons";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="mt-6">
              <SocialIcons links={siteConfig.socials} />
            </div>
          </div>

          {siteConfig.footerNav.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10" />

        <div className="grid gap-6 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
          <FooterContact icon={<Phone className="h-4 w-4" />} label="Call">
            <a href={`tel:${siteConfig.phoneRaw}`} className="hover:text-foreground">
              {siteConfig.phone}
            </a>
          </FooterContact>
          <FooterContact icon={<Mail className="h-4 w-4" />} label="Email">
            <a href={`mailto:${siteConfig.email}`} className="hover:text-foreground">
              {siteConfig.email}
            </a>
          </FooterContact>
          <FooterContact icon={<MapPin className="h-4 w-4" />} label="Visit">
            {siteConfig.address.formatted}
          </FooterContact>
          <FooterContact icon={<Clock className="h-4 w-4" />} label="Hours">
            {siteConfig.hours[0]?.day}: {siteConfig.hours[0]?.hours}
          </FooterContact>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {year} {siteConfig.legalName}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/admin" className="hover:text-foreground">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterContact({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-primary">
        {icon}
      </span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
          {label}
        </p>
        <p className="mt-0.5 text-foreground/90">{children}</p>
      </div>
    </div>
  );
}
