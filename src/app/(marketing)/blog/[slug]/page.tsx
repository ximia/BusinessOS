import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { blogPosts, getPostBySlug } from "@/config";
import { buildMetadata } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { CtaSection } from "@/components/sections/cta-section";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return buildMetadata({ title: "Article" });
  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.coverImage,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const paragraphs = post.content.split("\n\n");

  return (
    <>
      <article className="section">
        <div className="container max-w-3xl">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Blog", href: "/blog" },
              { label: post.title },
            ]}
            className="mb-8"
          />

          <Badge>{post.category}</Badge>
          <h1 className="heading-lg mt-4 text-balance">{post.title}</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            By {post.author} · {formatDate(post.publishedAt)} ·{" "}
            {post.readingMinutes} min read
          </p>

          {post.coverImage && (
            <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl border border-border">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="mt-10 space-y-6 text-lg leading-relaxed text-foreground/90">
            {paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <div className="mt-12 border-t border-border pt-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to all articles
            </Link>
          </div>
        </div>
      </article>

      <CtaSection />
    </>
  );
}
