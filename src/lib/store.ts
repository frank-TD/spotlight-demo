"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SESSIONS, PARTICIPANTS, type StageStatus } from "./mock-data";
import { Locale, translations } from "./i18n";

type Role = "backer" | "creator";

/* ── Session lifecycle flow (invitation → deposit → stages → done) ───────── */

export type FlowPhase =
  | "invitation"
  | "rejected"
  | "contract_draft"
  | "contract_confirm"
  | "deposit"
  | "submit"
  | "review"
  | "completed";

export interface ContractTerms {
  copyright: string;
  revisionLimit: number;
  autoAcceptDays: number;
}

export interface SessionFlow {
  phase: FlowPhase;
  stageIndex: number; // 0 = Deposit, 1 = Moodboard, 2 = Draft Cut, 3 = Revised Cut, 4 = Final Delivery
  total: number; // order total in ¥
  needTitle: string;
  revisions: number;
  terms?: ContractTerms;
}

export const STAGE_META = [
  { name: "Deposit", ratio: 0.1 },
  { name: "Moodboard", ratio: 0.25 },
  { name: "Draft Cut", ratio: 0.25 },
  { name: "Revised Cut", ratio: 0.2 },
  { name: "Final Delivery", ratio: 0.2 },
] as const;

export type StageView = {
  idx: number;
  name: string;
  ratio: number;
  amountFiat: number;
  status: StageStatus;
};

export const stageAmount = (total: number, idx: number) => Math.round(total * STAGE_META[idx].ratio);

const NOT_STARTED: FlowPhase[] = ["invitation", "rejected", "contract_draft", "contract_confirm"];

export function flowToStages(flow: SessionFlow | undefined): StageView[] {
  const total = flow?.total ?? 4200;
  return STAGE_META.map((m, idx) => {
    let status: StageStatus = "pending";
    if (flow && !NOT_STARTED.includes(flow.phase)) {
      if (flow.phase === "completed" || idx < flow.stageIndex) status = "accepted";
      else if (idx === flow.stageIndex) status = flow.phase === "review" ? "submitted" : "in_progress";
    }
    return { idx, name: m.name, ratio: m.ratio, amountFiat: stageAmount(total, idx), status };
  });
}

export interface PostedNeed {
  id: string;
  backerId: string;
  title: string;
  contentType: string;
  styles: string[];
  budget: number;
  deliveryDays: number;
  durationSec: number;
  episodes: number;
  status: "open";
  publishedAt: string;
  brief: string;
}

export interface BankCard {
  id: string;
  bankCode: string; // resolves to a localized bank name
  network: string; // "UnionPay" | "Visa" | "Mastercard"
  last4: string;
  holder: string;
  isDefault: boolean;
}

// Which role must act next for a given flow (drives the pinned card + sidebar highlight).
export function flowActor(flow: SessionFlow | undefined): Role | null {
  if (!flow) return null;
  switch (flow.phase) {
    case "invitation":
      return "creator";
    case "contract_draft":
      return "backer";
    case "contract_confirm":
      return "creator";
    case "deposit":
      return "backer";
    case "submit":
      return "creator";
    case "review":
      return "backer";
    default:
      return null;
  }
}

/* ── AIGC Studio types ───────────────────────────────────────────────── */

export type StudioMode = "image" | "video" | "voiceover" | "music";

// Per-asset settings vary by mode; we keep them as a single record and
// downstream renderers pick the relevant keys.
export interface StudioAssetSettings {
  aspect?: string;
  quality?: string;
  count?: number;
  duration?: string;
  resolution?: string;
  audio?: boolean;
  voiceId?: string;
  voiceName?: string;
  language?: string;
  accent?: string;
  effect?: string;
  speed?: number;
  genre?: string;
  mood?: string;
  tempo?: string;
}

export interface StudioAsset {
  id: string;
  mode: StudioMode;
  prompt: string;
  modelId: string;
  modelName: string;
  settings: StudioAssetSettings;
  // For image/video: a picsum URL seeded by the prompt.
  imageUrl?: string;
  // For voiceover/music: a synthetic duration in seconds + waveform seed.
  durationSec?: number;
  waveformSeed?: string;
  createdAt: number;
}

