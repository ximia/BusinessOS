import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { siteConfig } from "@/config";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

/**
 * Reusable full-width call-to-action band. Drop it near the bottom of any page.
 */
export function CtaSection({
  title = "Ready to see your car at its best?",
  description = "Book a free quote today. Tell us about your vehicle and we'll recommend the right service — no pressure, no upsells.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="section">
      <div className="container">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary px-8 py-14 text-center text-primary-foreground md:px-16 md:py-20">
            <div
              className="pointer-events-none absolute inset-0 bg-grid opacity-10 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
              aria-hidden
            />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                {title}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80 text-pretty">
                {description}
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/contact">
                    Get a free quote
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <a href={`tel:${siteConfig.phoneRaw}`}>
                    <Phone className="h-4 w-4" />
                    {siteConfig.phone}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
