"use client";
import { useState } from "react";
import {
  Play,
  Check,
  Clock3,
  Loader2,
  Eye,
  FolderPlus,
  RefreshCcw,
  Zap,
} from "lucide-react";
import MiniSelect from "./MiniSelect";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/* ── Superstar — external provider mock ──────────────────────────────────
   First-pass UI mockup for plugging a third-party generation API into the
   studio as an "External Provider". Everything here is mock data — no real
   API, token or cost wiring. English copy is hardcoded on purpose (mockup
   stage); it moves into i18n when the real integration lands. */

export type SuperstarGenMode = "t2i" | "i2i" | "t2v" | "i2v";

export interface SuperstarSettings {
  aspect: string;
  resolution: string;
  duration: string;
  quantity: number;
}

export interface SuperstarTask {
  id: string; // mock-superstar-task-001
  status: "queued" | "generating" | "completed";
  mode: SuperstarGenMode;
  prompt: string;
  settings: SuperstarSettings;
  createdAt: number;
}

export const SUPERSTAR_GEN_MODES: { id: SuperstarGenMode; label: string }[] = [
  { id: "t2i", label: "Text to Image" },
  { id: "i2i", label: "Image to Image" },
  { id: "t2v", label: "Text to Video" },
  { id: "i2v", label: "Image to Video" },
];

export const SUPERSTAR_DEFAULT_SETTINGS: SuperstarSettings = {
  aspect: "16:9",
  resolution: "1K",
  duration: "5s",
  quantity: 1,
};

export const SUPERSTAR_PROMPT_PLACEHOLDER =
  "Describe the scene, motion, style, and output you want Superstar to generate...";

export const genModeLabel = (m: SuperstarGenMode) =>
  SUPERSTAR_GEN_MODES.find((x) => x.id === m)?.label ?? m;

export const superstarSummary = (s: SuperstarSettings) =>
  `${s.aspect} / ${s.resolution} / ${s.duration} / ${s.quantity}`;

/* Small lime "S" mark so the provider reads as a brand without pretending to
   be a portal into another product. */
export function SuperstarGlyph({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const cls =
    size === "lg"
      ? "w-10 h-10 rounded-xl text-base"
      : size === "md"
        ? "w-8 h-8 rounded-lg text-sm"
        : "w-5 h-5 rounded-md text-[10px]";
  return (
    <span
      className={cn(
        "shrink-0 inline-flex items-center justify-center font-label font-bold bg-primary text-on-primary",
        cls
      )}
      aria-hidden="true"
    >
      S
    </span>
  );
}

/* ── Status pill ─────────────────────────────────────────────────────── */

const STATUS_META: Record<
  SuperstarTask["status"],
  { label: string; icon: typeof Clock3; cls: string }
> = {
  queued: {
    label: "Queued",
    icon: Clock3,
    cls: "border-outline-variant/50 text-on-surface-variant",
  },
  generating: {
    label: "Generating",
    icon: Loader2,
    cls: "border-primary/50 text-primary",
  },
  completed: {
    label: "Completed",
    icon: Check,
    cls: "border-primary/50 text-primary bg-primary-container/30",
  },
};

/* ── Task card ───────────────────────────────────────────────────────── */

export function SuperstarTaskCard({
  task,
  onRegenerate,
  onMockAction,
}: {
  task: SuperstarTask;
  onRegenerate: (task: SuperstarTask) => void;
  onMockAction: (action: string) => void;
}) {
  const meta = STATUS_META[task.status];
  const StatusIcon = meta.icon;

  return (
    <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-low overflow-hidden">
      {/* Header: provider identity + live status */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-outline-variant/25">
        <SuperstarGlyph size="sm" />
        <span className="font-label text-label-md uppercase tracking-wider text-on-surface">
          Superstar
        </span>
        <span className="font-label text-[9px] uppercase tracking-widest border border-outline-variant/50 text-on-surface-variant px-1.5 py-0.5 rounded">
          External
        </span>
        <span
          className={cn(
            "ml-auto inline-flex items-center gap-1.5 font-label text-[10px] uppercase tracking-widest border px-2 py-1 rounded-full",
            meta.cls
          )}
        >
          <StatusIcon className={cn("w-3 h-3", task.status === "generating" && "animate-spin")} />
          {meta.label}
        </span>
      </div>

      {/* Completed → video placeholder thumbnail; in-flight → shimmer strip */}
      {task.status === "completed" ? (
        <div
          className="relative aspect-video flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, #101014 0%, #16181c 45%, rgba(198,255,52,0.12) 100%)",
          }}
        >
          <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(198,255,52,0.08),transparent_65%)]" />
          <span className="relative w-14 h-14 rounded-full border border-primary/50 bg-surface/60 backdrop-blur flex items-center justify-center text-primary">
            <Play className="w-6 h-6 translate-x-[1px]" fill="currentColor" />
          </span>
          <span className="absolute bottom-3 right-3 font-label text-[9px] uppercase tracking-widest text-on-surface-variant/80 border border-outline-variant/40 bg-surface/50 px-2 py-0.5 rounded">
            Mock output · {task.settings.duration}
          </span>
        </div>
      ) : (
        <div className="relative aspect-[16/4] bg-surface-container overflow-hidden">
          <span className="shimmer-overlay" />
          <span className="absolute inset-0 flex items-center justify-center font-label text-[10px] uppercase tracking-widest text-on-surface-variant/70">
            {task.status === "queued" ? "Waiting in provider queue…" : "Rendering via Superstar API…"}
          </span>
        </div>
      )}

      {/* Body: task facts */}
      <div className="px-4 py-3 space-y-1.5">
        <p className="font-body text-sm text-on-surface line-clamp-2">{task.prompt}</p>
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 pt-1">
          <Fact label="Provider" value="Superstar" />
          <Fact label="Mode" value={genModeLabel(task.mode)} />
          <Fact label="Task ID" value={task.id} mono />
          <Fact
            label="Output"
            value={`${task.settings.aspect} · ${task.settings.resolution} · ${task.settings.duration}`}
          />
          <Fact label="Cost" value={task.status === "completed" ? "Pending API response" : "Pending"} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 px-3 pb-3 flex-wrap">
        <CardAction icon={Eye} label="View details" onClick={() => onMockAction("View details")} />
        <CardAction
          icon={FolderPlus}
          label="Add to project"
          onClick={() => onMockAction("Add to project")}
        />
        <CardAction icon={RefreshCcw} label="Regenerate" onClick={() => onRegenerate(task)} />
      </div>
    </div>
  );
}

