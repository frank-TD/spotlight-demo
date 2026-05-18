"use client";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NEEDS, CREATORS } from "@/lib/mock-data";
import Link from "next/link";
import { ArrowRight, Plus, Star, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";

export default function MarketPage() {
  const { isLoggedIn, activeRole, switchRole } = useStore();
  const router = useRouter();
  const t = useT();

  useEffect(() => {
    if (!isLoggedIn) router.push("/login");
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Role switcher */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-foreground">{t.market.title}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {activeRole === "backer" ? t.market.backerDesc : t.market.creatorDesc}
            </p>
          </div>
          <div className="flex items-center bg-muted rounded-lg p-1 gap-1">
            {(["backer", "creator"] as const).map((r) => (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all",
                  activeRole === r
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r === "backer" ? t.market.roleBacker : t.market.roleCreator}
              </button>
            ))}
          </div>
        </div>

        {activeRole === "backer" ? <BackerView /> : <CreatorView />}
      </div>
    </AppShell>
  );
}

function BackerView() {
  const t = useT();
  return (
    <div className="space-y-8">
      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/market/needs/new">
          <div className="bg-primary text-white rounded-xl p-5 hover:bg-primary/90 transition-colors cursor-pointer group">
            <Plus className="w-5 h-5 mb-3" />
            <h3 className="font-semibold text-sm mb-1">{t.market.postANeed}</h3>
            <p className="text-white/70 text-xs">{t.market.postANeedDesc}</p>
            <ArrowRight className="w-4 h-4 mt-3 opacity-60 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
        <Link href="/market/creators">
          <div className="bg-white border border-border rounded-xl p-5 hover:border-primary/40 transition-colors cursor-pointer group">
            <Star className="w-5 h-5 mb-3 text-primary" />
            <h3 className="font-semibold text-sm mb-1 text-foreground">{t.market.browseCreators}</h3>
            <p className="text-muted-foreground text-xs">{t.market.browseCreatorsDesc}</p>
            <ArrowRight className="w-4 h-4 mt-3 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
        <Link href="/projects">
          <div className="bg-white border border-border rounded-xl p-5 hover:border-primary/40 transition-colors cursor-pointer group">
            <CheckCircle2 className="w-5 h-5 mb-3 text-primary" />
            <h3 className="font-semibold text-sm mb-1 text-foreground">{t.nav.myProjects}</h3>
            <p className="text-muted-foreground text-xs">{t.market.myProjectsDesc}</p>
            <ArrowRight className="w-4 h-4 mt-3 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Active order summary */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">{t.market.activeOrder}</h2>
        <Link href="/orders/ord_001">
          <div className="bg-white border border-border rounded-xl p-5 hover:border-primary/40 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Cinematic Brand Film — NeoVision AI</p>
                <p className="text-xs text-muted-foreground mt-0.5">with Aria Song · ¥4,200</p>
              </div>
              <Badge className="bg-accent text-primary border-0 text-xs">{t.market.stageOf(3, 5)}</Badge>
            </div>
            <div className="mt-4">
              <div className="flex gap-1.5">
                {t.market.stageNames.map((s, i) => (
                  <div key={s} className="flex-1">
                    <div className={cn("h-1.5 rounded-full", i < 2 ? "bg-primary" : i === 2 ? "bg-primary/40" : "bg-border")} />
                    <p className="text-[9px] text-muted-foreground mt-1 truncate">{s}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-amber-600 mt-3 font-medium">{t.market.draftSubmitted}</p>
          </div>
        </Link>
      </div>

      {/* My needs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">{t.market.myPostedNeeds}</h2>
          <Link href="/market/needs/new">
            <Button size="sm" variant="outline" className="text-xs gap-1"><Plus className="w-3 h-3" /> {t.common.new}</Button>
          </Link>
        </div>
        <div className="space-y-3">
          {NEEDS.filter(n => n.backerId === "u_backer_01").map((need) => (
            <Link key={need.id} href={`/market/needs/${need.id}`}>
              <div className="bg-white border border-border rounded-xl p-4 hover:border-primary/40 transition-colors flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{need.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">¥{need.budget.toLocaleString()} · {need.bids} {t.common.bids} · {need.publishedAt}</p>
                </div>
                <Badge variant={need.status === "open" ? "default" : "secondary"} className="text-xs capitalize">
                  {need.status === "open" ? t.market.statusOpen : t.market.statusInProgress}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function CreatorView() {
  const t = useT();
  const needs = NEEDS.filter(n => n.status === "open");
  return (
    <div className="space-y-8">
      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/projects">
          <div className="bg-primary text-white rounded-xl p-5 hover:bg-primary/90 transition-colors cursor-pointer group">
            <CheckCircle2 className="w-5 h-5 mb-3" />
            <h3 className="font-semibold text-sm mb-1">{t.nav.myProjects}</h3>
            <p className="text-white/70 text-xs">{t.market.creatorActiveProjects}</p>
            <ArrowRight className="w-4 h-4 mt-3 opacity-60 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
        <Link href="/market/creators/u_creator_01">
          <div className="bg-white border border-border rounded-xl p-5 hover:border-primary/40 transition-colors cursor-pointer group">
            <Star className="w-5 h-5 mb-3 text-primary" />
            <h3 className="font-semibold text-sm mb-1 text-foreground">{t.market.myProfileCard}</h3>
            <p className="text-muted-foreground text-xs">{t.market.myProfileCardDesc}</p>
            <ArrowRight className="w-4 h-4 mt-3 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
        <Link href="/assets">
          <div className="bg-white border border-border rounded-xl p-5 hover:border-primary/40 transition-colors cursor-pointer group">
            <Sparkles className="w-5 h-5 mb-3 text-primary" />
            <h3 className="font-semibold text-sm mb-1 text-foreground">{t.market.assetLibrary}</h3>
            <p className="text-muted-foreground text-xs">{t.market.assetLibraryDesc}</p>
            <ArrowRight className="w-4 h-4 mt-3 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recommended needs */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-foreground">{t.market.recommendedForYou}</h2>
          <Badge variant="outline" className="text-primary border-primary/30 bg-accent text-xs gap-1"><Sparkles className="w-2.5 h-2.5" /> {t.market.aiMatch}</Badge>
        </div>
        <div className="space-y-3">
          {needs.map((need) => (
            <Link key={need.id} href={`/market/needs/${need.id}`}>
              <div className="bg-white border border-border rounded-xl p-4 hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm font-medium text-foreground truncate">{need.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{need.backerNickname} · ¥{need.budget.toLocaleString()} · {need.deliveryDays}{t.common.days}</p>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {need.styles.slice(0,3).map(s => (
                        <span key={s} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-semibold text-primary">{need.matchScore}%</div>
                    <div className="text-[10px] text-muted-foreground">{t.common.match}</div>
                    <div className="text-xs text-muted-foreground mt-1">{need.bids} {t.common.bids}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
