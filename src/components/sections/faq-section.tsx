import { faqs } from "@/config";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/motion/reveal";

export function FaqSection({ limit }: { limit?: number }) {
  const items = limit ? faqs.slice(0, limit) : faqs;

  return (
    <section id="faq" className="section bg-muted/20">
      <div className="container grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <SectionHeading
          align="left"
          eyebrow="FAQ"
          title="Questions, answered"
          description="Still unsure about something? Reach out — we're happy to talk it through with no pressure."
        />

        <Reveal>
          <Accordion type="single" collapsible className="w-full">
            {items.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
