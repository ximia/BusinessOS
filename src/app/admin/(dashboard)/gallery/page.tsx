import { getGalleryImages } from "@/services/gallery.service";
import { GalleryManager } from "@/components/admin/gallery-manager";

export default async function GalleryAdminPage() {
  const images = await getGalleryImages();
  return <GalleryManager initialImages={images} />;
}