export interface StudioSession {
  id: string;
  title: string;
  mode: StudioMode;
  assets: StudioAsset[];
  createdAt: number;
}

interface AppState {
  // Auth
  isLoggedIn: boolean;
  activeRole: Role;

  // Locale
  locale: Locale;
  setLocale: (locale: Locale) => void;
  login: (role?: Role) => void;
  logout: () => void;
  switchRole: (role: Role) => void;

  // True once persisted state has rehydrated on the client (avoids guard redirects on refresh)
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;

  // Onboarding: true once the user has finished /onboarding/role + /onboarding/profile
  onboardingComplete: boolean;
  setOnboardingComplete: (v: boolean) => void;

  // Role-specific onboarding answers (persisted; demo-only — never displayed in detail yet)
  userPreferences: {
    backer?: {
      company?: string;
      industry?: string;
      budgetTier?: string;
      contentTypes?: string[];
      styles?: string[];
      bio?: string;
    };
    creator?: {
      displayName?: string;
      specialties?: string[];
      experience?: string;
      rateFrom?: number;
      portfolioUrl?: string;
      styles?: string[];
      availability?: string;
      bio?: string;
    };
  };
  updateBackerPrefs: (prefs: Partial<NonNullable<AppState["userPreferences"]["backer"]>>) => void;
  updateCreatorPrefs: (prefs: Partial<NonNullable<AppState["userPreferences"]["creator"]>>) => void;

  // AIGC Studio sessions (persisted)
  studioSessions: StudioSession[];
  currentStudioSessionId: string | null;
  studioGenerating: boolean;
  newStudioSession: (mode: StudioMode) => string;
  setCurrentStudioSession: (id: string | null) => void;
  deleteStudioSession: (id: string) => void;
  addStudioAsset: (sessionId: string, asset: StudioAsset) => void;
  setStudioGenerating: (v: boolean) => void;
  updateStudioSessionTitle: (id: string, title: string) => void;

  // Session lifecycle flow (shared by messages + order detail)
  sessionFlows: Record<string, SessionFlow>;
  startInvitation: (sessionId: string, needTitle: string, total: number) => void;
  acceptInvitation: (sessionId: string) => void;
  declineInvitation: (sessionId: string) => void;
  submitContract: (sessionId: string, terms: ContractTerms & { total: number }) => void;
  confirmContract: (sessionId: string) => void;
  rejectContract: (sessionId: string) => void;
  acceptBid: (sessionId: string, needTitle: string, total: number) => void;
  payDeposit: (sessionId: string) => void;
  submitDelivery: (sessionId: string) => void;
  approveDelivery: (sessionId: string) => void;
  requestRevision: (sessionId: string) => void;
  resetFlow: (sessionId: string) => void;

  // Account profile edits (persisted, per role)
  profileEdits: Partial<Record<Role, { nickname?: string; email?: string; bio?: string }>>;
  updateProfile: (role: Role, edits: { nickname?: string; email?: string; bio?: string }) => void;

  // Wallet simulation
  backerDiamond: number;
  creatorShell: number;
  recharge: (amount: number) => void;
  withdraw: (amount: number) => void;
  spendDiamond: (amount: number) => void;

  // Bank cards
  bankCards: BankCard[];
  addBankCard: (card: Omit<BankCard, "id" | "isDefault">) => void;
  removeBankCard: (id: string) => void;
  setDefaultBankCard: (id: string) => void;

  // Agent float
  agentOpen: boolean;
  toggleAgent: () => void;
  openAgent: () => void;
  agentMessages: Array<{ role: "user" | "agent"; text: string; link?: { label: string; href: string } | null }>;
  appendAgentMessages: (msgs: Array<{ role: "user" | "agent"; text: string; link?: { label: string; href: string } | null }>) => void;
  clearAgentMessages: () => void;
  agentThinking: boolean;
  setAgentThinking: (v: boolean) => void;

  // Bid state (tracked per need)
  appliedNeeds: Record<string, boolean>;
  submitBid: (needId: string) => void;

