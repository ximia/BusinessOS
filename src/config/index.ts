/**
 * Barrel export for all site configuration.
 *
 * Import content from a single place:
 *   import { siteConfig, services, faqs } from "@/config";
 */
export { siteConfig } from "./site.config";
export { themeConfig } from "./theme.config";
export { services, getServiceBySlug, getFeaturedServices } from "./services.config";
export { processSteps } from "./process.config";
export {
  testimonials,
  getFeaturedTestimonials,
} from "./testimonials.config";
export { faqs, getFaqCategories } from "./faq.config";
export { galleryItems, getGalleryCategories } from "./gallery.config";
export { team } from "./team.config";
export { blogPosts, getPostBySlug, getBlogCategories } from "./blog.config";
export { jobOpenings, getJobBySlug } from "./careers.config";
