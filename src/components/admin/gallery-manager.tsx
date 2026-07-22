"use client";

import * as React from "react";
import Image from "next/image";
import { Upload, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import type { GalleryImage } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export function GalleryManager({ initialImages }: { initialImages: GalleryImage[] }) {
  const { toast } = useToast();
  const [images, setImages] = React.useState(initialImages);

  const remove = (id: string) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "Image removed" });
  };

  const move = (index: number, dir: -1 | 1) => {
    setImages((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      {/* Upload dropzone (wire to Supabase Storage) */}
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card px-6 py-10 text-center transition-colors hover:border-primary/40 hover:bg-accent/40">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Upload className="h-5 w-5" />
        </span>
        <span className="text-sm font-medium">Upload images</span>
        <span className="text-xs text-muted-foreground">
          Drag & drop or click. Images are optimized on upload via Supabase Storage.
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={() =>
            toast({
              title: "Upload ready to wire up",
              description:
                "Connect this input to Supabase Storage + the gallery_images table.",
            })
          }
        />
      </label>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <div
            key={img.id}
            className="group overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="relative aspect-square">
              <Image
                src={img.url}
                alt={img.title}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-medium">{img.title}</p>
              <Badge variant="muted" className="mt-1.5">
                {img.category}
              </Badge>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Move left"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => move(i, 1)}
                    disabled={i === images.length - 1}
                    aria-label="Move right"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => remove(img.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
