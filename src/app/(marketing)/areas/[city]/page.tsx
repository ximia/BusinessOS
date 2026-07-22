import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Check, ArrowRight, Phone, MapPin } from "lucide-react";
import { siteConfig } from "@/config";
import { getIcon } from "@/lib/icons";
import {
  buildMetadata,
  localBusinessJsonLd,
  breadcrumbJsonLd,
} from "@/lib/seo";
import {
  areas,
  getAreaBySlug,
  nearbyAreas,
  allServices,
  cityIntro,
  localWhyUs,
} from "@/features/local-seo/local-seo";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { CtaSection } from "@/components/sections/cta-section";

export function generateStaticParams() {
  return areas().map((a) => ({ city: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const area = getAreaBySlug(city);
  if (!area) return buildMetadata({ title: "Service area" });
  return buildMetadata({
    title: `${siteConfig.industry} in ${area.name}`,
    description: `${siteConfig.companyName} provides ${siteConfig.industry.toLowerCase()} in ${area.name}. Services, pricing, and easy booking for ${area.name} drivers.`,
    path: `/areas/${area.slug}`,
  });
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const area = getAreaBySlug(city);
  if (!area) notFound();

  const intro = cityIntro(area);
  const why = localWhyUs(area);
  const services = allServices();
  const nearby = nearbyAreas(area.slug);

  return (
    <>
      <PageHeader
        title={`${siteConfig.industry} in ${area.name}`}
        description={`${siteConfig.companyName} — trusted ${siteConfig.industry.toLowerCase()} for ${area.name} and the surrounding area.`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Service areas", href: "/areas" },
          { label: area.name },
        ]}
      />

      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <div>
            <div className="space-y-5 text-[15px] leading-relaxed text-muted-foreground">
              {intro.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <h2 className="mt-12 font-display text-xl font-semibold tracking-tight">
              Our services in {area.name}
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {services.map((service) => {
                const Icon = getIcon(service.icon);
                return (
                  <Link
                    key={service.slug}
                    href={`/areas/${area.slug}/${service.slug}`}
                    className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 font-semibold">
                      {service.title} in {area.name}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {service.excerpt}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                      Learn more
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sticky rail */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="h-6 w-6" />
              </span>
              <h2 className="mt-5 font-semibold">Why {area.name} chooses us</h2>
              <ul className="mt-4 space-y-3">
                {why.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-col gap-2.5">
                <Button asChild size="lg">
                  <Link href="/contact">
                    Book in {area.name}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href={`tel:${siteConfig.phoneRaw}`}>
                    <Phone className="h-4 w-4" />
                    {siteConfig.phone}
                  </a>
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {nearby.length > 0 && (
        <section className="section bg-muted/20">
          <div className="container">
            <h2 className="heading-md">Nearby areas we serve</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {nearby.map((n) => (
                <Link
                  key={n.slug}
                  href={`/areas/${n.slug}`}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {n.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaSection />

      <Script
        id={`ld-area-${area.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            localBusinessJsonLd([area.name]),
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Service areas", path: "/areas" },
              { name: area.name, path: `/areas/${area.slug}` },
            ]),
          ]),
        }}
      />
    </>
  );
}
