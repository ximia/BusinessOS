import type { BlogPost } from "@/types/content";

/**
 * Seed blog posts. Production content is managed via the Blog Manager (Supabase
 * `posts` table); this is the demo/fallback set and the shape the CMS returns.
 * `content` supports simple paragraphs separated by blank lines.
 */
export const blogPosts: BlogPost[] = [
  {
    slug: "why-automatic-car-washes-ruin-paint",
    title: "Why automatic car washes quietly ruin your paint",
    excerpt:
      "That $12 tunnel wash feels efficient. Here's what those spinning brushes are actually doing to your clear coat — and what to do instead.",
    category: "Paint Care",
    author: "Elena Ruiz",
    publishedAt: "2026-05-18",
    readingMinutes: 5,
    coverImage:
      "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1200&q=80",
    tags: ["paint", "maintenance"],
    content:
      "Automatic washes are built for speed, not care. The brushes and cloth strips that scrub your car have scrubbed thousands of cars before yours — dragging grit across every panel.\n\nOver time that grit carves a web of fine scratches into your clear coat. In direct sunlight you'll see them as swirls or a dull haze. They're not dirt; they're damage, and no amount of washing removes them.\n\nThe fix is simple: wash by hand with two buckets and soft media, or hand the job to someone who does. If your paint is already swirled, a single-stage correction can bring back the depth — and a coating keeps it there.",
  },
  {
    slug: "ceramic-coating-worth-it",
    title: "Is a ceramic coating actually worth it?",
    excerpt:
      "Coatings get hyped and misunderstood in equal measure. Here's an honest breakdown of what they do, what they don't, and who should bother.",
    category: "Protection",
    author: "Sam Okafor",
    publishedAt: "2026-06-02",
    readingMinutes: 6,
    coverImage:
      "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1200&q=80",
    tags: ["ceramic", "protection"],
    content:
      "A ceramic coating is a semi-permanent layer of liquid glass that bonds to your paint. It's not magic and it's not a force field — it won't stop rock chips or door dings.\n\nWhat it does do is make maintenance dramatically easier. Water sheets off, dirt struggles to stick, and washing takes half the time. On corrected paint it also locks in gloss for years.\n\nWho should get one? Anyone who keeps their cars a few years and is tired of waxing. Anyone who wants a flawless finish to actually last. If you flip cars every year, a good sealant is probably enough.",
  },
  {
    slug: "prepping-your-car-for-a-detail",
    title: "How to prep your car before a detail appointment",
    excerpt:
      "A few minutes of prep helps us spend our time on the work that matters. Here's a short checklist before we arrive.",
    category: "Tips",
    author: "Jordan Pierce",
    publishedAt: "2026-06-20",
    readingMinutes: 3,
    coverImage:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80",
    tags: ["tips", "interior"],
    content:
      "You don't need to clean before we clean — but a couple of small things help us focus on the deep work.\n\nClear out personal items and anything valuable. Empty the trunk if you'd like it detailed. Let us know about any specific stains, smells, or scratches so we can plan for them.\n\nThat's it. Everything else is on us.",
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getBlogCategories(): string[] {
  return Array.from(new Set(blogPosts.map((p) => p.category)));
}
