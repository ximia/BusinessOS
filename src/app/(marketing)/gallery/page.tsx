import type { Metadata } from "next";
import { galleryItems } from "@/config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/shared/page-header";
import { GalleryGrid } from "@/components/shared/gallery-grid";
import { CtaSection } from "@/components/sections/cta-section";

export const metadata: Metadata = buildMetadata({
  title: "Gallery",
  description: "A look at recent work — corrections, coatings, and interiors.",
  path: "/gallery",
});

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        title="Recent work"
        description="A selection of cars we've had the pleasure of detailing. Every one of these left looking better than it arrived."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Gallery" }]}
      />
      <section className="section">
        <div className="container">
          <GalleryGrid items={galleryItems} />
        </div>
      </section>
      <CtaSection />
    </>
  );
}
