import type { Testimonial } from "@/types/content";
import type { HomeSectionType } from "@/features/website/sections.catalog";
import { Hero } from "@/components/sections/hero";
import { LogoStrip } from "@/components/sections/logo-strip";
import { AboutSection } from "@/components/sections/about-section";
import { ServicesSection } from "@/components/sections/services-section";
import { ProcessSection } from "@/components/sections/process-section";
import { BeforeAfterSection } from "@/components/sections/before-after-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { FaqSection } from "@/components/sections/faq-section";
import { ServiceAreaSection } from "@/components/sections/service-area-section";
import { ContactSection } from "@/components/sections/contact-section";
import { CtaSection } from "@/components/sections/cta-section";

/** Data the renderer needs to hydrate certain sections. */
export interface SectionRenderData {
  testimonials: Testimonial[];
}

/**
 * Render a single homepage section by its catalog type. Keeps the section →
 * component mapping in one place so the homepage (and future page builders) can
 * render an admin-defined, reorderable layout.
 */
export function renderSection(type: HomeSectionType, data: SectionRenderData) {
  switch (type) {
    case "hero":
      return <Hero />;
    case "logoStrip":
      return <LogoStrip />;
    case "services":
      return <ServicesSection />;
    case "about":
      return <AboutSection />;
    case "process":
      return <ProcessSection />;
    case "beforeAfter":
      return <BeforeAfterSection />;
    case "testimonials":
      return <TestimonialsSection testimonials={data.testimonials} />;
    case "serviceArea":
      return <ServiceAreaSection />;
    case "faq":
      return <FaqSection limit={6} />;
    case "contact":
      return <ContactSection />;
    case "cta":
      return <CtaSection />;
    default:
      return null;
  }
}
