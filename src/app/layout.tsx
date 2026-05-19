import type { Metadata } from "next";
import { Arimo, Bebas_Neue, Bodoni_Moda } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const bodoni = Bodoni_Moda({
  variable: "--font-headline",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const arimo = Arimo({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const bebas = Bebas_Neue({
  variable: "--font-label",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Spotlight — AIGC Creative Marketplace",
  description: "Connect creators and backers for AI-powered video production",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bodoni.variable} ${arimo.variable} ${bebas.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background text-on-surface font-body antialiased">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
