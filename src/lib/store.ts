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

  // Agent float
  agentOpen: boolean;
  toggleAgent: () => void;

  // Bid state
  myBidStatus: "none" | "pending" | "accepted" | "rejected";
  submitBid: () => void;

  // Invitation
  invitationSent: boolean;
  sendInvitation: () => void;

  // Creator profile edits (overlays the mock CREATORS[0] for u_creator_01)
  creatorEdits: { nickname?: string; bio?: string; specialties?: string[]; rateFrom?: number; activeHours?: string; avatarUrl?: string };
  updateCreatorEdits: (edits: Partial<{ nickname: string; bio: string; specialties: string[]; rateFrom: number; activeHours: string; avatarUrl: string }>) => void;

  // Showcase edits (overlays CREATORS[0].showcase when defined)
  showcaseEdits?: Array<{ id: string; title: string; duration: string; description?: string; fileSource?: "local" | "asset"; fileName?: string; assetId?: string }>;
  setShowcaseEdits: (items: Array<{ id: string; title: string; duration: string; description?: string; fileSource?: "local" | "asset"; fileName?: string; assetId?: string }>) => void;
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

      agentOpen: false,
      toggleAgent: () => set((s) => ({ agentOpen: !s.agentOpen })),

      myBidStatus: "none",
      submitBid: () => set({ myBidStatus: "pending" }),

      invitationSent: false,
      sendInvitation: () => set({ invitationSent: true }),

      creatorEdits: {},
      updateCreatorEdits: (edits) =>
        set((s) => ({ creatorEdits: { ...s.creatorEdits, ...edits } })),

      showcaseEdits: undefined,
      setShowcaseEdits: (items) => set({ showcaseEdits: items }),
    }),
    {
      name: "spotlight-demo-store",
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        activeRole: state.activeRole,
        locale: state.locale,
        creatorEdits: state.creatorEdits,
        showcaseEdits: state.showcaseEdits,
      }),
    }
  )
);
