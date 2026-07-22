import { cn } from "@/lib/utils";

export interface LegalSection {
  heading: string;
  body: string[];
}

/** Renders a legal document's sections with consistent typographic rhythm. */
export function LegalContent({
  sections,
  className,
}: {
  sections: LegalSection[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-10", className)}>
      {sections.map((section, i) => (
        <section key={i}>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            {i + 1}. {section.heading}
          </h2>
          <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted-foreground">
            {section.body.map((para, j) => (
              <p key={j}>{para}</p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
