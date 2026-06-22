import { mediaUrl } from "./media";

export type StageStatus =
  | "pending"
  | "in_progress"
  | "submitted"
  | "accepted"
  | "rejected"
  | "auto_accepted";

export interface Stage {
  id: string;
  idx: number;
  name: string;
  ratio: number;
  amountFiat: number;
  status: StageStatus;
  submittedAt: string | null;
  decidedAt: string | null;
  autoAcceptAt?: string;
}

// ── Users ────────────────────────────────────────────────────────────────────

export const CURRENT_USER_BACKER = {
  id: "u_backer_01",
  nickname: "Lucas Chen",
  avatar: "LC",
  email: "lucas@neovision.co",
  role: "backer" as const,
  kycStatus: "passed" as const,
  diamond: 12400,
  shell: 0,
};

export const CURRENT_USER_CREATOR = {
  id: "u_creator_01",
  nickname: "Aria Song",
  avatar: "AS",
  email: "aria@studio.me",
  role: "creator" as const,
  kycStatus: "passed" as const,
  diamond: 0,
  shell: 8650,
};

// ── Creators ─────────────────────────────────────────────────────────────────

export const CREATORS = [
  {
    id: "u_creator_01",
    nickname: "Aria Song",
    avatar: "AS",
    avatarColor: "bg-rose-100 text-rose-700",
    specialties: ["Narrative Short Film", "Cinematic", "Sci-Fi"],
    bio: "Award-winning AIGC filmmaker. Blending technology with poetic storytelling. Previously: Sundance Lab, NVIDIA AI Lab.",
    rating: 4.9,
    orders: 47,
    completion: 98,
    punctuality: 96,
    disputes: 0,
    copyrightViolations: 0,
    rateCard: { from: 2800, unit: "project" },
    activeHours: "09:00–22:00 CST",
    showcase: [
      { id: "a1", title: "Echoes of Tomorrow", type: "video", thumbnail: "🎬", duration: "4:32" },
      { id: "a2", title: "Neon Requiem", type: "video", thumbnail: "🎬", duration: "2:18" },
      { id: "a3", title: "The Glass Garden", type: "video", thumbnail: "🎬", duration: "6:01" },
    ],
  },
  {
    id: "u_creator_02",
    nickname: "Marco Reyes",
    avatar: "MR",
    avatarColor: "bg-sky-100 text-sky-700",
    specialties: ["Commercial", "Brand Film", "Product Visualization"],
    bio: "Commercial director with 8 years in AIGC production. Client: Nike, Sony, ByteDance.",
    rating: 4.7,
    orders: 83,
    completion: 95,
    punctuality: 92,
    disputes: 1,
    copyrightViolations: 0,
    rateCard: { from: 3500, unit: "project" },
    activeHours: "10:00–20:00 CET",
    showcase: [
      { id: "a4", title: "Nike: Run Beyond", type: "video", thumbnail: "🎬", duration: "1:00" },
      { id: "a5", title: "Sony Vision Pro", type: "video", thumbnail: "🎬", duration: "0:45" },
    ],
  },
  {
    id: "u_creator_03",
    nickname: "Yuki Tanaka",
    avatar: "YT",
    avatarColor: "bg-emerald-100 text-emerald-700",
    specialties: ["Anime Style", "Character Animation", "Music Video"],
    bio: "Anime-influenced AIGC animator. Obsessed with character emotion and fluid motion.",
    rating: 4.8,
    orders: 31,
    completion: 100,
    punctuality: 97,
    disputes: 0,
    copyrightViolations: 0,
    rateCard: { from: 2200, unit: "project" },
    activeHours: "14:00–02:00 JST",
    showcase: [
      { id: "a6", title: "Stellar Bloom MV", type: "video", thumbnail: "🎬", duration: "3:44" },
      { id: "a7", title: "Nishi's Journey", type: "video", thumbnail: "🎬", duration: "8:12" },
    ],
  },
  {
    id: "u_creator_04",
    nickname: "Sofia Okonkwo",
    avatar: "SO",
    avatarColor: "bg-amber-100 text-amber-700",
    specialties: ["Documentary", "Journalism", "Social Content"],
    bio: "Documentary storyteller merging AI tools with real-world impact narratives.",
    rating: 4.6,
    orders: 22,
    completion: 91,
    punctuality: 89,
    disputes: 0,
    copyrightViolations: 0,
    rateCard: { from: 1800, unit: "project" },
    activeHours: "08:00–18:00 WAT",
    showcase: [
      { id: "a8", title: "Invisible Cities", type: "video", thumbnail: "🎬", duration: "12:00" },
    ],
  },
  {
    id: "u_creator_05",
    nickname: "Liang Wei",
    avatar: "LW",
    avatarColor: "bg-violet-100 text-violet-700",
    specialties: ["Trailer", "Cinematic", "Action"],
    bio: "Trailer specialist cutting high-tension teasers for AI-made features. Ex-agency editor.",
    rating: 4.8,
    orders: 39,
    completion: 97,
    punctuality: 95,
    disputes: 0,
    copyrightViolations: 0,
    rateCard: { from: 3000, unit: "project" },
    activeHours: "10:00–21:00 CST",
    showcase: [
      { id: "a9", title: "Voidbound — Teaser", type: "video", thumbnail: "🎬", duration: "1:30" },
    ],
  },
  {
    id: "u_creator_06",
    nickname: "Nadia Haddad",
    avatar: "NH",
    avatarColor: "bg-teal-100 text-teal-700",
    specialties: ["Brand Film", "Fashion", "Cinematic"],
    bio: "Fashion-leaning brand filmmaker. Texture, light, and motion obsessive.",
    rating: 4.9,
    orders: 26,
    completion: 99,
    punctuality: 98,
    disputes: 0,
    copyrightViolations: 0,
    rateCard: { from: 4200, unit: "project" },
    activeHours: "09:00–19:00 GST",
    showcase: [
      { id: "a10", title: "Maison Aurelle SS26", type: "video", thumbnail: "🎬", duration: "1:10" },
    ],
  },
];

