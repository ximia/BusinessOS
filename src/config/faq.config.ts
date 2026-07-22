import type { FaqItem } from "@/types/content";

export const faqs: FaqItem[] = [
  {
    question: "Do you come to me, or do I drop the car off?",
    answer:
      "We're fully mobile. We bring our own water and power and work at your home or office — you don't need to be present the whole time, just there to hand off and pick up the keys.",
    category: "Booking",
  },
  {
    question: "How long does a detail take?",
    answer:
      "An interior or maintenance service is typically 2–4 hours. Paint correction and ceramic coatings are half- to full-day jobs, occasionally two days for heavy correction. We'll give you an honest time estimate before we start.",
    category: "Services",
  },
  {
    question: "What's the difference between a wax and a ceramic coating?",
    answer:
      "A wax is a temporary layer that lasts a few weeks. A ceramic coating chemically bonds to the paint and lasts years, with far stronger water-beading and stain resistance. If you keep your cars a while, a coating is almost always the better value.",
    category: "Services",
  },
  {
    question: "Will paint correction damage my clear coat?",
    answer:
      "Not the way we do it. We measure clear-coat thickness before starting and always use the least aggressive method that removes the defects. We'd rather leave a hairline than risk your paint.",
    category: "Services",
  },
  {
    question: "How should I maintain the car after a detail?",
    answer:
      "Skip automatic washes — they're the number-one cause of swirl marks. A proper hand wash every couple of weeks, or our recurring maintenance wash, keeps corrected and coated paint looking its best.",
    category: "Aftercare",
  },
  {
    question: "What areas do you serve?",
    answer:
      "We cover Portland and the surrounding metro — Lake Oswego, Beaverton, Tigard, West Linn, and more. If you're just outside the area, reach out; we can often make it work.",
    category: "Booking",
  },
  {
    question: "How do I pay, and do you require a deposit?",
    answer:
      "We accept card, tap-to-pay, and bank transfer. Larger coating jobs take a small deposit to hold the date; everything else is paid on completion once you're happy with the work.",
    category: "Booking",
  },
];

export function getFaqCategories(): string[] {
  return Array.from(new Set(faqs.map((f) => f.category).filter(Boolean))) as string[];
}
