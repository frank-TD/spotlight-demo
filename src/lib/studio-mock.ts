import type { StudioMode } from "./store";

/* ── Models per mode ────────────────────────────────────────────────── */

export interface StudioModel {
  id: string;
  name: string;
  brand:
    | "google"
    | "openai"
    | "kling"
    | "artlist"
    | "krea"
    | "grok"
    | "seedance"
    | "happy"
    | "veo"
    | "suno"
    | "udio"
    | "elevenlabs";
  badge?: "NEW";
  tier?: "FREE" | "1K";
  features?: string[];
  description: string;
}

export const IMAGE_MODELS: StudioModel[] = [
  {
    id: "nano-banana-pro",
    name: "Nano Banana Pro",
    brand: "google",
    tier: "FREE",
    description: "Google's premium model for photorealistic detail at 4K.",
    features: ["Multi-Image Input", "4K"],
  },
  {
    id: "nano-banana-2",
    name: "Nano Banana 2",
    brand: "google",
    tier: "FREE",
    description: "Google's latest model for fast, high-quality image generation.",
    features: ["Multi-Image Input", "4K"],
  },
  {
    id: "seedream-5",
    name: "Seedream 5.0",
    brand: "seedance",
    tier: "FREE",
    description: "Cinematic depth-of-field and natural skin tones out of the box.",
  },
  {
    id: "gpt-image-2",
    name: "GPT Image 2",
    brand: "openai",
    tier: "FREE",
    description: "Strong at text-in-image and editorial layouts.",
    features: ["Text Rendering"],
  },
  {
    id: "kling-3",
    name: "Kling 3.0",
    brand: "kling",
    tier: "FREE",
    description: "Kling's image model with painterly, story-driven outputs.",
  },
  {
    id: "kling-o3",
    name: "Kling O3",
    brand: "kling",
    tier: "FREE",
    description: "Faster Kling variant for quick iterations.",
  },
  {
    id: "artlist-original",
    name: "Artlist Original 1.0",
    brand: "artlist",
    tier: "FREE",
    description: "House model tuned for brand-safe stock-ready visuals.",
  },
  {
    id: "krea-2",
    name: "Krea 2",
    brand: "krea",
    tier: "1K",
    badge: "NEW",
    description: "New from Krea — strong at typography and surreal composition.",
  },
  {
    id: "grok-imagine",
    name: "Grok Imagine",
    brand: "grok",
    tier: "1K",
    features: ["Image Input"],
    description: "xAI's image model — playful, character-forward.",
  },
];

export const VIDEO_MODELS: StudioModel[] = [
  {
    id: "seedance-2",
    name: "Seedance 2.0",
    brand: "seedance",
    tier: "FREE",
    description: "Smooth motion, strong subject coherence across cuts.",
    features: ["Audio", "10 sec"],
  },
  {
    id: "seedance-2-fast",
    name: "Seedance 2.0 Fast",
    brand: "seedance",
    tier: "FREE",
    description: "Half-resolution fast preview of Seedance 2.0.",
  },
  {
    id: "happy-horse-1",
    name: "Happy Horse 1.0",
    brand: "happy",
    tier: "FREE",
    badge: "NEW",
    description: "New entrant — quirky character animation.",
  },
  {
    id: "veo-3-1-lite",
    name: "Veo 3.1 Lite",
    brand: "veo",
    tier: "FREE",
    description: "Veo's lightweight tier for short clips.",
  },
  {
    id: "veo-3-1",
    name: "Veo 3.1",
    brand: "veo",
    tier: "FREE",
    description: "Veo flagship — broadcast-grade cinematics.",
    features: ["Audio", "4K"],
  },
  {
    id: "veo-3-1-fast",
    name: "Veo 3.1 Fast",
    brand: "veo",
    tier: "FREE",
    description: "Veo 3.1 with reduced step count for iteration.",
  },
  {
    id: "veo-3-1-extend",
    name: "Veo 3.1 Extend Video",
    brand: "veo",
    tier: "FREE",
    description: "Extend an existing clip with frame-coherent continuation.",
  },
  {
    id: "kling-3",
    name: "Kling 3.0",
    brand: "kling",
    tier: "FREE",
    description: "Cinematic video with rich narrative continuity and native audio.",
    features: ["Start/End Frame", "Audio", "4K", "15 sec"],
  },
  {
    id: "kling-o3",
    name: "Kling O3",
    brand: "kling",
    tier: "FREE",
    description: "Kling's lighter video variant.",
  },
];