// ── Needs ─────────────────────────────────────────────────────────────────────

export const NEEDS = [
  {
    id: "need_001",
    backerId: "u_backer_01",
    backerNickname: "Lucas Chen",
    backerAvatar: "LC",
    title: "Cinematic Brand Film for AI Startup — 90s Hero Video",
    contentType: "Commercial",
    styles: ["Cinematic", "Tech", "Minimal"],
    durationSec: 90,
    episodes: 1,
    aspectRatio: "16:9",
    platforms: ["YouTube", "Website", "LinkedIn"],
    budget: 4500,
    deliveryDays: 21,
    allowAI: true,
    nda: false,
    copyright: "Buyout",
    modifyLimit: 3,
    moodboard: true,
    status: "open" as const,
    bids: 8,
    publishedAt: "2026-05-12",
    brief:
      "We are launching a new AI product platform next month and need a powerful 90-second brand film that captures the feeling of human creativity amplified by AI. The tone should be aspirational and minimal — no stock-footage clichés. Think Stripe's product films or Linear's launch videos.",
    matchScore: 94,
  },
  {
    id: "need_002",
    backerId: "u_backer_02",
    backerNickname: "Priya Mehta",
    backerAvatar: "PM",
    title: "3-Episode Anime Short Series — Original IP",
    contentType: "Narrative Short Film",
    styles: ["Anime", "Fantasy", "Character-driven"],
    durationSec: 480,
    episodes: 3,
    aspectRatio: "16:9",
    platforms: ["YouTube", "Bilibili"],
    budget: 9800,
    deliveryDays: 45,
    allowAI: true,
    nda: true,
    copyright: "Sub-licensable",
    modifyLimit: 2,
    moodboard: true,
    status: "open" as const,
    bids: 3,
    publishedAt: "2026-05-14",
    brief:
      "Original IP anime series — 3 episodes, each 8 minutes. A coming-of-age story set in near-future Tokyo. Character designs and world-building reference provided. Need a creator who can maintain visual consistency across all three episodes.",
    matchScore: 87,
  },
  {
    id: "need_003",
    backerId: "u_backer_03",
    backerNickname: "James Wu",
    backerAvatar: "JW",
    title: "Product Launch Video — Smart Home Device",
    contentType: "Commercial",
    styles: ["Clean", "Product", "Warm"],
    durationSec: 60,
    episodes: 1,
    aspectRatio: "16:9",
    platforms: ["YouTube", "TikTok", "Instagram"],
    budget: 2800,
    deliveryDays: 14,
    allowAI: true,
    nda: false,
    copyright: "Buyout",
    modifyLimit: 3,
    moodboard: false,
    status: "open" as const,
    bids: 12,
    publishedAt: "2026-05-15",
    brief:
      "60-second product launch video for our new smart home sensor. Warm, lifestyle-focused aesthetic. Show the device integrating naturally into everyday life. Family-friendly.",
    matchScore: 71,
  },
  {
    id: "need_004",
    backerId: "u_backer_01",
    backerNickname: "Lucas Chen",
    backerAvatar: "LC",
    title: "Music Video — Indie Electronic Artist",
    contentType: "Music Video",
    styles: ["Abstract", "Surreal", "Neon"],
    durationSec: 210,
    episodes: 1,
    aspectRatio: "16:9",
    platforms: ["YouTube", "Spotify Canvas"],
    budget: 3200,
    deliveryDays: 18,
    allowAI: true,
    nda: false,
    copyright: "Buyout",
    modifyLimit: 4,
    moodboard: true,
    status: "in_progress" as const,
    bids: 6,
    publishedAt: "2026-05-08",
    matchScore: 0,
  },
  {
    id: "need_005",
    backerId: "u_backer_04",
    backerNickname: "NeoVision AI",
    backerAvatar: "NV",
    title: "Music Video — Indie Electronic Single",
    contentType: "Music Video",
    styles: ["Neon", "Surreal", "Performance"],
    durationSec: 180,
    episodes: 1,
    aspectRatio: "16:9",
    platforms: ["YouTube", "Spotify Canvas"],
    budget: 5200,
    deliveryDays: 24,
    allowAI: true,
    nda: false,
    copyright: "Buyout",
    modifyLimit: 3,
    moodboard: true,
    status: "open" as const,
    bids: 5,
    publishedAt: "2026-05-16",
    brief:
      "A 3-minute performance-driven music video for an indie electronic single. Neon-soaked, surreal, with a strong recurring visual motif. Looking for a creator with a distinctive directorial voice.",
    matchScore: 81,
  },
  {
    id: "need_006",
    backerId: "u_backer_05",
    backerNickname: "Atlas Studios",
    backerAvatar: "AT",
    title: "Animated Trailer for Original Fantasy IP",
    contentType: "Trailer",
    styles: ["Fantasy", "Epic", "Painterly"],
    durationSec: 75,
    episodes: 1,
    aspectRatio: "2.39:1",
    platforms: ["YouTube", "Festival"],
    budget: 7600,
    deliveryDays: 30,
    allowAI: true,
    nda: true,
    copyright: "Sub-licensable",
    modifyLimit: 2,
    moodboard: true,
    status: "open" as const,
    bids: 4,
    publishedAt: "2026-05-17",
    brief:
      "A 75-second animated trailer to launch our original fantasy IP. Painterly, epic tone. World bible and key art provided. Must hold visual consistency and land a memorable final shot.",
    matchScore: 76,
  },
];

