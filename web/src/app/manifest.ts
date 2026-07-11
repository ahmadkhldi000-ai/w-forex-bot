import type { MetadataRoute } from "next";

export const dynamic = "force-static";

/**
 * PWA Manifest — makes WForexBot installable on mobile/desktop.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WForexBot — تداول الفوركس بالذكاء الاصطناعي",
    short_name: "WForexBot",
    description:
      "روبوت تداول آلي مؤتمت يحلّل سوق الفوركس على مدار الساعة وينفّذ صفقات بدقّة عالية مع إدارة مخاطر صارمة.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0f0d",
    theme_color: "#0a0f0d",
    lang: "ar",
    dir: "rtl",
    categories: ["finance", "business", "productivity"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
