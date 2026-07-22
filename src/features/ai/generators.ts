import { siteConfig, services } from "@/config";

/**
 * AI tools (Priority 8) — the catalog of content generators. Each generator is
 * provider-agnostic: it declares its input fields, builds a system+user prompt
 * from the inputs and the site's business context, and provides a templated
 * demo output so the admin is explorable without an API key. The provider that
 * actually runs the prompt lives in `provider.ts` (server-only).
 *
 * Pure module (no SDK import) so it is safe on both client and server.
 */

export type FieldType = "text" | "textarea" | "select";

export interface GeneratorField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  help?: string;
}

export interface GeneratorRequest {
  system: string;
  user: string;
  maxTokens: number;
}

export interface Generator {
  id: string;
  name: string;
  description: string;
  category: "marketing" | "seo" | "support";
  icon: string;
  fields: GeneratorField[];
  build: (inputs: Record<string, string>) => GeneratorRequest;
  demo: (inputs: Record<string, string>) => string;
}

/** Shared brand context prepended to every system prompt. */
function brandContext(): string {
  return [
    `You write for ${siteConfig.companyName}, a ${siteConfig.industry.toLowerCase()} in ${siteConfig.address.city}.`,
    `Voice: confident, warm, specific, and honest — no hype, no fake statistics, no emoji.`,
    `Services offered: ${services.map((s) => s.title).join(", ")}.`,
  ].join(" ");
}

const v = (inputs: Record<string, string>, key: string, fallback = "") =>
  (inputs[key] ?? "").trim() || fallback;

