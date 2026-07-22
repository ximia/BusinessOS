import { Breadcrumb, type Crumb } from "@/components/ui/breadcrumb";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/**
 * Consistent hero header for interior pages: breadcrumb, title, and optional
 * lead paragraph over a restrained brand wash.
 */
export function PageHeader({
  title,
  description,
  breadcrumbs,
  className,
}: {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-border/70 bg-muted/20",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-[0.3] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
        aria-hidden
      />
      <div className="container py-16 md:py-20">
        {breadcrumbs && <Breadcrumb items={breadcrumbs} className="mb-6" />}
        <Reveal>
          <h1 className="heading-lg max-w-3xl text-balance">{title}</h1>
        </Reveal>
        {description && (
          <Reveal delay={0.06}>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
              {description}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
