import type { Metadata } from "next";
import { Arimo, Bebas_Neue, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const cormorant = Cormorant_Garamond({
  variable: "--font-headline",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
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
  title: "Spotlight — Fund it. Own it. Stream it.",
  description:
    "Discover AI-powered films, back the stories you believe in — and let AI distribute them to the world.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${arimo.variable} ${bebas.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background text-on-surface font-body antialiased">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
