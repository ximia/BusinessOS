import type { Metadata } from "next";
import { services } from "@/config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/shared/page-header";
import { ServiceCard } from "@/components/shared/service-card";
import { ProcessSection } from "@/components/sections/process-section";
import { CtaSection } from "@/components/sections/cta-section";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";

export const metadata: Metadata = buildMetadata({
  title: "Services",
  description:
    "Our full range of detailing services — from maintenance washes to paint correction and ceramic coatings.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        title="Detailing services for every kind of car and budget"
        description="Whether you want a quick refresh or a full transformation, there's a service here that fits. Not sure which? We'll point you the right way."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
      />

      <section className="section">
        <div className="container">
          <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <RevealItem key={service.slug}>
                <ServiceCard service={service} className="h-full" />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <ProcessSection />
      <CtaSection />
    </>
  );
}
