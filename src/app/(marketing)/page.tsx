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
import { getApprovedTestimonials } from "@/services/reviews.service";

export default async function HomePage() {
  const testimonials = await getApprovedTestimonials();

  return (
    <>
      <Hero />
      <LogoStrip />
      <ServicesSection />
      <AboutSection />
      <ProcessSection />
      <BeforeAfterSection />
      <TestimonialsSection testimonials={testimonials} />
      <ServiceAreaSection />
      <FaqSection limit={6} />
      <ContactSection />
      <CtaSection />
    </>
  );
}