// ── Hero / showcase reel ─────────────────────────────────────────────────────
// Cinematic clips used behind the homepage hero AND as featured-project preview
// videos. Web-optimized placeholders ship from /public today; when the backend
// takes over, swap this list (or hydrate it from an API) and/or set
// NEXT_PUBLIC_VIDEO_CDN — consumers read {id,src,poster} and never change. Each
// clip carries a real first-frame poster so cards show a still before playback.
export interface VideoClip {
  id: string;
  src: string;
  poster: string;
}

// Fallback dark SVG (matches --md-surface) for any clip without a real poster.
export const HERO_VIDEO_POSTER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect width='8' height='8' fill='%2308080a'/%3E%3C/svg%3E";

// Hero background pool — the three uploaded films cross-fade as the hero reel.
const HERO_CLIP_IDS = ["hero-1", "hero-2", "hero-3"];
// Older clips stay available only for the "In the Spotlight" preview lookups.
const FEATURED_CLIP_IDS = ["3917525", "8059683", "7596081", "3917513"];

const toClip = (id: string): VideoClip => ({
  id,
  src: mediaUrl(`/videos/clips/${id}.mp4`),
  // The new hero clips ship without a baked first-frame still, so fall back to
  // the flat dark poster; the older featured clips keep their .jpg posters.
  poster: id.startsWith("hero-") ? HERO_VIDEO_POSTER : mediaUrl(`/videos/clips/${id}.jpg`),
});

export const HERO_VIDEO_CLIPS: VideoClip[] = HERO_CLIP_IDS.map(toClip);

// Lookup so featured projects can reference a clip by id for their preview.
export const VIDEO_CLIP_BY_ID: Record<string, VideoClip> = Object.fromEntries(
  [...HERO_CLIP_IDS, ...FEATURED_CLIP_IDS].map((id) => [id, toClip(id)])
);

// ── Featured projects (homepage "In the Spotlight" curation) ─────────────────
// Curated slate shown on the marketing homepage. Titles stay untranslated
// (film brand names); loglines/meta live in i18n keyed by `copyKey`. Spotlight
// is a commissioning marketplace — a backer funds a creator to make the film —
// so projects move through: open (seeking a backer) → production (commissioned,
// being made) → released. There is no crowdfunding goal/backer-count/countdown.
// `clipId` (optional) gives a card a preview video; the rest fall back to a
// seeded still.

export type FeaturedStatus = "open" | "production" | "released";

export const FEATURED_PROJECTS = [
  {
    id: "feat_celestial",
    title: "Celestial Entity",
    creator: "Aria Song",
    city: "Seoul",
    seed: "celestial",
    clipId: "3917525",
    status: "open" as FeaturedStatus,
    copyKey: 1,
    lead: true,
  },
  {
    id: "feat_neon",
    title: "Die My Love",
    creator: "Yuki Tanaka",
    city: "Osaka",
    seed: "neonrain",
    poster: mediaUrl("/posters/die-my-love.jpg"),
    status: "production" as FeaturedStatus,
    copyKey: 2,
  },
  {
    id: "feat_golden",
    title: "Gringo",
    creator: "Marco Reyes",
    city: "Tokyo",
    seed: "goldencore",
    poster: mediaUrl("/posters/gringo.jpg"),
    status: "open" as FeaturedStatus,
    copyKey: 3,
  },
  {
    id: "feat_aurora",
    title: "Love Will Tear Us Apart",
    creator: "Sofia Okonkwo",
    city: "Seoul",
    seed: "aurora",
    poster: mediaUrl("/posters/love-tears-us-apart.jpg"),
    status: "released" as FeaturedStatus,
    copyKey: 4,
    nowShowing: true,
  },
  {
    id: "feat_crimson",
    title: "Who Are You?",
    creator: "Liang Wei",
    city: "Taipei",
    seed: "crimsonmirage",
    poster: mediaUrl("/posters/who-are-you.jpg"),
    status: "open" as FeaturedStatus,
    copyKey: 5,
  },
  {
    id: "feat_lanterns",
    title: "Fish Bone",
    creator: "Mei Lin",
    city: "Hangzhou",
    seed: "paperlanterns",
    poster: mediaUrl("/posters/fish-bone.jpg"),
    status: "released" as FeaturedStatus,
    copyKey: 6,
  },
  {
    id: "feat_eighthday",
    title: "The Bear",
    creator: "Dilan Cruz",
    city: "Manila",
    seed: "eighthday",
    poster: mediaUrl("/posters/the-bear.jpg"),
    status: "production" as FeaturedStatus,
    copyKey: 7,
  },
];

