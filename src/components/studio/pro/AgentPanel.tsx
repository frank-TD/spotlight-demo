"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Check,
  Clapperboard,
  Loader2,
  Scissors,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  MAX_SHOTS_CAP,
  MV_TRACKS,
  PRO_COSTS,
  SCRIPT_MAX_LEN,
  TITLE_MAX_LEN,
  WORKFLOWS,
  clearSession,
  fmtShotNo,
  frameImg,
  nowTs,
  proId,
  readSession,
  splitScript,
  writeSession,
  SK,
} from "./pro-mock";
import { useStore, type ProFragment, type ProWorkflow } from "@/lib/store";
import { cn } from "@/lib/utils";

/* ── NexGC Agent — chat-first production ─────────────────────────────────
   The conversation replaces the old four-step wizard. One scripted state
   machine drives both modes: Guided (clarifying quick-replies → parse →
   storyboard approval → staged frame/direct queues) and Just-make-it (the
   whole pipeline runs hands-free and commits a finished, assembled cut).
   Draft chats park in sessionStorage under SK.agentDraft; once a project
   exists the thread moves to SK.agentChat(projectId) so every project keeps
   its own history across the signup-gate round-trip. */

export interface AgentBoot {
  mode: "guided" | "auto";
  workflow: ProWorkflow;
  seed?: string;
}

type ChatPhase =
  | "intake" // waiting for the first prompt
  | "style"
  | "aspect" // film only
  | "shots"
  | "confirm" // recap shown, parse chip armed
  | "parsing"
  | "board" // storyboard preview awaiting approval (draft mode)
  | "actions" // project exists, quick actions armed
  | "queue" // frame/direct/assemble running against the store
  | "auto" // just-make-it pipeline running (draft mode)
  | "append" // long paste offered as extra shots (project mode)
  | "done";

interface SimShot {
  id: string;
  summary: string;
  dialogue?: string;
  frameUrl?: string;
  directed?: boolean;
}

interface ChatMsg {
  id: string;
  role: "user" | "agent";
  text?: string;
  board?: SimShot[]; // inline storyboard card
  progress?: { label: string; done: number; total: number };
  cost?: number; // small ⚡ caption under the bubble
}

interface ChatState {
  open: boolean; // draft chats only: closed chats don't auto-reopen
  mode: "guided" | "auto";
  workflow: ProWorkflow;
  phase: ChatPhase;
  msgs: ChatMsg[];
  typing: boolean;
  prompt: string;
  style?: string;
  aspect?: string;
  shots?: number;
  pendingScript?: string;
}

interface Chip {
  id: string;
  label: string;
  cost?: number;
  primary?: boolean;
}

const OPENERS: Record<ProWorkflow, string> = {
  ugc: "Let's shoot a UGC ad. What's the product, and what's the hook the creator opens with?",
  ad: "Let's cut a product spot. Describe the product, the mood, and the closing tagline.",
  mv: "Let's make a music video. Paste lyrics or describe the visuals section by section — I'll sync the beats.",
  film: "Let's direct your film. Tell me the story — a one-line idea or a full script both work.",
};

const EXAMPLE_PROMPTS = [
  "A rain-soaked rooftop revenge micro drama",
  "A 15s glow serum ad, golden hour",
  "A synthwave night-drive music video",
];

const sanitizePhase = (phase: ChatPhase, hasProject: boolean): ChatPhase => {
  if (phase === "parsing") return "confirm";
  if (phase === "queue" || phase === "append") return "actions";
  if (phase === "auto") return hasProject ? "done" : "confirm";
  return phase;
};

// Interrupted runs leave a live progress bubble behind; freeze it on restore.
const sanitizeMsgs = (msgs: ChatMsg[]): ChatMsg[] =>
  msgs.map((m) =>
    m.progress && m.progress.done < m.progress.total
      ? { ...m, progress: undefined, text: `${m.progress.label} — interrupted, pick it back up below.` }
      : m
  );

const agentMsg = (text: string, extra?: Partial<ChatMsg>): ChatMsg => ({
  id: proId("msg"),
  role: "agent",
  text,
  ...extra,
});
const userMsg = (text: string): ChatMsg => ({ id: proId("msg"), role: "user", text });

// Project title from the first sentence of the prompt (same rule the old
// intake form used for auto-naming).
const titleFrom = (prompt: string, fallback: string) => {
  const clean = prompt.trim().replace(/\s+/g, " ");
  const first = clean.split(/(?<=[。！？!?.])/)[0] ?? clean;
  return (first || fallback).slice(0, TITLE_MAX_LEN).trim() || fallback;
};