export const GENERATORS: Generator[] = [
  {
    id: "service-copy",
    name: "Service description",
    description: "Compelling copy for a service page.",
    category: "marketing",
    icon: "sparkles",
    fields: [
      { key: "service", label: "Service", type: "text", placeholder: "Ceramic coating", required: true },
      { key: "points", label: "Key points (optional)", type: "textarea", placeholder: "5-year protection, hydrophobic, gloss…" },
    ],
    build: (i) => ({
      system: `${brandContext()} Write website copy for a single service. Return 2–3 short paragraphs of plain prose — no headings, no lists.`,
      user: `Service: ${v(i, "service")}.${
        v(i, "points") ? ` Emphasize: ${v(i, "points")}.` : ""
      } Write persuasive but honest copy a customer would read on the service page.`,
      maxTokens: 900,
    }),
    demo: (i) =>
      `Our ${v(i, "service", "service")} is built around one idea: doing it properly, the first time. We take the time to assess your vehicle, prep every surface, and use products we'd put on our own cars.\n\nYou'll see the difference up close — and so will everyone else. Book a slot and we'll walk you through exactly what's involved, with pricing that's clear before we start.`,
  },
  {
    id: "faqs",
    name: "FAQ writer",
    description: "Question-and-answer pairs for a topic.",
    category: "marketing",
    icon: "help-circle",
    fields: [
      { key: "topic", label: "Topic", type: "text", placeholder: "Ceramic coating", required: true },
      { key: "count", label: "How many", type: "select", options: ["3", "5", "8"] },
    ],
    build: (i) => ({
      system: `${brandContext()} Write a customer FAQ. Format each item as "Q: …" on one line and "A: …" on the next, separated by a blank line.`,
      user: `Write ${v(i, "count", "5")} frequently asked questions and honest answers about ${v(i, "topic")}.`,
      maxTokens: 1200,
    }),
    demo: (i) =>
      `Q: How long does ${v(i, "topic", "this service")} take?\nA: Most jobs are a half to full day depending on vehicle size and condition. We'll give you a firm estimate before booking.\n\nQ: How much does it cost?\nA: Pricing depends on size and condition. Contact us for a fast, no-obligation quote.\n\nQ: Do I need to prepare anything?\nA: Just remove personal items. We handle the rest.`,
  },
  {
    id: "blog-post",
    name: "Blog draft",
    description: "A first draft blog article in Markdown.",
    category: "marketing",
    icon: "newspaper",
    fields: [
      { key: "title", label: "Title / topic", type: "text", placeholder: "Is ceramic coating worth it?", required: true },
      { key: "audience", label: "Audience (optional)", type: "text", placeholder: "New car owners" },
    ],
    build: (i) => ({
      system: `${brandContext()} Write a helpful, non-salesy blog article in Markdown with a short intro, 3–4 subheadings, and a brief conclusion.`,
      user: `Title/topic: ${v(i, "title")}.${
        v(i, "audience") ? ` Audience: ${v(i, "audience")}.` : ""
      } Write the article.`,
      maxTokens: 2000,
    }),
    demo: (i) =>
      `# ${v(i, "title", "Untitled")}\n\nA lot of advice online is vague or trying to sell you something. Here's a straight answer from people who do this every day.\n\n## What it actually does\n\n…\n\n## When it's worth it\n\n…\n\n## The honest trade-offs\n\n…\n\n## Bottom line\n\nIf you keep your car a while and care how it looks, it usually pays off. If you're selling next month, maybe not.`,
  },
  {
    id: "meta-description",
    name: "Meta description",
    description: "An SEO meta description (≤ 155 chars).",
    category: "seo",
    icon: "search",
    fields: [
      { key: "page", label: "Page title", type: "text", placeholder: "Ceramic Coating in Portland", required: true },
      { key: "topic", label: "What it's about", type: "text", placeholder: "Long-lasting paint protection" },
    ],
    build: (i) => ({
      system: `${brandContext()} Write a single SEO meta description of at most 155 characters. Return only the description, no quotes.`,
      user: `Page: ${v(i, "page")}.${v(i, "topic") ? ` About: ${v(i, "topic")}.` : ""}`,
      maxTokens: 200,
    }),
    demo: (i) =>
      `${v(i, "page", "Professional service")} by ${siteConfig.companyName}. Trusted, meticulous work in ${siteConfig.address.city}. Get a fast, no-obligation quote today.`.slice(
        0,
        155
      ),
  },
  {
    id: "city-page",
    name: "Local landing copy",
    description: "Intro copy for a city × service page.",
    category: "seo",
    icon: "map-pin",
    fields: [
      { key: "city", label: "City", type: "text", placeholder: "Beaverton", required: true },
      { key: "service", label: "Service", type: "text", placeholder: "Interior detail", required: true },
    ],
    build: (i) => ({
      system: `${brandContext()} Write 2 short paragraphs of unique local landing-page copy for a specific service in a specific city. Mention the city naturally; avoid keyword stuffing.`,
      user: `City: ${v(i, "city")}. Service: ${v(i, "service")}.`,
      maxTokens: 700,
    }),
    demo: (i) =>
      `Looking for ${v(i, "service", "our services").toLowerCase()} in ${v(i, "city", "your area")}? ${siteConfig.companyName} brings the same meticulous work our ${siteConfig.address.city} customers rely on to ${v(i, "city", "your neighborhood")}.\n\nWe're a short drive away and happy to answer questions before you book. Get in touch for a fast quote tailored to your vehicle.`,
  },
  {
    id: "alt-text",
    name: "Image alt text",
    description: "Accessible, descriptive alt text.",
    category: "seo",
    icon: "image",
    fields: [
      { key: "subject", label: "What's in the image", type: "text", placeholder: "Black sedan after paint correction", required: true },
    ],
    build: (i) => ({
      system: `Write a single concise, descriptive image alt text (under 125 characters). Describe what is visible; do not start with "image of". Return only the alt text.`,
      user: `Image subject: ${v(i, "subject")}.`,
      maxTokens: 120,
    }),
    demo: (i) => `${v(i, "subject", "Detailing work")}, photographed in natural light`.slice(0, 125),
  },
  {
    id: "review-reply",
    name: "Review reply",
    description: "A professional reply to a customer review.",
    category: "support",
    icon: "message-square",
    fields: [
      { key: "review", label: "Customer review", type: "textarea", placeholder: "Paste the review…", required: true },
      { key: "rating", label: "Rating", type: "select", options: ["5", "4", "3", "2", "1"] },
      { key: "tone", label: "Tone", type: "select", options: ["Warm", "Professional", "Apologetic"] },
    ],
    build: (i) => ({
      system: `${brandContext()} Write a short, sincere reply to a customer review as the business owner. Thank them, respond to specifics, and keep it under 80 words. ${
        Number(v(i, "rating", "5")) <= 3
          ? "This is a critical review — be genuinely apologetic and offer to make it right, without being defensive."
          : "This is a positive review — be warm and specific."
      } Preferred tone: ${v(i, "tone", "Warm")}.`,
      user: `Review (${v(i, "rating", "5")}★): "${v(i, "review")}"`,
      maxTokens: 300,
    }),
    demo: (i) =>
      Number(v(i, "rating", "5")) <= 3
        ? `Thank you for the honest feedback — I'm sorry we fell short here. That's not the experience we want anyone to have. I'd like to make it right; please reach out to me directly and we'll sort it out.`
        : `Thank you so much for taking the time to share this — it genuinely means a lot to the whole team. We loved working on your car and can't wait to see you again. Take care!`,
  },
];

export function getGenerator(id: string): Generator | undefined {
  return GENERATORS.find((g) => g.id === id);
}