function Fact({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <>
      <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/85 pt-[3px]">
        {label}
      </span>
      <span className={cn("text-xs text-on-surface-variant", mono ? "font-mono" : "font-body")}>
        {value}
      </span>
    </>
  );
}

function CardAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Eye;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-outline-variant/50 font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
    >
      <Icon className="w-3 h-3" />
      {label}
    </button>
  );
}

/* ── Mock parameter panel ────────────────────────────────────────────── */

export function SuperstarParamsDialog({
  open,
  onOpenChange,
  settings,
  onConfirm,
  title = "Superstar output",
  subtitle = "External Provider · Mock mode",
  durationOptions = ["5s", "10s"],
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  settings: SuperstarSettings;
  onConfirm: (s: SuperstarSettings) => void;
  title?: string;
  subtitle?: string;
  durationOptions?: string[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden" showCloseButton>
        <DialogTitle className="sr-only">{title} settings</DialogTitle>
        {open && (
          <ParamsBody
            settings={settings}
            onConfirm={onConfirm}
            onOpenChange={onOpenChange}
            title={title}
            subtitle={subtitle}
            durationOptions={durationOptions}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ParamsBody({
  settings,
  onConfirm,
  onOpenChange,
  title,
  subtitle,
  durationOptions,
}: {
  settings: SuperstarSettings;
  onConfirm: (s: SuperstarSettings) => void;
  onOpenChange: (o: boolean) => void;
  title: string;
  subtitle: string;
  durationOptions: string[];
}) {
  const [draft, setDraft] = useState<SuperstarSettings>(settings);
  const set = (patch: Partial<SuperstarSettings>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <div className="p-6">
      <div className="flex items-center gap-2.5 mb-1">
        <SuperstarGlyph size="md" />
        <h2 className="font-headline text-xl text-on-surface">{title}</h2>
      </div>
      <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-5">
        {subtitle}
      </p>

      <div className="space-y-4">
        <ParamRow label="Aspect Ratio">
          <MiniSelect
            value={draft.aspect}
            options={["16:9", "9:16", "1:1"]}
            onChange={(v) => set({ aspect: v })}
          />
        </ParamRow>
        <ParamRow label="Resolution">
          <MiniSelect
            value={draft.resolution}
            options={["720p", "1080p", "1K"]}
            onChange={(v) => set({ resolution: v })}
          />
        </ParamRow>
        <ParamRow label="Duration">
          <MiniSelect
            value={draft.duration}
            options={durationOptions}
            onChange={(v) => set({ duration: v })}
          />
        </ParamRow>
        <ParamRow label="Quantity">
          <MiniSelect value={draft.quantity} options={[1]} onChange={(v) => set({ quantity: v })} />
        </ParamRow>
      </div>

      <div className="mt-5 rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3">
        <p className="flex items-center gap-1.5 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
          <Zap className="w-3 h-3 text-primary" /> Cost
        </p>
        <p className="font-body text-sm text-on-surface mt-1.5">
          Estimated cost: <span className="text-on-surface-variant">Pending API connection</span>
        </p>
        <p className="font-body text-xs text-on-surface-variant/85 mt-0.5">
          Actual cost will be returned after API response.
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          onConfirm(draft);
          onOpenChange(false);
        }}
        className="mt-6 w-full bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-7 py-3 rounded-full hover:opacity-90 active:scale-95 transition-all"
      >
        Apply settings
      </button>
    </div>
  );
}

function ParamRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-body text-sm text-on-surface">{label}</span>
      {children}
    </div>
  );
}
