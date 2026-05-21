"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ORDER_ACTIVE, Stage, StageStatus } from "./mock-data";
import { Locale } from "./i18n";

type Role = "backer" | "creator";

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

  // Order simulation
  orderStages: Stage[];
  acceptStage: (stageId: string) => void;
  rejectStage: (stageId: string) => void;
  submitStage: (stageId: string) => void;

  // Wallet simulation
  backerDiamond: number;
  creatorShell: number;
  recharge: (amount: number) => void;
  withdraw: (amount: number) => void;
  spendDiamond: (amount: number) => void;

  // Agent float
  agentOpen: boolean;
  toggleAgent: () => void;
  agentMessages: Array<{ role: "user" | "agent"; text: string; link?: { label: string; href: string } | null }>;
  appendAgentMessages: (msgs: Array<{ role: "user" | "agent"; text: string; link?: { label: string; href: string } | null }>) => void;
  clearAgentMessages: () => void;

  // Bid state
  myBidStatus: "none" | "pending" | "accepted" | "rejected";
  submitBid: () => void;

  // Per-session messaging
  sessionExtraMessages: Record<string, Array<{ id: string; senderId: string; senderName: string; senderRole: string; text: string; ts: string; isCard?: boolean }>>;
  appendSessionMessage: (sessionId: string, msg: { id: string; senderId: string; senderName: string; senderRole: string; text: string; ts: string; isCard?: boolean }) => void;
  sessionInvitations: Record<string, { sentAt: number }>;
  sendSessionInvitation: (sessionId: string) => void;

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

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      activeRole: "backer" as Role,
      locale: "en" as Locale,
      setLocale: (locale) => set({ locale }),

      login: (role = "backer") => set({ isLoggedIn: true, activeRole: role }),
      logout: () => set({ isLoggedIn: false }),
      switchRole: (role) => set({ activeRole: role }),

      orderStages: ORDER_ACTIVE.stages as Stage[],

      acceptStage: (stageId) =>
        set((s) => {
          const stages = s.orderStages.map((st) => {
            if (st.id === stageId) return { ...st, status: "accepted" as StageStatus, decidedAt: new Date().toISOString() };
            return st;
          });
          const acceptedIdx = stages.findIndex((st) => st.id === stageId);
          if (stages[acceptedIdx + 1]?.status === "pending") {
            stages[acceptedIdx + 1] = { ...stages[acceptedIdx + 1], status: "in_progress" as StageStatus };
          }
          const released = stages.find((st) => st.id === stageId)?.amountFiat ?? 0;
          return { orderStages: stages, creatorShell: s.creatorShell + released };
        }),

      rejectStage: (stageId) =>
        set((s) => ({
          orderStages: s.orderStages.map((st) =>
            st.id === stageId ? { ...st, status: "rejected" as StageStatus } : st
          ),
        })),

      submitStage: (stageId) =>
        set((s) => ({
          orderStages: s.orderStages.map((st) =>
            st.id === stageId ? { ...st, status: "submitted" as StageStatus, submittedAt: new Date().toISOString() } : st
          ),
        })),

      backerDiamond: 12400,
      creatorShell: 8650,

      recharge: (amount) => set((s) => ({ backerDiamond: s.backerDiamond + amount })),
      withdraw: (amount) => set((s) => ({ creatorShell: s.creatorShell - amount })),
      spendDiamond: (amount) => set((s) => ({ backerDiamond: s.backerDiamond - amount })),

      agentOpen: false,
      toggleAgent: () => set((s) => ({ agentOpen: !s.agentOpen })),
      agentMessages: [],
      appendAgentMessages: (msgs) => set((s) => ({ agentMessages: [...s.agentMessages, ...msgs] })),
      clearAgentMessages: () => set({ agentMessages: [] }),

      myBidStatus: "none",
      submitBid: () => set({ myBidStatus: "pending" }),

      sessionExtraMessages: {},
      appendSessionMessage: (sessionId, msg) =>
        set((s) => ({
          sessionExtraMessages: {
            ...s.sessionExtraMessages,
            [sessionId]: [...(s.sessionExtraMessages[sessionId] ?? []), msg],
          },
        })),
      sessionInvitations: {},
      sendSessionInvitation: (sessionId) =>
        set((s) => ({
          sessionInvitations: { ...s.sessionInvitations, [sessionId]: { sentAt: Date.now() } },
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
        sessionInvitations: state.sessionInvitations,
        agentMessages: state.agentMessages,
      }),
    }
  )
);
