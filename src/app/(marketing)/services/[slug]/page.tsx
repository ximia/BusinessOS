import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Check, ArrowRight, Phone } from "lucide-react";
import { services, getServiceBySlug, siteConfig } from "@/config";
import { getIcon } from "@/lib/icons";
import { buildMetadata, serviceJsonLd } from "@/lib/seo";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { CtaSection } from "@/components/sections/cta-section";
import { ServiceCard } from "@/components/shared/service-card";
import { Reveal } from "@/components/motion/reveal";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return buildMetadata({ title: "Service" });
  return buildMetadata({
    title: service.title,
    description: service.excerpt,
    path: `/services/${service.slug}`,
    image: service.image,
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const Icon = getIcon(service.icon);
  const related = services.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <>
      <PageHeader
        title={service.title}
        description={service.excerpt}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: service.title },
        ]}
      />

      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <div>
            {service.image && (
              <Reveal>
                <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl border border-border">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                    priority
                  />
                </div>
              </Reveal>
            )}

            <div className="prose-lg max-w-none space-y-5 text-[15px] leading-relaxed text-muted-foreground">
              {service.description.map((para, i) => (
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
                Final price depends on vehicle size and condition.
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
                    Book this service
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

      <section className="section bg-muted/20">
        <div className="container">
          <h2 className="heading-md">Other services you might want</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </div>
        </div>
      </section>

      <CtaSection />

      <Script
        id={`ld-service-${service.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            serviceJsonLd(service.title, service.excerpt)
          ),
        }}
      />
    </>
  );
}