// ── Released-film performance showcase (homepage Distribution section) ────────
// PLACEHOLDER DEMO DATA — these titles, dates and numbers are NOT real, verified
// performance. They are mock proof points for the marketing showcase, shaped to
// be swapped 1:1 with real released-film distribution data later. No revenue.
// Each film shows as a poster card; clicking it zooms to its full metrics.
export const RELEASED_SHOWCASE = {
  films: [
    {
      id: "neon-rain",
      title: "Marty Supreme",
      poster: mediaUrl("/posters/marty-supreme.jpg"),
      releaseDate: "May 2026",
      type: "Feature Film · Released Globally",
      distribution: "5 Platforms · 31 Regions · 28-Day Release Window",
      // Large post-release proof points (audience/distribution only — no revenue).
      // `value` animates as a count-up; `suffix`/`decimals` shape the display.
      metrics: [
        { value: 2.4, suffix: "M", decimals: 1, label: "Total Views" },
        { value: 68, suffix: "%", decimals: 0, label: "Avg. Completion" },
        { value: 142, suffix: "K", decimals: 0, label: "Audience Actions" },
        { value: 31, suffix: "", decimals: 0, label: "Regions" },
      ],
    },
    {
      id: "golden-core",
      title: "Exit 8",
      poster: mediaUrl("/posters/exit-8.jpg"),
      releaseDate: "Apr 2026",
      type: "Feature Film · Festival Circuit",
      distribution: "Festival Circuit · 6 Submissions · 3 Selections",
      metrics: [
        { value: 812, suffix: "K", decimals: 0, label: "Total Views" },
        { value: 74, suffix: "%", decimals: 0, label: "Avg. Completion" },
        { value: 53, suffix: "K", decimals: 0, label: "Audience Actions" },
        { value: 18, suffix: "", decimals: 0, label: "Regions" },
      ],
    },
    {
      id: "aurora-crystal",
      title: "Dallas Buyers Club",
      poster: mediaUrl("/posters/dallas-buyers-club.jpg"),
      releaseDate: "Mar 2026",
      type: "Feature Film · Streaming",
      distribution: "Streaming · 4 Platforms · 12 Regions",
      metrics: [
        { value: 1.1, suffix: "M", decimals: 1, label: "Total Views" },
        { value: 71, suffix: "%", decimals: 0, label: "Avg. Completion" },
        { value: 96, suffix: "K", decimals: 0, label: "Audience Actions" },
        { value: 12, suffix: "", decimals: 0, label: "Regions" },
      ],
    },
  ],
  capabilities: ["Streaming", "Festival", "Social Cuts", "Regional Release"],
} as const;

// ── Bids on need_001 ──────────────────────────────────────────────────────────

export const BIDS_NEED_001 = [
  {
    id: "bid_001",
    creatorId: "u_creator_01",
    creator: CREATORS[0],
    quote: 4200,
    note: "I specialize in exactly this type of minimal-cinematic narrative. My approach: open with a single human element, build tension through sound design, resolve with the product reveal. Can deliver in 18 days.",
    status: "pending" as const,
    submittedAt: "2026-05-13",
  },
  {
    id: "bid_002",
    creatorId: "u_creator_02",
    creator: CREATORS[1],
    quote: 4500,
    note: "Brand films are my core expertise. Proposing a 3-act structure: problem → friction → resolution. References: Sony Vision Pro campaign I directed last year.",
    status: "pending" as const,
    submittedAt: "2026-05-13",
  },
  {
    id: "bid_003",
    creatorId: "u_creator_03",
    creator: CREATORS[2],
    quote: 3800,
    note: "Bringing an anime-influenced visual sensibility to tech content. Unconventional but memorable.",
    status: "pending" as const,
    submittedAt: "2026-05-14",
  },
];

// ── Orders ────────────────────────────────────────────────────────────────────

