import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "W Forex Bot — تداول الفوركس بالذكاء الاصطناعي",
  description:
    "روبوت تداول آلي مؤتمت يحلّل سوق الفوركس على مدار الساعة وينفّذ صفقات بدقّة عالية مع إدارة مخاطر صارمة. عوائد ثابتة بدون عواطف.",
  keywords: [
    "فوركس",
    "روبوت تداول",
    "EA",
    "ذكاء اصطناعي",
    "تداول آلي",
    "MT5",
    "Forex Bot",
  ],
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
        {children}
      </body>
    </html>
  );
}
