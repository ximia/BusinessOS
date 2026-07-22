import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { mockGallery } from "./mock-data";
import type { GalleryImage } from "@/types/database";

export async function getGalleryImages(): Promise<GalleryImage[]> {
  if (!isSupabaseConfigured()) return mockGallery;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .order("position", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}
