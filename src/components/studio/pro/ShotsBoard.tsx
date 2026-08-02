"use client";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Clapperboard,
  Mic,
  ImagePlus,
  Megaphone,
  Music2,
  Package,
  Pause,
  Plus,
  Smartphone,
  TrendingUp,
  UsersRound,
  Wand2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import AgentPanel, { type AgentBoot } from "./AgentPanel";
import WorkflowIntake, { type IntakeDraft } from "./WorkflowIntake";
import PremierePanel from "./PremierePanel";
import { clearSession, readSession, workflowOf, WORKFLOWS, WORKFLOW_ORDER, SK } from "./pro-mock";
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
const WF_TINT: Record<ProWorkflow, string> = {
  ugc: "linear-gradient(150deg, #16181c 20%, rgba(127,247,226,0.18) 100%)",
  ad: "linear-gradient(150deg, #16181c 20%, rgba(255,184,64,0.16) 100%)",
  mv: "linear-gradient(150deg, #16181c 20%, rgba(150,120,255,0.18) 100%)",
  film: "linear-gradient(150deg, #101014 10%, rgba(127,247,226,0.30) 100%)",
};
const WF_ACCENT: Record<ProWorkflow, string> = {
  ugc: "#7ff7e2",
  ad: "#ffb840",
  mv: "#b08bff",
  film: "#5adfc8",
};

/* ── Trending this week ──────────────────────────────────────────────────
   Viral templates split per workflow: each shelf leads with a featured
   card on the left and a 2×2 rack of smaller ones. Film / MV wear local
   poster art; UGC / Ad wear accent-tinted mock frames (phone / product) so
   the type reads at a glance. Clicking any card opens that flow's intake
   form with the template prompt pre-filled. */

interface ProTemplate {
  title: string;
  prompt: string;
  img?: string; // local poster art
  mock?: "phone" | "product"; // gradient mock frame when no poster fits
  stat: string; // decorative trend counter
}

const TRENDING: Record<ProWorkflow, { featured: ProTemplate; items: ProTemplate[] }> = {
  ugc: {
    featured: {
      title: "POV: your skincare shelf talks back",
      prompt:
        "A POV UGC clip where my skincare shelf talks back to me every morning — deadpan product banter, creator-style handheld, 9:16.",
      mock: "phone",
      stat: "2.1M remakes",
    },
    items: [
      { title: "3 hooks that stop the scroll", prompt: "A UGC ad opening with three rapid-fire hooks to camera, then a 10s product demo with bold captions.", mock: "phone", stat: "890K" },
      { title: "Unboxing, but cinematic", prompt: "A cinematic unboxing UGC clip — macro tape cut, slow reveal, honest first reaction to camera.", mock: "phone", stat: "612K" },
      { title: "Street interview: one question", prompt: "A street-interview UGC clip asking strangers one question, jump cuts, bold subtitles.", mock: "phone", stat: "540K" },
      { title: "Day in the life, 30 seconds", prompt: "A 30-second day-in-the-life UGC vlog with quick match cuts and a soft voiceover.", mock: "phone", stat: "475K" },
    ],
  },
  ad: {
    featured: {
      title: "Golden-hour perfume spot",
      prompt: "A 15s golden-hour perfume ad — macro bottle in silk light, one lifestyle beat, a whispered tagline on the end card.",
      mock: "product",
      stat: "1.4M views",
    },
    items: [
      { title: "Glow serum in 15 seconds", prompt: "A 15s glow serum spot: droplet macro, one lifestyle beat, tagline end card — Glow, bottled.", mock: "product", stat: "760K" },
      { title: "Sneaker drop end card", prompt: "A sneaker drop ad — studio spins, street b-roll, bold price end card with the release date.", mock: "product", stat: "705K" },
      { title: "Coffee pour, macro mood", prompt: "A specialty coffee ad built on macro pours and steam, warm wood tones, a quiet logo close.", mock: "product", stat: "632K" },
      { title: "Phone case drop test", prompt: "A playful phone-case ad: slow-motion drop tests, confetti burst, a grinning CTA end card.", mock: "product", stat: "588K" },
    ],
  },
  mv: {
    featured: {
      title: "Synthwave night drive",
      prompt: "A synthwave night-drive music video — chrome, violet skyline, looping highway lights synced to the beat.",
      img: "/posters/aurora-crystal.jpg",
      stat: "3.2M plays",
    },
    items: [
      { title: "Neon rain run", prompt: "A high-energy music video chase through neon rain, whip pans landing on every downbeat.", img: "/posters/neon-rain.jpg", stat: "1.1M" },
      { title: "Lantern festival slow dance", prompt: "A slow-burn romance music video at a lantern festival — paper light, missed glances, one shared umbrella.", img: "/posters/paper-lanterns.jpg", stat: "980K" },
      { title: "Two lives, one chorus", prompt: "A split-screen music video following two lives that converge on the final chorus.", img: "/posters/past-lives.jpg", stat: "864K" },
      { title: "Slow-burn breakup ballad", prompt: "A breakup ballad music video — empty apartment, golden dust, memories replayed in reverse.", img: "/posters/love-tears-us-apart.jpg", stat: "790K" },
    ],
  },
  film: {
    featured: {
      title: "Rain-soaked rooftop revenge",
      prompt: "A rain-soaked rooftop revenge micro drama — neon reflections, betrayal at midnight, 9:16.",
      img: "/posters/crimson-mirage.jpg",
      stat: "4.6M remakes",
    },
    items: [
      { title: "The printer is sentient", prompt: "A deadpan office comedy short where the printer becomes sentient and starts negotiating.", img: "/posters/exit-8.jpg", stat: "1.3M" },
      { title: "Backstage in 22 minutes", prompt: "A backstage sports drama short — 22 minutes before the final, one taped-up racket.", img: "/posters/marty-supreme.jpg", stat: "1.0M" },
      { title: "Two sisters, one tide", prompt: "Two sisters gut the day's catch in a steaming back-kitchen while old wounds rise with the tide.", img: "/posters/fish-bone.jpg", stat: "876K" },
      { title: "The stranger in 4B", prompt: "A paranoid thriller short — the new neighbour in 4B knows everyone's name already.", img: "/posters/who-are-you.jpg", stat: "742K" },
    ],
  },
};

