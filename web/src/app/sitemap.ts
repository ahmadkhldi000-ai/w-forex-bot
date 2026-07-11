import type { MetadataRoute } from "next";

export const dynamic = "force-static";

/**
 * Dynamic sitemap for search engines.
 * Includes all public marketing pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const changeFrequency = "weekly" as const;

  const routes = [
    "", // Home / Landing
    "/auth", // Login / Register
  ];

  return routes.map((route) => ({
    url: `https://wforexbot.vercel.app${route}`,
    lastModified,
    changeFrequency,
    priority: route === "" ? 1.0 : 0.8,
  }));
}
