import Link from "next/link";
import Image from "next/image";
import { Check, ArrowRight } from "lucide-react";
import { siteConfig } from "@/config";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

const points = [
  "One detailer per car, from start to finish — never rushed through an assembly line.",
  "Honest recommendations. We'll talk you out of work you don't need.",
  "Fully mobile, fully insured, and meticulous about your property.",
];

export function AboutSection() {
  return (
    <section id="about" className="section">
      <div className="container grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal className="relative order-last lg:order-first">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border">
            <Image
              src="https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=900&q=80"
              alt="A detailer carefully working on a car's finish"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -right-4 -top-4 hidden rounded-2xl border border-border bg-card p-4 shadow-xl sm:block">
            <p className="font-display text-3xl font-semibold">
              {new Date().getFullYear() - siteConfig.foundedYear}+
            </p>
            <p className="text-xs text-muted-foreground">years in business</p>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <span className="eyebrow">
              <span className="h-px w-6 bg-primary/50" aria-hidden />
              About us
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="heading-lg mt-4 text-balance">
              We treat every car like it&apos;s staying in the family
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
              {siteConfig.companyName} started in a single-car garage in{" "}
              {siteConfig.foundedYear}, out of frustration with shops that cut
              corners. We built the kind of detailing service we&apos;d want for
              our own cars — patient, precise, and straight with you about what
              your vehicle actually needs.
            </p>
          </Reveal>

          <ul className="mt-8 space-y-4">
            {points.map((point, i) => (
              <Reveal as="li" key={i} delay={0.12 + i * 0.06} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-4 w-4" />
                </span>
                <span className="text-[15px] leading-relaxed text-foreground/90">
                  {point}
                </span>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.3}>
            <Button asChild variant="outline" className="mt-8">
              <Link href="/about">
                More about our story
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
