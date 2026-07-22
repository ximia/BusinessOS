import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, ArrowRight, Heart, GraduationCap, Clock } from "lucide-react";
import { jobOpenings, siteConfig } from "@/config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";

export const metadata: Metadata = buildMetadata({
  title: "Careers",
  description: `Join the team at ${siteConfig.companyName}.`,
  path: "/careers",
});

const perks = [
  { icon: Heart, title: "Work you're proud of", body: "No corner-cutting. You'll do things properly and stand behind the result." },
  { icon: GraduationCap, title: "Real training", body: "We invest in your skills — correction, coatings, and the craft behind them." },
  { icon: Clock, title: "Sane schedule", body: "Consistent hours and respect for your time outside of work." },
];

export default function CareersPage() {
  return (
    <>
      <PageHeader
        title="Do work you can be proud of"
        description="We're a small team that takes real pride in the craft. If you care about the details and want to get seriously good at this trade, we'd like to hear from you."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Careers" }]}
      />

      <section className="section">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3">
            {perks.map((perk) => (
              <div
                key={perk.title}
                className="rounded-2xl border border-border bg-card p-7"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <perk.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold">{perk.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{perk.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-muted/20">
        <div className="container">
          <h2 className="heading-md">Open positions</h2>
          <RevealGroup className="mt-8 space-y-4">
            {jobOpenings.map((job) => (
              <RevealItem key={job.slug}>
                <Link
                  href={`/careers/${job.slug}`}
                  className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-semibold">
                        {job.title}
                      </h3>
                      <Badge variant="muted">{job.type}</Badge>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {job.location} · {job.department}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    View role
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>
    </>
  );
}