  // Backer-posted needs (persisted, shown alongside the mock NEEDS)
  postedNeeds: PostedNeed[];
  addNeed: (need: PostedNeed) => void;

  // Per-session messaging
  sessionExtraMessages: Record<string, Array<{ id: string; senderId: string; senderName: string; senderRole: string; text: string; ts: string; isCard?: boolean }>>;
  appendSessionMessage: (sessionId: string, msg: { id: string; senderId: string; senderName: string; senderRole: string; text: string; ts: string; isCard?: boolean }) => void;

  // Creator profile edits (overlays the mock CREATORS[0] for u_creator_01)
  creatorEdits: { nickname?: string; bio?: string; specialties?: string[]; rateFrom?: number; activeHours?: string; avatarUrl?: string };
  updateCreatorEdits: (edits: Partial<{ nickname: string; bio: string; specialties: string[]; rateFrom: number; activeHours: string; avatarUrl: string }>) => void;

  // Showcase edits (overlays CREATORS[0].showcase when defined)
  showcaseEdits?: Array<{ id: string; title: string; duration: string; description?: string; fileSource?: "local" | "asset"; fileName?: string; assetId?: string }>;
  setShowcaseEdits: (items: Array<{ id: string; title: string; duration: string; description?: string; fileSource?: "local" | "asset"; fileName?: string; assetId?: string }>) => void;

  // Distribution
  distributionByAsset: Record<string, Distribution>;
  updateDistribution: (assetId: string, dist: Partial<Distribution>) => void;
  clearDistribution: (assetId: string) => void;
}

export type DistStatus =
  | "metadata"
  | "platforms"
  | "payment"
  | "neowow_review"
  | "platform_review"
  | "queue"
  | "live"
  | "takedown";

export interface DistMetadata {
  title: string;
  description: string;
  type: string;
  tags: string[];
  language: string;
  subtitles: string[];
  regions: string[];
  price: number;
  copyright: string;
}

export interface Distribution {
  status: DistStatus;
  metadata?: DistMetadata;
  platforms?: string[];
  paidAt?: number;
  takedownAt?: number;
}

