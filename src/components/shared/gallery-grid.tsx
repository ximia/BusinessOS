"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { GalleryItem } from "@/types/content";

/**
 * Filterable masonry-ish gallery with a lightbox. Categories are derived from
 * the items so it works for any client's photo set.
 */
export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const categories = React.useMemo(
    () => ["All", ...Array.from(new Set(items.map((i) => i.category)))],
    [items]
  );
  const [active, setActive] = React.useState("All");
  const [lightbox, setLightbox] = React.useState<GalleryItem | null>(null);

  const filtered =
    active === "All" ? items : items.filter((i) => i.category === active);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              active === cat
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => setLightbox(item)}
            className="group relative aspect-square overflow-hidden rounded-xl border border-border"
          >
            <Image
              src={item.src}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="absolute inset-x-0 bottom-0 translate-y-2 p-3 text-left opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
              <p className="text-xs font-medium text-white">{item.title}</p>
              <p className="text-[11px] text-white/70">{item.category}</p>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-3xl overflow-hidden p-0">
          {lightbox && (
            <>
              <DialogTitle className="sr-only">{lightbox.title}</DialogTitle>
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={lightbox.src}
                  alt={lightbox.title}
                  fill
                  sizes="90vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <p className="font-medium">{lightbox.title}</p>
                <p className="text-sm text-muted-foreground">{lightbox.category}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
