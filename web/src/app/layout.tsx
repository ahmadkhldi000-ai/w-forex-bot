import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

/**
 * Runs before hydration to set <html lang/dir> from persisted preference,
 * preventing a flash of the wrong language/direction on load.
 */
const setInitialLang = `
(function(){
  try {
    var l = localStorage.getItem('lang');
    if (l) {
      document.documentElement.lang = l;
      document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    }
  } catch (e) {}
})();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://wforexbot.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "WForexBot — تداول الفوركس بالذكاء الاصطناعي",
    template: "%s · WForexBot",
  },
  description:
    "روبوت تداول آلي مؤتمت يحلّل سوق الفوركس على مدار الساعة وينفّذ صفقات بدقّة عالية مع إدارة مخاطر صارمة. عوائد ثابتة بدون عواطف.",
  applicationName: "WForexBot",
  keywords: [
    "WForexBot",
    "فوركس",
    "روبوت تداول",
    "EA",
    "ذكاء اصطناعي",
    "تداول آلي",
    "MT5",
    "Forex Bot",
    "Smart Money Concepts",
    "Automated Trading",
  ],
  authors: [{ name: "WForexBot" }],
  creator: "WForexBot",
  publisher: "WForexBot",
  alternates: {
    canonical: "/",
    languages: {
      ar: "/",
      en: "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: siteUrl,
    siteName: "WForexBot",
    title: "WForexBot — تداول الفوركس بالذكاء الاصطناعي",
    description:
      "روبوت تداول آلي مؤتمت يحلّل سوق الفوركس على مدار الساعة وينفّذ صفقات بدقّة عالية مع إدارة مخاطر صارمة.",
  },
  twitter: {
    card: "summary_large_image",
    title: "WForexBot — تداول الفوركس بالذكاء الاصطناعي",
    description:
      "روبوت تداول آلي مؤتمت يحلّل سوق الفوركس على مدار الساعة وينفّذ صفقات بدقّة عالية مع إدارة مخاطر صارمة.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-fg">
        <script dangerouslySetInnerHTML={{ __html: setInitialLang }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
