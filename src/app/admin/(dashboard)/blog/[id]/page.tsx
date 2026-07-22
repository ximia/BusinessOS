import { notFound } from "next/navigation";
import { getPosts } from "@/services/posts.service";
import { BlogEditor } from "@/components/admin/blog-editor";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const posts = await getPosts();
  const post = posts.find((p) => p.id === id);
  if (!post) notFound();

  return <BlogEditor post={post} />;
}
