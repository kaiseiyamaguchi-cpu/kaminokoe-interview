import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";

export const metadata: Metadata = {
  title: "かんぺAI Web版 — 面接の暗記大会、降りていい",
  description: "ブラウザだけで使える面接サポート。Zoom / Meet / Teams 対応。",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/favicon.png", sizes: "32x32", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "かんぺAI",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
