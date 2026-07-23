"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X, Sparkles, Zap, Loader2, Eye, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import {
  ASSET_DIM,
  GEN_PLACEHOLDER,
  KIND_LABEL,
  KIND_PLURAL,
  PRESETS,
  PRO_COSTS,
  assetImg,
  nameFromPrompt,
  nowTs,
  picsum,
  proId,
} from "./pro-mock";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useStore, type ProAsset, type ProAssetKind } from "@/lib/store";
import { cn } from "@/lib/utils";

/* ── Asset library (characters / scenes / props) ─────────────────────────
   Artlist-style: Explore presets, My saved assets and generation History
   under a floating tab bar, with a bottom generator bar that produces four
   mock candidates — picking one saves it into My. */

type Tab = "explore" | "my" | "history";

interface DetailTarget {
  name: string;
  desc: string;
  imageUrl: string;
  mineId?: string;
}

export default function AssetLibrary({ kind }: { kind: ProAssetKind }) {
  const {
    proAssets,
    addProAsset,
    deleteProAsset,
    proGenRuns,
    addProGenRun,
    spendProCredits,
    isLoggedIn,
    openSignupGate,
  } = useStore();

  const [tab, setTab] = useState<Tab>("explore");
  const [prompt, setPrompt] = useState("");
  const [refs, setRefs] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [candidates, setCandidates] = useState<string[] | null>(null);
  const [detail, setDetail] = useState<DetailTarget | null>(null);
  // Prompt/refs snapshot taken when a run starts, so the picker dialog and
  // the history entry describe the run even after the inputs are cleared.
  const [runMeta, setRunMeta] = useState({ prompt: "", refs: 0 });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const mine = proAssets.filter((a) => a.kind === kind);
  const runs = proGenRuns.filter((r) => r.kind === kind);
  const [w, h] = ASSET_DIM[kind];
  const aspect = kind === "character" ? "aspect-[3/4]" : kind === "scene" ? "aspect-video" : "aspect-square";

  const generate = () => {
    if (!isLoggedIn) {
      openSignupGate("/discovery/workspace");
      return;
    }
    if (!prompt.trim()) {
      toast.error(`Describe the ${KIND_LABEL[kind].toLowerCase()} first`);
      return;
    }
    if (!spendProCredits(PRO_COSTS.asset)) {
      toast.error("Not enough credits (mock balance)");
      return;
    }
    setRunMeta({ prompt: prompt.trim(), refs });
    setGenerating(true);
    setProgress(5);
    const iv = setInterval(
      () => setProgress((p) => (p >= 95 ? 95 : p + Math.ceil((100 - p) / 6))),
      170
    );
    timers.current.push(iv as unknown as ReturnType<typeof setTimeout>);
    timers.current.push(
      setTimeout(() => {
        clearInterval(iv);
        setProgress(100);
        const seed = `${kind}-${Date.now()}`;
        setCandidates([0, 1, 2, 3].map((i) => picsum(`${seed}-${i}`, w, h)));
        setGenerating(false);
      }, 1900)
    );
  };

  // Close the candidate picker, logging the run (with or without a pick).
  const finishRun = (pickedUrl?: string) => {
    if (candidates) {
      addProGenRun({
        id: proId("run"),
        kind,
        prompt: runMeta.prompt,
        refs: runMeta.refs,
        candidates,
        pickedUrl,
        createdAt: nowTs(),
      });
    }
    if (pickedUrl) {
      const asset: ProAsset = {
        id: proId("asset"),
        kind,
        name: nameFromPrompt(runMeta.prompt, kind),
        desc: runMeta.prompt.slice(0, 120),
        imageUrl: pickedUrl,
        createdAt: nowTs(),
      };
      addProAsset(asset);
      toast.success(`Saved to My ${KIND_PLURAL[kind]}`);
      setTab("my");
      setPrompt("");
      setRefs(0);
    }
    setCandidates(null);
  };

  return (
    <div className="relative">
      {/* Floating tab bar */}
      <div className="flex justify-center mb-5">
        <div className="inline-flex items-center rounded-full border border-outline-variant/40 bg-surface-container-low p-1">
          {(
            [
              { id: "explore", label: "Explore" },
              { id: "my", label: `My ${KIND_PLURAL[kind]}` },
              { id: "history", label: "History" },
            ] as { id: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "px-4 py-1.5 rounded-full font-label text-[10px] uppercase tracking-wider transition-colors",
                tab === t.id
                  ? "bg-surface-container-high text-on-surface"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grids */}
      {tab === "explore" && (
        <Grid
          aspect={aspect}
          items={PRESETS[kind].map((p) => ({
            name: p.name,
            desc: p.desc,
            imageUrl: assetImg(kind, p.seed),
          }))}
          onView={(it) => setDetail(it)}
        />
      )}
      {tab === "my" &&
        (mine.length === 0 ? (
          <EmptyNote>
            Nothing saved yet — describe a {KIND_LABEL[kind].toLowerCase()} below and pick your
            favourite result.
          </EmptyNote>
        ) : (
          <Grid
            aspect={aspect}
            items={mine.map((a) => ({
              name: a.name,
              desc: a.desc,
              imageUrl: a.imageUrl,
              mineId: a.id,
            }))}
            onView={(it) => setDetail(it)}
          />
        ))}
      {tab === "history" &&
        (runs.length === 0 ? (
          <EmptyNote>No generation runs yet — results land here with all four candidates.</EmptyNote>
        ) : (
          <div className="space-y-3 max-w-3xl mx-auto">
            {runs.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-outline-variant/35 bg-surface-container-low p-4"
              >
                <div className="flex items-center gap-2">
                  <p className="font-body text-sm text-on-surface flex-1 truncate">{r.prompt}</p>
                  <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/75 shrink-0">
                    {r.refs > 0 ? `${r.refs} refs · ` : ""}
                    {new Date(r.createdAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  {r.candidates.map((url) => (
                    <div
                      key={url}
                      className={cn(
                        "relative w-20 aspect-square rounded-lg overflow-hidden border-2",
                        r.pickedUrl === url ? "border-primary" : "border-transparent"
                      )}
                    >
                      <Image
                        src={url}
                        alt="candidate"
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                      />
                      {r.pickedUrl === url && (
                        <span className="absolute bottom-1 right-1 inline-flex w-4 h-4 rounded-full bg-primary text-on-primary items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}

      {/* Generator bar */}
      <div className="sticky bottom-6 z-30 mt-8">
        <div
          className="max-w-[720px] mx-auto rounded-[24px] border border-outline-variant/40 overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
          style={{
            background: "rgba(20, 20, 26, 0.92)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
          }}
        >
          {generating && (
            <div className="h-1 bg-surface-container">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          <div className="flex items-start gap-3 px-4 pt-3 pb-2">
            <button
              type="button"
              onClick={() => setRefs((r) => (r >= 4 ? 4 : r + 1))}
              aria-label="add reference image"
              title="Add reference image (mock)"
              className="w-9 h-9 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors shrink-0 mt-0.5"
            >
              <ImagePlus className="w-4 h-4" />
            </button>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  generate();
                }
              }}
              rows={2}
              aria-label={GEN_PLACEHOLDER[kind]}
              placeholder={GEN_PLACEHOLDER[kind]}
              className="flex-1 bg-transparent border-none resize-none focus:outline-none font-body text-sm text-on-surface placeholder:text-on-surface-variant/70 pt-1.5"
            />
            <button
              type="button"
              onClick={generate}
              disabled={generating}
              className="inline-flex items-center gap-1.5 bg-primary text-on-primary font-label text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-full hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 shrink-0"
            >
              {generating ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" /> {progress}%
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" /> Generate
                  <span className="inline-flex items-center gap-0.5 border-l border-on-primary/30 pl-1.5 ml-0.5">
                    <Zap className="w-2.5 h-2.5" fill="currentColor" /> {PRO_COSTS.asset}
                  </span>
                </>
              )}
            </button>
          </div>
          {refs > 0 && (
            <div className="flex items-center gap-1.5 px-4 pb-3">
              {Array.from({ length: refs }, (_, n) => n).map((i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-container/40 text-on-primary-container font-body text-[10px]"
                >
                  Ref {i + 1}
                  <button
                    type="button"
                    onClick={() => setRefs((r) => r - 1)}
                    aria-label={`remove reference ${i + 1}`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              <span className="font-label text-[8px] uppercase tracking-widest text-on-surface-variant/60">
                Mock references
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Candidate picker */}
      <Dialog open={candidates !== null} onOpenChange={(o) => !o && finishRun()}>
        <DialogContent className="sm:max-w-lg p-6" showCloseButton>
          <DialogTitle className="font-headline text-xl text-on-surface">
            Pick a result
          </DialogTitle>
          <p className="font-body text-xs text-on-surface-variant -mt-1">
            “{runMeta.prompt}” — choose one to save into My {KIND_PLURAL[kind]}.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {candidates?.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => finishRun(url)}
                className={cn(
                  "relative rounded-xl overflow-hidden border-2 border-transparent hover:border-primary transition-colors",
                  aspect
                )}
              >
                <Image
                  src={url}
                  alt="candidate"
                  width={w}
                  height={h}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden" showCloseButton>
          <DialogTitle className="sr-only">{detail?.name ?? KIND_LABEL[kind]}</DialogTitle>
          {detail && (
            <div>
              <div className={cn("relative w-full overflow-hidden", aspect, "max-h-[420px]")}>
                <Image
                  src={detail.imageUrl}
                  alt={detail.name}
                  width={w}
                  height={h}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <h3 className="font-headline text-xl text-on-surface">{detail.name}</h3>
                  <span className="font-label text-[9px] uppercase tracking-widest border border-outline-variant/50 text-on-surface-variant px-1.5 py-0.5 rounded">
                    {KIND_LABEL[kind]}
                  </span>
                  {detail.mineId && (
                    <span className="font-label text-[9px] uppercase tracking-widest border border-primary/40 text-primary px-1.5 py-0.5 rounded">
                      Mine
                    </span>
                  )}
                </div>
                <p className="font-body text-sm text-on-surface-variant mt-2 leading-relaxed">
                  {detail.desc}
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setDetail(null);
                      toast.info(`Mention @${detail.name} in a shot prompt to use it`);
                    }}
                    className="inline-flex items-center gap-1.5 bg-primary text-on-primary font-label text-[10px] uppercase tracking-wider px-4 py-2 rounded-full hover:opacity-90 transition-all"
                  >
                    Use in Shots
                  </button>
                  {detail.mineId && (
                    <button
                      type="button"
                      onClick={() => {
                        deleteProAsset(detail.mineId!);
                        setDetail(null);
                        toast.success("Deleted");
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-outline-variant/50 font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:border-error/60 hover:text-error transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Grid({
  aspect,
  items,
  onView,
}: {
  aspect: string;
  items: DetailTarget[];
  onView: (item: DetailTarget) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-2">
      {items.map((it) => (
        <button
          key={it.mineId ?? it.name}
          type="button"
          onClick={() => onView(it)}
          className="group relative rounded-2xl overflow-hidden bg-surface-container text-left"
        >
          <div className={cn("w-full", aspect)}>
            <Image
              src={it.imageUrl}
              alt={it.name}
              width={480}
              height={480}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            />
          </div>
          <span className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
          <span className="absolute bottom-2.5 left-3 font-body text-sm text-white">{it.name}</span>
          <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface/70 backdrop-blur border border-outline-variant/40 font-label text-[10px] uppercase tracking-wider text-on-surface">
              <Eye className="w-3 h-3" /> View {/* Artlist's hover affordance */}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-outline-variant/40 bg-surface-container-lowest/60 px-6 py-14 text-center">
      <p className="font-body text-sm text-on-surface-variant max-w-sm mx-auto leading-relaxed">
        {children}
      </p>
    </div>
  );
}
