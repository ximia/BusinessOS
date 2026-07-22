import { Fragment } from "react";
import { getApprovedTestimonials } from "@/services/reviews.service";
import { getSiteConfig } from "@/features/settings/settings.service";
import {
  DEFAULT_HOME_LAYOUT,
  normalizeLayout,
} from "@/features/website/sections.catalog";
import { renderSection } from "@/components/sections/section-renderer";

export default async function HomePage() {
  const [testimonials, config] = await Promise.all([
    getApprovedTestimonials(),
    getSiteConfig(),
  ]);

  // Admin-defined layout (Website Builder) with a safe default fallback.
  const layout = config.homeLayout
    ? normalizeLayout(config.homeLayout)
    : DEFAULT_HOME_LAYOUT;

  return (
    <>
      {layout
        .filter((section) => section.enabled)
        .map((section) => (
          <Fragment key={section.id}>
            {renderSection(section.type, { testimonials })}
          </Fragment>
        ))}
    </>
  );
}
