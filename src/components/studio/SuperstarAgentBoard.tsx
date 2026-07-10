"use client";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  Clock3,
  Loader2,
  FileText,
  Play,
  ChevronDown,
  ChevronRight,
  Pencil,
  MousePointerClick,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { SuperstarGlyph } from "./SuperstarProvider";
import { cn } from "@/lib/utils";

/* ── Superstar Agent — short-drama production mock ───────────────────────
   Second-pass mockup: Superstar is not just a one-shot generator but a
   production agent (script → episodes → visuals → video tasks → review).
   Everything below is mock data and timers — no API, token pending. The
   whole plan lives inline on the board (no side drawers). */

export const AGENT_SETTINGS_SUMMARY = "16:9 / 720p / 8s / 1";

const PIPELINE: { label: string; status: "completed" | "processing" | "waiting" }[] = [
  { label: "Script Intake", status: "completed" },
  { label: "Episode Split", status: "processing" },
  { label: "Visual Planning", status: "waiting" },
  { label: "Video Generation", status: "waiting" },
  { label: "Review", status: "waiting" },
];

const NEXT_STEPS = [
  "Check script file",
  "Split script into episodes",
  "Create episode tasks",
  "Estimate production cost",
  "Generate video tasks",
  "Return completed assets to Spotlight",
];

const API_MAPPING: [string, string][] = [
  ["project_id", "pending"],
  ["source_project_file_id", "pending"],
  ["video_model_id", "pending"],
  ["parameters", "mock"],
];

type EpisodeStatus = "pending" | "ready" | "generating" | "completed";

interface AgentEpisode {
  code: string;
  title: string;
  status: EpisodeStatus;
  meta: string;
  note?: string;
  progress?: number;
  taskId?: string;
  promptPreview: string;
  actions: ("viewScript" | "generate" | "viewDetails" | "select" | "edit")[];
}

const INITIAL_EPISODES: AgentEpisode[] = [
  {
    code: "EP01",
    title: "Opening Hook",
    status: "ready",
    meta: "6 shots · 8s each · 16:9 · 720p",
    note: "Estimated cost: pending",
    promptPreview:
      "Cold open on a rain-soaked rooftop — the heroine burns the contract that ruined her family, vowing to take the company back.",
    actions: ["viewScript", "generate"],
  },
  {
    code: "EP02",
    title: "Conflict Starts",
    status: "generating",
    progress: 42,
    taskId: "mock-superstar-ep002",
    meta: "5 shots · 8s each · 16:9 · 720p",
    promptPreview:
      "The rival CEO humiliates her in the boardroom; a mysterious ally slips her a keycard under the table.",
    actions: ["viewDetails"],
  },
  {
    code: "EP03",
    title: "Reversal",
    status: "pending",
    meta: "7 shots · 8s each · 16:9 · 720p",
    note: "Waiting for confirmation",
    promptPreview:
      "Midnight archive break-in — she discovers the forged signature that flips the story on its head.",
    actions: ["select", "edit"],
  },
];

/* ── Small shared pieces ─────────────────────────────────────────────── */

function StatusTag({ children, tone = "muted" }: { children: React.ReactNode; tone?: "lime" | "muted" }) {
  return (
    <span
      className={cn(
        "font-label text-[9px] uppercase tracking-widest border px-2 py-0.5 rounded-full",
        tone === "lime"
          ? "border-primary/50 text-primary"
          : "border-outline-variant/50 text-on-surface-variant"
      )}
    >
      {children}
    </span>
  );
}

const EPISODE_TONE: Record<EpisodeStatus, { label: string; pill: string; card: string }> = {
  pending: {
    label: "Pending",
    pill: "border-outline-variant/50 text-on-surface-variant",
    card: "border-outline-variant/40",
  },
  ready: {
    label: "Ready to generate",
    pill: "border-primary/50 text-primary",
    card: "border-primary/45",
  },
  generating: {
    label: "Generating",
    pill: "border-amber-400/60 text-amber-300",
    card: "border-amber-400/35",
  },
  completed: {
    label: "Completed",
    pill: "border-primary/50 text-primary bg-primary-container/30",
    card: "border-primary/45",
  },
};

/* ── Production board ────────────────────────────────────────────────── */

