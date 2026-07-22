import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Check, MapPin } from "lucide-react";
import { jobOpenings, getJobBySlug, siteConfig } from "@/config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function generateStaticParams() {
  return jobOpenings.map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = getJobBySlug(slug);
  if (!job) return buildMetadata({ title: "Careers" });
  return buildMetadata({
    title: job.title,
    description: job.summary,
    path: `/careers/${job.slug}`,
  });
}

export default async function JobPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = getJobBySlug(slug);
  if (!job) notFound();

  return (
    <>
      <PageHeader
        title={job.title}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Careers", href: "/careers" },
          { label: job.title },
        ]}
      />

      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-[1.4fr_0.6fr] lg:gap-16">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="muted">{job.type}</Badge>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {job.location}
              </span>
            </div>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {job.summary}
            </p>

            <JobList title="What you'll do" items={job.responsibilities} />
            <JobList title="What we're looking for" items={job.requirements} />
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
              <h2 className="font-display text-lg font-semibold">
                Interested?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Send a short note about yourself and any relevant experience.
                We read every application.
              </p>
              <Button asChild size="lg" className="mt-6 w-full">
                <a
                  href={`mailto:${siteConfig.email}?subject=Application: ${job.title}`}
                >
                  Apply for this role
                </a>
              </Button>
              <Button asChild variant="outline" className="mt-2.5 w-full">
                <Link href="/careers">Back to all roles</Link>
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function JobList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-10">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[15px] leading-relaxed">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-foreground/90">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
