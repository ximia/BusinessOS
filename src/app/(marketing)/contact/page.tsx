import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { siteConfig } from "@/config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/shared/page-header";
import { QuoteForm } from "@/components/forms/quote-form";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = buildMetadata({
  title: "Contact & Quotes",
  description: `Request a free quote or get in touch with ${siteConfig.companyName}.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Request a free quote"
        description="Tell us about your vehicle and what you're after. We'll get back to you within one business day with an honest recommendation and price."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-[1.4fr_0.6fr] lg:gap-16">
          <Reveal>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <h2 className="font-display text-xl font-semibold">
                Quote request
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Fields marked with * are required.
              </p>
              <div className="mt-6">
                <QuoteForm />
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="space-y-6">
            <InfoCard icon={<Phone className="h-5 w-5" />} label="Call or text">
              <a href={`tel:${siteConfig.phoneRaw}`} className="hover:text-primary">
                {siteConfig.phone}
              </a>
            </InfoCard>
            <InfoCard icon={<Mail className="h-5 w-5" />} label="Email">
              <a href={`mailto:${siteConfig.email}`} className="hover:text-primary">
                {siteConfig.email}
              </a>
            </InfoCard>
            <InfoCard icon={<MapPin className="h-5 w-5" />} label="Based in">
              {siteConfig.address.formatted}
            </InfoCard>
            <InfoCard icon={<Clock className="h-5 w-5" />} label="Hours">
              <ul className="space-y-0.5">
                {siteConfig.hours.map((h) => (
                  <li key={h.day} className="flex justify-between gap-4">
                    <span>{h.day}</span>
                    <span className="text-muted-foreground">{h.hours}</span>
                  </li>
                ))}
              </ul>
            </InfoCard>
            {siteConfig.emergencyNote && (
              <p className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground/80">
                {siteConfig.emergencyNote}
              </p>
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}

function InfoCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-card p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="text-sm">
        <p className="font-medium text-foreground">{label}</p>
        <div className="mt-1 text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}