export const ORDER_ACTIVE = {
  id: "ord_001",
  needId: "need_001",
  title: "Cinematic Brand Film — NeoVision AI",
  backer: { id: "u_backer_01", nickname: "Lucas Chen", avatar: "LC" },
  creator: { id: "u_creator_01", nickname: "Aria Song", avatar: "AS" },
  totalFiat: 4200,
  totalDiamond: 420000,
  copyright: "Buyout",
  status: "in_progress" as const,
  contractSignedAt: "2026-05-14",
  stages: [
    {
      id: "stg_001",
      idx: 0,
      name: "Deposit",
      ratio: 0.1,
      amountFiat: 420,
      status: "accepted" as StageStatus,
      submittedAt: "2026-05-14",
      decidedAt: "2026-05-14",
    },
    {
      id: "stg_002",
      idx: 1,
      name: "Moodboard",
      ratio: 0.25,
      amountFiat: 1050,
      status: "accepted" as StageStatus,
      submittedAt: "2026-05-16",
      decidedAt: "2026-05-17",
    },
    {
      id: "stg_003",
      idx: 2,
      name: "Draft Cut",
      ratio: 0.25,
      amountFiat: 1050,
      status: "submitted" as StageStatus,
      submittedAt: "2026-05-17",
      decidedAt: null,
      autoAcceptAt: "2026-05-24",
    },
    {
      id: "stg_004",
      idx: 3,
      name: "Revised Cut",
      ratio: 0.2,
      amountFiat: 840,
      status: "pending" as StageStatus,
      submittedAt: null,
      decidedAt: null,
    },
    {
      id: "stg_005",
      idx: 4,
      name: "Final Delivery",
      ratio: 0.2,
      amountFiat: 840,
      status: "pending" as StageStatus,
      submittedAt: null,
      decidedAt: null,
    },
  ],
  deliverables: {
    stg_002: [
      {
        id: "d1",
        name: "moodboard_v1.pdf",
        size: "4.2 MB",
        type: "pdf",
        uploadedAt: "2026-05-16 14:22",
      },
      {
        id: "d2",
        name: "reference_pack.zip",
        size: "18.7 MB",
        type: "zip",
        uploadedAt: "2026-05-16 14:23",
      },
    ],
    stg_003: [
      {
        id: "d3",
        name: "draft_cut_v1.mp4",
        size: "312 MB",
        type: "video",
        uploadedAt: "2026-05-17 19:41",
      },
    ],
  },
  ledger: [
    { date: "2026-05-14", type: "Deposit", amount: 420, note: "Stage 1: Deposit" },
    { date: "2026-05-17", type: "Release", amount: 1050, note: "Stage 2: Moodboard approved" },
  ],
  messages: [
    {
      id: "m1",
      senderId: "u_creator_01",
      senderName: "Aria Song",
      senderRole: "Creator",
      text: "Hi Lucas! Excited to work on this. I've reviewed the brief carefully — I think a cold open starting with a single cursor blink on black, then building into the workflow montage, would hit the tone perfectly.",
      ts: "2026-05-14 15:30",
    },
    {
      id: "m2",
      senderId: "u_backer_01",
      senderName: "Lucas Chen",
      senderRole: "Backer",
      text: "Love that concept. The cursor metaphor is exactly the kind of detail our audience will appreciate. Let's go.",
      ts: "2026-05-14 16:02",
    },
    {
      id: "m3",
      senderId: "system",
      senderName: "Spotlight",
      senderRole: "System",
      text: "Stage 1 (Deposit) has been paid. Project officially started.",
      ts: "2026-05-14 16:05",
      isCard: true,
    },
    {
      id: "m4",
      senderId: "u_creator_01",
      senderName: "Aria Song",
      senderRole: "Creator",
      text: "Moodboard and reference pack uploaded. Key decisions: palette is near-monochrome with single warm amber accent, music direction is ambient electronic.",
      ts: "2026-05-16 14:24",
    },
    {
      id: "m5",
      senderId: "system",
      senderName: "Spotlight",
      senderRole: "System",
      text: "Aria has submitted deliverables for Stage 2 (Moodboard). Please review and accept or request changes.",
      ts: "2026-05-16 14:25",
      isCard: true,
    },
    {
      id: "m6",
      senderId: "u_backer_01",
      senderName: "Lucas Chen",
      senderRole: "Backer",
      text: "Palette is perfect. Approved!",
      ts: "2026-05-17 10:11",
    },
    {
      id: "m7",
      senderId: "system",
      senderName: "Spotlight",
      senderRole: "System",
      text: "Stage 2 (Moodboard) approved. ¥1,050 released to Aria Song. Stage 3 (Draft Cut) is now active.",
      ts: "2026-05-17 10:12",
      isCard: true,
    },
    {
      id: "m8",
      senderId: "u_creator_01",
      senderName: "Aria Song",
      senderRole: "Creator",
      text: "Draft cut uploaded. Total runtime 1:32 — slightly over the brief but I think the pacing earns it. Happy to trim if needed.",
      ts: "2026-05-17 19:43",
    },
    {
      id: "m9",
      senderId: "system",
      senderName: "Spotlight",
      senderRole: "System",
      text: "Aria has submitted deliverables for Stage 3 (Draft Cut). You have 7 days to review before auto-acceptance.",
      ts: "2026-05-17 19:44",
      isCard: true,
    },
  ],
};

export const ORDER_COMPLETED = {
  id: "ord_002",
  needId: "need_003",
  title: "Product Launch Video — Smart Home Device",
  backer: { id: "u_backer_03", nickname: "James Wu", avatar: "JW" },
  creator: { id: "u_creator_01", nickname: "Aria Song", avatar: "AS" },
  totalFiat: 2800,
  copyright: "Buyout",
  status: "completed" as const,
  contractSignedAt: "2026-04-28",
  completedAt: "2026-05-10",
  stages: [
    {
      id: "stg_A1",
      idx: 0,
      name: "Deposit",
      ratio: 0.1,
      amountFiat: 280,
      status: "accepted" as StageStatus,
    },
    {
      id: "stg_A2",
      idx: 1,
      name: "Moodboard",
      ratio: 0.25,
      amountFiat: 700,
      status: "accepted" as StageStatus,
    },
    {
      id: "stg_A3",
      idx: 2,
      name: "Draft Cut",
      ratio: 0.25,
      amountFiat: 700,
      status: "accepted" as StageStatus,
    },
    {
      id: "stg_A4",
      idx: 3,
      name: "Revised Cut",
      ratio: 0.2,
      amountFiat: 560,
      status: "accepted" as StageStatus,
    },
    {
      id: "stg_A5",
      idx: 4,
      name: "Final Delivery",
      ratio: 0.2,
      amountFiat: 560,
      status: "accepted" as StageStatus,
    },
  ],
};

// ── Assets ────────────────────────────────────────────────────────────────────

export const MY_ASSETS_CREATED = [
  {
    id: "asset_001",
    title: "NeoVision Draft Cut v1",
    type: "video",
    size: "312 MB",
    duration: "1:32",
    orderId: "ord_001",
    orderTitle: "Cinematic Brand Film — NeoVision AI",
    createdAt: "2026-05-17",
    showcased: false,
  },
  {
    id: "asset_002",
    title: "Product Launch — Final Export",
    type: "video",
    size: "890 MB",
    duration: "0:45",
    orderId: "ord_002",
    orderTitle: "Product Launch Video — Smart Home Device",
    createdAt: "2026-05-10",
    showcased: true,
  },
  {
    id: "asset_003",
    title: "Stellar Bloom MV — Director's Cut",
    type: "video",
    size: "1.2 GB",
    duration: "3:44",
    orderId: null,
    orderTitle: null,
    createdAt: "2026-04-22",
    showcased: true,
  },
];

