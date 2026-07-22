import type { MetadataRoute } from "next";
import { services, blogPosts, jobOpenings } from "@/config";
import { absoluteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/gallery",
    "/reviews",
    "/blog",
    "/careers",
    "/contact",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: absoluteUrl(path || "/"),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const serviceRoutes = services.map((s) => ({
    url: absoluteUrl(`/services/${s.slug}`),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const blogRoutes = blogPosts.map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    lastModified: new Date(p.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const careerRoutes = jobOpenings.map((j) => ({
    url: absoluteUrl(`/careers/${j.slug}`),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...serviceRoutes, ...blogRoutes, ...careerRoutes];
}
