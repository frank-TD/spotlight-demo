"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useT } from "@/hooks/useT";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Sparkles, Wallet, ChevronDown, User, FolderOpen, LogOut, Check, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Locale } from "@/lib/i18n";

const LOCALES: { value: Locale; label: string; short: string }[] = [
  { value: "en", label: "English", short: "EN" },
  { value: "zh-CN", label: "简体中文", short: "简" },
  { value: "zh-TW", label: "繁體中文", short: "繁" },
];

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, activeRole, backerDiamond, creatorShell, locale, setLocale, logout, toggleAgent, switchRole } = useStore();
  const t = useT();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NAV_ITEMS = [
    { label: t.nav.discover, href: "/discovery" },
    { label: t.nav.marketplace, href: "/market" },
    { label: t.nav.studio, href: "/studio" },
    { label: t.nav.myProjects, href: "/projects" },
    { label: t.nav.assets, href: "/assets" },
    { label: t.nav.messages, href: "/messages" },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-[80px] z-50 bg-surface/60 backdrop-blur-[30px] border-b border-outline-variant/10 shadow-[0_4px_30px_rgba(0,0,0,0.06)]">
      <div className="flex justify-between items-center px-4 md:px-12 w-full max-w-[1280px] mx-auto h-full">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-headline text-[28px] md:text-[32px] text-on-surface italic font-bold leading-none whitespace-nowrap">
            Spotlight
          </Link>
          {isLoggedIn && (
            <nav className="hidden md:flex gap-5 lg:gap-7">
              {NAV_ITEMS.map((item) => {
                const active = pathname.startsWith(item.href.split("/").slice(0, 3).join("/"));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "font-label text-label-md uppercase tracking-widest transition-colors duration-300 whitespace-nowrap",
                      active
                        ? "text-primary relative after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full"
                        : "text-on-surface-variant hover:text-on-surface"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider px-2 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{LOCALES.find((l) => l.value === locale)?.short ?? "EN"}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              {LOCALES.map((l) => (
                <DropdownMenuItem
                  key={l.value}
                  onClick={() => setLocale(l.value)}
                  className={cn("cursor-pointer", locale === l.value && "text-primary font-medium")}
                >
                  {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {isLoggedIn ? (
            <>
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant"
                aria-label="open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                onClick={toggleAgent}
                className="hidden md:flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors px-2 py-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t.nav.aiAssistant}</span>
              </button>

              <Link
                href="/wallet"
                className="hidden md:flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface px-2 py-1.5"
              >
                <Wallet className="w-4 h-4" />
                <span className="font-mono text-sm">
                  {activeRole === "backer" ? `◆ ${backerDiamond.toLocaleString()}` : `◉ ${creatorShell.toLocaleString()}`}
                </span>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1.5 px-1.5 py-1 rounded-full hover:bg-surface-container transition-colors">
                  <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-xs font-bold text-on-primary-container">
                    {activeRole === "backer" ? "LC" : "AS"}
                  </div>
                  <ChevronDown className="w-4 h-4 text-on-surface-variant" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-bold text-on-surface">{activeRole === "backer" ? "Lucas Chen" : "Aria Song"}</p>
                    <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mt-0.5">
                      {activeRole === "backer" ? t.market.roleBacker : t.market.roleCreator}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1 font-label text-[10px] uppercase tracking-wider text-on-surface-variant">
                    {t.nav.viewAs}
                  </div>
                  {(["backer", "creator"] as const).map((r) => (
                    <DropdownMenuItem
                      key={r}
                      onClick={() => switchRole(r)}
                      className={cn("gap-2 cursor-pointer", activeRole === r && "text-primary")}
                    >
                      {activeRole === r ? <Check className="w-4 h-4" /> : <span className="w-4 h-4" />}
                      {r === "backer" ? t.market.roleBacker : t.market.roleCreator}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/account/profile")} className="gap-2 cursor-pointer">
                    <User className="w-4 h-4" /> {t.nav.profile}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/wallet")} className="gap-2 cursor-pointer">
                    <Wallet className="w-4 h-4" /> {t.nav.wallet}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/projects")} className="gap-2 cursor-pointer">
                    <FolderOpen className="w-4 h-4" /> {t.nav.myProjects}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-error gap-2 cursor-pointer">
                    <LogOut className="w-4 h-4" /> {t.nav.signOut}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="font-label text-label-md uppercase tracking-wider text-on-surface-variant hover:text-on-surface px-2 py-1.5"
              >
                {t.nav.signIn}
              </Link>
              <Link href="/register">
                <Button className="font-label text-label-md uppercase tracking-wider px-5 py-2.5 bg-primary text-on-primary rounded-lg hover:opacity-90 active:scale-95 transition-all">
                  {t.nav.getStarted}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile slide-in menu */}
      {isLoggedIn && (
        <div
          className={cn(
            "md:hidden fixed inset-0 z-[60] transition-opacity duration-300",
            mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
        >
          <div
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className={cn(
              "absolute top-0 right-0 h-full w-[80%] max-w-[320px] bg-surface shadow-2xl flex flex-col transition-transform duration-300 ease-out",
              mobileOpen ? "translate-x-0" : "translate-x-full"
            )}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/30">
              <span className="font-headline text-2xl italic font-bold text-on-surface">Spotlight</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface-variant"
                aria-label="close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const active = pathname.startsWith(item.href.split("/").slice(0, 3).join("/"));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "block px-4 py-3 rounded-lg font-label text-label-md uppercase tracking-widest transition-colors",
                      active
                        ? "bg-primary-container text-primary"
                        : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-outline-variant/30 px-3 py-3 space-y-1">
              <button
                onClick={() => {
                  toggleAgent();
                  setMobileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors font-label text-label-md uppercase tracking-widest"
              >
                <Sparkles className="w-4 h-4" /> {t.nav.aiAssistant}
              </button>
              <Link
                href="/wallet"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between gap-2 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              >
                <span className="flex items-center gap-3 font-label text-label-md uppercase tracking-widest">
                  <Wallet className="w-4 h-4" /> {t.nav.wallet}
                </span>
                <span className="font-mono text-sm text-on-surface">
                  {activeRole === "backer" ? `◆ ${backerDiamond.toLocaleString()}` : `◉ ${creatorShell.toLocaleString()}`}
                </span>
              </Link>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
