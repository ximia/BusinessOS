import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, ArrowRight } from "lucide-react";
import { siteConfig } from "@/config";
import { buildMetadata } from "@/lib/seo";
import { areas, allServices } from "@/features/local-seo/local-seo";
import { PageHeader } from "@/components/shared/page-header";
import { CtaSection } from "@/components/sections/cta-section";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = buildMetadata({
  title: "Service areas",
  description: `Areas ${siteConfig.companyName} serves — professional ${siteConfig.industry.toLowerCase()} across ${siteConfig.serviceAreas
    .map((a) => a.name)
    .slice(0, 4)
    .join(", ")} and more.`,
  path: "/areas",
});

export default function AreasHubPage() {
  const list = areas();
  const svc = allServices();

  return (
    <>
      <PageHeader
        title="Areas we serve"
        description={`Local ${siteConfig.industry.toLowerCase()} across the region. Find your city for services, pricing, and booking.`}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Service areas" }]}
      />

      <section className="section">
        <div className="container">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((area) => (
              <Reveal key={area.slug}>
                <Link
                  href={`/areas/${area.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/40"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <h2 className="mt-4 font-semibold">{area.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {area.note ??
                      `${siteConfig.industry} in ${area.name} and nearby.`}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    View {area.name}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>

          {/* Popular service × city links for crawlability */}
          <div className="mt-14">
            <h2 className="heading-md">Popular services by area</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {list.slice(0, 6).flatMap((area) =>
                svc.slice(0, 3).map((service) => (
                  <Link
                    key={`${area.slug}-${service.slug}`}
                    href={`/areas/${area.slug}/${service.slug}`}
                    className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {service.title} in {area.name}
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
