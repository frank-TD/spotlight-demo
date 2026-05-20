"use client";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { NEEDS } from "@/lib/mock-data";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";
import {
  PlusCircle,
  Compass,
  BriefcaseBusiness,
  ArrowRight,
  Megaphone,
  Eye,
  Check,
  Clock,
  CheckCheck,
  Hourglass,
  Film,
  BellRing,
  Plus,
  Sparkles,
  IdCard,
  FolderHeart,
} from "lucide-react";

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
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 pt-10 pb-16">
        <header className="animate-fade-up flex flex-col md:flex-row justify-between md:items-end gap-6 mb-12" style={{ animationDelay: "0ms" }}>
          <div>
            <h1 className="font-headline text-headline-lg text-on-surface">{t.market.title}</h1>
            <p className="text-on-surface-variant mt-2 font-body opacity-80 italic">
              {activeRole === "backer" ? t.market.backerDesc : t.market.creatorDesc}
            </p>
          </div>
          <div className="bg-surface-container-low p-1 rounded-xl flex border border-outline-variant/30 shadow-sm self-start md:self-auto">
            {(["backer", "creator"] as const).map((r) => (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className={cn(
                  "px-8 py-2 font-label text-label-md uppercase tracking-widest rounded-lg transition-colors",
                  activeRole === r
                    ? "bg-surface-container-lowest text-primary shadow-sm border border-outline-variant/20"
                    : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                {r === "backer" ? t.market.roleBacker : t.market.roleCreator}
              </button>
            ))}
          </div>
        </header>

        {activeRole === "backer" ? <BackerView /> : <CreatorView />}
      </div>
    </AppShell>
  );
}