export default function AgentPanel({
  projectId,
  boot,
  dock,
  onProjectCreated,
  onGoEditor,
  onClose,
}: {
  projectId: string | null;
  boot: AgentBoot | null;
  dock: boolean; // docked beside the board vs. full-area draft takeover
  onProjectCreated: (id: string) => void;
  onGoEditor: () => void;
  onClose?: () => void;
}) {
  const {
    isLoggedIn,
    openSignupGate,
    spendProCredits,
    newProProject,
    addProFragments,
    updateProFragment,
    setProTimeline,
    proTimelines,
    proProjects,
    proFragments,
  } = useStore();

  const project = projectId ? (proProjects.find((p) => p.id === projectId) ?? null) : null;
  const fragments = projectId ? proFragments.filter((f) => f.projectId === projectId) : [];
  const cfgWf = project?.workflow ?? boot?.workflow ?? "film";

  /* One state object, restored whole from the session park. All transitions
     run through commit() below — handlers and timer callbacks only, never
     effects — so the ref mirror is always fresh for the timeout chains. */
  const [chat, setChat] = useState<ChatState>(() => {
    const key = projectId ? SK.agentChat(projectId) : SK.agentDraft;
    const saved = readSession<ChatState>(key);
    if (saved && saved.msgs.length > 0) {
      return {
        ...saved,
        typing: false,
        phase: sanitizePhase(saved.phase, !!projectId),
        msgs: sanitizeMsgs(saved.msgs),
      };
    }
    if (projectId) {
      // Fresh thread on an existing project: status-aware welcome.
      const directed = fragments.filter((f) => f.status === "directed").length;
      return {
        open: true,
        mode: "guided",
        workflow: cfgWf,
        phase: "actions",
        typing: false,
        prompt: "",
        msgs: [
          agentMsg(
            fragments.length === 0
              ? "This board is empty. Paste a script or an idea and I'll draft the shots."
              : `Welcome back — ${fragments.length} shots on the board, ${directed} directed. Use the quick actions, or tell me things like “shot 3 — make it rain”.`
          ),
        ],
      };
    }
    const mode = boot?.mode ?? "guided";
    const wf = boot?.workflow ?? "film";
    const seed = boot?.seed?.trim();
    const base: ChatState = {
      open: true,
      mode,
      workflow: wf,
      phase: "intake",
      typing: false,
      prompt: "",
      msgs: [agentMsg(mode === "auto" ? "One-shot mode. Give me the idea and I'll handle every step — parse, frame, direct, assemble." : OPENERS[wf])],
    };
    if (seed && mode === "guided") {
      return {
        ...base,
        phase: "style",
        prompt: seed,
        msgs: [...base.msgs, userMsg(seed), agentMsg(styleQuestion(seed))],
      };
    }
    if (seed && mode === "auto") {
      // The pipeline itself kicks off from the mount effect below.
      return { ...base, phase: "auto", prompt: seed, msgs: [...base.msgs, userMsg(seed)] };
    }
    return base;
  });

  const chatRef = useRef(chat);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const autoKicked = useRef(false);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const sessionKey = projectId ? SK.agentChat(projectId) : SK.agentDraft;
  const commit = (next: ChatState) => {
    chatRef.current = next;
    setChat(next);
    writeSession(sessionKey, next);
  };
  const push = (patch: Partial<ChatState>, ...msgs: ChatMsg[]) => {
    const cur = chatRef.current;
    commit({ ...cur, ...patch, msgs: [...cur.msgs, ...msgs] });
  };
  const patchMsg = (id: string, patch: Partial<ChatMsg>) => {
    const cur = chatRef.current;
    commit({ ...cur, msgs: cur.msgs.map((m) => (m.id === id ? { ...m, ...patch } : m)) });
  };
  const later = (ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  };
  // Push the user's line, show the typing dots, then deliver the reply.
  const reply = (user: ChatMsg | null, patch: Partial<ChatState>, ...msgs: ChatMsg[]) => {
    const cur = chatRef.current;
    commit({
      ...cur,
      typing: true,
      msgs: user ? [...cur.msgs, user] : cur.msgs,
    });
    later(650, () => {
      const now = chatRef.current;
      commit({ ...now, ...patch, typing: false, msgs: [...now.msgs, ...msgs] });
    });
  };

  // Keep the thread pinned to the newest message (DOM write only).
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat.msgs.length, chat.typing]);

  // Park the thread from the very first render (sessionStorage write only) so
  // a reload or the signup-gate round-trip restores it before any interaction.
  useEffect(() => {
    writeSession(sessionKey, chatRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Guided flow ── */

  function styleQuestion(prompt: string) {
    const refNote = /[@♪[]/.test(prompt) ? "References noted. " : "";
    return `${refNote}Got it. Which art style should I shoot this in?`;
  }

  const askAfterStyle = (wf: ProWorkflow) =>
    wf === "film" ? "Vertical micro drama or widescreen short film?" : shotsQuestion(wf);
  const shotsQuestion = (wf: ProWorkflow) =>
    `How many shots? ${WORKFLOWS[wf].defaultShots} is the sweet spot for ${WORKFLOWS[wf].label.toLowerCase()}.`;

  const recapText = (c: ChatState) => {
    const cfg = WORKFLOWS[c.workflow];
    const bits = [c.style, c.aspect ?? cfg.aspect, `${c.shots ?? cfg.defaultShots} shots`];
    if (cfg.hasTrack) bits.push(`♪ ${MV_TRACKS[0]}`);
    return `Locked: ${bits.join(" · ")}. Ready to break the ${cfg.scriptLabel.toLowerCase()} into shots — ${PRO_COSTS.script} credits.`;
  };

  const startParse = () => {
    if (!isLoggedIn) {
      openSignupGate("/discovery/workspace");
      return;
    }
    if (!spendProCredits(PRO_COSTS.script)) {
      reply(null, {}, agentMsg("Not enough credits for the parse — top up from the ⚡ pill above, then try again."));
      return;
    }
    const cur = chatRef.current;
    const progressId = proId("msg");
    commit({
      ...cur,
      phase: "parsing",
      msgs: [
        ...cur.msgs,
        {
          id: progressId,
          role: "agent",
          progress: { label: "Parsing — beat detection, shot split, asset scan", done: 0, total: 1 },
          cost: PRO_COSTS.script,
        },
      ],
    });
    later(1600, () => {
      const c = chatRef.current;
      const cfg = WORKFLOWS[c.workflow];
      const cap = Math.min(c.shots ?? cfg.defaultShots, MAX_SHOTS_CAP);
      const sim: SimShot[] = splitScript(c.prompt, cap).map((d) => ({ ...d, id: proId("sim") }));
      if (sim.length === 0) {
        commit({
          ...c,
          phase: "confirm",
          msgs: c.msgs
            .map((m) => (m.id === progressId ? agentMsg("I couldn't find anything to split — give me a longer description.") : m)),
        });
        return;
      }
      commit({
        ...c,
        phase: "board",
        msgs: [
          ...c.msgs.map((m) =>
            m.id === progressId ? { ...m, progress: { label: "Parsed", done: 1, total: 1 } } : m
          ),
          agentMsg(`${sim.length} shots drafted. Approve the storyboard and I'll put them on the board.`, {
            board: sim,
          }),
        ],
      });
    });
  };

  // Free re-split (the parse is already paid for): nudge the count around.
  const resplit = () => {
    const c = chatRef.current;
    const cfg = WORKFLOWS[c.workflow];
    const cur = c.shots ?? cfg.defaultShots;
    const next = cur + 2 > Math.min(16, MAX_SHOTS_CAP) ? Math.max(2, cfg.defaultShots - 2) : cur + 2;
    const sim: SimShot[] = splitScript(c.prompt, next).map((d) => ({ ...d, id: proId("sim") }));
    reply(
      null,
      { shots: next },
      agentMsg(`Re-split into ${sim.length} shots — how's this cut?`, { board: sim })
    );
  };

  const lastBoard = () => {
    const c = chatRef.current;
    for (let i = c.msgs.length - 1; i >= 0; i -= 1) {
      const b = c.msgs[i].board;
      if (b) return b;
    }
    return [];
  };

  const commitBoard = () => {
    const c = chatRef.current;
    const cfg = WORKFLOWS[c.workflow];
    const sim = lastBoard();
    if (sim.length === 0) return;
    const pid = newProProject(
      titleFrom(c.prompt, cfg.label),
      c.style ?? cfg.styles[0],
      c.workflow,
      cfg.hasTrack ? MV_TRACKS[0] : undefined,
      c.aspect ?? cfg.aspect
    );
    const now = nowTs();
    addProFragments(
      sim.map((s, i) => ({
        id: proId("frag"),
        projectId: pid,
        title: fmtShotNo(i + 1),
        summary: s.summary,
        dialogue: s.dialogue,
        status: "draft",
        frames: [],
        durationSec: cfg.shotSec,
        createdAt: now + i,
      })) satisfies ProFragment[]
    );
    const handoff: ChatState = {
      ...c,
      phase: "actions",
      msgs: [
        ...c.msgs,
        userMsg("Create the board"),
        agentMsg(`Board is live — ${sim.length} drafts ready. Frame them all next, or open any shot to fine-tune it.`),
      ],
    };
    // The thread follows the project: park it under the project key so the
    // remounted (docked) panel picks it up mid-conversation.
    writeSession(SK.agentChat(pid), handoff);
    clearSession(SK.agentDraft);
    toast.success(`${sim.length} shots created`);
    onProjectCreated(pid);
  };

  /* ── Project-mode queues (patch the store live, board updates behind) ── */

  const frameQueue = (ids: string[], progressId: string, idx: number, doneText: string, after?: () => void) => {
    if (idx >= ids.length) {
      patchMsg(progressId, { progress: { label: "Framed", done: ids.length, total: ids.length } });
      if (after) {
        after();
      } else {
        push({ phase: "actions" }, agentMsg(doneText));
      }
      return;
    }
    later(900, () => {
      const seed = `${ids[idx]}-${nowTs()}`;
      const fresh = [frameImg(`${seed}-a`), frameImg(`${seed}-b`)];
      updateProFragment(ids[idx], { frames: fresh, frameUrl: fresh[0], status: "framed" });
      patchMsg(progressId, { progress: { label: "Framing", done: idx + 1, total: ids.length } });
      frameQueue(ids, progressId, idx + 1, doneText, after);
    });
  };

  const directQueue = (ids: string[], progressId: string, idx: number, doneText: string, after?: () => void) => {
    if (idx >= ids.length) {
      patchMsg(progressId, { progress: { label: "Directed", done: ids.length, total: ids.length } });
      if (after) {
        after();
      } else {
        push({ phase: "actions" }, agentMsg(doneText));
      }
      return;
    }
    later(1000, () => {
      const frag = useStore.getState().proFragments.find((f) => f.id === ids[idx]);
      const url = frag?.frameUrl ?? frameImg(`${ids[idx]}-auto`);
      updateProFragment(ids[idx], { status: "directed", frameUrl: url, frames: frag?.frames.length ? frag.frames : [url] });
      patchMsg(progressId, { progress: { label: "Directing", done: idx + 1, total: ids.length } });
      directQueue(ids, progressId, idx + 1, doneText, after);
    });
  };

  const startQueue = (kind: "frame" | "direct", targets: ProFragment[]) => {
    if (!isLoggedIn) {
      openSignupGate("/discovery/workspace");
      return;
    }
    const cost = targets.length * (kind === "frame" ? PRO_COSTS.frame : PRO_COSTS.video);
    if (!spendProCredits(cost)) {
      reply(null, {}, agentMsg(`Not enough credits — this run needs ${cost}.`));
      return;
    }
    const progressId = proId("msg");
    push(
      { phase: "queue" },
      {
        id: progressId,
        role: "agent",
        progress: { label: kind === "frame" ? "Framing" : "Directing", done: 0, total: targets.length },
        cost,
      }
    );
    const ids = targets.map((t) => t.id);
    if (kind === "frame") {
      frameQueue(ids, progressId, 0, `${ids.length} shots framed — direct them when they look right.`);
    } else {
      directQueue(ids, progressId, 0, `${ids.length} shots directed. Assemble the timeline and it's a cut.`);
    }
  };

  const assemble = () => {
    if (!projectId) return;
    const frags = useStore.getState().proFragments.filter((f) => f.projectId === projectId && f.status === "directed");
    if (frags.length === 0) return;
    setProTimeline(projectId, {
      video: frags.map((f) => ({ id: proId("clip"), fragmentId: f.id, inSec: 0, outSec: f.durationSec })),
      audio: [],
    });
    const total = frags.reduce((s, f) => s + f.durationSec, 0);
    reply(
      userMsg("Assemble the timeline"),
      { phase: "actions" },
      agentMsg(`Timeline assembled — ${frags.length} clips, ~${total}s. Open the editor to trim, then export.`)
    );
  };

  /* ── Just-make-it pipeline (draft mode, commits everything at the end) ── */

  const runAutoPipeline = () => {
    const c = chatRef.current;
    const cfg = WORKFLOWS[c.workflow];
    if (!isLoggedIn) {
      commit({
        ...c,
        phase: "confirm",
        style: c.style ?? cfg.styles[0],
        shots: c.shots ?? cfg.defaultShots,
        msgs: [...c.msgs, agentMsg("Sign in first — your idea is parked right here.")],
      });
      openSignupGate("/discovery/workspace");
      return;
    }
    const style = cfg.styles[0];
    const shots = cfg.defaultShots;
    const totalCost = PRO_COSTS.script + shots * (PRO_COSTS.frame + PRO_COSTS.video);
    commit({
      ...c,
      style,
      shots,
      aspect: cfg.aspect,
      msgs: [
        ...c.msgs,
        agentMsg(
          `On it. ${style} · ${cfg.aspect} · up to ${shots} shots — the full run costs about ${totalCost} credits and I'll stop if the balance runs dry.`
        ),
      ],
    });
    later(900, () => autoParse());
  };

  const autoParse = () => {
    const c = chatRef.current;
    if (!spendProCredits(PRO_COSTS.script)) {
      autoAbort("the script parse");
      return;
    }
    const progressId = proId("msg");
    commit({
      ...c,
      msgs: [
        ...c.msgs,
        { id: progressId, role: "agent", progress: { label: "Parsing script", done: 0, total: 1 }, cost: PRO_COSTS.script },
      ],
    });
    later(1400, () => {
      const cur = chatRef.current;
      const cfg = WORKFLOWS[cur.workflow];
      const sim: SimShot[] = splitScript(cur.prompt, cur.shots ?? cfg.defaultShots).map((d) => ({
        ...d,
        id: proId("sim"),
      }));
      if (sim.length === 0) {
        commit({
          ...cur,
          phase: "intake",
          msgs: cur.msgs.map((m) =>
            m.id === progressId ? agentMsg("That's too thin to split — give me a couple of sentences.") : m
          ),
        });
        return;
      }
      const boardId = proId("msg");
      commit({
        ...cur,
        msgs: [
          ...cur.msgs.map((m) => (m.id === progressId ? { ...m, progress: { label: "Parsed", done: 1, total: 1 } } : m)),
          { id: boardId, role: "agent", text: `${sim.length} shots. Framing…`, board: sim },
        ],
      });
      autoFrame(sim, boardId, 0);
    });
  };

  const autoAbort = (stage: string) => {
    const c = chatRef.current;
    commit({
      ...c,
      phase: "confirm",
      msgs: [...c.msgs, agentMsg(`Ran out of credits at ${stage}. Top up from the ⚡ pill, then hit Parse to continue by hand.`)],
    });
  };

  const autoFrame = (sim: SimShot[], boardId: string, idx: number) => {
    if (idx === 0 && !spendProCredits(sim.length * PRO_COSTS.frame)) {
      autoAbort("framing");
      return;
    }
    if (idx >= sim.length) {
      autoDirect(sim, boardId, 0);
      return;
    }
    later(700, () => {
      sim[idx] = { ...sim[idx], frameUrl: frameImg(`auto-${boardId}-${idx}-${nowTs()}`) };
      patchMsg(boardId, { board: [...sim], text: `Framing ${idx + 1}/${sim.length}…` });
      autoFrame(sim, boardId, idx + 1);
    });
  };

  const autoDirect = (sim: SimShot[], boardId: string, idx: number) => {
    if (idx === 0 && !spendProCredits(sim.length * PRO_COSTS.video)) {
      // Frames exist but videos don't — commit what we have as framed drafts.
      autoCommit(sim, false);
      return;
    }
    if (idx >= sim.length) {
      patchMsg(boardId, { text: `All ${sim.length} shots directed. Assembling…` });
      later(800, () => autoCommit(sim, true));
      return;
    }
    later(800, () => {
      sim[idx] = { ...sim[idx], directed: true };
      patchMsg(boardId, { board: [...sim], text: `Directing ${idx + 1}/${sim.length}…` });
      autoDirect(sim, boardId, idx + 1);
    });
  };

  const autoCommit = (sim: SimShot[], directed: boolean) => {
    const c = chatRef.current;
    const cfg = WORKFLOWS[c.workflow];
    const pid = newProProject(
      titleFrom(c.prompt, cfg.label),
      c.style ?? cfg.styles[0],
      c.workflow,
      cfg.hasTrack ? MV_TRACKS[0] : undefined,
      c.aspect ?? cfg.aspect
    );
    const now = nowTs();
    const frags: ProFragment[] = sim.map((s, i) => ({
      id: proId("frag"),
      projectId: pid,
      title: fmtShotNo(i + 1),
      summary: s.summary,
      dialogue: s.dialogue,
      status: directed ? "directed" : s.frameUrl ? "framed" : "draft",
      frames: s.frameUrl ? [s.frameUrl] : [],
      frameUrl: s.frameUrl,
      durationSec: cfg.shotSec,
      createdAt: now + i,
    }));
    addProFragments(frags);
    if (directed) {
      setProTimeline(pid, {
        video: frags.map((f) => ({ id: proId("clip"), fragmentId: f.id, inSec: 0, outSec: f.durationSec })),
        audio: [],
      });
    }
    const total = frags.reduce((s, f) => s + f.durationSec, 0);
    const handoff: ChatState = {
      ...c,
      phase: directed ? "done" : "actions",
      msgs: [
        ...c.msgs,
        agentMsg(
          directed
            ? `Your cut is ready — ${frags.length} shots directed and assembled into a ~${total}s timeline. Open the editor to trim and export.`
            : `Framing done, but the balance couldn't cover directing. ${frags.length} framed shots are on the board — direct them when you top up.`
        ),
      ],
    };
    writeSession(SK.agentChat(pid), handoff);
    clearSession(SK.agentDraft);
    toast.success(directed ? "One-shot run complete" : "Run stopped early — shots saved");
    onProjectCreated(pid);
  };

  // Just-make-it boots straight into the pipeline. The effect only schedules
  // the first timer; every state change happens inside timer callbacks.
  useEffect(() => {
    if (autoKicked.current) return;
    if (projectId || chatRef.current.mode !== "auto" || chatRef.current.phase !== "auto") return;
    autoKicked.current = true;
    timers.current.push(setTimeout(() => runAutoPipeline(), 500));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Free-text input ── */

  const matchOption = (text: string, options: readonly string[]) =>
    options.find((o) => o.toLowerCase() === text.toLowerCase()) ??
    options.find((o) => o.toLowerCase().includes(text.toLowerCase()) && text.length >= 3);

  const send = () => {
    const text = input.trim().slice(0, SCRIPT_MAX_LEN);
    if (!text || chat.typing) return;
    setInput("");
    const c = chatRef.current;
    const cfg = WORKFLOWS[c.workflow];

    // Project mode: edit commands + long-paste append offer.
    if (projectId) {
      const m = text.match(/^shot\s*(\d+)\s*[—:,-]?\s*(.*)$/i);
      if (m) {
        const idx = parseInt(m[1], 10) - 1;
        const frag = fragments[idx];
        if (!frag) {
          reply(userMsg(text), {}, agentMsg(`I don't see shot ${m[1]} on this board — it has ${fragments.length} shots.`));
          return;
        }
        const note = m[2].trim();
        const wasDirected = frag.status === "directed";
        const patch: Partial<ProFragment> = {};
        if (note) patch.summary = note;
        if (frag.status !== "draft") {
          const seed = `${frag.id}-${nowTs()}`;
          patch.frames = [frameImg(`${seed}-a`), frameImg(`${seed}-b`)];
          patch.frameUrl = patch.frames[0];
          patch.status = "framed";
        }
        updateProFragment(frag.id, patch);
        reply(
          userMsg(text),
          {},
          agentMsg(
            frag.status === "draft"
              ? `${frag.title} updated.`
              : `${frag.title} ${note ? "rewritten and " : ""}re-framed${wasDirected ? " — direct it again when it looks right" : ""}.`
          )
        );
        return;
      }
      if (text.length >= 120 && c.phase === "actions") {
        reply(
          userMsg(text),
          { phase: "append", pendingScript: text },
          agentMsg(`That reads like new material — parse it into extra shots for “${project?.title}”? ${PRO_COSTS.script} credits.`)
        );
        return;
      }
      reply(
        userMsg(text),
        {},
        agentMsg("I can frame, direct and assemble from the quick actions below — or say “shot 3 — make it rain” to rework one shot. A long paste becomes new shots.")
      );
      return;
    }

    // Draft mode: guided Q&A.
    switch (c.phase) {
      case "intake":
        reply(userMsg(text), { phase: "style", prompt: text }, agentMsg(styleQuestion(text)));
        return;
      case "style": {
        const hit = matchOption(text, cfg.styles);
        if (hit) {
          pickStyle(hit, text);
        } else {
          reply(userMsg(text), { prompt: `${c.prompt} ${text}` }, agentMsg("Noted — added to the brief. Pick a style below to keep moving."));
        }
        return;
      }
      case "aspect": {
        const hit = /16/.test(text) ? "16:9" : /9\s*[:x]\s*16|vertical|micro/i.test(text) ? "9:16" : null;
        if (hit) {
          pickAspect(hit, text);
        } else {
          reply(userMsg(text), {}, agentMsg("Vertical (9:16) or widescreen (16:9)?"));
        }
        return;
      }
      case "shots": {
        const n = parseInt(text.replace(/\D/g, ""), 10);
        if (n >= 2 && n <= MAX_SHOTS_CAP) {
          pickShots(n, text);
        } else {
          reply(userMsg(text), {}, agentMsg(`Give me a number between 2 and ${MAX_SHOTS_CAP} — or tap one below.`));
        }
        return;
      }
      case "confirm":
      case "board":
        // New text at recap/board = a rewritten brief; restart the questions.
        reply(userMsg(text), { phase: "style", prompt: text, shots: undefined }, agentMsg("New brief — let's re-lock the look. Which style?"));
        return;
      default:
        reply(userMsg(text), {}, agentMsg("One step at a time — I'm mid-run. The board updates live on the right."));
    }
  };

  const pickStyle = (style: string, label?: string) => {
    const c = chatRef.current;
    reply(userMsg(label ?? style), { phase: c.workflow === "film" ? "aspect" : "shots", style }, agentMsg(askAfterStyle(c.workflow)));
  };
  const pickAspect = (aspect: string, label?: string) => {
    reply(userMsg(label ?? aspect), { phase: "shots", aspect }, agentMsg(shotsQuestion(chatRef.current.workflow)));
  };
  const pickShots = (n: number, label?: string) => {
    const c = chatRef.current;
    const next = { ...c, shots: n };
    reply(userMsg(label ?? `${n} shots`), { phase: "confirm", shots: n }, agentMsg(recapText(next)));
  };

  const startOver = () => {
    const wf = chatRef.current.workflow;
    const fresh: ChatState = {
      open: true,
      mode: "guided",
      workflow: wf,
      phase: "intake",
      typing: false,
      prompt: "",
      msgs: [agentMsg(OPENERS[wf])],
    };
    commit(fresh);
  };

  const appendShots = () => {
    const c = chatRef.current;
    const script = c.pendingScript;
    if (!projectId || !script) return;
    if (!isLoggedIn) {
      openSignupGate("/discovery/workspace");
      return;
    }
    if (!spendProCredits(PRO_COSTS.script)) {
      reply(null, { phase: "actions", pendingScript: undefined }, agentMsg("Not enough credits for the parse."));
      return;
    }
    const progressId = proId("msg");
    push(
      { phase: "queue", pendingScript: undefined },
      { id: progressId, role: "agent", progress: { label: "Parsing", done: 0, total: 1 }, cost: PRO_COSTS.script }
    );
    later(1400, () => {
      const cfg = WORKFLOWS[chatRef.current.workflow];
      const sim = splitScript(script, cfg.defaultShots);
      const base = useStore.getState().proFragments.filter((f) => f.projectId === projectId).length;
      const now = nowTs();
      addProFragments(
        sim.map((s, i) => ({
          id: proId("frag"),
          projectId,
          title: fmtShotNo(base + i + 1),
          summary: s.summary,
          dialogue: s.dialogue,
          status: "draft",
          frames: [],
          durationSec: cfg.shotSec,
          createdAt: now + i,
        })) satisfies ProFragment[]
      );
      patchMsg(progressId, { progress: { label: "Parsed", done: 1, total: 1 } });
      push({ phase: "actions" }, agentMsg(`Added ${sim.length} draft shots to the end of the board.`));
    });
  };

  /* ── Chips (derived every render — no chip state to restore) ── */

  const cfg = WORKFLOWS[chat.workflow];
  const drafts = fragments.filter((f) => f.status === "draft");
  const framed = fragments.filter((f) => f.status === "framed");
  const directedCount = fragments.filter((f) => f.status === "directed").length;
  const timelineReady = !!(projectId && (proTimelines[projectId]?.video.length ?? 0) > 0);

  let chips: Chip[] = [];
  if (!chat.typing) {
    if (!projectId) {
      switch (chat.phase) {
        case "intake":
          chips = EXAMPLE_PROMPTS.map((p) => ({ id: `ex:${p}`, label: p }));
          break;
        case "style":
          chips = cfg.styles.slice(0, 6).map((s) => ({ id: `style:${s}`, label: s }));
          break;
        case "aspect":
          chips = [
            { id: "aspect:9:16", label: "9:16 Micro Drama" },
            { id: "aspect:16:9", label: "16:9 Short Film" },
          ];
          break;
        case "shots": {
          const d = cfg.defaultShots;
          chips = [...new Set([Math.max(2, d - 2), d, Math.min(16, d + 2)])].map((n) => ({
            id: `shots:${n}`,
            label: `${n} shots`,
          }));
          break;
        }
        case "confirm":
          chips = [
            { id: "parse", label: "Break it into shots", cost: PRO_COSTS.script, primary: true },
            { id: "restart", label: "Start over" },
          ];
          break;
        case "board":
          chips = [
            { id: "create", label: "Create the board", primary: true },
            { id: "resplit", label: "Split differently" },
            { id: "restart", label: "Start over" },
          ];
          break;
        default:
          break;
      }
    } else if (chat.phase === "append") {
      chips = [
        { id: "append", label: "Parse into new shots", cost: PRO_COSTS.script, primary: true },
        { id: "cancel-append", label: "Never mind" },
      ];
    } else if (chat.phase === "actions" || chat.phase === "done") {
      if (drafts.length > 0)
        chips.push({
          id: "frame-all",
          label: `Frame ${drafts.length} draft${drafts.length > 1 ? "s" : ""}`,
          cost: drafts.length * PRO_COSTS.frame,
          primary: true,
        });
      if (framed.length > 0 && drafts.length === 0)
        chips.push({
          id: "direct-all",
          label: `Direct ${framed.length} shot${framed.length > 1 ? "s" : ""}`,
          cost: framed.length * PRO_COSTS.video,
          primary: true,
        });
      if (directedCount > 0 && drafts.length === 0 && framed.length === 0 && !timelineReady)
        chips.push({ id: "assemble", label: "Assemble the timeline", primary: true });
      if (timelineReady) chips.push({ id: "editor", label: "Open the editor" });
    }
  }

  const onChip = (chip: Chip) => {
    const [kind, ...rest] = chip.id.split(":");
    const val = rest.join(":");
    switch (kind) {
      case "ex":
        reply(userMsg(val), { phase: "style", prompt: val }, agentMsg(styleQuestion(val)));
        return;
      case "style":
        pickStyle(val);
        return;
      case "aspect":
        pickAspect(val);
        return;
      case "shots":
        pickShots(parseInt(val, 10));
        return;
      case "parse":
        startParse();
        return;
      case "create":
        commitBoard();
        return;
      case "resplit":
        resplit();
        return;
      case "restart":
        startOver();
        return;
      case "frame-all":
        startQueue("frame", drafts);
        return;
      case "direct-all":
        startQueue("direct", framed);
        return;
      case "assemble":
        assemble();
        return;
      case "editor":
        onGoEditor();
        return;
      case "append":
        appendShots();
        return;
      case "cancel-append":
        push({ phase: "actions", pendingScript: undefined }, agentMsg("Skipped — the paste stays out of the board."));
        return;
      default:
        break;
    }
  };

  const close = () => {
    const cur = chatRef.current;
    writeSession(sessionKey, { ...cur, open: false });
    onClose?.();
  };

  const busy = chat.typing || chat.phase === "parsing" || chat.phase === "queue" || chat.phase === "auto";

  return (
    <div
      className={cn(
        "rounded-3xl border border-outline-variant/40 bg-surface-container-lowest/70 flex flex-col overflow-hidden",
        dock
          ? "lg:sticky lg:top-24 h-[420px] lg:h-[calc(100vh-160px)] lg:max-h-[660px]"
          : "max-w-[760px] mx-auto h-[min(640px,calc(100vh-200px))]"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-outline-variant/25 shrink-0">
        <span className="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </span>
        <span className="min-w-0">
          <span className="block font-label text-label-md uppercase tracking-wider text-on-surface leading-none">
            NexGC Agent
          </span>
          <span className="block font-label text-[8px] uppercase tracking-widest text-on-surface-variant/70 mt-1">
            {project ? `${project.title} · ${cfg.badge}` : `${cfg.label} · ${chat.mode === "auto" ? "One-shot" : "Guided"}`}
          </span>
        </span>
        <span
          className={cn(
            "ml-auto inline-flex items-center gap-1.5 font-label text-[8px] uppercase tracking-widest",
            busy ? "text-amber-300" : "text-primary"
          )}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full", busy ? "bg-amber-300 animate-pulse" : "bg-primary")} />
          {busy ? "Working" : "Ready"}
        </span>
        {!projectId && onClose && (
          <button
            type="button"
            onClick={close}
            aria-label="close agent chat"
            className="w-7 h-7 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {chat.msgs.map((m) => (
          <MsgBubble key={m.id} msg={m} dock={dock} />
        ))}
        {chat.typing && (
          <div className="flex items-end gap-2">
            <AgentAvatar />
            <span className="rounded-2xl rounded-bl-sm bg-surface-container border border-outline-variant/30 px-3.5 py-2.5 inline-flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/60 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
          </div>
        )}
      </div>

      {/* Quick replies */}
      {chips.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => onChip(chip)}
              disabled={busy}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-label text-[10px] uppercase tracking-wider transition-colors disabled:opacity-50",
                chip.primary
                  ? "bg-primary text-on-primary border-primary hover:opacity-90"
                  : "border-outline-variant/50 text-on-surface-variant hover:border-primary/50 hover:text-primary"
              )}
            >
              {chip.label}
              {chip.cost !== undefined && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 border-l pl-1.5",
                    chip.primary ? "border-on-primary/30" : "border-outline-variant/40"
                  )}
                >
                  <Zap className="w-2.5 h-2.5" fill="currentColor" />
                  {chip.cost}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <div className="px-3 pb-3 shrink-0">
        <div className="flex items-end gap-2 rounded-2xl border border-outline-variant/40 bg-surface-container px-3 py-2 focus-within:border-primary/50 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder={
              projectId
                ? "Try “shot 3 — make it rain”, or paste more script…"
                : chat.phase === "intake"
                  ? "Describe the video in your head…"
                  : "Or type your answer…"
            }
            aria-label="message the agent"
            className="flex-1 bg-transparent border-none resize-none focus:outline-none font-body text-sm text-on-surface placeholder:text-on-surface-variant/60 leading-relaxed max-h-24"
          />
          <button
            type="button"
            onClick={send}
            disabled={!input.trim() || busy}
            aria-label="send"
            className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 shrink-0"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
        <p className="font-label text-[8px] uppercase tracking-widest text-on-surface-variant/50 text-center mt-1.5">
          Mock agent · scripted pipeline · no real API
        </p>
      </div>
    </div>
  );
}

function AgentAvatar() {
  return (
    <span className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/30 text-primary flex items-center justify-center shrink-0">
      <Sparkles className="w-3 h-3" />
    </span>
  );
}

function MsgBubble({ msg, dock }: { msg: ChatMsg; dock: boolean }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <span className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary text-on-primary px-3.5 py-2.5 font-body text-sm leading-relaxed whitespace-pre-wrap break-words">
          {msg.text}
        </span>
      </div>
    );
  }
  const prog = msg.progress;
  const progDone = prog && prog.done >= prog.total;
  return (
    <div className="flex items-end gap-2">
      <AgentAvatar />
      <div className="max-w-[92%] min-w-0">
        <div className="rounded-2xl rounded-bl-sm bg-surface-container border border-outline-variant/30 px-3.5 py-2.5">
          {prog ? (
            <span
              className={cn(
                "inline-flex items-center gap-2 font-label text-[10px] uppercase tracking-wider",
                progDone ? "text-primary" : "text-amber-300"
              )}
            >
              {progDone ? <Check className="w-3.5 h-3.5" /> : <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {prog.label}
              {prog.total > 1 && (
                <span className="text-on-surface-variant/80">
                  {prog.done}/{prog.total}
                </span>
              )}
            </span>
          ) : (
            msg.text && (
              <p className="font-body text-sm text-on-surface leading-relaxed whitespace-pre-wrap break-words">
                {msg.text}
              </p>
            )
          )}
          {msg.board && <BoardCard shots={msg.board} dock={dock} />}
        </div>
        {msg.cost !== undefined && (
          <span className="inline-flex items-center gap-1 font-label text-[8px] uppercase tracking-widest text-on-surface-variant/60 mt-1 ml-1">
            <Zap className="w-2.5 h-2.5" fill="currentColor" /> {msg.cost} credits
          </span>
        )}
      </div>
    </div>
  );
}

/* Inline storyboard: numbered rows in the dock, a two-up grid in takeover.
   Tiles pick up thumbs while the auto pipeline frames them and a check once
   directed — the chat itself is the progress surface. */
function BoardCard({ shots, dock }: { shots: SimShot[]; dock: boolean }) {
  return (
    <div className={cn("mt-2.5 gap-1.5", dock ? "flex flex-col" : "grid grid-cols-2")}>
      {shots.map((s, i) => (
        <div
          key={s.id}
          className="flex items-center gap-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-low px-2.5 py-2 min-w-0"
        >
          <span
            className={cn(
              "relative shrink-0 rounded-lg overflow-hidden flex items-center justify-center",
              "w-[52px] h-[30px] bg-surface-container-high"
            )}
            style={
              s.frameUrl
                ? { backgroundImage: `url(${s.frameUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                : undefined
            }
          >
            {!s.frameUrl && (
              <span className="font-label text-[8px] text-on-surface-variant/70">{String(i + 1).padStart(2, "0")}</span>
            )}
            {s.directed && (
              <span className="absolute inset-0 bg-black/35 flex items-center justify-center">
                <Check className="w-3 h-3 text-primary" />
              </span>
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-body text-[11.5px] text-on-surface leading-snug truncate">{s.summary}</span>
            {s.dialogue && (
              <span className="block font-body text-[10px] text-on-surface-variant/75 italic truncate">
                “{s.dialogue}”
              </span>
            )}
          </span>
          <span className="shrink-0 text-on-surface-variant/50">
            {s.directed ? <Clapperboard className="w-3 h-3 text-primary" /> : s.frameUrl ? <Scissors className="w-3 h-3 text-amber-300" /> : null}
          </span>
        </div>
      ))}
    </div>
  );
}
