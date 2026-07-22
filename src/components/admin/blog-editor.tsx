"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { postSchema, type PostInput } from "@/lib/validations";
import type { Post } from "@/types/database";
import { slugify } from "@/lib/utils";
import { Field } from "@/components/shared/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

/**
 * Blog post editor used for both create and edit. Validated with Zod; auto-
 * generates a slug from the title. Wire `onSubmit` to a Supabase insert/update.
 */
export function BlogEditor({ post }: { post?: Post }) {
  const { toast } = useToast();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: post
      ? {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          status: post.status,
          cover_image: post.cover_image ?? "",
          seo_title: post.seo_title ?? "",
          seo_description: post.seo_description ?? "",
        }
      : { status: "draft", content: "", title: "", slug: "", excerpt: "", category: "" },
  });

  const status = watch("status");

  async function onSubmit(values: PostInput) {
    // Demo: persist to Supabase `posts` here. Simulated success below.
    await new Promise((r) => setTimeout(r, 400));
    toast({
      title: post ? "Post updated" : "Post created",
      description: `“${values.title}” saved as ${values.status}.`,
    });
    router.push("/admin/blog");
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6"
    >
      <Link
        href="/admin/blog"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to posts
      </Link>

      <Field label="Title" htmlFor="title" required error={errors.title?.message}>
        <Input
          id="title"
          {...register("title", {
            onChange: (e) => {
              if (!post) setValue("slug", slugify(e.target.value));
            },
          })}
          placeholder="A great, specific headline"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Slug" htmlFor="slug" required error={errors.slug?.message}>
          <Input id="slug" {...register("slug")} placeholder="url-slug" />
        </Field>
        <Field label="Category" htmlFor="category" required error={errors.category?.message}>
          <Input id="category" {...register("category")} placeholder="e.g. Paint Care" />
        </Field>
      </div>

      <Field label="Excerpt" htmlFor="excerpt" required error={errors.excerpt?.message}>
        <Textarea
          id="excerpt"
          {...register("excerpt")}
          placeholder="One or two sentences shown in listings and search results."
          className="min-h-[80px]"
        />
      </Field>

      <Field label="Content" htmlFor="content" required error={errors.content?.message}>
        <Textarea
          id="content"
          {...register("content")}
          placeholder="Write your post. Separate paragraphs with a blank line."
          className="min-h-[280px] font-mono text-sm"
        />
      </Field>

      <Field label="Cover image URL" htmlFor="cover_image" hint="Optional">
        <Input
          id="cover_image"
          {...register("cover_image")}
          placeholder="https://…"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="SEO title" htmlFor="seo_title" hint="Optional">
          <Input id="seo_title" {...register("seo_title")} />
        </Field>
        <div>
          <label className="text-sm font-medium">Status</label>
          <Select
            value={status}
            onValueChange={(v) => setValue("status", v as PostInput["status"])}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Field label="SEO description" htmlFor="seo_description" hint="Optional">
        <Textarea
          id="seo_description"
          {...register("seo_description")}
          className="min-h-[64px]"
        />
      </Field>

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4" />
          {isSubmitting ? "Saving…" : "Save post"}
        </Button>
        <Button type="button" variant="ghost" asChild>
          <Link href="/admin/blog">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