// Build a system "card" message in the current locale and append it to a session.
function appendCard(
  state: { sessionExtraMessages: AppState["sessionExtraMessages"]; locale: Locale },
  sessionId: string,
  text: string
): AppState["sessionExtraMessages"] {
  const ts = new Date().toISOString().slice(0, 16).replace("T", " ");
  const msg = {
    id: `flw_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    senderId: "system",
    senderName: "Spotlight",
    senderRole: "system",
    text,
    ts,
    isCard: true,
  };
  return {
    ...state.sessionExtraMessages,
    [sessionId]: [...(state.sessionExtraMessages[sessionId] ?? []), msg],
  };
}

function partyNames(sessionId: string) {
  const s = SESSIONS.find((x) => x.id === sessionId);
  return {
    backer: (s && PARTICIPANTS[s.backerId]?.nickname) || "Backer",
    creator: (s && PARTICIPANTS[s.creatorId]?.nickname) || "Creator",
  };
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      activeRole: "backer" as Role,
      locale: "en" as Locale,
      setLocale: (locale) => set({ locale }),

      login: (role = "backer") => set({ isLoggedIn: true, activeRole: role }),
      logout: () => set({ isLoggedIn: false, onboardingComplete: false, userPreferences: {} }),
      switchRole: (role) => set({ activeRole: role }),

      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),

      onboardingComplete: false,
      setOnboardingComplete: (v) => set({ onboardingComplete: v }),

      userPreferences: {},
      updateBackerPrefs: (prefs) =>
        set((s) => ({ userPreferences: { ...s.userPreferences, backer: { ...s.userPreferences.backer, ...prefs } } })),
      updateCreatorPrefs: (prefs) =>
        set((s) => ({ userPreferences: { ...s.userPreferences, creator: { ...s.userPreferences.creator, ...prefs } } })),

      // AIGC Studio
      studioSessions: [],
      currentStudioSessionId: null,
      studioGenerating: false,
      newStudioSession: (mode) => {
        const id = `studio_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const session: StudioSession = {
          id,
          title: "Untitled session",
          mode,
          assets: [],
          createdAt: Date.now(),
        };
        set((s) => ({
          studioSessions: [session, ...s.studioSessions],
          currentStudioSessionId: id,
        }));
        return id;
      },
      setCurrentStudioSession: (id) => set({ currentStudioSessionId: id }),
      deleteStudioSession: (id) =>
        set((s) => {
          const next = s.studioSessions.filter((sess) => sess.id !== id);
          return {
            studioSessions: next,
            currentStudioSessionId:
              s.currentStudioSessionId === id ? (next[0]?.id ?? null) : s.currentStudioSessionId,
          };
        }),
      addStudioAsset: (sessionId, asset) =>
        set((s) => ({
          studioSessions: s.studioSessions.map((sess) =>
            sess.id === sessionId
              ? {
                  ...sess,
                  assets: [...sess.assets, asset],
                  // First asset's prompt becomes the session title (shown in left rail + header).
                  title: sess.assets.length === 0 ? asset.prompt.slice(0, 60) : sess.title,
                }
              : sess
          ),
        })),
      setStudioGenerating: (v) => set({ studioGenerating: v }),
      updateStudioSessionTitle: (id, title) =>
        set((s) => ({
          studioSessions: s.studioSessions.map((sess) => (sess.id === id ? { ...sess, title } : sess)),
        })),

      // Seeded so the flagship NeoVision conversation (sess_001) starts at the
      // invitation step and shares its lifecycle state with the order page.
      sessionFlows: {
        sess_001: {
          phase: "invitation",
          stageIndex: 0,
          total: 4200,
          needTitle: "Cinematic Brand Film for AI Startup — 90s Hero Video",
          revisions: 0,
        },
      },

      startInvitation: (sessionId, needTitle, total) =>
        set((s) => {
          const f = translations[s.locale].flow;
          const { backer } = partyNames(sessionId);
          return {
            sessionFlows: {
              ...s.sessionFlows,
              [sessionId]: { phase: "invitation", stageIndex: 0, total, needTitle, revisions: 0 },
            },
            sessionExtraMessages: appendCard(s, sessionId, f.sysInvited(backer, needTitle)),
          };
        }),

      acceptInvitation: (sessionId) =>
        set((s) => {
          const flow = s.sessionFlows[sessionId];
          if (!flow) return {};
          const f = translations[s.locale].flow;
          const { creator } = partyNames(sessionId);
          return {
            sessionFlows: { ...s.sessionFlows, [sessionId]: { ...flow, phase: "contract_draft" } },
            sessionExtraMessages: appendCard(s, sessionId, f.sysAccepted(creator)),
          };
        }),

      submitContract: (sessionId, terms) =>
        set((s) => {
          const flow = s.sessionFlows[sessionId];
          if (!flow || flow.phase !== "contract_draft") return {};
          const f = translations[s.locale].flow;
          const { backer } = partyNames(sessionId);
          return {
            sessionFlows: {
              ...s.sessionFlows,
              [sessionId]: {
                ...flow,
                phase: "contract_confirm",
                total: terms.total,
                terms: { copyright: terms.copyright, revisionLimit: terms.revisionLimit, autoAcceptDays: terms.autoAcceptDays },
              },
            },
            sessionExtraMessages: appendCard(s, sessionId, f.sysContractSubmitted(backer)),
          };
        }),

      confirmContract: (sessionId) =>
        set((s) => {
          const flow = s.sessionFlows[sessionId];
          if (!flow || flow.phase !== "contract_confirm") return {};
          const f = translations[s.locale].flow;
          const { creator } = partyNames(sessionId);
          return {
            sessionFlows: { ...s.sessionFlows, [sessionId]: { ...flow, phase: "deposit" } },
            sessionExtraMessages: appendCard(s, sessionId, f.sysContractConfirmed(creator)),
          };
        }),

      // Creator sends the contract back to the backer to revise.
      rejectContract: (sessionId) =>
        set((s) => {
          const flow = s.sessionFlows[sessionId];
          if (!flow || flow.phase !== "contract_confirm") return {};
          const f = translations[s.locale].flow;
          const { creator } = partyNames(sessionId);
          return {
            sessionFlows: { ...s.sessionFlows, [sessionId]: { ...flow, phase: "contract_draft" } },
            sessionExtraMessages: appendCard(s, sessionId, f.sysContractChanges(creator)),
          };
        }),

      // Clear a session's flow (e.g. after a declined invitation, to allow re-inviting).
      resetFlow: (sessionId) =>
        set((s) => {
          const next = { ...s.sessionFlows };
          delete next[sessionId];
          return { sessionFlows: next };
        }),

      // Accepting a creator's bid skips the invitation and goes straight to contract drafting.
      acceptBid: (sessionId, needTitle, total) =>
        set((s) => {
          const f = translations[s.locale].flow;
          return {
            sessionFlows: {
              ...s.sessionFlows,
              [sessionId]: { phase: "contract_draft", stageIndex: 0, total, needTitle, revisions: 0 },
            },
            sessionExtraMessages: appendCard(s, sessionId, f.sysBidAccepted),
          };
        }),

      declineInvitation: (sessionId) =>
        set((s) => {
          const flow = s.sessionFlows[sessionId];
          if (!flow) return {};
          const f = translations[s.locale].flow;
          const { creator } = partyNames(sessionId);
          return {
            sessionFlows: { ...s.sessionFlows, [sessionId]: { ...flow, phase: "rejected" } },
            sessionExtraMessages: appendCard(s, sessionId, f.sysDeclined(creator)),
          };
        }),

      payDeposit: (sessionId) =>
        set((s) => {
          const flow = s.sessionFlows[sessionId];
          if (!flow || flow.phase !== "deposit") return {};
          const f = translations[s.locale].flow;
          const amount = stageAmount(flow.total, 0);
          return {
            sessionFlows: { ...s.sessionFlows, [sessionId]: { ...flow, phase: "submit", stageIndex: 1 } },
            backerDiamond: Math.max(0, s.backerDiamond - amount),
            sessionExtraMessages: appendCard(s, sessionId, f.sysDeposit(amount)),
          };
        }),

      submitDelivery: (sessionId) =>
        set((s) => {
          const flow = s.sessionFlows[sessionId];
          if (!flow || flow.phase !== "submit") return {};
          const f = translations[s.locale].flow;
          const { creator } = partyNames(sessionId);
          const stageName = f.stageNames[flow.stageIndex];
          return {
            sessionFlows: { ...s.sessionFlows, [sessionId]: { ...flow, phase: "review" } },
            sessionExtraMessages: appendCard(s, sessionId, f.sysSubmitted(creator, stageName)),
          };
        }),

      approveDelivery: (sessionId) =>
        set((s) => {
          const flow = s.sessionFlows[sessionId];
          if (!flow || flow.phase !== "review") return {};
          const f = translations[s.locale].flow;
          const amount = stageAmount(flow.total, flow.stageIndex);
          const stageName = f.stageNames[flow.stageIndex];
          const isLast = flow.stageIndex >= STAGE_META.length - 1;
          const next: SessionFlow = isLast
            ? { ...flow, phase: "completed" }
            : { ...flow, phase: "submit", stageIndex: flow.stageIndex + 1, revisions: 0 };
          let extra = appendCard(s, sessionId, f.sysApproved(stageName, amount));
          if (isLast) extra = appendCard({ sessionExtraMessages: extra, locale: s.locale }, sessionId, f.sysCompleted);
          return {
            sessionFlows: { ...s.sessionFlows, [sessionId]: next },
            creatorShell: s.creatorShell + amount,
            sessionExtraMessages: extra,
          };
        }),

      requestRevision: (sessionId) =>
        set((s) => {
          const flow = s.sessionFlows[sessionId];
          if (!flow || flow.phase !== "review") return {};
          const f = translations[s.locale].flow;
          const stageName = f.stageNames[flow.stageIndex];
          return {
            sessionFlows: {
              ...s.sessionFlows,
              [sessionId]: { ...flow, phase: "submit", revisions: flow.revisions + 1 },
            },
            sessionExtraMessages: appendCard(s, sessionId, f.sysRevision(stageName)),
          };
        }),

      backerDiamond: 12400,
      creatorShell: 8650,

      recharge: (amount) => set((s) => ({ backerDiamond: s.backerDiamond + amount })),
      withdraw: (amount) => set((s) => ({ creatorShell: s.creatorShell - amount })),
      spendDiamond: (amount) => set((s) => ({ backerDiamond: s.backerDiamond - amount })),

      bankCards: [
        { id: "bc_1", bankCode: "cmb", network: "UnionPay", last4: "8829", holder: "Lucas Chen", isDefault: true },
        { id: "bc_2", bankCode: "icbc", network: "Visa", last4: "4012", holder: "Lucas Chen", isDefault: false },
      ],
      addBankCard: (card) =>
        set((s) => {
          const isFirst = s.bankCards.length === 0;
          return { bankCards: [...s.bankCards, { ...card, id: `bc_${Date.now()}`, isDefault: isFirst }] };
        }),
      removeBankCard: (id) => set((s) => ({ bankCards: s.bankCards.filter((c) => c.id !== id) })),
      setDefaultBankCard: (id) =>
        set((s) => ({ bankCards: s.bankCards.map((c) => ({ ...c, isDefault: c.id === id })) })),

      agentOpen: false,
      toggleAgent: () => set((s) => ({ agentOpen: !s.agentOpen })),
      openAgent: () => set({ agentOpen: true }),
      agentMessages: [],
      appendAgentMessages: (msgs) => set((s) => ({ agentMessages: [...s.agentMessages, ...msgs] })),
      clearAgentMessages: () => set({ agentMessages: [] }),
      agentThinking: false,
      setAgentThinking: (v) => set({ agentThinking: v }),

      appliedNeeds: {},
      submitBid: (needId) => set((s) => ({ appliedNeeds: { ...s.appliedNeeds, [needId]: true } })),

      postedNeeds: [],
      addNeed: (need) => set((s) => ({ postedNeeds: [need, ...s.postedNeeds] })),

      profileEdits: {},
      updateProfile: (role, edits) =>
        set((s) => ({ profileEdits: { ...s.profileEdits, [role]: { ...s.profileEdits[role], ...edits } } })),

      sessionExtraMessages: {},
      appendSessionMessage: (sessionId, msg) =>
        set((s) => ({
          sessionExtraMessages: {
            ...s.sessionExtraMessages,
            [sessionId]: [...(s.sessionExtraMessages[sessionId] ?? []), msg],
          },
        })),

      creatorEdits: {},
      updateCreatorEdits: (edits) =>
        set((s) => ({ creatorEdits: { ...s.creatorEdits, ...edits } })),

      showcaseEdits: undefined,
      setShowcaseEdits: (items) => set({ showcaseEdits: items }),

      distributionByAsset: {},
      updateDistribution: (assetId, dist) =>
        set((s) => ({
          distributionByAsset: {
            ...s.distributionByAsset,
            [assetId]: { ...(s.distributionByAsset[assetId] ?? { status: "metadata" }), ...dist },
          },
        })),
      clearDistribution: (assetId) =>
        set((s) => {
          const next = { ...s.distributionByAsset };
          delete next[assetId];
          return { distributionByAsset: next };
        }),
    }),
    {
      name: "spotlight-demo-store",
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        activeRole: state.activeRole,
        locale: state.locale,
        creatorEdits: state.creatorEdits,
        showcaseEdits: state.showcaseEdits,
        distributionByAsset: state.distributionByAsset,
        sessionExtraMessages: state.sessionExtraMessages,
        sessionFlows: state.sessionFlows,
        bankCards: state.bankCards,
        appliedNeeds: state.appliedNeeds,
        postedNeeds: state.postedNeeds,
        profileEdits: state.profileEdits,
        agentMessages: state.agentMessages,
        onboardingComplete: state.onboardingComplete,
        userPreferences: state.userPreferences,
        studioSessions: state.studioSessions,
        currentStudioSessionId: state.currentStudioSessionId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
