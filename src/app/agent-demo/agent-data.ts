import type {
  BriefField,
  ContractRiskItem,
  Creator,
  MissingField,
  ProjectAlert,
} from "./agent-types";

// All mock data for the Agent demo. No backend, no AI — these stand in for what
// a real transaction-intelligence layer would compute from the workflow.

export const SAMPLE_BRIEF =
  "We're launching a new AI-native fragrance line and need a 60–90s cinematic hero film for the campaign — moody, nocturnal, a little surreal. Should feel premium and work for both web and social. Need it in about a month.";

// What "Structure with Agent" extracts from the natural-language brief.
export const STRUCTURED_FIELDS: BriefField[] = [
  { key: "type", label: "Content type", value: "Cinematic hero film + social cutdowns", filled: true },
  { key: "duration", label: "Duration", value: "60–90s hero · 6×9s social", filled: true },
  { key: "style", label: "Style", value: "Moody · nocturnal · surreal · premium", filled: true },
  { key: "deliverables", label: "Deliverables", value: "1 hero film, 6 social cuts, 1 key still", filled: true },
  { key: "budget", label: "Budget", value: "", filled: false },
  { key: "deadline", label: "Deadline", value: "", filled: false },
];

// Inline Agent cards for the fields the brief is missing or vague on.
export const MISSING_FIELDS: MissingField[] = [
  {
    key: "budget",
    label: "Budget not specified",
    detail: "Briefs without a budget get 3× fewer quality proposals.",
    suggestion: "Suggest ¥180K–320K based on scope + comparable AI hero films.",
    risk: "high",
  },
  {
    key: "deadline",
    label: "Deadline unclear",
    detail: "“About a month” is ambiguous for milestone planning.",
    suggestion: "Set a firm delivery date — propose 28 days from commission.",
    risk: "medium",
  },
  {
    key: "copyright",
    label: "Copyright scope undefined",
    detail: "Who owns the final film and source assets isn't stated.",
    suggestion: "Add full buyout + source files, worldwide, in perpetuity.",
    risk: "high",
  },
  {
    key: "reference",
    label: "No reference materials",
    detail: "References cut revision rounds by ~40%.",
    suggestion: "Attach 2–3 mood references or link a board.",
    risk: "low",
  },
];

export const BRIEF_CANVAS = {
  summary:
    "A 60–90s cinematic hero film for an AI-native fragrance launch — nocturnal, surreal, premium — with a 6-cut social package and one key still, delivered for web + social within ~4 weeks.",
  requirements: [
    "Proven cinematic / fashion-film reel",
    "Strong AI motion + grading craft",
    "Comfort with surreal, nocturnal art direction",
    "Available to start within 7 days",
  ],
  deliverables: [
    "1× hero film (60–90s, 4K, graded)",
    "6× vertical social cutdowns (9s)",
    "1× hero key still (print-ready)",
    "Project source files + handover",
  ],
  timeline: [
    { label: "Concept + boards", days: "Days 1–5" },
    { label: "First cut", days: "Days 6–16" },
    { label: "Revisions (2 rounds)", days: "Days 17–24" },
    { label: "Final delivery", days: "Days 25–28" },
  ],
  budget: { range: "¥180K – ¥320K", note: "Escrow-protected, released by milestone" },
  risks: [
    { label: "Budget set within recommended band", ok: true },
    { label: "Firm delivery date defined", ok: true },
    { label: "Full copyright buyout + source files", ok: true },
    { label: "Reference materials still light", ok: false },
  ],
};

export const CREATORS: Creator[] = [
  {
    id: "c1",
    name: "Aria Song",
    city: "Seoul",
    avatar: "/posters/aurora-crystal.jpg",
    specialty: "Cinematic · Sci-fi",
    rate: "¥220K avg",
    tags: [
      { label: "Best Style Match", tone: "match" },
      { label: "High Reliability", tone: "reliable" },
    ],
    scores: { style: 96, price: 78, speed: 72, reliability: 94 },
    risk: "low",
    riskNote: "No flags — 31 on-time deliveries",
    why: [
      "Style embedding matches your nocturnal/surreal board at 96%.",
      "94% on-time across 31 escrow-backed projects.",
      "Two prior fragrance/beauty films in portfolio.",
    ],
    suggestedAction: "Invite — strongest overall fit",
  },
  {
    id: "c2",
    name: "Marco Reyes",
    city: "Chicago",
    avatar: "/posters/golden-core.jpg",
    specialty: "Brand · Commercial",
    rate: "¥160K avg",
    tags: [
      { label: "Budget Friendly", tone: "budget" },
      { label: "Fast Delivery", tone: "speed" },
    ],
    scores: { style: 81, price: 95, speed: 92, reliability: 88 },
    risk: "low",
    riskNote: "Reliable, slightly off-style",
    why: [
      "Comes in ~30% under your budget band.",
      "Median first-cut in 9 days — fastest of the shortlist.",
      "Style match is good (81%) but less surreal-leaning.",
    ],
    suggestedAction: "Shortlist — best value",
  },
  {
    id: "c3",
    name: "Yuki Tanaka",
    city: "Osaka",
    avatar: "/posters/neon-rain.jpg",
    specialty: "Anime · Music video",
    rate: "¥280K avg",
    tags: [
      { label: "Best Style Match", tone: "match" },
      { label: "Risk: Limited Availability", tone: "risk" },
    ],
    scores: { style: 93, price: 64, speed: 58, reliability: 90 },
    risk: "medium",
    riskNote: "Only 1 slot this quarter",
    why: [
      "Distinct nocturnal-neon style, 93% board match.",
      "Limited availability — one opening in the next 6 weeks.",
      "Premium rate, ~12% over your band.",
    ],
    suggestedAction: "Ask about availability first",
  },
];

