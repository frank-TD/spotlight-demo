"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Globe,
  Coins,
  ShieldCheck,
  ScanSearch,
  Hourglass,
  Sparkles,
  Loader2,
  AlertTriangle,
  Film,
  Plus,
  X,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { useStore, type DistMetadata, type DistStatus } from "@/lib/store";
import AppShell from "@/components/layout/AppShell";
import {
  MY_ASSETS_CREATED,
  MY_ASSETS_PURCHASED,
  DISTRIBUTION_PLATFORMS,
  DISTRIBUTION_LANGUAGES,
  DISTRIBUTION_REGIONS,
  DISTRIBUTION_TYPES,
  COPYRIGHT_OPTIONS,
  DISTRIBUTION_COST_SHELL,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useT } from "@/hooks/useT";

const STAGES: DistStatus[] = [
  "metadata",
  "platforms",
  "payment",
  "neowow_review",
  "platform_review",
  "queue",
  "live",
];

const STAGE_ICONS: Record<DistStatus, React.ComponentType<{ className?: string }>> = {
  metadata: FileText,
  platforms: Globe,
  payment: Coins,
  neowow_review: ShieldCheck,
  platform_review: ScanSearch,
  queue: Hourglass,
  live: Sparkles,
  takedown: AlertTriangle,
};

const DEFAULT_METADATA: DistMetadata = {
  title: "",
  description: "",
  type: DISTRIBUTION_TYPES[0],
  tags: [],
  language: DISTRIBUTION_LANGUAGES[0].id,
  subtitles: [],
  regions: ["global"],
  price: 0,
  copyright: COPYRIGHT_OPTIONS[0],
};

