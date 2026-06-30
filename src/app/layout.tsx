import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

// Site-wide type is now Montserrat (matching the editorial homepage) — one
// geometric sans drives the headline / body / label slots via globals.css.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Spotlight — Fund it. Own it. Stream it.",
  description:
    "Discover AI-powered films, back the stories you believe in — and let AI distribute them to the world.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background text-on-surface font-body antialiased">
        {children}
        <div className="film-grain" aria-hidden="true" />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
