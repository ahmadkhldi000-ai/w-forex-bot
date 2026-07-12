import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

/**
 * Runs before hydration to set <html lang/dir> from persisted preference,
 * preventing a flash of the wrong language/direction on load.
 */
const LANG_STORAGE_KEY = "w-forex-lang";

/**
 * Runs before hydration to:
 *  1. Restore a previously-chosen language from localStorage (user preference wins)
 *  2. Otherwise auto-detect the device/browser language on the very first visit
 *     — Arabic devices get Arabic, everyone else gets English.
 * This prevents a flash of the wrong language/direction on load.
 */
const setInitialLang = `
(function(){
  try {
    var KEY = ${JSON.stringify(LANG_STORAGE_KEY)};
    var stored = localStorage.getItem(KEY);
    var l;
    if (stored === 'ar' || stored === 'en') {
      l = stored;
    } else {
      // First visit — auto-detect device language
      var nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
      l = nav.indexOf('ar') === 0 ? 'ar' : 'en';
      localStorage.setItem(KEY, l);
    }
    document.documentElement.lang = l;
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
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
    default: "WForexBot — AI-Powered Forex Trading Bot",
    template: "%s · WForexBot",
  },
  description:
    "WForexBot is an automated AI trading bot that analyzes the forex market around the clock and executes trades with precision and strict risk management.",
  applicationName: "WForexBot",
  keywords: [
    "WForexBot",
    "Forex Bot",
    "AI Trading Bot",
    "Automated Trading",
    "MetaTrader 5",
    "MT5",
    "Smart Money Concepts",
    "Copy Trading",
    "فوركس",
    "روبوت تداول",
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
    locale: "en_US",
    url: siteUrl,
    siteName: "WForexBot",
    title: "WForexBot — AI-Powered Forex Trading Bot",
    description:
      "Trade forex on autopilot with WForexBot. An AI-powered trading bot that analyzes the market 24/7 and executes high-precision trades with strict risk management.",
  },
  twitter: {
    card: "summary_large_image",
    title: "WForexBot — AI-Powered Forex Trading Bot",
    description:
      "Trade forex on autopilot with WForexBot. An AI-powered trading bot that analyzes the market 24/7 and executes high-precision trades with strict risk management.",
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