export const MY_ASSETS_PURCHASED = [
  {
    id: "asset_P01",
    title: "Echoes of Tomorrow",
    type: "video",
    size: "780 MB",
    orderId: "ord_002",
    creatorName: "Aria Song",
    copyright: "Buyout",
    purchasedAt: "2026-05-10",
    subLicensable: false,
  },
];

// ── Agent recommendations ─────────────────────────────────────────────────────

export const AGENT_RECOMMENDATIONS_CREATOR = [
  { ...NEEDS[0], matchScore: 94 },
  { ...NEEDS[1], matchScore: 87 },
  { ...NEEDS[2], matchScore: 71 },
];

export const AGENT_RECOMMENDATIONS_CREATOR_LIST = [CREATORS[0], CREATORS[1], CREATORS[2]];

// ── Wallet transactions ───────────────────────────────────────────────────────

export const WALLET_TRANSACTIONS = [
  {
    id: "tx_01",
    date: "2026-05-17",
    type: "Release",
    currency: "shell",
    amount: +1050,
    balance: 8650,
    note: "Stage 2 approved — ord_001",
  },
  {
    id: "tx_02",
    date: "2026-05-14",
    type: "Release",
    currency: "shell",
    amount: +420,
    balance: 7600,
    note: "Stage 1 deposit — ord_001",
  },
  {
    id: "tx_03",
    date: "2026-05-10",
    type: "Release",
    currency: "shell",
    amount: +2800,
    balance: 7180,
    note: "Project completed — ord_002",
  },
  {
    id: "tx_04",
    date: "2026-05-03",
    type: "Withdraw",
    currency: "shell",
    amount: -3000,
    balance: 4380,
    note: "Bank transfer — ICBC *8821",
  },
  {
    id: "tx_05",
    date: "2026-04-25",
    type: "Release",
    currency: "shell",
    amount: +700,
    balance: 7380,
    note: "Stage 2 approved — ord_002",
  },
];

export const BACKER_WALLET_TRANSACTIONS = [
  {
    id: "btx_01",
    date: "2026-05-14",
    type: "Escrow Lock",
    currency: "diamond",
    amount: -420,
    balance: 11980,
    note: "Deposit locked — ord_001",
  },
  {
    id: "btx_02",
    date: "2026-05-13",
    type: "Recharge",
    currency: "diamond",
    amount: +5000,
    balance: 12400,
    note: "Stripe — ¥5,000",
  },
  {
    id: "btx_03",
    date: "2026-05-01",
    type: "Recharge",
    currency: "diamond",
    amount: +10000,
    balance: 7400,
    note: "Stripe — ¥10,000",
  },
];

export const PRESET_SPECIALTY_TAGS = [
  "Cinematic",
  "Commercial",
  "Brand Film",
  "Narrative Short Film",
  "Music Video",
  "Documentary",
  "Anime Style",
  "Character Animation",
  "Product Visualization",
  "Sci-Fi",
  "Surreal",
  "Minimal",
  "Abstract",
  "Tech",
  "Social Content",
  "Journalism",
];

export const SHOWCASE_THUMBNAIL_OPTIONS = [
  "🎬",
  "🎞️",
  "📽️",
  "🎥",
  "🎨",
  "✨",
  "🌌",
  "🪐",
  "🎭",
  "🌸",
];

// ── Distribution ─────────────────────────────────────────────────────────────

export const DISTRIBUTION_PLATFORMS = [
  { id: "bilibili", name: "Bilibili", region: "CN" },
  { id: "youtube", name: "YouTube", region: "Global" },
  { id: "tiktok", name: "TikTok", region: "Global" },
  { id: "vimeo", name: "Vimeo", region: "Global" },
  { id: "netflix", name: "Netflix", region: "Global" },
  { id: "xiaohongshu", name: "小红书", region: "CN" },
  { id: "weibo", name: "Weibo Video", region: "CN" },
  { id: "instagram", name: "Instagram Reels", region: "Global" },
];

export const DISTRIBUTION_LANGUAGES = [
  { id: "zh-CN", name: "简体中文" },
  { id: "zh-TW", name: "繁體中文" },
  { id: "en-US", name: "English (US)" },
  { id: "ja-JP", name: "日本語" },
  { id: "ko-KR", name: "한국어" },
  { id: "es-ES", name: "Español" },
];

export const DISTRIBUTION_REGIONS = [
  { id: "global", name: "Worldwide" },
  { id: "cn", name: "China" },
  { id: "us", name: "United States" },
  { id: "jp", name: "Japan" },
  { id: "kr", name: "Korea" },
  { id: "eu", name: "European Union" },
];

export const DISTRIBUTION_TYPES = [
  "Brand Film",
  "Music Video",
  "Documentary",
  "Commercial",
  "Short Film",
  "Animation",
  "Series",
];

export const COPYRIGHT_OPTIONS = [
  "All Rights Reserved",
  "CC BY 4.0",
  "CC BY-NC 4.0",
  "CC BY-SA 4.0",
  "Public Domain",
];

export const DISTRIBUTION_COST_SHELL = 200;

// ── Participants registry (for messages) ─────────────────────────────────────

