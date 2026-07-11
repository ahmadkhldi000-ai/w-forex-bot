import type { MetadataRoute } from "next";

export const dynamic = "force-static";

/**
 * robots.txt — allows indexing of public pages,
 * blocks private/dashboard/admin routes.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/live-trading",
          "/markets",
          "/strategies",
          "/history",
          "/settings",
          "/admin",
          "/copy-trading",
        ],
      },
    ],
    sitemap: "https://wforexbot.vercel.app/sitemap.xml",
  };
}