export const VOICEOVER_ENGINES: StudioModel[] = [
  {
    id: "eleven-v3",
    name: "Eleven v3",
    brand: "elevenlabs",
    tier: "FREE",
    description: "ElevenLabs' flagship multilingual voice synthesis.",
  },
  {
    id: "eleven-multilingual-v2",
    name: "Eleven Multilingual v2",
    brand: "elevenlabs",
    tier: "FREE",
    description: "Stable multilingual baseline.",
  },
  {
    id: "openai-voice",
    name: "OpenAI Voice",
    brand: "openai",
    tier: "FREE",
    description: "Conversational, natural-feeling reading voice.",
  },
];

export const MUSIC_MODELS: StudioModel[] = [
  {
    id: "suno-v4",
    name: "Suno v4",
    brand: "suno",
    tier: "FREE",
    description: "Full song with vocals, structure, and arrangement.",
    features: ["Vocals", "Lyrics"],
  },
  {
    id: "udio",
    name: "Udio",
    brand: "udio",
    tier: "FREE",
    description: "Strong production polish, broad genre coverage.",
  },
  {
    id: "artlist-instrumental",
    name: "Artlist Instrumental",
    brand: "artlist",
    tier: "FREE",
    description: "House instrumental engine — license-clean.",
  },
];

export const MODELS_BY_MODE: Record<StudioMode, StudioModel[]> = {
  image: IMAGE_MODELS,
  video: VIDEO_MODELS,
  voiceover: VOICEOVER_ENGINES,
  music: MUSIC_MODELS,
};

export const DEFAULT_MODEL_BY_MODE: Record<StudioMode, string> = {
  image: "nano-banana-2",
  video: "kling-3",
  voiceover: "eleven-v3",
  music: "suno-v4",
};

/* ── Voice catalog (Voiceover mode) ─────────────────────────────────── */

export interface StudioVoice {
  id: string;
  name: string;
  description: string;
  gender: "Male" | "Female";
  tags: string[]; // e.g. Tutorials, Social, Commercials
  // Background gradient seed for the waveform card thumbnail (4 variations).
  hue: 0 | 1 | 2 | 3;
}

export const VOICES: StudioVoice[] = [
  {
    id: "bright",
    name: "Bright",
    description: "Narrate with a friendly, welcoming voice",
    gender: "Female",
    tags: ["Tutorials", "Social"],
    hue: 0,
  },
  {
    id: "sleek",
    name: "Sleek",
    description: "A charismatic voice to sell your product",
    gender: "Male",
    tags: ["Commercials", "Tutorials"],
    hue: 1,
  },
  {
    id: "trail",
    name: "Trail",
    description: "A steady voice to accompany every journey",
    gender: "Male",
    tags: ["Social", "Health & Wellness"],
    hue: 2,
  },
  {
    id: "persuasion",
    name: "Persuasion",
    description: "Speak clearly and directly to your audience",
    gender: "Female",
    tags: ["Commercials", "Social"],
    hue: 3,
  },
  {
    id: "lumen",
    name: "Lumen",
    description: "Warm, slow, documentary-grade narration",
    gender: "Female",
    tags: ["Documentary", "Tutorials"],
    hue: 0,
  },
  {
    id: "anchor",
    name: "Anchor",
    description: "Newsroom-confident, neutral baseline",
    gender: "Male",
    tags: ["News", "Tutorials"],
    hue: 1,
  },
];

/* ── Picker options ────────────────────────────────────────────────── */

export const ASPECT_OPTIONS = ["1:1", "4:3", "16:9", "9:16", "21:9"];
export const QUALITY_OPTIONS = ["1K", "2K", "4K"];
export const COUNT_OPTIONS = [1, 2, 4];
export const VIDEO_DURATION_OPTIONS = ["3 sec", "5 sec", "10 sec", "15 sec"];
export const VIDEO_RESOLUTION_OPTIONS = ["720p", "1080p", "4K"];
export const LANGUAGE_OPTIONS = ["English", "Mandarin", "Spanish", "Japanese", "French"];
export const ACCENT_OPTIONS = ["American", "British", "Australian", "Neutral"];
export const VOICE_EFFECT_OPTIONS = ["No Effect", "Phone", "Megaphone", "Whisper"];
export const GENRE_OPTIONS = [
  "Cinematic",
  "Lo-fi",
  "Electronic",
  "Hip-hop",
  "Acoustic",
  "Orchestral",
  "Synthwave",
  "Ambient",
];
export const MOOD_OPTIONS = [
  "Uplifting",
  "Melancholic",
  "Tense",
  "Playful",
  "Epic",
  "Dreamy",
  "Calm",
];
export const MUSIC_DURATION_OPTIONS = ["15 sec", "30 sec", "1 min", "2 min"];
