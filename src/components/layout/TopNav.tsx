"use client";
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
import { Sparkles, ChevronDown, LogOut, User, Wallet, FolderOpen, Globe } from "lucide-react";
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
  const { isLoggedIn, activeRole, backerDiamond, creatorShell, locale, setLocale, logout, toggleAgent } = useStore();
  const t = useT();

  const NAV_ITEMS = [
    { label: t.nav.marketplace, href: "/market" },
    { label: t.nav.studio, href: "/studio" },
    { label: t.nav.myProjects, href: "/projects" },
    { label: t.nav.assets, href: "/assets" },
    { label: t.nav.messages, href: "/messages/sessions/sess_001" },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-foreground">Spotlight</span>
        </Link>

        {/* Nav links */}
        {isLoggedIn && (
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  pathname.startsWith(item.href)
                    ? "bg-accent text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Language switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{LOCALES.find(l => l.value === locale)?.short ?? "EN"}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              {LOCALES.map((l) => (
                <DropdownMenuItem
                  key={l.value}
                  onClick={() => setLocale(l.value)}
                  className={cn("cursor-pointer text-sm", locale === l.value && "text-primary font-medium")}
                >
                  {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {isLoggedIn ? (
            <>
              {/* Agent button */}
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary gap-1.5 text-sm"
                onClick={toggleAgent}
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">{t.nav.aiAssistant}</span>
              </Button>

              {/* Wallet */}
              <Link href="/wallet">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-sm gap-1.5">
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:inline font-mono">
                    {activeRole === "backer" ? `◆ ${backerDiamond.toLocaleString()}` : `◉ ${creatorShell.toLocaleString()}`}
                  </span>
                </Button>
              </Link>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1.5 text-sm px-2 py-1.5 rounded-md hover:bg-muted transition-colors">
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-primary">
                    {activeRole === "backer" ? "LC" : "AS"}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{activeRole === "backer" ? "Lucas Chen" : "Aria Song"}</p>
                    <p className="text-xs text-muted-foreground capitalize">{activeRole}</p>
                  </div>
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
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive gap-2 cursor-pointer">
                    <LogOut className="w-4 h-4" /> {t.nav.signOut}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-sm">{t.nav.signIn}</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="text-sm">{t.nav.getStarted}</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
