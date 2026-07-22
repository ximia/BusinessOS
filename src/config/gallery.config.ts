import type { GalleryItem } from "@/types/content";

/**
 * Gallery / before-after content. In production the Gallery Manager writes
 * these to Supabase Storage; this is the demo/fallback set.
 */
export const galleryItems: GalleryItem[] = [
  {
    id: "g1",
    title: "Single-stage correction, black sedan",
    category: "Paint Correction",
    src: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
    before:
      "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=1200&q=80",
    after:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "g2",
    title: "Full interior reset, family SUV",
    category: "Interior",
    src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    before:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80",
    after:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "g3",
    title: "Ceramic coating, sports coupe",
    category: "Ceramic Coating",
    src: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "g4",
    title: "Wheel-off detail",
    category: "Paint Correction",
    src: "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "g5",
    title: "Leather restoration",
    category: "Interior",
    src: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "g6",
    title: "Gloss after coating",
    category: "Ceramic Coating",
    src: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80",
  },
];

export function getGalleryCategories(): string[] {
  return Array.from(new Set(galleryItems.map((g) => g.category)));
}
