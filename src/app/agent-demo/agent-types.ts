// Shared types for the Spotlight Agent demo (frontend-only mockup).

export type Flow = "brief" | "match" | "contract" | "project";

export type Risk = "low" | "medium" | "high";

export type DockTone = "watching" | "suggest" | "risk" | "action";

export type Suggestion = {
  id: string;
  title: string;
  detail: string;
  confidence: number; // 0–100
  risk?: Risk;
  action?: string;
};

export type AgentEvent = {
  id: string;
  kind: "info" | "suggest" | "risk" | "action" | "success";
  title: string;
  detail?: string;
  time: string;
};

// ── Brief flow ───────────────────────────────────────────────────────────────
export type BriefField = {
  key: string;
  label: string;
  value: string;
  filled: boolean;
};

export type MissingField = {
  key: string;
  label: string;
  detail: string;
  suggestion: string;
  risk: Risk;
};

// ── Creator match flow ───────────────────────────────────────────────────────
export type CreatorTag = {
  label: string;
  tone: "match" | "speed" | "budget" | "reliable" | "risk";
};

export type Creator = {
  id: string;
  name: string;
  city: string;
  avatar: string;
  specialty: string;
  rate: string;
  tags: CreatorTag[];
  scores: { style: number; price: number; speed: number; reliability: number };
  risk: Risk;
  riskNote: string;
  why: string[];
  suggestedAction: string;
};

// ── Contract flow ────────────────────────────────────────────────────────────
export type ContractRiskItem = {
  id: string;
  label: string;
  detail: string;
  suggestion: string;
  risk: Risk;
  resolved: boolean;
};

// ── Project flow ─────────────────────────────────────────────────────────────
export type ProjectAlert = {
  id: string;
  title: string;
  detail: string;
  risk: Risk;
};