/* ── Create screen ───────────────────────────────────────────────────────
   Director-style home (OpenArt): a vibe prompt with reference attachments
   feeds the agent chat (Guide me / Just make it); the four quick-start
   cards open their split-panel intake forms, which generate the whole
   video in one run. Opening a project lands on its premiere page — there
   is no shot board anymore. */

export default function ShotsBoard({
  onGoEditor,
  onOpenTools,
}: {
  onGoEditor: () => void;
  onOpenTools: () => void;
}) {
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
  // Trending card → that flow's intake form with the template prompt seeded.
  // A parked form draft must not shadow the template, so clear it first.
  const openTemplate = (wf: ProWorkflow, prompt: string) => {
    clearSession(SK.intake);
    setVibeText(prompt);
    setIntakeWf(wf);
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

      {/* ── Quick Tools — the old Basic studio, one click away ── */}
      <button
        type="button"
        onClick={onOpenTools}
        className="mt-3 w-full flex items-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-low/60 hover:border-primary/50 px-4 py-3 text-left transition-colors group"
      >
        <span className="flex items-center gap-1.5 shrink-0">
          {[ImagePlus, Clapperboard, Mic, Music2].map((Icon, i) => (
            <span
              key={i}
              className="w-7 h-7 rounded-lg border border-outline-variant/40 bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors"
            >
              <Icon className="w-3.5 h-3.5" />
            </span>
          ))}
        </span>
        <span className="min-w-0 flex-1">
          <span className="font-label text-[11px] uppercase tracking-wider text-on-surface">
            Quick Tools
          </span>
          <span className="block font-body text-[10.5px] text-on-surface-variant mt-0.5 leading-snug">
            Single-shot image, video, voiceover and music generation — no pipeline, just one prompt.
          </span>
        </span>
        <span className="shrink-0 font-label text-[10px] uppercase tracking-wider text-on-surface-variant group-hover:text-primary transition-colors">
          Open →
        </span>
      </button>

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

      {/* ── Trending this week ── */}
      <div className="flex items-baseline justify-between mt-12 mb-1">
        <p className="font-headline text-2xl text-on-surface inline-flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-tertiary" />
          Trending this week
        </p>
        <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/70">
          Remake any template with your cast
        </span>
      </div>
      {WORKFLOW_ORDER.map((wf) => (
        <TrendingShelf key={wf} wf={wf} onOpen={openTemplate} />
      ))}
    </div>
  );
}

