import { galleryItems } from "@/config";
import { SectionHeading } from "@/components/shared/section-heading";
import { BeforeAfterSlider } from "@/components/shared/before-after-slider";
import { Reveal } from "@/components/motion/reveal";

export function BeforeAfterSection() {
  // Pick the first gallery item that has a before/after pair.
  const pair = galleryItems.find((g) => g.before && g.after);
  if (!pair?.before || !pair?.after) return null;

  return (
    <section id="results" className="section bg-muted/20">
      <div className="container grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            align="left"
            eyebrow="The difference"
            title="Real results, not a filter"
            description="Drag the handle to see the same panel before and after a correction. This is paint that's been polished — not photographed under flattering light."
          />
          <dl className="mt-8 grid grid-cols-2 gap-6">
            <div>
              <dt className="text-sm text-muted-foreground">Typical turnaround</dt>
              <dd className="mt-1 font-display text-2xl font-semibold">Same day</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Correction stages</dt>
              <dd className="mt-1 font-display text-2xl font-semibold">1–2</dd>
            </div>
          </dl>
        </div>

        <Reveal>
          <BeforeAfterSlider before={pair.before} after={pair.after} />
        </Reveal>
      </div>
    </section>
  );
}
