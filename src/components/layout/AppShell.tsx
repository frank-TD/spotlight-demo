"use client";
import Link from "next/link";
import TopNav from "./TopNav";
import AgentFloat from "./AgentFloat";
import SignupGate from "@/components/common/SignupGate";

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
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <TopNav />
      <main className={heroUnderNav ? "flex-1" : "flex-1 pt-[80px]"}>{children}</main>
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
        <nav className="flex gap-8">
          {["About", "Support", "Terms", "Privacy"].map((label) => (
            <Link
              key={label}
              href="#"
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
