"use client";
import { useState } from "react";
import {
  Upload,
  Download,
  Star,
  ExternalLink,
  Film,
  Send,
  Eye,
  Trash2,
  ImageIcon,
  Clapperboard,
  Mic,
  Music2,
  UsersRound,
  Mountain,
  Box,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useStore, DistStatus, type ProAssetKind, type StudioMode } from "@/lib/store";
import AppShell from "@/components/layout/AppShell";
import { MY_ASSETS_CREATED, MY_ASSETS_PURCHASED } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";

/* The asset hub's tab set: everything the studio produces lands here —
   final cuts, the NexGC cast/scenes/props libraries and Quick Tools
   single-shot generations — next to purchases. ?tab= deep-links from the
   studio's "view" toasts land on the right shelf. */
type HubTab = "created" | "cast" | "scenes" | "props" | "generations" | "purchased";
const HUB_TABS: { id: HubTab; label: string }[] = [
  { id: "created", label: "Final Cuts" },
  { id: "cast", label: "Cast" },
  { id: "scenes", label: "Scenes" },
  { id: "props", label: "Props" },
  { id: "generations", label: "Generations" },
  { id: "purchased", label: "Purchased" },
];
const KIND_BY_TAB: Partial<Record<HubTab, ProAssetKind>> = {
  cast: "character",
  scenes: "scene",
  props: "prop",
};
const MODE_ICON: Record<StudioMode, typeof ImageIcon> = {
  image: ImageIcon,
  video: Clapperboard,
  voiceover: Mic,
  music: Music2,
};

