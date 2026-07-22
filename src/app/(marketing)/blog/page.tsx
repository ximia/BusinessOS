import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { buildMetadata } from "@/lib/seo";
import { getPublishedPosts } from "@/services/posts.service";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Blog",
  description: "Detailing tips, guides, and honest advice for car owners.",
  path: "/blog",
});

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  const [featured, ...rest] = posts;

  return (
    <>
      <PageHeader
        title="Advice for people who care about their cars"
        description="Practical guides on protecting your paint, keeping interiors fresh, and getting the most from every detail."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
      />

      <section className="section">
        <div className="container">
          {featured && (
            <Link
              href={`/blog/${featured.slug}`}
              className="group mb-14 grid gap-8 overflow-hidden rounded-3xl border border-border bg-card lg:grid-cols-2"
            >
              <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto">
                {featured.coverImage && (
                  <Image
                    src={featured.coverImage}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="flex flex-col justify-center p-8 lg:p-10">
                <Badge className="w-fit">{featured.category}</Badge>
                <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-3 text-muted-foreground">{featured.excerpt}</p>
                <p className="mt-6 text-sm text-muted-foreground">
                  {featured.author} · {formatDate(featured.publishedAt)} ·{" "}
                  {featured.readingMinutes} min read
                </p>
              </div>
            </Link>
          )}

          <RevealGroup className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <RevealItem key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {post.coverImage && (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <Badge variant="muted" className="w-fit">
                      {post.category}
                    </Badge>
                    <h3 className="mt-3 font-display text-lg font-semibold tracking-tight">
                      {post.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {post.excerpt}
                    </p>
                    <p className="mt-4 text-xs text-muted-foreground">
                      {formatDate(post.publishedAt)} · {post.readingMinutes} min read
                    </p>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>
    </>
  );
}
