import type { ProcessStep } from "@/types/content";

/** The "how it works" steps shown on the homepage Process section. */
export const processSteps: ProcessStep[] = [
  {
    step: 1,
    title: "Tell us about your car",
    description:
      "Send a few photos and what's bothering you. We'll recommend the right service — no upsells for work you don't need.",
    icon: "clipboard",
  },
  {
    step: 2,
    title: "Book a time that works",
    description:
      "Pick a morning that suits you. We come to your home or office with our own water and power.",
    icon: "calendar",
  },
  {
    step: 3,
    title: "We do the work",
    description:
      "One detailer, one car, start to finish. We treat every vehicle like it's staying in the family.",
    icon: "wrench",
  },
  {
    step: 4,
    title: "You get it back better than new",
    description:
      "We walk you through what we did and how to keep it that way. If anything's off, we make it right.",
    icon: "handshake",
  },
];
