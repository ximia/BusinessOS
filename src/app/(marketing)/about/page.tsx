import Image from "next/image";
import type { Metadata } from "next";
import { siteConfig, team } from "@/config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/shared/page-header";
import { CtaSection } from "@/components/sections/cta-section";
import { SectionHeading } from "@/components/shared/section-heading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RevealGroup, RevealItem, Reveal } from "@/components/motion/reveal";
import { initials } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description: `The story and people behind ${siteConfig.companyName}.`,
  path: "/about",
});

const values = [
  {
    title: "Craft over speed",
    body: "We'd rather do one car properly than rush three. Quality is the whole point.",
  },
  {
    title: "Honest to a fault",
    body: "We tell you what your car needs and what it doesn't — even when it costs us the sale.",
  },
  {
    title: "Respect your property",
    body: "We work clean, tidy up after ourselves, and treat your driveway like our own.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="A detailing studio built on doing it right"
        description={`Since ${siteConfig.foundedYear}, we've grown from a one-person garage operation into a small team that shares one obsession: cars that leave looking better than new.`}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      <section className="section">
        <div className="container grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border">
              <Image
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=900&q=80"
                alt="The team at work"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <div>
            <SectionHeading
              align="left"
              eyebrow="Our story"
              title="It started with one frustrated car owner"
            />
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
              <p>
                Our founder kept paying good money for details that didn&apos;t
                last — swirled paint, missed spots, that faint chemical smell
                that never quite left. So she learned to do it herself, properly,
                and people started asking who did her car.
              </p>
              <p>
                {siteConfig.companyName} is the result: a service run by people
                who genuinely care, using the right products and taking the time
                each vehicle deserves. No franchise playbook, no corner-cutting —
                just careful work and straight talk.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-muted/20">
        <div className="container">
          <SectionHeading
            eyebrow="What we stand for"
            title="The principles behind every appointment"
          />
          <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3">
            {values.map((v) => (
              <RevealItem
                key={v.title}
                className="rounded-2xl border border-border bg-card p-7"
              >
                <h3 className="font-display text-lg font-semibold tracking-tight">
                  {v.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  {v.body}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="The team"
            title="The people who'll be looking after your car"
          />
          <RevealGroup className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <RevealItem key={member.id} className="text-center">
                <Avatar className="mx-auto h-24 w-24">
                  {member.avatar && (
                    <AvatarImage src={member.avatar} alt={member.name} />
                  )}
                  <AvatarFallback className="text-lg">
                    {initials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mt-4 font-display text-lg font-semibold">
                  {member.name}
                </h3>
                <p className="text-sm font-medium text-primary">{member.role}</p>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {member.bio}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
