"use client";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Film } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { CURRENT_USER_BACKER, ORDER_ACTIVE, ORDER_COMPLETED } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";

const INDUSTRIES = ["AI Tech", "Brand Film", "Product Launch"];

export default function BackerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  use(params);
  const t = useT();
  const user = CURRENT_USER_BACKER;
  const commissioned = [ORDER_ACTIVE, ORDER_COMPLETED];
  const totalSpent = commissioned.reduce((sum, o) => sum + o.totalFiat, 0);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 md:px-12 pt-8 pb-16">
        <Link
          href="/market"
          className="inline-flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider text-on-surface-variant hover:text-on-surface mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> {t.chat.backerBackToList}
        </Link>

        <div className="animate-fade-up space-y-6">
          {/* Header card */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-2xl font-bold shrink-0">
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-headline text-headline-md text-on-surface">{user.nickname}</h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="font-label text-[10px] uppercase tracking-widest bg-secondary-container text-on-secondary-container px-2.5 py-1 rounded">
                    {t.market.roleBacker}
                  </span>
                  <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                    {t.chat.backerCompany}
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-5 font-body text-sm text-on-surface-variant leading-relaxed">
              {t.profile.bioBackerDefault}
            </p>

            {/* Industries */}
            <div className="mt-5 flex flex-wrap gap-2">
              {INDUSTRIES.map((s) => (
                <span
                  key={s}
                  className="font-label text-[11px] uppercase tracking-widest bg-primary-container text-on-primary-container px-2.5 py-1 rounded-full"
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-outline-variant/30 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="font-headline text-[24px] text-on-surface leading-none">
                  {commissioned.length}
                </p>
                <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mt-1.5">
                  {t.chat.backerProjectsCommissioned}
                </p>
              </div>
              <div>
                <p className="font-headline text-[24px] text-on-surface leading-none">
                  ¥{totalSpent.toLocaleString()}
                </p>
                <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mt-1.5">
                  {t.chat.backerTotalSpent}
                </p>
              </div>
              <div>
                <p className="font-headline text-[24px] text-on-surface leading-none">
                  {t.chat.backerJoinedAtValue}
                </p>
                <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mt-1.5">
                  {t.chat.backerJoinedAt}
                </p>
              </div>
            </div>
          </div>

          {/* Recent commissions */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8">
            <h2 className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant mb-5">
              {t.chat.backerProjectsCommissioned}
            </h2>
            <div className="space-y-3">
              {commissioned.map((order, i) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 hover:bg-surface-container-high transition-colors group"
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br",
                      i % 2 === 0
                        ? "from-primary-container via-primary-fixed to-tertiary-container"
                        : "from-tertiary-container via-tertiary-fixed to-primary-container"
                    )}
                  >
                    <Film className="w-5 h-5 text-primary opacity-70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-bold text-on-surface text-sm truncate">
                      {order.title}
                    </p>
                    <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mt-1">
                      {t.projects.counterpartCreator}: {order.creator.nickname} · ¥
                      {order.totalFiat.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