export const PARTICIPANTS: Record<
  string,
  {
    id: string;
    nickname: string;
    avatar: string;
    avatarColor: string;
    role: "backer" | "creator";
    isAgent?: boolean;
    represents?: string;
  }
> = {
  u_backer_01: {
    id: "u_backer_01",
    nickname: "Lucas Chen",
    avatar: "LC",
    avatarColor: "bg-primary-container text-on-primary-container",
    role: "backer",
  },
  u_backer_02: {
    id: "u_backer_02",
    nickname: "Priya Mehta",
    avatar: "PM",
    avatarColor: "bg-amber-100 text-amber-700",
    role: "backer",
  },
  u_creator_01: {
    id: "u_creator_01",
    nickname: "Aria Song",
    avatar: "AS",
    avatarColor: "bg-rose-100 text-rose-700",
    role: "creator",
  },
  u_creator_02: {
    id: "u_creator_02",
    nickname: "Marco Reyes",
    avatar: "MR",
    avatarColor: "bg-sky-100 text-sky-700",
    role: "creator",
  },
  u_creator_03: {
    id: "u_creator_03",
    nickname: "Yuki Tanaka",
    avatar: "YT",
    avatarColor: "bg-emerald-100 text-emerald-700",
    role: "creator",
  },
  u_creator_04: {
    id: "u_creator_04",
    nickname: "Sofia Okonkwo",
    avatar: "SO",
    avatarColor: "bg-amber-100 text-amber-700",
    role: "creator",
  },
  agent_marlow: {
    id: "agent_marlow",
    nickname: "Marlow",
    avatar: "ML",
    avatarColor: "bg-secondary text-on-secondary",
    role: "backer",
    isAgent: true,
    represents: "backer",
  },
  agent_wren: {
    id: "agent_wren",
    nickname: "Wren",
    avatar: "WR",
    avatarColor: "bg-tertiary text-on-tertiary",
    role: "creator",
    isAgent: true,
    represents: "creator",
  },
};

// ── Sessions ─────────────────────────────────────────────────────────────────

type ExtraMsg = {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  text: string;
  ts: string;
  isCard?: boolean;
};

export interface Session {
  id: string;
  backerId: string;
  creatorId: string;
  subject: string;
  orderId: string | null;
  invitationSent: boolean;
  lastUpdated: string;
  messages: ExtraMsg[];
}

// Every session is a 4-party group: backer, creator, Marlow (backer's agent), Wren (creator's agent)
const M = (id: string, ts: string, text: string): ExtraMsg => ({
  id,
  senderId: "agent_marlow",
  senderName: "Marlow",
  senderRole: "Backer's Agent",
  text,
  ts,
});
const W = (id: string, ts: string, text: string): ExtraMsg => ({
  id,
  senderId: "agent_wren",
  senderName: "Wren",
  senderRole: "Creator's Agent",
  text,
  ts,
});

