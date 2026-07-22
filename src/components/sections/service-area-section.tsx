import { MapPin } from "lucide-react";
import { siteConfig } from "@/config";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/motion/reveal";

export function ServiceAreaSection() {
  return (
    <section id="service-area" className="section">
      <div className="container grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Service area"
            title={`Proudly serving ${siteConfig.address.city} & the surrounding metro`}
            description="We come to you. If you're near any of these neighborhoods, we've likely got you covered — and if you're just outside, ask."
          />

          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {siteConfig.serviceAreas.map((area) => (
              <li
                key={area.name}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm"
              >
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate">{area.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
            <iframe
              title={`Map of ${siteConfig.companyName} service area`}
              src={siteConfig.mapEmbedUrl}
              width="100%"
              height="420"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale-[0.2]"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
