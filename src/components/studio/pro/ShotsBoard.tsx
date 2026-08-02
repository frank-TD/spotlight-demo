"use client";
import { useEffect, useState } from "react";
import {
  Clapperboard,
  ImagePlus,
  Megaphone,
  Music2,
  Plus,
  Smartphone,
  UsersRound,
  Wand2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import AgentPanel, { type AgentBoot } from "./AgentPanel";
import WorkflowIntake, { type IntakeDraft } from "./WorkflowIntake";
import PremierePanel from "./PremierePanel";
import { readSession, workflowOf, WORKFLOWS, WORKFLOW_ORDER, SK } from "./pro-mock";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore, type ProWorkflow } from "@/lib/store";
import { cn } from "@/lib/utils";

/* Quick-start card visuals per workflow. */
const WF_ICON: Record<ProWorkflow, typeof Smartphone> = {
  ugc: Smartphone,
  ad: Megaphone,
  mv: Music2,
  film: Clapperboard,
};
/* Viral-template inspirations (local poster art; prompts prefill the vibe box). */
const INSPIRATIONS = [
  { title: "Rain-soaked rooftop revenge", img: "/posters/crimson-mirage.jpg", prompt: "A rain-soaked rooftop revenge micro drama — neon reflections, betrayal at midnight, 9:16." },
  { title: "Golden-hour perfume spot", img: "/posters/golden-core.jpg", prompt: "A 15s golden-hour perfume ad — macro product shots, silk and light, a whispered tagline." },
  { title: "Synthwave night drive", img: "/posters/aurora-crystal.jpg", prompt: "A synthwave night-drive music video — chrome, violet skyline, looping highway lights." },
  { title: "The printer is sentient", img: "/posters/exit-8.jpg", prompt: "A deadpan office comedy short where the printer becomes sentient and starts negotiating." },
  { title: "Lantern festival romance", img: "/posters/love-tears-us-apart.jpg", prompt: "A lantern festival romance micro film — paper light, missed trains, one shared umbrella." },
  { title: "Backstage in 22 minutes", img: "/posters/marty-supreme.jpg", prompt: "A backstage sports drama short — 22 minutes before the final, one taped-up racket." },
] as const;

const WF_TINT: Record<ProWorkflow, string> = {
  ugc: "linear-gradient(150deg, #16181c 20%, rgba(127,247,226,0.18) 100%)",
  ad: "linear-gradient(150deg, #16181c 20%, rgba(255,184,64,0.16) 100%)",
  mv: "linear-gradient(150deg, #16181c 20%, rgba(150,120,255,0.18) 100%)",
  film: "linear-gradient(150deg, #101014 10%, rgba(127,247,226,0.30) 100%)",
};

/* ── Create screen ───────────────────────────────────────────────────────
   Director-style home (OpenArt): a vibe prompt with reference attachments
   feeds the agent chat (Guide me / Just make it); the four quick-start
   cards open their split-panel intake forms, which generate the whole
   video in one run. Opening a project lands on its premiere page — there
   is no shot board anymore. */

