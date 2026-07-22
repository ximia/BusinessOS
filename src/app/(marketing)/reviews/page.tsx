import type { Metadata } from "next";
import { Star } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { getApprovedTestimonials } from "@/services/reviews.service";
import { PageHeader } from "@/components/shared/page-header";
import { TestimonialCard } from "@/components/shared/testimonial-card";
import { CtaSection } from "@/components/sections/cta-section";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";

export const metadata: Metadata = buildMetadata({
  title: "Reviews",
  description: "What our customers say about working with us.",
  path: "/reviews",
});

export default async function ReviewsPage() {
  const reviews = await getApprovedTestimonials();
  const avg =
    reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1);

  return (
    <>
      <PageHeader
        title="What our customers say"
        description="We've built this business on referrals and repeat customers. Here's why."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Reviews" }]}
      />

      <section className="section">
        <div className="container">
          <div className="mb-12 flex flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-6 w-6 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <p className="font-display text-3xl font-semibold">
              {avg.toFixed(1)} out of 5
            </p>
            <p className="text-sm text-muted-foreground">
              Based on {reviews.length} verified customer reviews
            </p>
          </div>

          <RevealGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <RevealItem key={r.id}>
                <TestimonialCard testimonial={r} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