export function SuperstarProductionBoard({ onRequireAuth }: { onRequireAuth: () => boolean }) {
  const [episodes, setEpisodes] = useState<AgentEpisode[]>(INITIAL_EPISODES);
  const [expanded, setExpanded] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setInterval>[]>([]);

  useEffect(() => () => timers.current.forEach(clearInterval), []);

  const mockAction = (label: string) =>
    toast.info(`${label} — mock mode, available after API integration`);

  // "Generate" on a ready episode runs a small local simulation so the board
  // demonstrates the full status lifecycle without any API.
  const generateEpisode = (code: string) => {
    if (!onRequireAuth()) return;
    setEpisodes((eps) =>
      eps.map((e) =>
        e.code === code
          ? { ...e, status: "generating", progress: 4, taskId: `mock-superstar-${code.toLowerCase()}` }
          : e
      )
    );
    const timer = setInterval(() => {
      setEpisodes((eps) =>
        eps.map((e) => {
          if (e.code !== code || e.status !== "generating") return e;
          const next = Math.min(100, (e.progress ?? 0) + 7 + Math.round(Math.random() * 6));
          if (next >= 100) {
            clearInterval(timer);
            return { ...e, status: "completed", progress: 100, note: "Returned to Spotlight assets" };
          }
          return { ...e, progress: next };
        })
      );
    }, 450);
    timers.current.push(timer);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Board head */}
      <div className="flex flex-wrap items-start gap-3">
        <SuperstarGlyph size="lg" />
        <div className="flex-1 min-w-[220px]">
          <h2 className="font-headline text-2xl text-on-surface leading-tight">Superstar Agent</h2>
          <p className="font-body text-sm text-on-surface-variant mt-0.5">
            Short drama production workflow inside Spotlight Studio.
          </p>
          <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/75 mt-1.5">
            Script → Episodes → Visuals → Video Tasks → Review
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <StatusTag tone="lime">External Agent</StatusTag>
          <StatusTag>Token pending</StatusTag>
          <StatusTag>Mock mode</StatusTag>
        </div>
      </div>

      {/* Production pipeline */}
      <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-4 overflow-x-auto">
        <div className="flex items-center min-w-[560px]">
          {PIPELINE.map((step, i) => (
            <div key={step.label} className={cn("flex items-center", i > 0 && "flex-1")}>
              {i > 0 && (
                <span
                  className={cn(
                    "flex-1 h-px mx-2",
                    step.status === "waiting" ? "bg-outline-variant/40" : "bg-primary/40"
                  )}
                />
              )}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <span
                  className={cn(
                    "w-7 h-7 rounded-full border flex items-center justify-center",
                    step.status === "completed" && "border-primary/60 text-primary bg-primary-container/30",
                    step.status === "processing" && "border-amber-400/60 text-amber-300",
                    step.status === "waiting" && "border-outline-variant/50 text-on-surface-variant/70"
                  )}
                >
                  {step.status === "completed" ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : step.status === "processing" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Clock3 className="w-3.5 h-3.5" />
                  )}
                </span>
                <span className="font-label text-[9px] uppercase tracking-wider text-on-surface-variant whitespace-nowrap">
                  {step.label}
                </span>
                <span
                  className={cn(
                    "font-label text-[8px] uppercase tracking-widest",
                    step.status === "completed" && "text-primary",
                    step.status === "processing" && "text-amber-300",
                    step.status === "waiting" && "text-on-surface-variant/60"
                  )}
                >
                  {step.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Production summary */}
      <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-low p-5">
        <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">
          Production Summary
        </p>
        <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
          <SummaryFact label="Project" value="mock-spotlight-project-001" mono />
          <SummaryFact label="Source" value="Uploaded script · mock-script-file-001" />
          <SummaryFact label="Current Action" value="Parsing script into episodes…" live />
          <SummaryFact label="Production Settings" value="16:9 · 720p · 8s · 1" />
          <SummaryFact label="Cost" value="Estimated cost: pending API connection" />
        </div>
      </div>

      {/* Next steps */}
      <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-low p-5">
        <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">
          Next Steps
        </p>
        <ol className="space-y-1.5">
          {NEXT_STEPS.map((step, i) => (
            <li key={step} className="flex items-center gap-3">
              <span
                className={cn(
                  "w-5 h-5 rounded-full border flex items-center justify-center font-label text-[9px] shrink-0",
                  i === 0
                    ? "border-primary/60 text-primary"
                    : "border-outline-variant/50 text-on-surface-variant"
                )}
              >
                {i + 1}
              </span>
              <span className={cn("font-body text-sm", i === 0 ? "text-on-surface" : "text-on-surface-variant")}>
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Episode board */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
            Episode Board
          </p>
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/75">
            3 episodes · 0 completed · 1 generating · 2 pending
          </span>
        </div>
        <div className="space-y-3">
          {episodes.map((ep) => (
            <EpisodeCard
              key={ep.code}
              episode={ep}
              expanded={expanded === ep.code}
              onToggleDetails={() => setExpanded((cur) => (cur === ep.code ? null : ep.code))}
              onGenerate={() => generateEpisode(ep.code)}
              onMockAction={mockAction}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryFact({
  label,
  value,
  mono,
  live,
}: {
  label: string;
  value: string;
  mono?: boolean;
  live?: boolean;
}) {
  return (
    <>
      <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/85 pt-[3px]">
        {label}
      </span>
      <span className={cn("text-sm text-on-surface flex items-center gap-2", mono ? "font-mono text-xs" : "font-body")}>
        {live && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />}
        {value}
      </span>
    </>
  );
}

/* ── Episode card with inline details (no side drawer) ───────────────── */

function EpisodeCard({
  episode,
  expanded,
  onToggleDetails,
  onGenerate,
  onMockAction,
}: {
  episode: AgentEpisode;
  expanded: boolean;
  onToggleDetails: () => void;
  onGenerate: () => void;
  onMockAction: (label: string) => void;
}) {
  const tone = EPISODE_TONE[episode.status];
  const [mappingOpen, setMappingOpen] = useState(false);

  return (
    <div className={cn("rounded-2xl border bg-surface-container-low overflow-hidden", tone.card)}>
      <div className="p-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-label text-label-md uppercase tracking-wider text-on-surface">
            {episode.code} · {episode.title}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 font-label text-[9px] uppercase tracking-widest border px-2 py-0.5 rounded-full",
              tone.pill
            )}
          >
            {episode.status === "generating" && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
            {episode.status === "completed" && <Check className="w-2.5 h-2.5" />}
            {tone.label}
          </span>
          <span className="ml-auto font-label text-[10px] uppercase tracking-widest text-on-surface-variant/75">
            {episode.meta}
          </span>
        </div>

        {episode.status === "generating" && (
          <div className="mt-3">
            <div className="flex items-center justify-between font-label text-[9px] uppercase tracking-widest text-on-surface-variant mb-1">
              <span>Progress · {episode.progress ?? 0}%</span>
              {episode.taskId && <span className="font-mono normal-case">{episode.taskId}</span>}
            </div>
            <div className="h-1.5 rounded-full bg-surface-container overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-400/80 transition-all duration-500"
                style={{ width: `${episode.progress ?? 0}%` }}
              />
            </div>
          </div>
        )}

        {episode.note && episode.status !== "generating" && (
          <p className="font-body text-xs text-on-surface-variant mt-2">{episode.note}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          {episode.actions.includes("viewScript") && (
            <EpisodeAction icon={FileText} label="View script" onClick={() => onMockAction("View script")} />
          )}
          {episode.actions.includes("generate") && episode.status === "ready" && (
            <button
              type="button"
              onClick={onGenerate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-on-primary font-label text-[10px] uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all"
            >
              <Play className="w-3 h-3" fill="currentColor" /> Generate
            </button>
          )}
          {episode.actions.includes("select") && (
            <EpisodeAction icon={MousePointerClick} label="Select" onClick={() => onMockAction("Select")} />
          )}
          {episode.actions.includes("edit") && (
            <EpisodeAction icon={Pencil} label="Edit" onClick={() => onMockAction("Edit")} />
          )}
          <button
            type="button"
            onClick={onToggleDetails}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-label text-[10px] uppercase tracking-wider transition-colors",
              expanded
                ? "border-primary/50 text-primary"
                : "border-outline-variant/50 text-on-surface-variant hover:border-primary/50 hover:text-primary"
            )}
          >
            <Eye className="w-3 h-3" /> View details
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Inline details (replaces any side drawer) */}
      {expanded && (
        <div className="border-t border-outline-variant/25 px-4 py-4 space-y-3 bg-surface-container-lowest/40">
          <p className="font-body text-sm text-on-surface-variant leading-relaxed">
            <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/75 block mb-1">
              Prompt preview
            </span>
            {episode.promptPreview}
          </p>
          <div className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5">
            <DetailFact label="Episode status" value={tone.label} />
            <DetailFact label="Task ID" value={episode.taskId ?? "pending"} mono />
            <DetailFact label="Output settings" value="16:9 · 720p · 8s · 1" />
            <DetailFact label="Cost" value="Pending API connection" />
          </div>

          {/* API mapping — collapsed by default to keep the card light */}
          <div className="rounded-xl border border-outline-variant/30">
            <button
              type="button"
              onClick={() => setMappingOpen((o) => !o)}
              className="w-full flex items-center justify-between px-3 py-2 font-label text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors"
            >
              API Mapping
              {mappingOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
            {mappingOpen && (
              <div className="px-3 pb-3 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1">
                {API_MAPPING.map(([k, v]) => (
                  <DetailFact key={k} label={k} value={v} mono />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailFact({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <>
      <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/75 pt-[2px]">
        {label}
      </span>
      <span className={cn("text-xs text-on-surface-variant", mono ? "font-mono" : "font-body")}>{value}</span>
    </>
  );
}

function EpisodeAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof FileText;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant/50 font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
    >
      <Icon className="w-3 h-3" />
      {label}
    </button>
  );
}