export default function ShotsBoard({ onGoEditor }: { onGoEditor: () => void }) {
  const { proProjects, currentProProjectId, setCurrentProProject, proFragments, proAssets } =
    useStore();

  const project = proProjects.find((p) => p.id === currentProProjectId) ?? null;

  /* Restore-on-mount, resolved inside initializers (render-safe): a nav
     deep-link (?flow=ugc|ad|mv|film) opens that workflow's form directly;
     otherwise a parked form or agent chat interrupted by the signup gate
     reopens in place (form wins). */
  const [intakeWf, setIntakeWf] = useState<ProWorkflow | null>(() => {
    if (typeof window !== "undefined") {
      const flow = new URLSearchParams(window.location.search).get("flow");
      if (flow && WORKFLOW_ORDER.includes(flow as ProWorkflow)) return flow as ProWorkflow;
    }
    const d = readSession<IntakeDraft>(SK.intake);
    if (d?.open && (d.script || d.charName || d.charDesc || d.adTagline)) return d.workflow ?? "film";
    return null;
  });
  // The deep link is one-shot. Soft navigations commit the URL after the
  // first render, so the initializer above can miss it — this effect catches
  // that case (scheduled open, never a sync setState) and then strips the
  // param so closing the form doesn't re-open it.
  useEffect(() => {
    const url = new URL(window.location.href);
    const flow = url.searchParams.get("flow");
    let t: ReturnType<typeof setTimeout> | undefined;
    if (flow && WORKFLOW_ORDER.includes(flow as ProWorkflow)) {
      t = setTimeout(() => setIntakeWf((cur) => cur ?? (flow as ProWorkflow)), 0);
      url.searchParams.delete("flow");
      window.history.replaceState(null, "", url.toString());
    }
    return () => {
      if (t) clearTimeout(t);
    };
  }, []);
  const [agentBoot, setAgentBoot] = useState<AgentBoot | null>(() => {
    if (readSession<IntakeDraft>(SK.intake)?.open) return null; // form wins
    const d = readSession<{ open?: boolean; msgs?: unknown[]; mode?: "guided" | "auto"; workflow?: ProWorkflow }>(
      SK.agentDraft
    );
    if (d?.open && (d.msgs?.length ?? 0) > 1) {
      return { mode: d.mode ?? "guided", workflow: d.workflow ?? "film" };
    }
    return null;
  });
  // Text typed into the Create-screen vibe bar, seeded into either entry.
  const [vibeText, setVibeText] = useState("");

  // Quick-start form and agent chat take over the whole section area.
  if (intakeWf) {
    return (
      <WorkflowIntake
        key={intakeWf}
        workflow={intakeWf}
        initialScript={vibeText || undefined}
        onClose={() => setIntakeWf(null)}
        onCreated={(id) => {
          setIntakeWf(null);
          setCurrentProProject(id);
        }}
      />
    );
  }
  if (!project && agentBoot) {
    return (
      <div className="pt-2 pb-4">
        <AgentPanel
          key="draft"
          boot={agentBoot}
          onProjectCreated={(id) => {
            setAgentBoot(null);
            setCurrentProProject(id);
          }}
          onClose={() => setAgentBoot(null)}
        />
      </div>
    );
  }

  /* Project open → premiere page (player + export + editor handoff). */
  if (project) {
    return <PremierePanel onNewVideo={() => setCurrentProProject(null)} onGoEditor={onGoEditor} />;
  }

  const startAgent = (mode: AgentBoot["mode"], wf: ProWorkflow, seed?: string) => {
    if (mode === "auto" && !(seed && seed.trim())) {
      toast.error("Describe the video first — one line is enough");
      return;
    }
    setAgentBoot({ mode, workflow: wf, seed: seed?.trim() || undefined });
  };
  const coverOf = (pid: string) =>
    proFragments.find((f) => f.projectId === pid && (f.frameUrl || f.frames[0]))?.frameUrl;
  const statsOf = (pid: string) => {
    const fs = proFragments.filter((f) => f.projectId === pid);
    const done = fs.filter((f) => f.status === "directed").length;
    if (fs.length === 0) return "Empty";
    return done === fs.length ? `${fs.length} shots · Ready` : `${fs.length} shots · ${done} directed`;
  };

  return (
    <div className="max-w-[1080px] mx-auto pb-4">
      {/* ── Vibe prompt ── */}
      <div className="text-center pt-4">
        <h3
          className="font-headline text-[34px] leading-tight text-on-surface"
          style={{ textWrap: "balance" }}
        >
          Vibe Direct Your Next Video
        </h3>
        <p className="font-body text-sm text-on-surface-variant mt-1.5">
          Describe it once — the agent parses, frames, directs and assembles the whole cut.
        </p>
      </div>

      <div className="mt-6 max-w-[760px] mx-auto rounded-[26px] border border-outline-variant/40 bg-surface-container-low/80 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
        <textarea
          value={vibeText}
          onChange={(e) => setVibeText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              startAgent("guided", "film", vibeText);
            }
          }}
          rows={2}
          placeholder="Describe the video in your head — the story, the mood, the style…"
          aria-label="describe your video"
          className="w-full bg-transparent border-none resize-none focus:outline-none font-body text-[15px] text-on-surface placeholder:text-on-surface-variant/60 leading-relaxed"
        />
        <div className="flex items-center gap-2 pt-2.5 mt-1 border-t border-outline-variant/25">
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="add a reference"
              className="w-8 h-8 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
            >
              <Plus className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[210px]">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                  Guide it with a reference
                </DropdownMenuLabel>
                {/* Mock attachments: each drops a token into the brief that
                    the agent acknowledges in its recap. */}
                {[
                  { icon: ImagePlus, label: "Add an image", token: "[image: reference.png]" },
                  { icon: Music2, label: "Add a track", token: `♪ ${"Neon night drive · synthwave"}` },
                  {
                    icon: UsersRound,
                    label: "Mention a character",
                    token: `@${proAssets.find((a) => a.kind === "character")?.name ?? "Theo"}`,
                  },
                ].map(({ icon: Icon, label, token }) => (
                  <DropdownMenuItem
                    key={label}
                    onClick={() => {
                      setVibeText((v) => (v ? `${v.trimEnd()} ${token}` : token));
                      toast.success(`${token} attached to the brief (mock)`);
                    }}
                    className="gap-2.5 cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/60">
            Image · Track · @Character
          </span>
          <span className="flex-1" />
          <button
            type="button"
            onClick={() => startAgent("auto", "film", vibeText)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-outline-variant/50 font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
          >
            <Zap className="w-3 h-3" /> Just make it
          </button>
          <button
            type="button"
            onClick={() => startAgent("guided", "film", vibeText)}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-on-primary font-label text-[10px] uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all"
          >
            <Wand2 className="w-3 h-3" /> Guide me
          </button>
        </div>
      </div>

      {/* Example chips */}
      <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
        {[
          "Create an anime micro drama",
          "Create a 15s glow serum ad",
          "Create a synthwave music video",
        ].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setVibeText(c)}
            className="px-3.5 py-1.5 rounded-full border border-outline-variant/40 font-body text-xs text-on-surface-variant hover:border-primary/50 hover:text-on-surface transition-colors"
          >
            {c}
          </button>
        ))}
      </div>

      {/* ── Quick Starts ── */}
      <div className="flex items-baseline justify-between mt-12 mb-3">
        <p className="font-headline text-lg text-on-surface">Quick Starts</p>
        <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/70">
          4 workflows · full video in one run
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {WORKFLOW_ORDER.map((wf) => {
          const cfg = WORKFLOWS[wf];
          const Icon = WF_ICON[wf];
          return (
            <button
              key={wf}
              type="button"
              onClick={() => setIntakeWf(wf)}
              className="group shrink-0 w-[240px] text-left rounded-2xl border border-outline-variant/40 overflow-hidden hover:border-primary/50 transition-colors bg-surface-container-low flex items-stretch"
            >
              <span
                className="w-[76px] shrink-0 flex items-center justify-center"
                style={{ background: WF_TINT[wf] }}
              >
                <Icon className="w-6 h-6 text-on-surface/85 group-hover:scale-110 transition-transform duration-300" />
              </span>
              <span className="px-3 py-2.5 min-w-0">
                <span className="flex items-center gap-1.5">
                  <span className="font-label text-[11px] uppercase tracking-wider text-on-surface truncate">
                    {cfg.label}
                  </span>
                  {cfg.tag && (
                    <span
                      className={cn(
                        "font-label text-[7px] uppercase tracking-widest px-1 py-px rounded shrink-0",
                        cfg.tag === "Featured"
                          ? "bg-primary text-on-primary"
                          : "border border-outline-variant/50 text-on-surface-variant"
                      )}
                    >
                      {cfg.tag}
                    </span>
                  )}
                </span>
                <span className="block font-body text-[10.5px] text-on-surface-variant mt-1 leading-snug">
                  {cfg.tagline}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Director Projects ── */}
      {proProjects.length > 0 && (
        <>
          <div className="flex items-baseline justify-between mt-10 mb-3">
            <p className="font-headline text-lg text-on-surface">Director Projects</p>
            <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/70">
              {proProjects.length} {proProjects.length === 1 ? "project" : "projects"}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {proProjects.slice(0, 8).map((pr) => {
              const cover = coverOf(pr.id);
              return (
                <button
                  key={pr.id}
                  type="button"
                  onClick={() => setCurrentProProject(pr.id)}
                  aria-label={`Open project ${pr.title}`}
                  className="group text-left rounded-2xl border border-outline-variant/40 overflow-hidden hover:border-primary/50 transition-colors bg-surface-container-low"
                >
                  <span
                    className="block aspect-video bg-surface-container"
                    style={
                      cover
                        ? { backgroundImage: `url(${cover})`, backgroundSize: "cover", backgroundPosition: "center" }
                        : { background: WF_TINT[pr.workflow ?? "film"] }
                    }
                  />
                  <span className="block px-3 py-2.5">
                    <span className="flex items-center gap-1.5">
                      <span className="font-body text-sm text-on-surface truncate">{pr.title}</span>
                      <span className="font-label text-[7px] uppercase tracking-widest bg-primary text-on-primary px-1 py-px rounded shrink-0">
                        {workflowOf(pr.workflow).badge}
                      </span>
                    </span>
                    <span className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant/75 mt-1">
                      {statsOf(pr.id)} · {new Date(pr.createdAt).toLocaleDateString()}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* ── Inspirations · Viral Templates ── */}
      <div className="flex items-baseline justify-between mt-10 mb-3">
        <p className="font-headline text-lg text-on-surface">Inspirations</p>
        <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/70">
          Viral templates · recreate with your cast
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {INSPIRATIONS.map((t) => (
          <button
            key={t.title}
            type="button"
            onClick={() => {
              setVibeText(t.prompt);
              toast.success("Template loaded — press Guide me to direct it");
            }}
            aria-label={`Use template ${t.title}`}
            className="group relative shrink-0 w-[148px] rounded-xl overflow-hidden border border-outline-variant/40 hover:border-primary/60 transition-colors"
          >
            <span
              className="block aspect-[2/3]"
              style={{ backgroundImage: `url(${t.img})`, backgroundSize: "cover", backgroundPosition: "center" }}
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent pt-8 pb-2 px-2.5">
              <span className="block font-body text-[11.5px] text-white leading-snug">{t.title}</span>
            </span>
            <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
              <span className="px-3 py-1.5 rounded-full bg-primary text-on-primary font-label text-[9px] uppercase tracking-wider">
                Remake
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
