import Link from "next/link";
import { Plus } from "lucide-react";
import { getPosts } from "@/services/posts.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const statusVariant = {
  published: "success",
  draft: "muted",
  scheduled: "default",
} as const;

export default async function BlogAdminPage() {
  const posts = await getPosts();

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{posts.length} posts</p>
        <Button asChild size="sm">
          <Link href="/admin/blog/new">
            <Plus className="h-4 w-4" />
            New post
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Author</TableHead>
              <TableHead className="text-right">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <Link
                    href={`/admin/blog/${post.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {post.title}
                  </Link>
                  <div className="text-xs text-muted-foreground">/{post.slug}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="muted">{post.category}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[post.status]} className="capitalize">
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {post.author}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {formatDate(post.updated_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
