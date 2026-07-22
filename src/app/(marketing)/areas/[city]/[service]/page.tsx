import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Check, ArrowRight, Phone, ChevronRight } from "lucide-react";
import { services, getServiceBySlug, siteConfig } from "@/config";
import { getIcon } from "@/lib/icons";
import {
  buildMetadata,
  serviceJsonLd,
  faqJsonLd,
  breadcrumbJsonLd,
} from "@/lib/seo";
import {
  areas,
  getAreaBySlug,
  nearbyAreas,
  cityServiceIntro,
  cityServiceFaq,
} from "@/features/local-seo/local-seo";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { CtaSection } from "@/components/sections/cta-section";
import { Reveal } from "@/components/motion/reveal";

export function generateStaticParams() {
  return areas().flatMap((area) =>
    services.map((service) => ({ city: area.slug, service: service.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; service: string }>;
}): Promise<Metadata> {
  const { city, service: serviceSlug } = await params;
  const area = getAreaBySlug(city);
  const service = getServiceBySlug(serviceSlug);
  if (!area || !service) return buildMetadata({ title: "Service" });
  return buildMetadata({
    title: `${service.title} in ${area.name}`,
    description: `${service.title} in ${area.name} by ${siteConfig.companyName}. ${service.excerpt}`,
    path: `/areas/${area.slug}/${service.slug}`,
    image: service.image,
  });
}

export default async function CityServicePage({
  params,
}: {
  params: Promise<{ city: string; service: string }>;
}) {
  const { city, service: serviceSlug } = await params;
  const area = getAreaBySlug(city);
  const service = getServiceBySlug(serviceSlug);
  if (!area || !service) notFound();

  const Icon = getIcon(service.icon);
  const intro = cityServiceIntro(area, service);
  const faq = cityServiceFaq(area, service);
  const nearby = nearbyAreas(area.slug);
  const otherServices = services.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <>
      <PageHeader
        title={`${service.title} in ${area.name}`}
        description={service.excerpt}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Service areas", href: "/areas" },
          { label: area.name, href: `/areas/${area.slug}` },
          { label: service.title },
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

            {service.highlights && service.highlights.length > 0 && (
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {service.highlights.map((h) => {
                  const HIcon = getIcon(h.icon);
                  return (
                    <div
                      key={h.title}
                      className="rounded-2xl border border-border bg-card p-6"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <HIcon className="h-5 w-5" />
                      </span>
                      <h3 className="mt-4 font-semibold">{h.title}</h3>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        {h.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Localized FAQ */}
            <h2 className="mt-12 font-display text-xl font-semibold tracking-tight">
              {service.title} in {area.name} — FAQs
            </h2>
            <Accordion type="single" collapsible className="mt-4">
              {faq.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger>{f.question}</AccordionTrigger>
                  <AccordionContent>{f.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Sticky booking rail */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </span>
              {service.price && (
                <p className="mt-5 font-display text-2xl font-semibold">
                  {service.price}
                </p>
              )}
              <p className="mt-1 text-sm text-muted-foreground">
                {service.title} for {area.name} — final price depends on vehicle
                size and condition.
              </p>

              <ul className="mt-6 space-y-3">
                {service.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-foreground/90">{f}</span>
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

              <Link
                href={`/services/${service.slug}`}
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Full {service.title} details
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Internal links: same service in nearby cities + other services here */}
      <section className="section bg-muted/20">
        <div className="container grid gap-10 md:grid-cols-2">
          {nearby.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight">
                {service.title} in nearby areas
              </h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {nearby.map((n) => (
                  <Link
                    key={n.slug}
                    href={`/areas/${n.slug}/${service.slug}`}
                    className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {service.title} in {n.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Other services in {area.name}
            </h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {otherServices.map((s) => (
                <Reveal key={s.slug}>
                  <Link
                    href={`/areas/${area.slug}/${s.slug}`}
                    className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {s.title} in {area.name}
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CtaSection />

      <Script
        id={`ld-${area.slug}-${service.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            serviceJsonLd(
              `${service.title} in ${area.name}`,
              service.excerpt,
              [area.name]
            ),
            faqJsonLd(faq),
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Service areas", path: "/areas" },
              { name: area.name, path: `/areas/${area.slug}` },
              {
                name: service.title,
                path: `/areas/${area.slug}/${service.slug}`,
              },
            ]),
          ]),
        }}
      />
    </>
  );
}
