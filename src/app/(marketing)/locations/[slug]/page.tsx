import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react";
import { locations, getLocationBySlug, siteConfig } from "@/config";
import { buildMetadata, locationJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { getApprovedTestimonials } from "@/services/reviews.service";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { TestimonialCard } from "@/components/shared/testimonial-card";
import { CtaSection } from "@/components/sections/cta-section";
import { Reveal } from "@/components/motion/reveal";

export function generateStaticParams() {
  return locations.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const location = getLocationBySlug(slug);
  if (!location) return buildMetadata({ title: "Location" });
  return buildMetadata({
    title: `${location.name} — ${siteConfig.industry}`,
    description: `${siteConfig.companyName} in ${location.address.city}. Address, hours, phone, and directions. ${location.note ?? ""}`.trim(),
    path: `/locations/${location.slug}`,
  });
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const location = getLocationBySlug(slug);
  if (!location) notFound();

  const allTestimonials = await getApprovedTestimonials();
  const reviews = (
    location.reviewServices?.length
      ? allTestimonials.filter(
          (t) => t.service && location.reviewServices!.includes(t.service)
        )
      : allTestimonials.filter((t) => t.featured)
  ).slice(0, 3);
  const fallbackReviews = reviews.length ? reviews : allTestimonials.slice(0, 3);

  const others = locations.filter((l) => l.slug !== location.slug);

  return (
    <>
      <PageHeader
        title={location.name}
        description={location.note ?? `${siteConfig.companyName} in ${location.address.city}`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Locations", href: "/locations" },
          { label: location.name },
        ]}
      />

      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
          {/* Details */}
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard icon={MapPin} label="Address">
                {location.address.formatted}
              </InfoCard>
              <InfoCard icon={Phone} label="Phone">
                <a href={`tel:${location.phoneRaw}`} className="hover:text-primary">
                  {location.phone}
                </a>
              </InfoCard>
              {location.email && (
                <InfoCard icon={Mail} label="Email">
                  <a href={`mailto:${location.email}`} className="hover:text-primary">
                    {location.email}
                  </a>
                </InfoCard>
              )}
              <InfoCard icon={Clock} label="Hours">
                <ul className="space-y-1">
                  {location.hours.map((h) => (
                    <li key={h.day} className="flex justify-between gap-3">
                      <span className="text-muted-foreground">{h.day}</span>
                      <span>{h.hours}</span>
                    </li>
                  ))}
                </ul>
              </InfoCard>
            </div>

            {location.serviceAreas && location.serviceAreas.length > 0 && (
              <div>
                <h2 className="font-display text-lg font-semibold tracking-tight">
                  Areas served from {location.name}
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {location.serviceAreas.map((area) => (
                    <span
                      key={area}
                      className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/contact">
                  Book at {location.name}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={`tel:${location.phoneRaw}`}>
                  <Phone className="h-4 w-4" />
                  {location.phone}
                </a>
              </Button>
            </div>
          </div>

          {/* Map */}
          {location.mapEmbedUrl && (
            <Reveal>
              <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
                <iframe
                  title={`Map of ${siteConfig.companyName} — ${location.name}`}
                  src={location.mapEmbedUrl}
                  width="100%"
                  height="440"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale-[0.2]"
                />
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* Reviews */}
      {fallbackReviews.length > 0 && (
        <section className="section bg-muted/20">
          <div className="container">
            <h2 className="heading-md">What {location.address.city} customers say</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {fallbackReviews.map((t) => (
                <TestimonialCard key={t.id} testimonial={t} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Other locations */}
      {others.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="heading-md">Other locations</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {others.map((l) => (
                <Link
                  key={l.slug}
                  href={`/locations/${l.slug}`}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {l.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaSection />

      <Script
        id={`ld-location-${location.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            locationJsonLd(location),
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Locations", path: "/locations" },
              { name: location.name, path: `/locations/${location.slug}` },
            ]),
          ]),
        }}
      />
    </>
  );
}

function InfoCard({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-2 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
