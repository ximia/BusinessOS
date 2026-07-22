import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { siteConfig } from "@/config";
import { SectionHeading } from "@/components/shared/section-heading";
import { ContactForm } from "@/components/forms/contact-form";
import { Reveal } from "@/components/motion/reveal";

export function ContactSection() {
  return (
    <section id="contact" className="section">
      <div className="container">
        <SectionHeading
          eyebrow="Get in touch"
          title="Let's get your car booked in"
          description="Send a message and we'll reply within a business day, or call if you'd rather talk it through."
        />

        <div className="mx-auto mt-14 grid max-w-5xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal className="space-y-6">
            <ContactDetail icon={<Phone className="h-5 w-5" />} label="Call or text">
              <a href={`tel:${siteConfig.phoneRaw}`} className="hover:text-primary">
                {siteConfig.phone}
              </a>
            </ContactDetail>
            <ContactDetail icon={<Mail className="h-5 w-5" />} label="Email">
              <a href={`mailto:${siteConfig.email}`} className="hover:text-primary">
                {siteConfig.email}
              </a>
            </ContactDetail>
            <ContactDetail icon={<MapPin className="h-5 w-5" />} label="Based in">
              {siteConfig.address.formatted}
            </ContactDetail>
            <ContactDetail icon={<Clock className="h-5 w-5" />} label="Hours">
              <ul className="space-y-0.5">
                {siteConfig.hours.map((h) => (
                  <li key={h.day} className="flex justify-between gap-6">
                    <span>{h.day}</span>
                    <span className="text-muted-foreground">{h.hours}</span>
                  </li>
                ))}
              </ul>
            </ContactDetail>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ContactDetail({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="text-sm">
        <p className="font-medium text-foreground">{label}</p>
        <div className="mt-1 text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}
