import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CapacitorInit } from "@/components/CapacitorInit";

export const metadata: Metadata = {
  title: "LumeIQ - Sustainable Impact Tracker",
  description: "Track and reward sustainable financial behavior. Apple Fitness for sustainability and FinTech.",
  keywords: ["sustainability", "FinTech", "green", "impact", "carbon footprint", "ESG"],
  authors: [{ name: "LumeIQ" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "LumeIQ",
    description: "Track and reward sustainable financial behavior",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f0f7f0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
        <body
          className="antialiased"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
        >
          <CapacitorInit />
          {children}
          <Toaster />
      </body>
    </html>
  );
}
