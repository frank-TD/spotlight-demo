// Static mock data + helpers for NexGC Pro (short-drama production).
// Everything is display-level: picsum imagery with deterministic seeds, a
// decorative credits price list, and a local script-splitting heuristic.
// English copy is hardcoded on purpose (mockup stage), matching the
// Superstar provider convention.

import type { ProAssetKind, ProWorkflow } from "@/lib/store";

export const PRO_COSTS = {
  script: 15, // Script → Shots parse
  asset: 5, // one asset generation run (4 candidates)
  frame: 8, // Framing run
  video: 12, // Directing run
} as const;

export const DRAMA_STYLES = [
  "2D Anime",
  "Realistic",
  "Cyberpunk",
  "Ink Wash",
  "Retro HK",
  "K-Drama",
] as const;

export const ANGLES = ["Eye-level", "Low angle", "High angle", "Overhead"] as const;
export const SHOT_TYPES = ["Wide", "Medium", "Close-up", "Extreme CU"] as const;
export const LIGHTINGS = ["Natural", "Noir", "Neon", "Golden hour"] as const;
export const CAMERA_MOVES = [
  "Static",
  "Push in",
  "Pull out",
  "Pan left",
  "Pan right",
  "Orbit",
] as const;
export const SHOT_DURATIONS = [3, 5, 8, 12] as const;

export const MAX_SHOTS_CAP = 80;
export const SCRIPT_MAX_LEN = 10000;
export const TITLE_MAX_LEN = 20;

/* ── Video-type workflows (OpenArt-style quick starts) ───────────────────
   One wizard skeleton, four configurations. Each type tunes the intake
   copy, art styles, default shot count/length and output aspect; deeper
   per-type features (variant hooks, product frames, beat-synced boards)
   arrive in the next batch. */

export interface WorkflowCfg {
  label: string;
  tagline: string;
  badge: string; // compact pill shown on the project header / cards
  tag?: string; // corner ribbon on the quick-start card
  aspect: string;
  shotSec: number; // default per-shot duration
  defaultShots: number; // parse target when max shots is left blank
  styles: readonly string[];
  titleHint: string;
  scriptLabel: string;
  scriptHint: string;
  hasTrack?: boolean; // music video: pick a (mock) track
}

export const WORKFLOW_ORDER: ProWorkflow[] = ["ugc", "ad", "mv", "film"];

export const WORKFLOWS: Record<ProWorkflow, WorkflowCfg> = {
  ugc: {
    label: "UGC",
    tagline: "Authentic creator-style clips that convert",
    badge: "UGC",
    tag: "9:16",
    aspect: "9:16",
    shotSec: 5,
    defaultShots: 4,
    styles: ["Realistic", "K-Drama", "2D Anime"],
    titleHint: "Name this UGC clip",
    scriptLabel: "Creator script",
    scriptHint:
      "Hook first. Paste the pitch the creator delivers to camera — hook, body, call to action. Quoted lines become spoken dialogue.",
  },
  ad: {
    label: "Advertisement",
    tagline: "Polished product spots for any campaign",
    badge: "AD",
    tag: "New",
    aspect: "16:9",
    shotSec: 5,
    defaultShots: 3,
    styles: ["Realistic", "Cyberpunk", "Ink Wash"],
    titleHint: "Name this campaign spot",
    scriptLabel: "Ad brief",
    scriptHint:
      "Product, key selling points, mood, and the closing tagline. Three beats work best: product close-up, lifestyle scene, CTA end card.",
  },
  mv: {
    label: "Music Video",
    tagline: "Turn any track into a synced music video",
    badge: "MV",
    aspect: "16:9",
    shotSec: 5,
    defaultShots: 6,
    styles: ["2D Anime", "Cyberpunk", "Ink Wash", "Realistic"],
    titleHint: "Name this music video",
    scriptLabel: "Lyrics / visual beats",
    scriptHint:
      "Paste lyrics or describe the visuals section by section — intro, verse, chorus, bridge. Each section becomes one or more shots.",
    hasTrack: true,
  },
  film: {
    label: "Micro Film / Short Film",
    tagline: "Multi-scene stories worth re-watching",
    badge: "FILM",
    tag: "Featured",
    aspect: "9:16",
    shotSec: 8,
    defaultShots: 12,
    styles: DRAMA_STYLES,
    titleHint: "Name this episode",
    scriptLabel: "Script content",
    scriptHint:
      "Paste the complete episode script here — scene directions, dialogue, everything.",
  },
};

// Mock track library for the Music Video workflow.
export const MV_TRACKS = [
  "Tense neo-noir underscore",
  "Neon night drive · synthwave",
  "Paper lanterns · lo-fi",
  "Upload my own track…",
] as const;

export const workflowOf = (wf?: ProWorkflow): WorkflowCfg => WORKFLOWS[wf ?? "film"];

export interface ProPreset {
  name: string;
  desc: string;
  seed: string;
}