function BackerView() {
  const t = useT();
  const myNeeds = NEEDS.filter((n) => n.backerId === "u_backer_01");

  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <QuickActionCard
          href="/market/needs/new"
          icon={PlusCircle}
          title={t.market.postANeed}
          desc={t.market.postANeedDesc}
          variant="primary"
          decorIcon={Megaphone}
          style={{ animationDelay: "100ms" }}
        />
        <QuickActionCard
          href="/market/creators"
          icon={Compass}
          title={t.market.browseCreators}
          desc={t.market.browseCreatorsDesc}
          variant="tertiary"
          style={{ animationDelay: "180ms" }}
        />
        <QuickActionCard
          href="/projects"
          icon={BriefcaseBusiness}
          title={t.nav.myProjects}
          desc={t.market.myProjectsDesc}
          variant="secondary"
          style={{ animationDelay: "260ms" }}
        />
      </section>

      <div className="animate-fade-up" style={{ animationDelay: "340ms" }}>
        <ActiveOrderSection />
      </div>

      <section className="animate-fade-up" style={{ animationDelay: "420ms" }}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant">
            {t.market.myPostedNeeds}
          </h2>
          <Link
            href="/market/needs/new"
            className="flex items-center gap-2 font-label text-label-md uppercase tracking-wider text-primary border border-primary/20 px-4 py-1.5 rounded-lg hover:bg-primary-container transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t.common.new}
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {myNeeds.map((need, idx) => (
            <PostedNeedRow
              key={need.id}
              href={`/market/needs/${need.id}`}
              title={need.title}
              budget={need.budget}
              bids={need.bids}
              date={need.publishedAt}
              status={need.status === "open" ? t.market.statusOpen : t.market.statusInProgress}
              isOpen={need.status === "open"}
              gradient={idx}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function CreatorView() {
  const t = useT();
  const openNeeds = NEEDS.filter((n) => n.status === "open");

  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <QuickActionCard
          href="/projects"
          icon={BriefcaseBusiness}
          title={t.nav.myProjects}
          desc={t.market.creatorActiveProjects}
          variant="primary"
          decorIcon={Film}
          style={{ animationDelay: "100ms" }}
        />
        <QuickActionCard
          href="/market/creators/u_creator_01"
          icon={IdCard}
          title={t.market.myProfileCard}
          desc={t.market.myProfileCardDesc}
          variant="tertiary"
          style={{ animationDelay: "180ms" }}
        />
        <QuickActionCard
          href="/assets"
          icon={FolderHeart}
          title={t.market.assetLibrary}
          desc={t.market.assetLibraryDesc}
          variant="secondary"
          style={{ animationDelay: "260ms" }}
        />
      </section>

      <section className="animate-fade-up" style={{ animationDelay: "340ms" }}>
        <div className="flex items-center gap-3 mb-8">
          <h2 className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant">
            {t.market.recommendedForYou}
          </h2>
          <span className="flex items-center gap-1 bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-label text-[11px] tracking-widest uppercase">
            <Sparkles className="w-3 h-3" />
            {t.market.aiMatch}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {openNeeds.map((need, idx) => (
            <PostedNeedRow
              key={need.id}
              href={`/market/needs/${need.id}`}
              title={need.title}
              budget={need.budget}
              bids={need.bids}
              date={`${need.deliveryDays}${t.common.days}`}
              status={`${need.matchScore}% ${t.common.match}`}
              isOpen={true}
              gradient={idx}
            />
          ))}
        </div>
      </section>
    </>
  );
}

/* ───── Subcomponents ──────────────────────────────────────────────────── */

type LucideIcon = React.ComponentType<{ className?: string }>;

function QuickActionCard({
  href,
  icon: Icon,
  title,
  desc,
  variant,
  decorIcon: Decor,
  style,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  variant: "primary" | "secondary" | "tertiary";
  decorIcon?: LucideIcon;
  style?: React.CSSProperties;
}) {
  const styles = {
    primary: {
      cls: "bg-primary-container border-outline-variant/40 text-on-primary-container",
      iconCls: "text-primary-fixed-dim",
      arrowCls: "text-primary",
      descCls: "text-on-primary-container/70",
    },
    tertiary: {
      cls: "bg-surface-container-lowest border-outline-variant/40 hover:bg-tertiary-container text-on-surface",
      iconCls: "text-tertiary",
      arrowCls: "text-tertiary",
      descCls: "text-on-surface-variant",
    },
    secondary: {
      cls: "bg-surface-container-lowest border-outline-variant/40 hover:bg-secondary-container text-on-surface",
      iconCls: "text-secondary",
      arrowCls: "text-secondary",
      descCls: "text-on-surface-variant",
    },
  }[variant];

  return (
    <Link
      href={href}
      style={style}
      className={cn(
        "animate-fade-up group relative overflow-hidden rounded-xl border p-8 cursor-pointer active:scale-[0.98] transition-all duration-300",
        styles.cls
      )}
    >
      <div className="relative z-10">
        <Icon className={cn("w-8 h-8 mb-6", styles.iconCls)} />
        <h3 className="font-headline text-headline-md mb-2">{title}</h3>
        <p className={cn("font-body mb-8", styles.descCls)}>{desc}</p>
        <ArrowRight className={cn("w-5 h-5 group-hover:translate-x-2 transition-transform", styles.arrowCls)} />
      </div>
      {Decor && (
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Decor className="w-40 h-40" />
        </div>
      )}
    </Link>
  );
}

function ActiveOrderSection() {
  const t = useT();
  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant">
          {t.market.activeOrder}
        </h2>
      </div>
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h3 className="font-headline text-headline-md text-on-surface">
                  {t.market.activeOrderTitle}
                </h3>
                <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full font-label text-[11px] tracking-widest uppercase">
                  {t.market.stageOf(3, 5)}
                </span>
              </div>
              <p className="font-body text-on-surface-variant opacity-80 italic">{t.market.activeOrderWith}</p>
            </div>
            <Link
              href="/orders/ord_001"
              className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-label text-label-md uppercase tracking-wider shadow-sm hover:opacity-90 transition-opacity self-start"
            >
              <Eye className="w-4 h-4" />
              {t.chat.viewOrder}
            </Link>
          </div>

          <StageTracker />

          <div className="bg-primary-container/30 border-l-4 border-primary p-4 rounded-r-lg flex items-center gap-4 mt-12">
            <BellRing className="w-5 h-5 text-primary shrink-0" />
            <p className="font-body text-on-primary-container">
              <span className="font-bold">{t.market.draftSubmitted}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function StageTracker() {
  const t = useT();
  const stages = t.market.stageNames;
  const currentIndex = 2;

  return (
    <div className="relative mt-12 mb-8">
      <div className="absolute top-5 left-0 right-0 h-1 bg-surface-container-high z-0">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
        />
      </div>
      <div className="relative z-10 flex justify-between">
        {stages.map((label, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          const IconNode = done ? Check : active ? Clock : i === stages.length - 1 ? CheckCheck : Hourglass;
          return (
            <div key={label} className="flex flex-col items-center">
              <div
                className={cn(
                  "rounded-full flex items-center justify-center border-4 border-surface shadow-sm",
                  done && "w-10 h-10 bg-primary text-on-primary",
                  active && "w-12 h-12 -mt-1 bg-primary-container text-primary shadow-md ring-2 ring-primary/20",
                  !done && !active && "w-10 h-10 bg-surface-container text-outline-variant"
                )}
              >
                <IconNode className={cn("w-4 h-4", active && "animate-pulse w-5 h-5")} />
              </div>
              <span
                className={cn(
                  "mt-2 font-label text-[10px] uppercase tracking-widest text-center",
                  active ? "text-primary font-bold" : done ? "text-on-surface-variant" : "text-on-surface-variant/40"
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const GRADIENTS = [
  "from-primary-container via-primary-fixed to-tertiary-container",
  "from-tertiary-container via-tertiary-fixed to-primary-container",
  "from-secondary-container via-secondary-fixed to-primary-container",
];

function PostedNeedRow({
  href,
  title,
  budget,
  bids,
  date,
  status,
  isOpen,
  gradient,
}: {
  href: string;
  title: string;
  budget: number;
  bids: number;
  date: string;
  status: string;
  isOpen: boolean;
  gradient: number;
}) {
  const t = useT();
  return (
    <Link
      href={href}
      className="group bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-6 flex-1 min-w-0">
        <div
          className={cn(
            "w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br flex-shrink-0 flex items-center justify-center transition-all duration-500 grayscale group-hover:grayscale-0",
            GRADIENTS[gradient % GRADIENTS.length]
          )}
        >
          <Film className="w-7 h-7 text-primary opacity-70" />
        </div>
        <div className="min-w-0">
          <h4 className="font-headline text-[20px] text-on-surface mb-1 truncate">{title}</h4>
          <div className="flex flex-wrap gap-x-6 gap-y-1 font-body text-on-surface-variant text-[14px] opacity-70">
            <span>¥{budget.toLocaleString()}</span>
            <span>{bids} {t.common.bids}</span>
            <span>{date}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 ml-auto md:ml-0">
        <span
          className={cn(
            "px-4 py-1.5 rounded-full font-label text-[11px] uppercase tracking-widest border",
            isOpen
              ? "bg-primary-container text-on-primary-container border-primary/10"
              : "bg-secondary-container text-on-secondary-container border-outline-variant/20"
          )}
        >
          {status}
        </span>
        <ArrowRight className="w-5 h-5 text-outline-variant group-hover:text-on-surface transition-colors" />
      </div>
    </Link>
  );
}