export const CONTRACT_RISKS: ContractRiskItem[] = [
  {
    id: "r1",
    label: "Revision limit undefined",
    detail: "No cap on revision rounds — open-ended scope risk.",
    suggestion: "Set 2 included rounds, then ¥X per extra round.",
    risk: "high",
    resolved: false,
  },
  {
    id: "r2",
    label: "Copyright scope unclear",
    detail: "Ownership of the final film + source files isn't specified.",
    suggestion: "Full buyout + source files, worldwide, in perpetuity.",
    risk: "high",
    resolved: false,
  },
  {
    id: "r3",
    label: "Auto-acceptance rule missing",
    detail: "No rule for what happens if the backer doesn't review in time.",
    suggestion: "Auto-accept after 7 days of no response post-delivery.",
    risk: "medium",
    resolved: false,
  },
  {
    id: "r4",
    label: "Delivery format not defined",
    detail: "Resolution, codec and aspect ratios aren't pinned down.",
    suggestion: "4K ProRes master + H.264 web + 9:16 social exports.",
    risk: "medium",
    resolved: false,
  },
  {
    id: "r5",
    label: "Cancellation rule missing",
    detail: "No terms for cancelling mid-project or refund handling.",
    suggestion: "Pro-rata release per completed milestone on cancellation.",
    risk: "low",
    resolved: false,
  },
];

export const PROJECT = {
  title: "Nocturne — AI fragrance hero film",
  creator: "Aria Song · Seoul",
  budget: "¥240,000",
  progress: 62,
  milestones: [
    { label: "Concept + boards", state: "done" as const },
    { label: "First cut", state: "active" as const },
    { label: "Revisions", state: "todo" as const },
    { label: "Final delivery", state: "todo" as const },
  ],
  payment: "¥96,000 released · ¥144,000 in escrow",
  delivery: "First cut due — 2 days late",
};

export const PROJECT_EVENTS = [
  { id: "e1", kind: "risk" as const, title: "Brief marked incomplete", detail: "Budget + deadline were missing", time: "12 days ago" },
  { id: "e2", kind: "suggest" as const, title: "3 creators recommended", detail: "Ranked by style, price, reliability", time: "11 days ago" },
  { id: "e3", kind: "risk" as const, title: "Contract risk detected", detail: "Revision limit + copyright scope", time: "9 days ago" },
  { id: "e4", kind: "action" as const, title: "First cut delivery delayed", detail: "Now 2 days past milestone date", time: "1 day ago" },
  { id: "e5", kind: "risk" as const, title: "Revision count approaching limit", detail: "Round 2 of 2 in progress", time: "3 hours ago" },
];

export const PROJECT_ALERTS: ProjectAlert[] = [
  { id: "a1", title: "First cut is 2 days late", detail: "Milestone date was Jun 20. No new ETA from the creator.", risk: "high" },
  { id: "a2", title: "Backer has not replied for 48 hours", detail: "Creator asked a scope question that's still unanswered.", risk: "medium" },
  { id: "a3", title: "Delivery is missing source file", detail: "Latest upload included the master but no project files.", risk: "medium" },
];

// Canned Ask-Agent replies (round-robin), per flow.
export const ASK_REPLIES: Record<string, string[]> = {
  brief: [
    "Your brief is strong on style but light on budget. I'd anchor ¥180K–320K — that lifts quality proposals ~3×.",
    "For a 4-week window, lock the first-cut milestone at day 16 so two revision rounds still fit.",
  ],
  match: [
    "Aria is the safest overall pick: 96% style match and 94% on-time. Marco is the value play; Yuki is the boldest but availability is tight.",
    "If budget is the priority, shortlist Marco and ask Aria for a fixed quote to compare.",
  ],
  contract: [
    "The two high-risk gaps are revision limit and copyright scope — I can drop in standard terms for both in one click.",
    "Auto-acceptance protects the creator if you go quiet; 7 days is the platform norm.",
  ],
  project: [
    "The first cut is 2 days late and revisions are near the cap — I'd send a reminder and pre-approve one extra round to de-risk the timeline.",
    "The missing source file is the real blocker for handover. I can request it and pause the auto-accept clock.",
  ],
};