export const PRESETS: Record<ProAssetKind, ProPreset[]> = {
  character: [
    { name: "Theo", desc: "Brooding lead — storm-grey eyes, quiet menace.", seed: "pro-char-theo" },
    { name: "Celeste", desc: "1950s diner waitress with a secret past.", seed: "pro-char-celeste" },
    { name: "Ken", desc: "Rival heir, cigarette half-lit, always calculating.", seed: "pro-char-ken" },
    { name: "Goran", desc: "Warm uncle energy, knows where the bodies are.", seed: "pro-char-goran" },
    { name: "Noah", desc: "Beanie-wearing hacker ally, allergic to small talk.", seed: "pro-char-noah" },
    { name: "Mara", desc: "Disgraced heiress rebuilding her empire.", seed: "pro-char-mara" },
    { name: "Iris", desc: "Archive clerk who reads everyone's mail.", seed: "pro-char-iris" },
    { name: "Kane", desc: "Fixer in a rain-soaked trench coat.", seed: "pro-char-kane" },
  ],
  scene: [
    { name: "Rooftop at Rain", desc: "Neon skyline, wet concrete, cinematic dusk.", seed: "pro-scene-rooftop" },
    { name: "Boardroom", desc: "Glass tower, long table, cold morning light.", seed: "pro-scene-boardroom" },
    { name: "Midnight Archive", desc: "Steel shelving, flashlight beams, dust.", seed: "pro-scene-archive" },
    { name: "Neon Alley", desc: "Steam vents, hawker signs, pink-green glow.", seed: "pro-scene-alley" },
    { name: "Harbor Warehouse", desc: "Container rows, sodium lamps, fog.", seed: "pro-scene-harbor" },
    { name: "Penthouse", desc: "Floor-to-ceiling windows over the city.", seed: "pro-scene-penthouse" },
  ],
  prop: [
    { name: "Keycard", desc: "Unmarked black access card, worn edges.", seed: "pro-prop-keycard" },
    { name: "Burned Contract", desc: "Charred corner, signature still legible.", seed: "pro-prop-contract" },
    { name: "Silver Locket", desc: "Holds the photo that starts everything.", seed: "pro-prop-locket" },
    { name: "Burner Phone", desc: "One saved number, screen cracked.", seed: "pro-prop-phone" },
    { name: "Ledger", desc: "Handwritten accounts nobody was meant to read.", seed: "pro-prop-ledger" },
    { name: "Black Umbrella", desc: "The stranger's calling card.", seed: "pro-prop-umbrella" },
  ],
};

export const KIND_LABEL: Record<ProAssetKind, string> = {
  character: "Character",
  scene: "Scene",
  prop: "Prop",
};

export const KIND_PLURAL: Record<ProAssetKind, string> = {
  character: "Characters",
  scene: "Scenes",
  prop: "Props",
};

// Per-kind image dimensions (also encodes the card aspect).
export const ASSET_DIM: Record<ProAssetKind, [number, number]> = {
  character: [600, 800],
  scene: [960, 540],
  prop: [700, 700],
};

export const GEN_PLACEHOLDER: Record<ProAssetKind, string> = {
  character: "Describe your character's look and personality...",
  scene: "Describe the location, era, weather and mood...",
  prop: "Describe the prop — material, era, style, wear...",
};

export const picsum = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

export const assetImg = (kind: ProAssetKind, seed: string) => {
  const [w, h] = ASSET_DIM[kind];
  return picsum(seed, w, h);
};

export const frameImg = (seed: string) => picsum(seed, 960, 540);

export const proId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

// Timestamp helper — kept out of components so the react-hooks purity lint
// (which flags direct Date.now() in component scope) stays quiet.
export const nowTs = () => Date.now();

/* ── Session-scoped drafts ───────────────────────────────────────────────
   The signup gate routes guests to /login and back, unmounting the whole
   Pro workspace on the way. Drafts (script form, composer prompt, asset
   prompts, active section) park in sessionStorage so nothing typed is lost
   across that round-trip — or an accidental reload. Best-effort by design:
   storage failures must never break the flow. */

export function readSession<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeSession(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota/blocked — drafts are best-effort */
  }
}

export function clearSession(key: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

export const SK = {
  section: "pro.section",
  stepper: "pro.stepper.draft",
  composerOpen: "pro.composer.open",
  composerDraft: (fragId: string) => `pro.composer.${fragId}`,
  assetGen: (kind: string) => `pro.assetgen.${kind}`,
  mention: "pro.mention.pending",
} as const;

// Derive an asset name from the generation prompt: first two words, cleaned
// and title-cased ("young detective in noir coat" → "Young Detective").
export function nameFromPrompt(prompt: string, kind: ProAssetKind): string {
  const words = prompt
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1));
  return words.length > 0 ? words.join(" ") : `New ${KIND_LABEL[kind]}`;
}

// Split a full-episode script into up to `maxShots` shot drafts. Sentence
// boundaries (CJK or latin punctuation) are grouped evenly, and a quoted
// span inside a chunk is surfaced as that shot's dialogue line.
export function splitScript(
  script: string,
  maxShots: number
): { summary: string; dialogue?: string }[] {
  const clean = script.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const sentences = clean
    .split(/(?<=[。！？；!?.;])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
  if (sentences.length === 0) return [{ summary: clean.slice(0, 180) }];
  const cap = Math.min(Math.max(1, maxShots || 12), MAX_SHOTS_CAP);
  const count = Math.min(cap, Math.max(2, Math.ceil(sentences.length / 2)), sentences.length);
  const per = sentences.length / count;
  const out: { summary: string; dialogue?: string }[] = [];
  for (let i = 0; i < count; i++) {
    const chunk = sentences.slice(Math.round(i * per), Math.round((i + 1) * per));
    if (chunk.length === 0) continue;
    const text = chunk.join(" ");
    const quote = text.match(/[“"「]([^”"」]{2,80})[”"」]/);
    out.push({ summary: text.slice(0, 180), dialogue: quote?.[1] });
  }
  return out;
}

export const fmtShotNo = (n: number) => `Shot ${String(n).padStart(2, "0")}`;

// "83s" → "01:23.00" — transport clock formatting for the editor shell.
export function fmtClock(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.00`;
}
