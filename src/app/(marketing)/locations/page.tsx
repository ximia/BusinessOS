import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, Phone, Clock, ArrowRight } from "lucide-react";
import { locations, siteConfig } from "@/config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/shared/page-header";
import { CtaSection } from "@/components/sections/cta-section";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = buildMetadata({
  title: "Locations",
  description: `Visit ${siteConfig.companyName} — ${locations.length} locations across the region. Find addresses, hours, and phone numbers.`,
  path: "/locations",
});

export default function LocationsHubPage() {
  return (
    <>
      <PageHeader
        title="Our locations"
        description={`Find the ${siteConfig.companyName} nearest you — addresses, hours, and direct lines for each studio.`}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Locations" }]}
      />

      <section className="section">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {locations.map((location) => (
              <Reveal key={location.slug}>
                <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <h2 className="font-semibold">{location.name}</h2>
                  </div>
                  {location.note && (
                    <p className="mt-3 text-sm text-muted-foreground">{location.note}</p>
                  )}
                  <dl className="mt-4 space-y-2.5 text-sm">
                    <div className="flex gap-2.5">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <dd>{location.address.formatted}</dd>
                    </div>
                    <div className="flex gap-2.5">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <dd>
                        <a href={`tel:${location.phoneRaw}`} className="hover:text-primary">
                          {location.phone}
                        </a>
                      </dd>
                    </div>
                    <div className="flex gap-2.5">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <dd className="text-muted-foreground">
                        {location.hours[0]?.day}: {location.hours[0]?.hours}
                      </dd>
                    </div>
                  </dl>
                  <Link
                    href={`/locations/${location.slug}`}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    View {location.name}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