/* One flow's trending shelf: featured card left, 2×2 rack right. */
function TrendingShelf({
  wf,
  onOpen,
}: {
  wf: ProWorkflow;
  onOpen: (wf: ProWorkflow, prompt: string) => void;
}) {
  const cfg = WORKFLOWS[wf];
  const data = TRENDING[wf];
  const Icon = WF_ICON[wf];
  return (
    <section className="mt-7" aria-label={`${cfg.label} templates`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-3.5 h-3.5" style={{ color: WF_ACCENT[wf] }} />
        <span className="font-label text-[11px] uppercase tracking-wider text-on-surface">{cfg.label}</span>
        <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/60 hidden sm:inline">
          · {cfg.tagline}
        </span>
      </div>
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-3 items-stretch">
        <TemplateCard t={data.featured} wf={wf} featured onOpen={onOpen} />
        <div className="grid grid-cols-2 gap-3">
          {data.items.map((t) => (
            <TemplateCard key={t.title} t={t} wf={wf} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TemplateCard({
  t,
  wf,
  featured = false,
  onOpen,
}: {
  t: ProTemplate;
  wf: ProWorkflow;
  featured?: boolean;
  onOpen: (wf: ProWorkflow, prompt: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(wf, t.prompt)}
      aria-label={`Use template ${t.title}`}
      className={cn(
        "group relative rounded-2xl overflow-hidden border border-outline-variant/40 hover:border-primary/60 transition-colors text-left bg-surface-container-low",
        featured ? "min-h-[300px] lg:min-h-0" : "aspect-[16/10]"
      )}
    >
      {t.img ? (
        <span
          className="absolute inset-0"
          style={{ backgroundImage: `url(${t.img})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
      ) : (
        <MockFrame wf={wf} kind={t.mock ?? "phone"} featured={featured} />
      )}
      {/* Caption */}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pt-10 pb-3 px-3.5">
        <span className="inline-flex items-center gap-1 font-label text-[8px] uppercase tracking-widest text-tertiary mb-1">
          <TrendingUp className="w-2.5 h-2.5" /> {t.stat}
        </span>
        <span
          className={cn(
            "block text-white leading-snug",
            featured ? "font-headline text-xl" : "font-body text-[12px]"
          )}
        >
          {t.title}
        </span>
        {featured && (
          <span className="block font-body text-[11.5px] text-white/65 mt-1 line-clamp-2 max-w-[420px]">
            {t.prompt}
          </span>
        )}
      </span>
      {/* Hover action */}
      <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-on-primary font-label text-[9px] uppercase tracking-wider">
          Remake <ArrowRight className="w-3 h-3" />
        </span>
      </span>
    </button>
  );
}

/* Placeholder art for flows without poster material: an accent-tinted stage
   with a device mock — vertical phone for UGC, product card for Ad. */
function MockFrame({ wf, kind, featured }: { wf: ProWorkflow; kind: "phone" | "product"; featured: boolean }) {
  const accent = WF_ACCENT[wf];
  return (
    <span className="absolute inset-0 flex items-center justify-center" style={{ background: WF_TINT[wf] }}>
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: `radial-gradient(90% 70% at 50% 0%, ${accent}1f 0%, transparent 60%)` }}
      />
      {kind === "phone" ? (
        <span
          className={cn(
            "relative rounded-[18px] border border-white/20 flex flex-col overflow-hidden shadow-[0_14px_40px_rgba(0,0,0,0.5)]",
            featured ? "w-[120px] h-[212px]" : "w-[64px] h-[114px]"
          )}
          style={{ background: `linear-gradient(165deg, #1a1b20 15%, ${accent}33 100%)` }}
        >
          <span className="flex-1 flex items-center justify-center">
            <Smartphone className={cn("text-white/75", featured ? "w-7 h-7" : "w-4 h-4")} />
          </span>
          <span className="flex items-center gap-1 px-2 pb-1.5">
            <Pause className={cn("text-white/85 shrink-0", featured ? "w-2.5 h-2.5" : "w-1.5 h-1.5")} fill="currentColor" />
            <span className="flex-1 h-[2px] rounded-full bg-white/25 overflow-hidden">
              <span className="block h-full w-2/3 rounded-full bg-white/85" />
            </span>
          </span>
        </span>
      ) : (
        <span
          className={cn(
            "relative rounded-2xl border border-white/20 flex flex-col items-center justify-center gap-2 shadow-[0_14px_40px_rgba(0,0,0,0.5)]",
            featured ? "w-[150px] h-[150px]" : "w-[76px] h-[76px]"
          )}
          style={{ background: `linear-gradient(160deg, #1a1b20 20%, ${accent}3d 100%)` }}
        >
          <Package className={cn("text-white/80", featured ? "w-8 h-8" : "w-4 h-4")} />
          <span className={cn("rounded-full bg-white/30", featured ? "w-14 h-1" : "w-7 h-0.5")} />
        </span>
      )}
    </span>
  );
}
