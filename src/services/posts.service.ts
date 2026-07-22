import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { mockPosts } from "./mock-data";
import { blogPosts } from "@/config";
import type { Post } from "@/types/database";
import type { BlogPost } from "@/types/content";

/** All posts (admin — includes drafts & scheduled). */
export async function getPosts(): Promise<Post[]> {
  if (!isSupabaseConfigured()) return mockPosts;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Published posts for the public blog, mapped to the marketing shape. */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  if (!isSupabaseConfigured()) return blogPosts;
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (data ?? []).map(mapPost);
}

function mapPost(p: Post): BlogPost {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    category: p.category,
    author: p.author,
    publishedAt: p.published_at ?? p.created_at,
    readingMinutes: Math.max(1, Math.round(p.content.split(/\s+/).length / 200)),
    coverImage: p.cover_image ?? undefined,
  };
}
