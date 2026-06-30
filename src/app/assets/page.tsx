"use client";
import { useState } from "react";
import { Upload, Download, Star, ExternalLink, Film, Send, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useStore, DistStatus } from "@/lib/store";
import AppShell from "@/components/layout/AppShell";
import { MY_ASSETS_CREATED, MY_ASSETS_PURCHASED } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";

const STATUS_COLOR: Record<DistStatus, string> = {
  metadata: "bg-secondary-container text-on-secondary-container",
  platforms: "bg-secondary-container text-on-secondary-container",
  payment: "bg-secondary-container text-on-secondary-container",
  neowow_review: "bg-primary-container text-on-primary-container",
  platform_review: "bg-primary-container text-on-primary-container",
  queue: "bg-primary-container text-on-primary-container",
  live: "bg-tertiary-container text-on-tertiary-container",
  takedown: "bg-surface-container text-on-surface-variant",
};

export default function AssetsPage() {
  const [tab, setTab] = useState<"created" | "purchased">("created");
  const { distributionByAsset } = useStore();
  const t = useT();

  const statusLabel = (s: DistStatus) =>
    ({
      metadata: t.distribute.statusDraft,
      platforms: t.distribute.statusPlatforms,
      payment: t.distribute.statusPayment,
      neowow_review: t.distribute.statusNeowowReview,
      platform_review: t.distribute.statusPlatformReview,
      queue: t.distribute.statusQueue,
      live: t.distribute.statusLive,
      takedown: t.distribute.statusTakedown,
    })[s];

  const STAGES: DistStatus[] = [
    "metadata",
    "platforms",
    "payment",
    "neowow_review",
    "platform_review",
    "queue",
    "live",
  ];

  return (
    <AppShell>
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 pt-10 pb-16">
        <div
          className="animate-fade-up flex items-end justify-between mb-12"
          style={{ animationDelay: "0ms" }}
        >
          <div>
            <h1 className="font-headline text-headline-lg text-on-surface">{t.assets.title}</h1>
            <p className="text-on-surface-variant mt-2 font-body opacity-80">
              {t.assets.subtitle}
            </p>
          </div>
          {tab === "created" && (
            <button
              onClick={() => toast.info(t.assets.uploadToast)}
              className="flex items-center gap-1.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-5 py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition-all"
            >
              <Upload className="w-4 h-4" /> {t.assets.uploadBtn}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div
          className="animate-fade-up flex border-b border-outline-variant/30 mb-8 gap-2"
          style={{ animationDelay: "100ms" }}
        >
          {(["created", "purchased"] as const).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={cn(
                "px-4 py-3 font-label text-label-md uppercase tracking-wider transition-colors border-b-2 -mb-px",
                tab === tabKey
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              )}
            >
              {tabKey === "created"
                ? t.assets.myCreations(MY_ASSETS_CREATED.length)
                : t.assets.purchased(MY_ASSETS_PURCHASED.length)}
            </button>
          ))}
        </div>

        {tab === "created" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MY_ASSETS_CREATED.map((asset, i) => {
              const dist = distributionByAsset[asset.id];
              const stageIdx = dist ? STAGES.indexOf(dist.status) : -1;
              const isLive = dist?.status === "live";
              const isInReview =
                dist && ["neowow_review", "platform_review", "queue"].includes(dist.status);
              const isTakedown = dist?.status === "takedown";
              const hasDraft = dist && ["metadata", "platforms", "payment"].includes(dist.status);
              return (
                <div
                  key={asset.id}
                  className="animate-fade-up bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden group hover:shadow-md transition-shadow flex flex-col"
                  style={{ animationDelay: `${180 + i * 80}ms` }}
                >
                  <div
                    className={cn(
                      "aspect-video bg-gradient-to-br flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500",
                      i % 3 === 0 &&
                        "from-primary-container via-primary-fixed to-tertiary-container",
                      i % 3 === 1 &&
                        "from-tertiary-container via-tertiary-fixed to-primary-container",
                      i % 3 === 2 &&
                        "from-secondary-container via-secondary-fixed to-primary-container"
                    )}
                  >
                    <Film className="w-10 h-10 text-primary opacity-70" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-headline text-[18px] text-on-surface leading-snug">
                        {asset.title}
                      </p>
                      {asset.showcased && (
                        <Star className="w-4 h-4 fill-tertiary text-tertiary shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mb-1">
                      {asset.size} · {asset.duration}
                    </p>
                    {asset.orderId && (
                      <Link
                        href={`/orders/${asset.orderId}`}
                        className="font-label text-[11px] tracking-wider text-primary hover:underline flex items-center gap-1 mt-2"
                      >
                        {asset.orderTitle} <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}

                    {/* Distribution status */}
                    {dist && (
                      <div className="mt-4 pt-4 border-t border-outline-variant/30">
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={cn(
                              "font-label text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full",
                              STATUS_COLOR[dist.status]
                            )}
                          >
                            {statusLabel(dist.status)}
                          </span>
                          {dist.platforms && dist.platforms.length > 0 && (
                            <span className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant">
                              {t.distribute.publishedTo(dist.platforms.length)}
                            </span>
                          )}
                        </div>
                        {/* Progress bar (7 stages) */}
                        <div className="flex gap-1">
                          {STAGES.map((s, idx) => (
                            <div
                              key={s}
                              className={cn(
                                "flex-1 h-1 rounded-full",
                                idx <= stageIdx ? "bg-primary" : "bg-outline-variant/30"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex-1" />

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => toast.success(t.assets.downloadToast)}
                        className="flex-1 flex items-center justify-center gap-1.5 border border-outline-variant rounded-lg px-3 py-2 font-label text-label-md uppercase tracking-wider hover:bg-surface-container-high transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> {t.assets.downloadBtn}
                      </button>
                      {!dist && (
                        <Link
                          href={`/assets/${asset.id}/distribute`}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-3 py-2 rounded-lg hover:opacity-90"
                        >
                          <Send className="w-3.5 h-3.5" /> {t.distribute.actionStart}
                        </Link>
                      )}
                      {hasDraft && (
                        <Link
                          href={`/assets/${asset.id}/distribute`}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-3 py-2 rounded-lg hover:opacity-90"
                        >
                          <Send className="w-3.5 h-3.5" /> {t.distribute.actionStart}
                        </Link>
                      )}
                      {isInReview && (
                        <Link
                          href={`/assets/${asset.id}/distribute`}
                          className="flex-1 flex items-center justify-center gap-1.5 border border-outline-variant rounded-lg px-3 py-2 font-label text-label-md uppercase tracking-wider hover:bg-surface-container-high"
                        >
                          <Eye className="w-3.5 h-3.5" /> {t.distribute.actionView}
                        </Link>
                      )}
                      {isLive && (
                        <Link
                          href={`/assets/${asset.id}/distribute`}
                          className="flex-1 flex items-center justify-center gap-1.5 border border-outline-variant rounded-lg px-3 py-2 font-label text-label-md uppercase tracking-wider hover:bg-surface-container-high"
                        >
                          <Eye className="w-3.5 h-3.5" /> {t.distribute.actionManage}
                        </Link>
                      )}
                      {isTakedown && (
                        <Link
                          href={`/assets/${asset.id}/distribute`}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-3 py-2 rounded-lg hover:opacity-90"
                        >
                          <Send className="w-3.5 h-3.5" /> {t.distribute.actionResubmit}
                        </Link>
                      )}
                      <button
                        onClick={() => toast.error(t.assets.cannotDeleteToast)}
                        className="px-3 py-2 text-on-surface-variant hover:text-error hover:bg-error-container/40 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "purchased" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MY_ASSETS_PURCHASED.map((asset, i) => {
              const dist = distributionByAsset[asset.id];
              const stageIdx = dist ? STAGES.indexOf(dist.status) : -1;
              const isLive = dist?.status === "live";
              const isInReview =
                dist && ["neowow_review", "platform_review", "queue"].includes(dist.status);
              const isTakedown = dist?.status === "takedown";
              const hasDraft = dist && ["metadata", "platforms", "payment"].includes(dist.status);
              return (
                <div
                  key={asset.id}
                  className="animate-fade-up bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden group hover:shadow-md transition-shadow flex flex-col"
                  style={{ animationDelay: `${180 + i * 80}ms` }}
                >
                  <div
                    className={cn(
                      "aspect-video bg-gradient-to-br flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500",
                      i % 3 === 0 &&
                        "from-primary-container via-primary-fixed to-tertiary-container",
                      i % 3 === 1 &&
                        "from-tertiary-container via-tertiary-fixed to-primary-container",
                      i % 3 === 2 &&
                        "from-secondary-container via-secondary-fixed to-primary-container"
                    )}
                  >
                    <Film className="w-10 h-10 text-primary opacity-70" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <p className="font-headline text-[18px] text-on-surface mb-1">{asset.title}</p>
                    <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mb-3">
                      {t.assets.byAuthor} {asset.creatorName} · {asset.size}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-label text-[10px] uppercase tracking-widest bg-primary-container text-on-primary-container px-2 py-1 rounded">
                        {asset.copyright}
                      </span>
                      {!asset.subLicensable && (
                        <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                          {t.assets.nonTransferable}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/orders/${asset.orderId}`}
                      className="font-label text-[11px] tracking-wider text-primary hover:underline flex items-center gap-1"
                    >
                      {t.assets.sourceOrder} <ExternalLink className="w-3 h-3" />
                    </Link>

                    {/* Distribution status */}
                    {dist && (
                      <div className="mt-4 pt-4 border-t border-outline-variant/30">
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={cn(
                              "font-label text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full",
                              STATUS_COLOR[dist.status]
                            )}
                          >
                            {statusLabel(dist.status)}
                          </span>
                          {dist.platforms && dist.platforms.length > 0 && (
                            <span className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant">
                              {t.distribute.publishedTo(dist.platforms.length)}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {STAGES.map((s, idx) => (
                            <div
                              key={s}
                              className={cn(
                                "flex-1 h-1 rounded-full",
                                idx <= stageIdx ? "bg-primary" : "bg-outline-variant/30"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex-1" />

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => toast.success(t.assets.downloadToast)}
                        className="flex-1 flex items-center justify-center gap-1.5 border border-outline-variant rounded-lg px-3 py-2 font-label text-label-md uppercase tracking-wider hover:bg-surface-container-high transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> {t.assets.downloadBtn}
                      </button>
                      {!dist && (
                        <Link
                          href={`/assets/${asset.id}/distribute`}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-3 py-2 rounded-lg hover:opacity-90"
                        >
                          <Send className="w-3.5 h-3.5" /> {t.distribute.actionStart}
                        </Link>
                      )}
                      {hasDraft && (
                        <Link
                          href={`/assets/${asset.id}/distribute`}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-3 py-2 rounded-lg hover:opacity-90"
                        >
                          <Send className="w-3.5 h-3.5" /> {t.distribute.actionStart}
                        </Link>
                      )}
                      {isInReview && (
                        <Link
                          href={`/assets/${asset.id}/distribute`}
                          className="flex-1 flex items-center justify-center gap-1.5 border border-outline-variant rounded-lg px-3 py-2 font-label text-label-md uppercase tracking-wider hover:bg-surface-container-high"
                        >
                          <Eye className="w-3.5 h-3.5" /> {t.distribute.actionView}
                        </Link>
                      )}
                      {isLive && (
                        <Link
                          href={`/assets/${asset.id}/distribute`}
                          className="flex-1 flex items-center justify-center gap-1.5 border border-outline-variant rounded-lg px-3 py-2 font-label text-label-md uppercase tracking-wider hover:bg-surface-container-high"
                        >
                          <Eye className="w-3.5 h-3.5" /> {t.distribute.actionManage}
                        </Link>
                      )}
                      {isTakedown && (
                        <Link
                          href={`/assets/${asset.id}/distribute`}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-3 py-2 rounded-lg hover:opacity-90"
                        >
                          <Send className="w-3.5 h-3.5" /> {t.distribute.actionResubmit}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
