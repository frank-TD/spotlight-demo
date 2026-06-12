"use client";
import Link from "next/link";
import { useT } from "@/hooks/useT";

// Minimal single-row footer: wordmark, five essential links, copyright.
// Long-form links/disclaimers moved to /about. Shared by the marketing pages
// (homepage, /how-it-works, /about, /distribution).
export default function SiteFooter() {
  const t = useT();
  const links = [
    { label: t.homeV2.footerProjects, href: "/discovery" },
    { label: t.homeV2.footerDistribution, href: "/distribution" },
    { label: t.homeV2.footerHiw, href: "/how-it-works" },
    { label: t.landing.footerAbout, href: "/about" },
    { label: t.landing.footerTerms, href: "#" },
  ];

  return (
    <footer className="border-t border-outline-variant/30">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-9 flex flex-col md:flex-row items-center justify-between gap-6">
        <Link href="/" className="font-headline italic font-bold text-[22px] text-primary">
          Spotlight
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="font-label text-[11px] uppercase tracking-[0.22em] text-on-surface-variant hover:text-primary transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="font-label text-[10px] uppercase tracking-[0.22em] text-on-surface-variant/60">
          {t.landing.footerCopyright}
        </p>
      </div>
    </footer>
  );
}
