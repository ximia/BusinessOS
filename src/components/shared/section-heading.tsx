import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";

/**
 * Consistent section heading: optional eyebrow, title, and lead paragraph.
 * Used across every marketing section for a cohesive rhythm.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <Reveal>
          <span className="eyebrow">
            <span className="h-px w-6 bg-primary/50" aria-hidden />
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2 className="heading-lg mt-4 text-balance">{title}</h2>
      </Reveal>
      {description && (
        <Reveal delay={0.1}>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
