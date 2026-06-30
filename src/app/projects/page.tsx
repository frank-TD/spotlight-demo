"use client";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUpRight,
  MoreVertical,
  Film,
} from "lucide-react";
import { useStore, flowToStages } from "@/lib/store";
import AppShell from "@/components/layout/AppShell";
import { ORDER_ACTIVE, ORDER_COMPLETED } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";

export default function ProjectsPage() {
  const { activeRole, sessionFlows } = useStore();
  const t = useT();

  const orderStages = flowToStages(sessionFlows.sess_001);
  const completedCount = orderStages.filter((s) => s.status === "accepted").length;
  const totalStages = orderStages.length;
  const heroProgressPct = Math.round((completedCount / totalStages) * 100);

  const heroOrder = ORDER_ACTIVE;
  const recentOrders = [
    {
      ...ORDER_COMPLETED,
      completedCount: 5,
      total: 5,
      status: "completed" as const,
      progressPct: 100,
    },
  ];

  const counterpartHero =
    activeRole === "backer" ? heroOrder.creator.nickname : heroOrder.backer.nickname;

  return (
    <AppShell>
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 pt-10 pb-16">
        <div
          className="animate-fade-up flex flex-col md:flex-row justify-between md:items-end gap-6 mb-12"
          style={{ animationDelay: "0ms" }}
        >
          <div className="space-y-2">
            <h1 className="font-headline text-headline-lg text-on-surface">{t.projects.title}</h1>
            <p className="text-on-surface-variant font-body opacity-80">
              {activeRole === "backer" ? t.projects.backerDesc : t.projects.creatorDesc}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0 min-w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:outline-none focus:ring-0 font-body text-sm transition-all"
                placeholder={t.creators.searchPlaceholder}
                type="text"
              />
            </div>
            <button className="flex items-center gap-2 px-6 py-3 border border-outline-variant rounded-xl font-label text-label-md uppercase tracking-wider hover:bg-surface-container-high transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
              {t.common.inProgress}
            </button>
            <button className="flex items-center gap-2 px-6 py-3 border border-outline-variant rounded-xl font-label text-label-md uppercase tracking-wider hover:bg-surface-container-high transition-colors">
              <ArrowUpDown className="w-4 h-4" />
              {t.common.posted}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="animate-fade-up lg:col-span-2 group" style={{ animationDelay: "100ms" }}>
            <Link href={`/orders/${heroOrder.id}`} className="block">
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 h-full">
                <div className="p-8 md:p-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="bg-tertiary-container text-on-tertiary-container text-[11px] font-label uppercase tracking-[0.1em] px-3 py-1 rounded-full">
                          {t.projects.statusInProgress}
                        </span>
                        <span className="text-on-surface-variant/60 text-[11px] font-label uppercase tracking-[0.1em]">
                          {t.projects.stagePendingReview}
                        </span>
                      </div>
                      <h3 className="font-headline text-headline-md text-on-surface">
                        {heroOrder.title}
                      </h3>
                    </div>
                    <span className="w-12 h-12 flex items-center justify-center rounded-full border border-outline-variant group-hover:bg-primary group-hover:text-on-primary transition-all duration-300 shrink-0">
                      <ArrowUpRight className="w-5 h-5" />
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-sm font-bold text-on-primary-container border border-outline-variant">
                        {activeRole === "backer" ? "AS" : "LC"}
                      </div>
                      <div>
                        <p className="text-[10px] font-label uppercase text-outline tracking-wider">
                          {activeRole === "backer"
                            ? t.projects.counterpartCreator
                            : t.projects.counterpartBacker}
                        </p>
                        <p className="font-body font-bold">{counterpartHero}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-label uppercase text-outline tracking-wider">
                        {t.needDetail.budget}
                      </p>
                      <p className="font-body font-bold">¥{heroOrder.totalFiat.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-label uppercase text-outline tracking-wider">
                        {t.contract.autoAcceptance}
                      </p>
                      <p className="font-body font-bold">{t.contract.autoAcceptanceValue}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <p className="text-on-surface-variant font-body text-sm">
                        {t.projects.stagePendingReview}
                      </p>
                      <p className="font-label text-primary text-label-md">
                        {t.projects.stagesComplete(completedCount, totalStages)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {orderStages.map((s, i) => {
                        const done = i < completedCount;
                        const active = i === completedCount && s.status !== "pending";
                        return (
                          <div
                            key={s.idx}
                            className={cn(
                              "flex-1 h-1 rounded-full",
                              done && "bg-primary",
                              active && !done && "bg-primary/40",
                              !done && !active && "bg-outline-variant/30"
                            )}
                          />
                        );
                      })}
                    </div>
                    <p className="text-right text-[10px] font-label uppercase text-outline tracking-wider">
                      {heroProgressPct}%
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="animate-fade-up flex flex-col gap-6" style={{ animationDelay: "180ms" }}>
            <div className="bg-primary p-8 rounded-2xl text-on-primary">
              <h4 className="font-label text-label-md uppercase tracking-widest mb-6 opacity-80">
                {t.creatorProfile.performance}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-xl">
                  <p className="text-3xl font-headline mb-1">01</p>
                  <p className="text-[10px] font-label uppercase tracking-wider opacity-70">
                    {t.projects.statusInProgress}
                  </p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl">
                  <p className="text-3xl font-headline mb-1">01</p>
                  <p className="text-[10px] font-label uppercase tracking-wider opacity-70">
                    {t.projects.statusCompleted}
                  </p>
                </div>
              </div>
              <Link
                href="/market/needs/new"
                className="block text-center w-full mt-6 py-4 bg-primary-container text-on-primary-container rounded-xl font-label text-label-md uppercase tracking-wider hover:brightness-110 transition-all"
              >
                {t.market.postANeed}
              </Link>
            </div>

            <div className="bg-surface-container-high border border-outline-variant/30 rounded-2xl p-6 group">
              <div className="flex justify-between items-center mb-4">
                <span className="bg-secondary-container text-on-secondary-container text-[10px] font-label uppercase tracking-wider px-2 py-1 rounded">
                  {t.projects.statusCompleted}
                </span>
                <MoreVertical className="w-4 h-4 text-outline" />
              </div>
              <h4 className="font-body font-bold mb-1">{ORDER_COMPLETED.title}</h4>
              <p className="text-sm text-on-surface-variant/70">
                {activeRole === "backer"
                  ? t.projects.counterpartCreator
                  : t.projects.counterpartBacker}
                :{" "}
                {activeRole === "backer"
                  ? ORDER_COMPLETED.creator.nickname
                  : ORDER_COMPLETED.backer.nickname}
              </p>
            </div>
          </div>

          <div
            className="animate-fade-up lg:col-span-3 space-y-4"
            style={{ animationDelay: "260ms" }}
          >
            <h4 className="font-label text-label-md uppercase tracking-[0.2em] text-outline mb-2">
              {t.creators.aiRanked}
            </h4>
            {recentOrders.map((order, i) => {
              const counterpart =
                activeRole === "backer" ? order.creator.nickname : order.backer.nickname;
              return (
                <ListRow
                  key={order.id}
                  href={`/orders/${order.id}`}
                  title={order.title}
                  counterpart={counterpart}
                  counterpartLabel={
                    activeRole === "backer"
                      ? t.projects.counterpartCreator
                      : t.projects.counterpartBacker
                  }
                  budget={order.totalFiat}
                  progressPct={order.progressPct}
                  status={t.projects.statusCompleted}
                  statusVariant="completed"
                  gradient={i}
                />
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

const ROW_GRADIENTS = [
  "from-secondary-container via-secondary-fixed to-primary-fixed",
  "from-tertiary-container via-tertiary-fixed-dim to-primary-fixed",
  "from-primary-fixed to-tertiary-fixed",
];

function ListRow({
  href,
  title,
  counterpart,
  counterpartLabel,
  budget,
  progressPct,
  status,
  statusVariant,
  gradient,
}: {
  href: string;
  title: string;
  counterpart: string;
  counterpartLabel: string;
  budget: number;
  progressPct: number;
  status: string;
  statusVariant: "in_progress" | "completed";
  gradient: number;
}) {
  return (
    <Link
      href={href}
      className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-6 hover:bg-surface-container-high transition-colors group cursor-pointer"
    >
      <div
        className={cn(
          "w-full md:w-24 h-16 rounded-lg overflow-hidden bg-gradient-to-br flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500 flex-shrink-0",
          ROW_GRADIENTS[gradient % ROW_GRADIENTS.length]
        )}
      >
        <Film className="w-6 h-6 text-primary opacity-70" />
      </div>
      <div className="flex-grow min-w-0">
        <h5 className="font-body font-bold text-on-surface truncate">{title}</h5>
        <p className="text-xs text-on-surface-variant">
          {counterpartLabel}: {counterpart}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2 w-full md:w-48">
        <div className="flex justify-between w-full text-[10px] font-label text-outline">
          <span className="uppercase tracking-wider">progress</span>
          <span className={cn(progressPct === 100 ? "text-primary" : "text-on-surface")}>
            {progressPct}%
          </span>
        </div>
        <div className="w-full h-1 bg-outline-variant/30 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-bold text-on-surface whitespace-nowrap">
          ¥{budget.toLocaleString()}
        </span>
        <span
          className={cn(
            "text-[10px] font-label uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap",
            statusVariant === "completed"
              ? "bg-secondary/10 text-secondary"
              : "bg-tertiary-container text-on-tertiary-container"
          )}
        >
          {status}
        </span>
      </div>
    </Link>
  );
}
