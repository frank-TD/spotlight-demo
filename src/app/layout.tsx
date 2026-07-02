import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import HtmlLangSync from "@/components/common/HtmlLangSync";

// Site-wide type is now Montserrat (matching the editorial homepage) — one
// geometric sans drives the headline / body / label slots via globals.css.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const SITE_TITLE = "Spotlight — Fund it. Own it. Stream it.";
const SITE_DESCRIPTION =
  "Discover AI-powered films, back the stories you believe in — and let AI distribute them to the world.";

export const metadata: Metadata = {
  metadataBase: new URL("https://spotlight.demo"),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: "Spotlight",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background text-on-surface font-body antialiased">
        {children}
        <div className="film-grain" aria-hidden="true" />
        <Toaster position="top-center" />
        <HtmlLangSync />
      </body>
    </html>
  );
}
