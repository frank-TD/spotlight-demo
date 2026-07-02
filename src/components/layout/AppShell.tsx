"use client";
import Link from "next/link";
import TopNav from "./TopNav";
import AgentFloat from "./AgentFloat";
import SignupGate from "@/components/common/SignupGate";
import { useT } from "@/hooks/useT";

export default function AppShell({
  children,
  hideFooter = false,
  heroUnderNav = false,
}: {
  children: React.ReactNode;
  hideFooter?: boolean;
  // Let the first section render beneath the fixed nav (used by the marketing
  // homepage so the transparent nav overlays the cinematic hero).
  heroUnderNav?: boolean;
}) {
  const t = useT();
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      {/* Skip link — hidden until focused, lets keyboard users jump past the
          fixed nav straight to the page content. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:font-label focus:text-label-md focus:uppercase focus:tracking-wider focus:text-on-primary"
      >
        {t.nav.skipToContent}
      </a>
      <TopNav />
      <main id="main-content" className={heroUnderNav ? "flex-1" : "flex-1 pt-[80px]"}>
        {children}
      </main>
      {!hideFooter && <Footer />}
      <AgentFloat />
      <SignupGate />
    </div>
  );
}

function Footer() {
  return (
    <footer className="w-full py-12 bg-surface-container-lowest border-t border-outline-variant/30 mt-16">
      <div className="flex flex-col md:flex-row justify-between items-center px-12 max-w-[1280px] mx-auto gap-8">
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="font-headline text-headline-md text-primary font-bold">
            Spotlight
          </span>
          <p className="font-body text-on-surface-variant opacity-80 text-sm">
            © 2026 Spotlight Technologies
          </p>
        </div>
        <nav aria-label="Footer" className="flex gap-8">
          {[
            { label: "About", href: "/about" },
            { label: "Support", href: "#" },
            { label: "Terms", href: "#" },
            { label: "Privacy", href: "#" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="font-body text-on-surface-variant hover:text-primary transition-colors text-sm"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