export default function DistributePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useT();
  const {
    activeRole,
    distributionByAsset,
    updateDistribution,
    creatorShell,
    backerDiamond,
    withdraw,
    spendDiamond,
  } = useStore();

  const useShell = activeRole === "creator";
  const balance = useShell ? creatorShell : backerDiamond;
  const currencySymbol = useShell ? "◉" : "◆";

  const createdAsset = MY_ASSETS_CREATED.find((a) => a.id === id);
  const purchasedAsset = MY_ASSETS_PURCHASED.find((a) => a.id === id);
  const asset = createdAsset
    ? { id: createdAsset.id, title: createdAsset.title }
    : purchasedAsset
      ? { id: purchasedAsset.id, title: purchasedAsset.title }
      : undefined;
  const isPurchased = !createdAsset && !!purchasedAsset;
  const purchasedCopyright = purchasedAsset?.copyright;
  const dist = distributionByAsset[id];
  const status: DistStatus = dist?.status ?? "metadata";

  // Local form state
  const [metadata, setMetadata] = useState<DistMetadata>(
    dist?.metadata ?? { ...DEFAULT_METADATA, title: asset?.title ?? "" }
  );
  const [tagsInput, setTagsInput] = useState((dist?.metadata?.tags ?? []).join(", "));
  const [platforms, setPlatforms] = useState<string[]>(dist?.platforms ?? []);
  const [takedownOpen, setTakedownOpen] = useState(false);

  // Auto-progression timer
  useEffect(() => {
    if (status === "neowow_review") {
      const t1 = setTimeout(() => updateDistribution(id, { status: "platform_review" }), 2500);
      return () => clearTimeout(t1);
    }
    if (status === "platform_review") {
      const t2 = setTimeout(() => updateDistribution(id, { status: "queue" }), 2500);
      return () => clearTimeout(t2);
    }
    if (status === "queue") {
      const t3 = setTimeout(() => {
        updateDistribution(id, { status: "live" });
        toast.success(t.distribute.liveToast);
      }, 2500);
      return () => clearTimeout(t3);
    }
  }, [status, id, updateDistribution, t.distribute.liveToast]);

  if (!asset) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto px-6 md:px-12 pt-10 pb-16 text-center">
          <p className="font-body text-on-surface-variant">Asset not found.</p>
        </div>
      </AppShell>
    );
  }

  const goTo = (s: DistStatus) => updateDistribution(id, { status: s });

  const saveMetadata = () => {
    const next = {
      ...metadata,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 10),
    };
    if (!next.title.trim()) {
      toast.error(t.distribute.titleRequired);
      return false;
    }
    updateDistribution(id, { metadata: next });
    return true;
  };

  const onMetadataNext = () => {
    if (saveMetadata()) goTo("platforms");
  };

  const onPlatformsNext = () => {
    if (platforms.length === 0) {
      toast.error(t.distribute.selectAtLeastOne);
      return;
    }
    updateDistribution(id, { platforms });
    goTo("payment");
  };

  const onPay = () => {
    if (balance < DISTRIBUTION_COST_SHELL) {
      toast.error(t.distribute.insufficientShell);
      return;
    }
    if (useShell) withdraw(DISTRIBUTION_COST_SHELL);
    else spendDiamond(DISTRIBUTION_COST_SHELL);
    updateDistribution(id, { status: "neowow_review", paidAt: Date.now() });
    toast.success(t.distribute.submittedToast);
  };

  const onTakedown = () => {
    updateDistribution(id, { status: "takedown", takedownAt: Date.now() });
    setTakedownOpen(false);
    toast.success(t.distribute.takedownToast);
  };

  const onResubmit = () => {
    // keep metadata + platforms, return to metadata edit
    updateDistribution(id, { status: "metadata", paidAt: undefined, takedownAt: undefined });
  };

  const stageIdx = STAGES.indexOf(status === "takedown" ? "live" : status);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 md:px-12 pt-8 pb-16">
        <Link
          href="/assets"
          className="inline-flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider text-on-surface-variant hover:text-on-surface mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> {t.distribute.backToAssets}
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-on-primary-container" />
          </div>
          <div>
            <p className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant">
              {t.distribute.pageTitle}
            </p>
            <h1 className="font-headline text-headline-md text-on-surface mt-1">{asset.title}</h1>
          </div>
        </div>

        {/* Purchased asset notice */}
        {isPurchased && purchasedCopyright && (
          <div className="bg-tertiary-container/60 border border-tertiary/30 rounded-xl px-4 py-3 flex items-center gap-3 mb-6">
            <Info className="w-4 h-4 text-on-tertiary-container shrink-0" />
            <p className="font-body text-sm text-on-tertiary-container">
              {t.distribute.purchasedNotice(purchasedCopyright)}
            </p>
          </div>
        )}

        {/* Stage tracker */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 mb-6">
          <StageTracker currentIdx={stageIdx} status={status} />
        </div>

        {/* Step content */}
        {status === "metadata" && (
          <MetadataStep
            metadata={metadata}
            setMetadata={setMetadata}
            tagsInput={tagsInput}
            setTagsInput={setTagsInput}
            onNext={onMetadataNext}
            onSaveDraft={() => {
              if (saveMetadata()) toast.success(t.distribute.draftSavedToast);
            }}
          />
        )}

        {status === "platforms" && (
          <PlatformsStep
            platforms={platforms}
            setPlatforms={setPlatforms}
            onBack={() => goTo("metadata")}
            onNext={onPlatformsNext}
          />
        )}

        {status === "payment" && (
          <PaymentStep
            metadata={dist?.metadata ?? metadata}
            platforms={dist?.platforms ?? platforms}
            balance={balance}
            currencySymbol={currencySymbol}
            onBack={() => goTo("platforms")}
            onPay={onPay}
          />
        )}

        {(status === "neowow_review" || status === "platform_review" || status === "queue") && (
          <ReviewStep status={status} />
        )}

        {status === "live" && (
          <LiveStep
            platforms={dist?.platforms ?? []}
            metadata={dist?.metadata}
            onTakedown={() => setTakedownOpen(true)}
          />
        )}

        {status === "takedown" && <TakedownStep onResubmit={onResubmit} />}
      </div>

      {/* Takedown confirmation */}
      <Dialog open={takedownOpen} onOpenChange={setTakedownOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-[20px]">{t.distribute.takedown}</DialogTitle>
          </DialogHeader>
          <p className="font-body text-sm text-on-surface-variant py-2">
            {t.distribute.takedownNotice}
          </p>
          <DialogFooter>
            <button
              onClick={() => setTakedownOpen(false)}
              className="font-label text-label-md uppercase tracking-wider px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-high"
            >
              {t.common.cancel}
            </button>
            <button
              onClick={onTakedown}
              className="font-label text-label-md uppercase tracking-wider px-4 py-2 bg-error text-on-error rounded-lg hover:opacity-90"
            >
              {t.distribute.takedownConfirm}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

/* ───── Stage tracker ────────────────────────────────────────────────────── */

function StageTracker({ currentIdx, status }: { currentIdx: number; status: DistStatus }) {
  const t = useT();
  const labels: Record<DistStatus, string> = {
    metadata: t.distribute.stepMetadata,
    platforms: t.distribute.stepPlatforms,
    payment: t.distribute.stepPayment,
    neowow_review: t.distribute.stepNeowowReview,
    platform_review: t.distribute.stepPlatformReview,
    queue: t.distribute.stepQueue,
    live: t.distribute.stepLive,
    takedown: t.distribute.statusTakedown,
  };

  return (
    <div className="relative">
      {/* Connecting line */}
      <div className="absolute top-5 left-5 right-5 h-1 bg-outline-variant/30 z-0">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${(currentIdx / (STAGES.length - 1)) * 100}%` }}
        />
      </div>
      {/* Nodes */}
      <div className="relative z-10 flex justify-between">
        {STAGES.map((s, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx && status !== "takedown" && status !== "live";
          const isLive = status === "live" && i === STAGES.length - 1;
          const Icon = STAGE_ICONS[s];
          return (
            <div key={s} className="flex flex-col items-center gap-2" style={{ width: 80 }}>
              <div
                className={cn(
                  "rounded-full flex items-center justify-center border-4 border-surface shadow-sm transition-all",
                  done && "w-10 h-10 bg-primary text-on-primary",
                  (active || isLive) &&
                    "w-12 h-12 -mt-1 bg-primary-container text-on-primary-container shadow-md ring-2 ring-primary/30",
                  !done &&
                    !active &&
                    !isLive &&
                    "w-10 h-10 bg-surface-container text-outline-variant"
                )}
              >
                {done || isLive ? (
                  <Check className="w-4 h-4" />
                ) : active && ["neowow_review", "platform_review", "queue"].includes(s) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={cn(
                  "font-label text-[10px] uppercase tracking-widest text-center leading-tight",
                  done && "text-on-surface-variant",
                  (active || isLive) && "text-primary font-bold",
                  !done && !active && !isLive && "text-on-surface-variant/40"
                )}
              >
                {labels[s]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───── Metadata step ─────────────────────────────────────────────────────── */

function MetadataStep({
  metadata,
  setMetadata,
  tagsInput,
  setTagsInput,
  onNext,
  onSaveDraft,
}: {
  metadata: DistMetadata;
  setMetadata: (m: DistMetadata) => void;
  tagsInput: string;
  setTagsInput: (v: string) => void;
  onNext: () => void;
  onSaveDraft: () => void;
}) {
  const t = useT();
  const inputCls =
    "w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:outline-none font-body text-sm";
  const labelCls =
    "font-label text-label-md uppercase tracking-wider text-on-surface-variant block mb-2";

  const toggleSubtitle = (id: string) =>
    setMetadata({
      ...metadata,
      subtitles: metadata.subtitles.includes(id)
        ? metadata.subtitles.filter((s) => s !== id)
        : [...metadata.subtitles, id],
    });
  const toggleRegion = (id: string) =>
    setMetadata({
      ...metadata,
      regions: metadata.regions.includes(id)
        ? metadata.regions.filter((s) => s !== id)
        : [...metadata.regions, id],
    });

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 space-y-6">
      <h2 className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant">
        {t.distribute.metadataSection}
      </h2>

      <div>
        <label className={labelCls}>{t.distribute.fieldTitle}</label>
        <input
          value={metadata.title}
          onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>{t.distribute.fieldDescription}</label>
        <textarea
          value={metadata.description}
          onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
          rows={4}
          placeholder={t.distribute.fieldDescriptionPlaceholder}
          className={cn(inputCls, "resize-none")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>{t.distribute.fieldType}</label>
          <select
            value={metadata.type}
            onChange={(e) => setMetadata({ ...metadata, type: e.target.value })}
            className={inputCls}
          >
            {DISTRIBUTION_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>{t.distribute.fieldLanguage}</label>
          <select
            value={metadata.language}
            onChange={(e) => setMetadata({ ...metadata, language: e.target.value })}
            className={inputCls}
          >
            {DISTRIBUTION_LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>{t.distribute.fieldTags}</label>
        <input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="Cinematic, Brand, AI..."
          className={inputCls}
        />
        <p className="font-body text-xs text-on-surface-variant mt-1.5">
          {t.distribute.fieldTagsHint}
        </p>
      </div>

      <div>
        <label className={labelCls}>{t.distribute.fieldSubtitles}</label>
        <div className="flex flex-wrap gap-2">
          {DISTRIBUTION_LANGUAGES.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => toggleSubtitle(l.id)}
              className={cn(
                "font-label text-label-md uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors",
                metadata.subtitles.includes(l.id)
                  ? "bg-primary text-on-primary border-primary"
                  : "border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-primary/40"
              )}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelCls}>{t.distribute.fieldRegions}</label>
        <div className="flex flex-wrap gap-2">
          {DISTRIBUTION_REGIONS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => toggleRegion(r.id)}
              className={cn(
                "font-label text-label-md uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors",
                metadata.regions.includes(r.id)
                  ? "bg-primary text-on-primary border-primary"
                  : "border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-primary/40"
              )}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>{t.distribute.fieldPrice}</label>
          <input
            type="number"
            min={0}
            value={metadata.price}
            onChange={(e) => setMetadata({ ...metadata, price: Number(e.target.value) || 0 })}
            className={inputCls}
          />
          <p className="font-body text-xs text-on-surface-variant mt-1.5">
            {t.distribute.fieldPriceHint}
          </p>
        </div>
        <div>
          <label className={labelCls}>{t.distribute.fieldCopyright}</label>
          <select
            value={metadata.copyright}
            onChange={(e) => setMetadata({ ...metadata, copyright: e.target.value })}
            className={inputCls}
          >
            {COPYRIGHT_OPTIONS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={onSaveDraft}
          className="font-label text-label-md uppercase tracking-wider px-5 py-2.5 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors"
        >
          {t.distribute.saveDraft}
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider px-5 py-2.5 bg-primary text-on-primary rounded-lg hover:opacity-90"
        >
          {t.distribute.next} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ───── Platforms step ────────────────────────────────────────────────────── */

function PlatformsStep({
  platforms,
  setPlatforms,
  onBack,
  onNext,
}: {
  platforms: string[];
  setPlatforms: (v: string[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const t = useT();
  const toggle = (id: string) =>
    setPlatforms(platforms.includes(id) ? platforms.filter((p) => p !== id) : [...platforms, id]);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 space-y-6">
      <div>
        <h2 className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant mb-2">
          {t.distribute.platformsSection}
        </h2>
        <p className="font-body text-sm text-on-surface-variant">
          {t.distribute.selectedPlatforms}:{" "}
          <span className="font-bold text-on-surface">{platforms.length}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {DISTRIBUTION_PLATFORMS.map((p) => {
          const selected = platforms.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              className={cn(
                "flex items-center justify-between gap-3 p-4 rounded-xl border transition-colors text-left",
                selected
                  ? "border-primary bg-primary-container/50"
                  : "border-outline-variant hover:border-primary/40 hover:bg-surface-container"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    selected
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface-variant"
                  )}
                >
                  {selected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <p className="font-body font-bold text-on-surface">{p.name}</p>
                  <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mt-0.5">
                    {p.region}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between gap-2 pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider px-5 py-2.5 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t.distribute.back}
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider px-5 py-2.5 bg-primary text-on-primary rounded-lg hover:opacity-90"
        >
          {t.distribute.next} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ───── Payment step ──────────────────────────────────────────────────────── */

function PaymentStep({
  metadata,
  platforms,
  balance,
  currencySymbol,
  onBack,
  onPay,
}: {
  metadata: DistMetadata;
  platforms: string[];
  balance: number;
  currencySymbol: string;
  onBack: () => void;
  onPay: () => void;
}) {
  const t = useT();
  const platformNames = platforms
    .map((id) => DISTRIBUTION_PLATFORMS.find((p) => p.id === id)?.name ?? id)
    .join(", ");

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 space-y-5">
        <h2 className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant">
          {t.distribute.paymentSection}
        </h2>

        <div className="space-y-3">
          <SummaryRow label={t.distribute.fieldTitle} value={metadata.title || "—"} />
          <SummaryRow label={t.distribute.fieldType} value={metadata.type} />
          <SummaryRow
            label={t.distribute.fieldTags}
            value={metadata.tags.length > 0 ? metadata.tags.join(", ") : "—"}
          />
          <SummaryRow
            label={t.distribute.fieldLanguage}
            value={
              DISTRIBUTION_LANGUAGES.find((l) => l.id === metadata.language)?.name ??
              metadata.language
            }
          />
          <SummaryRow
            label={t.distribute.fieldRegions}
            value={metadata.regions
              .map((id) => DISTRIBUTION_REGIONS.find((r) => r.id === id)?.name ?? id)
              .join(", ")}
          />
          <SummaryRow
            label={t.distribute.pricingSummary}
            value={metadata.price === 0 ? t.distribute.free : `¥${metadata.price.toLocaleString()}`}
          />
          <SummaryRow label={t.distribute.fieldCopyright} value={metadata.copyright} />
          <SummaryRow label={t.distribute.platformsSummary} value={platformNames || "—"} />
        </div>
      </div>

      {/* Cost */}
      <div className="bg-primary text-on-primary rounded-2xl p-6 flex items-start gap-4">
        <Coins className="w-6 h-6 shrink-0 mt-1" />
        <div className="flex-1">
          <p className="font-label text-label-md uppercase tracking-wider opacity-80">
            {t.distribute.totalCost}
          </p>
          <p className="font-headline text-[28px] leading-none mt-1.5">
            {currencySymbol} {DISTRIBUTION_COST_SHELL.toLocaleString()}
          </p>
          <p className="font-body text-xs opacity-70 mt-2">{t.distribute.totalCostNote}</p>
        </div>
        <div className="text-right">
          <p className="font-label text-label-md uppercase tracking-wider opacity-80">
            {t.wallet.balLabel}
          </p>
          <p className="font-body font-bold mt-1.5">
            {currencySymbol} {balance.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex justify-between gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider px-5 py-2.5 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t.distribute.back}
        </button>
        <button
          onClick={onPay}
          disabled={balance < DISTRIBUTION_COST_SHELL}
          className="flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider px-5 py-2.5 bg-primary text-on-primary rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          <Coins className="w-4 h-4" />{" "}
          {`${currencySymbol === "◉" ? t.distribute.payAndSubmit(DISTRIBUTION_COST_SHELL) : t.distribute.payAndSubmit(DISTRIBUTION_COST_SHELL).replace("◉", "◆")}`}
        </button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
        {label}
      </span>
      <span className="font-body text-sm text-on-surface text-right max-w-[60%] truncate">
        {value}
      </span>
    </div>
  );
}

/* ───── Review step (auto-progressing) ────────────────────────────────────── */

function ReviewStep({ status }: { status: DistStatus }) {
  const t = useT();
  const Icon = STAGE_ICONS[status];
  const label = {
    neowow_review: t.distribute.statusNeowowReview,
    platform_review: t.distribute.statusPlatformReview,
    queue: t.distribute.statusQueue,
  }[status as "neowow_review" | "platform_review" | "queue"];

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-12 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center mb-5">
        <Icon className="w-7 h-7 text-on-primary-container" />
      </div>
      <p className="font-label text-label-md uppercase tracking-widest text-primary mb-2">
        {t.distribute.inReview}
      </p>
      <h2 className="font-headline text-headline-md text-on-surface mb-3">{label}</h2>
      <p className="font-body text-sm text-on-surface-variant max-w-md mb-6">
        {t.distribute.waitingMessage}
      </p>
      <div className="flex items-center gap-2 text-on-surface-variant font-label text-label-md uppercase tracking-wider">
        <Loader2 className="w-4 h-4 animate-spin" /> {t.distribute.estimatedCompletion}
      </div>
    </div>
  );
}

/* ───── Live step ─────────────────────────────────────────────────────────── */

function LiveStep({
  platforms,
  metadata,
  onTakedown,
}: {
  platforms: string[];
  metadata?: DistMetadata;
  onTakedown: () => void;
}) {
  const t = useT();
  return (
    <div className="space-y-5">
      <div className="bg-tertiary-container border border-tertiary/30 rounded-2xl p-8 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-tertiary text-on-tertiary flex items-center justify-center shrink-0">
          <Check className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-headline text-headline-md text-on-tertiary-container">
            {t.distribute.statusLive}
          </h2>
          <p className="font-body text-sm text-on-tertiary-container mt-1 opacity-80">
            {t.distribute.liveSection}
          </p>
        </div>
      </div>

      {/* Platforms list */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6">
        <p className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant mb-4">
          {t.distribute.platformsSummary}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {platforms.map((id) => {
            const p = DISTRIBUTION_PLATFORMS.find((x) => x.id === id);
            if (!p) return null;
            return (
              <div
                key={id}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
                    <Film className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-body font-bold text-on-surface text-sm">{p.name}</p>
                    <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mt-0.5">
                      {p.region}
                    </p>
                  </div>
                </div>
                <span className="font-label text-[10px] uppercase tracking-widest bg-tertiary-container text-on-tertiary-container px-2.5 py-1 rounded-full">
                  {t.distribute.statusLive}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metadata recap */}
      {metadata && (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6">
          <p className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant mb-4">
            {t.distribute.metadataSummary}
          </p>
          <div className="space-y-2">
            <SummaryRow label={t.distribute.fieldType} value={metadata.type} />
            <SummaryRow
              label={t.distribute.fieldLanguage}
              value={
                DISTRIBUTION_LANGUAGES.find((l) => l.id === metadata.language)?.name ??
                metadata.language
              }
            />
            <SummaryRow
              label={t.distribute.pricingSummary}
              value={
                metadata.price === 0 ? t.distribute.free : `¥${metadata.price.toLocaleString()}`
              }
            />
            <SummaryRow label={t.distribute.fieldCopyright} value={metadata.copyright} />
          </div>
        </div>
      )}

      {/* Takedown */}
      <div className="flex justify-end">
        <button
          onClick={onTakedown}
          className="flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider px-5 py-2.5 border border-error/40 text-error rounded-lg hover:bg-error-container/40 transition-colors"
        >
          <X className="w-4 h-4" /> {t.distribute.takedown}
        </button>
      </div>
    </div>
  );
}

/* ───── Takedown step ─────────────────────────────────────────────────────── */

function TakedownStep({ onResubmit }: { onResubmit: () => void }) {
  const t = useT();
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-12 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-5">
        <AlertTriangle className="w-7 h-7 text-on-surface-variant" />
      </div>
      <h2 className="font-headline text-headline-md text-on-surface mb-3">
        {t.distribute.takedownSection}
      </h2>
      <p className="font-body text-sm text-on-surface-variant max-w-md mb-6">
        {t.distribute.takedownNotice}
      </p>
      <button
        onClick={onResubmit}
        className="font-label text-label-md uppercase tracking-wider px-5 py-2.5 bg-primary text-on-primary rounded-lg hover:opacity-90"
      >
        {t.distribute.resubmit}
      </button>
    </div>
  );
}