function EmptyShelf({
  icon: Icon,
  title,
  sub,
  ctaHref,
  ctaLabel,
}: {
  icon: typeof ImageIcon;
  title: string;
  sub: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="rounded-3xl border border-outline-variant/40 bg-surface-container-lowest/60 px-6 py-16 text-center">
      <Icon className="w-7 h-7 text-on-surface-variant mx-auto" />
      <p className="font-headline text-xl text-on-surface mt-4">{title}</p>
      <p className="font-body text-sm text-on-surface-variant mt-1.5 max-w-md mx-auto">{sub}</p>
      <Link
        href={ctaHref}
        className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-primary/45 text-primary font-label text-[10px] uppercase tracking-wider hover:bg-primary-container/25 transition-colors"
      >
        {ctaLabel} →
      </Link>
    </div>
  );
}

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
  const [tab, setTab] = useState<HubTab>(() => {
    if (typeof window === "undefined") return "created";
    const q = new URLSearchParams(window.location.search).get("tab");
    if (q === "final") return "created";
    return HUB_TABS.some((x) => x.id === q) ? (q as HubTab) : "created";
  });
  const { distributionByAsset, proExports, proAssets, studioSessions } = useStore();
  const t = useT();

  const kindAssets = (kind: ProAssetKind) => proAssets.filter((a) => a.kind === kind);
  // Quick Tools output, flattened across sessions, newest first.
  const generations = studioSessions
    .flatMap((s) => s.assets.map((a) => ({ ...a, sessionTitle: s.title })))
    .sort((a, b) => b.createdAt - a.createdAt);

  // NexGC Pro final cuts surface at the top of the created tab, shaped like
  // the mock assets so the card + distribution flow treat them identically.
  const createdAssets = [
    ...proExports.map((e) => {
      const m = Math.floor(e.durationSec / 60);
      const s = Math.round(e.durationSec % 60);
      return {
        id: e.id,
        title: e.title,
        type: "video",
        size: `${Math.max(24, Math.round(e.durationSec * 9))} MB`,
        duration: `${m}:${String(s).padStart(2, "0")}`,
        orderId: undefined as string | undefined,
        orderTitle: undefined as string | undefined,
        createdAt: new Date(e.createdAt).toISOString().slice(0, 10),
        showcased: false,
        proCover: e.coverUrl,
        proMeta: `NexGC Pro · ${e.clipCount} ${e.clipCount === 1 ? "clip" : "clips"}`,
      };
    }),
    ...MY_ASSETS_CREATED.map((a) => ({
      ...a,
      orderId: a.orderId as string | undefined,
      orderTitle: a.orderTitle as string | undefined,
      proCover: undefined as string | undefined,
      proMeta: undefined as string | undefined,
    })),
  ];

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
            <p className="font-label text-[10px] uppercase tracking-[0.28em] text-tertiary mb-2.5">
              The Archive
            </p>
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
          className="animate-fade-up flex border-b border-outline-variant/30 mb-8 gap-1 overflow-x-auto"
          style={{ animationDelay: "100ms" }}
        >
          {HUB_TABS.map(({ id, label }) => {
            const count =
              id === "created"
                ? createdAssets.length
                : id === "purchased"
                  ? MY_ASSETS_PURCHASED.length
                  : id === "generations"
                    ? generations.length
                    : kindAssets(KIND_BY_TAB[id]!).length;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "px-4 py-3 font-label text-label-md uppercase tracking-wider transition-colors border-b-2 -mb-px whitespace-nowrap",
                  tab === id
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant hover:text-on-surface"
                )}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        {/* NexGC libraries: cast / scenes / props */}
        {(tab === "cast" || tab === "scenes" || tab === "props") &&
          (() => {
            const kind = KIND_BY_TAB[tab]!;
            const list = kindAssets(kind);
            if (list.length === 0) {
              return (
                <EmptyShelf
                  icon={tab === "cast" ? UsersRound : tab === "scenes" ? Mountain : Box}
                  title={`No ${tab} saved yet`}
                  sub="Generate looks in NexGC Studio — everything you save lands here."
                  ctaHref="/discovery/workspace"
                  ctaLabel="Open NexGC Studio"
                />
              );
            }
            return (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {list.map((a, i) => (
                  <div
                    key={a.id}
                    className="animate-fade-up bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden"
                    style={{ animationDelay: `${120 + i * 60}ms` }}
                  >
                    <div className={cn("relative overflow-hidden", kind === "scene" ? "aspect-video" : "aspect-[3/4]")}>
                      <Image
                        src={a.imageUrl}
                        alt={a.name}
                        width={480}
                        height={640}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="px-3.5 py-3">
                      <p className="font-body text-sm text-on-surface truncate">{a.name}</p>
                      <p className="font-body text-[11px] text-on-surface-variant/85 truncate mt-0.5">
                        {a.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

        {/* Quick Tools generations */}
        {tab === "generations" &&
          (generations.length === 0 ? (
            <EmptyShelf
              icon={Wand2}
              title="No generations yet"
              sub="Quick Tools output (image · video · voiceover · music) collects here, session by session."
              ctaHref="/discovery/workspace?mode=basic"
              ctaLabel="Open Quick Tools"
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {generations.map((g, i) => {
                const Icon = MODE_ICON[g.mode];
                return (
                  <div
                    key={g.id}
                    className="animate-fade-up bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden"
                    style={{ animationDelay: `${120 + i * 50}ms` }}
                  >
                    <div className="relative aspect-video bg-surface-container overflow-hidden">
                      {g.imageUrl ? (
                        <Image
                          src={g.imageUrl}
                          alt={g.prompt}
                          width={480}
                          height={270}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant">
                          <Icon className="w-6 h-6" />
                        </div>
                      )}
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 font-label text-[8px] uppercase tracking-widest bg-surface/70 backdrop-blur text-on-surface px-1.5 py-0.5 rounded-full">
                        <Icon className="w-2.5 h-2.5" /> {g.mode}
                      </span>
                    </div>
                    <div className="px-3.5 py-3">
                      <p className="font-body text-xs text-on-surface line-clamp-2 leading-snug">
                        {g.prompt || g.sessionTitle}
                      </p>
                      <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/70 mt-1.5">
                        {g.modelName} · {new Date(g.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

        {tab === "created" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {createdAssets.map((asset, i) => {
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
                  {asset.proCover ? (
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={asset.proCover}
                        alt={asset.title}
                        width={640}
                        height={360}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />
                      <span className="absolute top-2 left-2 font-label text-[9px] uppercase tracking-widest bg-primary text-on-primary px-2 py-0.5 rounded-full">
                        NexGC Pro
                      </span>
                    </div>
                  ) : (
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
                  )}
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
                      {asset.proMeta && (
                        <span className="text-primary"> · {asset.proMeta}</span>
                      )}
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
