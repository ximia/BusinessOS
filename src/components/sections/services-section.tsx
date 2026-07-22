import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { services } from "@/config";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { ServiceCard } from "@/components/shared/service-card";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";

export function ServicesSection() {
  return (
    <section id="services" className="section bg-muted/20">
      <div className="container">
        <SectionHeading
          eyebrow="What we do"
          title="Detailing services, done to a higher standard"
          description="From a quick maintenance wash to multi-stage paint correction and ceramic coatings — the right level of care for your car and your budget."
        />

        <RevealGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <RevealItem key={service.slug}>
              <ServiceCard service={service} className="h-full" />
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="mt-12 flex justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/services">
              View all services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