export const SESSIONS: Session[] = [
  {
    id: "sess_001",
    backerId: "u_backer_01",
    creatorId: "u_creator_01",
    subject: "Cinematic Brand Film — NeoVision AI",
    orderId: "ord_001",
    invitationSent: true,
    lastUpdated: "2026-05-17 19:43",
    messages: [
      M(
        "ms1_1",
        "2026-05-13 09:10",
        "Ran the NeoVision brief against Lucas's mandate. Aria is a clean fit — 98% completion, 47 projects, cinematic-narrative specialty. Comparable deals settled ¥3,600–4,200. I'd open at ¥3,800, 21-day delivery."
      ),
      W(
        "ms1_2",
        "2026-05-13 10:02",
        "Appreciate the read, Marlow. Aria's cinematic work is premium-tier — floor is ¥4,000. Hard walk-aways: milestone escrow, 3 revision rounds per stage, and no AI-only final delivery (hybrid pipeline)."
      ),
      M(
        "ms1_3",
        "2026-05-13 11:20",
        "Lucas can meet ¥4,200 across 5 milestones with per-stage escrow and 3 revisions. Copyright buyout for launch markets; Aria retains portfolio rights. Sending terms to both principals."
      ),
      W(
        "ms1_4",
        "2026-05-13 11:45",
        "Accepted on Aria's behalf — ¥4,200, 5 milestones, escrow, 3 revisions, hybrid pipeline, portfolio rights retained. Over to you both to sign."
      ),
      {
        id: "ms1_5",
        senderId: "u_backer_01",
        senderName: "Lucas Chen",
        senderRole: "Backer",
        text: "Terms look great. Confirmed — sending over a formal invitation now.",
        ts: "2026-05-14 09:30",
      },
      {
        id: "ms1_6",
        senderId: "u_creator_01",
        senderName: "Aria Song",
        senderRole: "Creator",
        text: "Excited to work on this! I've reviewed the brief — cold open on a single cursor blink, building into a workflow montage. That should hit the tone perfectly.",
        ts: "2026-05-14 15:30",
      },
    ],
  },
  {
    id: "sess_002",
    backerId: "u_backer_01",
    creatorId: "u_creator_03",
    subject: "Anime opener inquiry",
    orderId: null,
    invitationSent: false,
    lastUpdated: "2026-05-18 11:40",
    messages: [
      {
        id: "ms2_1",
        senderId: "u_backer_01",
        senderName: "Lucas Chen",
        senderRole: "Backer",
        text: "Hi Yuki, your character animation reel is stunning. We're planning a 30s anime opener for a product launch.",
        ts: "2026-05-18 10:45",
      },
      {
        id: "ms2_2",
        senderId: "u_creator_03",
        senderName: "Yuki Tanaka",
        senderRole: "Creator",
        text: "Thanks Lucas! Happy to discuss. Could you share more about the product, tone references, and timeline?",
        ts: "2026-05-18 11:00",
      },
      M(
        "ms2_3",
        "2026-05-18 11:12",
        "I've matched the brief: Yuki is 100% completion, 97% on-time across 31 projects — a strong fit. 30s animated comparables landed ¥2,200–2,600. Opening at ¥2,300, 18-day delivery."
      ),
      W(
        "ms2_4",
        "2026-05-18 11:20",
        "Numbers noted, Marlow. Yuki's original character animation carries a premium — floor ¥2,800. One hard walk-away: hybrid pipeline only (no AI-only output), revisions capped at 2 rounds."
      ),
      M(
        "ms2_5",
        "2026-05-18 11:28",
        "Lucas can move to ¥2,600 with a 3-day timeline buffer; hybrid pipeline and 2-round cap accepted. Buyout limited to launch markets — Yuki keeps portfolio rights."
      ),
      W(
        "ms2_6",
        "2026-05-18 11:34",
        "That works: ¥2,600, 21-day delivery, hybrid pipeline, 2 revisions, launch-market buyout, portfolio rights retained. Forwarding to both principals for sign-off."
      ),
      {
        id: "ms2_7",
        senderId: "u_creator_03",
        senderName: "Yuki Tanaka",
        senderRole: "Creator",
        text: "Terms look great on my end — excited to start!",
        ts: "2026-05-18 11:40",
      },
    ],
  },
  {
    id: "sess_003",
    backerId: "u_backer_01",
    creatorId: "u_creator_02",
    subject: "Smart-home product launch film",
    orderId: null,
    invitationSent: false,
    lastUpdated: "2026-05-19 09:30",
    messages: [
      {
        id: "ms3_1",
        senderId: "u_backer_01",
        senderName: "Lucas Chen",
        senderRole: "Backer",
        text: "Hi Marco — planning a smart-home product launch, your commercial work fits the brief perfectly.",
        ts: "2026-05-19 09:00",
      },
      M(
        "ms3_2",
        "2026-05-19 09:08",
        "Marco's portfolio median is ¥3,500; this 60s commercial sits right at it. I'd open at ¥3,200 to leave room, 14-day delivery."
      ),
      W(
        "ms3_3",
        "2026-05-19 09:18",
        "Marco holds at ¥3,500 for branded commercial work. Walk-away: usage rights are paid media only — organic social is included, but broadcast TV is a separate license."
      ),
      {
        id: "ms3_4",
        senderId: "u_creator_02",
        senderName: "Marco Reyes",
        senderRole: "Creator",
        text: "Send me the brief and I'll come back with treatment ideas tomorrow.",
        ts: "2026-05-19 09:30",
      },
    ],
  },
  {
    id: "sess_004",
    backerId: "u_backer_02",
    creatorId: "u_creator_01",
    subject: "3-episode anime short",
    orderId: null,
    invitationSent: false,
    lastUpdated: "2026-05-15 14:10",
    messages: [
      {
        id: "ms4_1",
        senderId: "u_backer_02",
        senderName: "Priya Mehta",
        senderRole: "Backer",
        text: "Hi Aria — I'm scoping a 3-episode anime short for an original IP. Your storytelling resonates with what we're after.",
        ts: "2026-05-15 13:30",
      },
      {
        id: "ms4_2",
        senderId: "u_creator_01",
        senderName: "Aria Song",
        senderRole: "Creator",
        text: "Hi Priya, character-driven sci-fi anime is exactly my space. Let's set up a 30-min sync to review the IP bible.",
        ts: "2026-05-15 13:50",
      },
      M(
        "ms4_3",
        "2026-05-15 14:00",
        "Three 8-min episodes is a larger commitment — Priya's mandate caps episodic at ¥9,800. I'd structure this as 3 milestones, ¥3,200/episode."
      ),
      W(
        "ms4_4",
        "2026-05-15 14:10",
        "Aria can do ¥9,800 total, but the IP walk-away stands: original character designs remain Aria's IP unless a separate buyout is agreed. NDA fine."
      ),
    ],
  },
  {
    id: "sess_005",
    backerId: "u_backer_01",
    creatorId: "u_creator_04",
    subject: "Documentary project",
    orderId: null,
    invitationSent: false,
    lastUpdated: "2026-05-19 15:10",
    messages: [
      {
        id: "ms5_1",
        senderId: "u_backer_01",
        senderName: "Lucas Chen",
        senderRole: "Backer",
        text: "Hi Sofia — looking at your Invisible Cities doc, I'd love to discuss a short-form social storytelling project.",
        ts: "2026-05-19 15:00",
      },
      M(
        "ms5_2",
        "2026-05-19 15:10",
        "Sofia's documentary rate starts at ¥1,800/project — well within budget. I'll wait for your brief before proposing terms to Wren."
      ),
    ],
  },
];

// Map a counterpart user id to its session for the current Backer (Lucas) or Creator (Aria)
export function findSessionForCounterpart(
  viewerRole: "backer" | "creator",
  counterpartId: string
): string | null {
  if (viewerRole === "backer") {
    const s = SESSIONS.find((s) => s.backerId === "u_backer_01" && s.creatorId === counterpartId);
    return s?.id ?? null;
  }
  const s = SESSIONS.find((s) => s.creatorId === "u_creator_01" && s.backerId === counterpartId);
  return s?.id ?? null;
}
