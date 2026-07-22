import { processSteps } from "@/config";
import { getIcon } from "@/lib/icons";
import { SectionHeading } from "@/components/shared/section-heading";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";

export function ProcessSection() {
  return (
    <section id="process" className="section">
      <div className="container">
        <SectionHeading
          eyebrow="How it works"
          title="Booking us is refreshingly simple"
          description="No phone tag, no pushy upsells. Four steps from first message to a car that looks better than the day you bought it."
        />

        <RevealGroup className="relative mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Connecting line on desktop */}
          <div
            className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
            aria-hidden
          />
          {processSteps.map((step) => {
            const Icon = getIcon(step.icon);
            return (
              <RevealItem key={step.step} className="relative">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card text-primary shadow-sm">
                  <Icon className="h-6 w-6" />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {step.step}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
