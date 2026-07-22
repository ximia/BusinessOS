import { SectionHeading } from "@/components/shared/section-heading";
import { TestimonialCard } from "@/components/shared/testimonial-card";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import type { Testimonial } from "@/types/content";

export function TestimonialsSection({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const featured = testimonials.filter((t) => t.featured).slice(0, 3);
  const list = featured.length >= 3 ? featured : testimonials.slice(0, 3);

  return (
    <section id="testimonials" className="section">
      <div className="container">
        <SectionHeading
          eyebrow="Reviews"
          title="Owners who don't leave their cars to just anyone"
          description="A few words from people who care about their vehicles as much as we do."
        />

        <RevealGroup className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => (
            <RevealItem key={t.id}>
              <TestimonialCard testimonial={t} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
