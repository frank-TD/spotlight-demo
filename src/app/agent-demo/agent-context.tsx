"use client";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { ASK_REPLIES } from "./agent-data";
import type { AgentEvent, DockTone, Flow, Suggestion } from "./agent-types";

type PanelData = {
  title: string;
  context: string[];
  suggestions: Suggestion[];
};

type AskEntry = { id: string; q: string; a: string };

type AgentCtx = {
  flow: Flow;
  setFlow: (f: Flow) => void;
  panelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  panel: PanelData;
  setPanel: (p: PanelData) => void;
  dock: { tone: DockTone; label: string };
  setDock: (d: { tone: DockTone; label: string }) => void;
  events: AgentEvent[];
  pushEvent: (e: Omit<AgentEvent, "id" | "time">) => void;
  askLog: AskEntry[];
  askAgent: (q: string) => void;
};

const Ctx = createContext<AgentCtx | null>(null);

let uid = 0;
const nextId = () => {
  uid += 1;
  return `x${uid}`;
};

const SEED_EVENTS: AgentEvent[] = [
  { id: "s1", kind: "info", title: "Agent watching this workspace", detail: "Brief · Match · Contract · Project", time: "now" },
];

export function AgentProvider({ children }: { children: ReactNode }) {
  const [flow, setFlowState] = useState<Flow>("brief");
  const [panelOpen, setPanelOpen] = useState(false);
  const [panel, setPanel] = useState<PanelData>({
    title: "Brief Agent",
    context: ["No brief drafted yet."],
    suggestions: [],
  });
  const [dock, setDock] = useState<{ tone: DockTone; label: string }>({ tone: "watching", label: "Watching" });
  const [events, setEvents] = useState<AgentEvent[]>(SEED_EVENTS);
  const [askLog, setAskLog] = useState<AskEntry[]>([]);
  const [askIdx, setAskIdx] = useState(0);

  const setFlow = useCallback((f: Flow) => setFlowState(f), []);
  const openPanel = useCallback(() => setPanelOpen(true), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);

  const pushEvent = useCallback((e: Omit<AgentEvent, "id" | "time">) => {
    setEvents((prev) => [{ ...e, id: nextId(), time: "just now" }, ...prev].slice(0, 12));
  }, []);

  const askAgent = useCallback(
    (q: string) => {
      const replies = ASK_REPLIES[flow] ?? ASK_REPLIES.brief;
      const a = replies[askIdx % replies.length];
      setAskIdx((i) => i + 1);
      setAskLog((prev) => [...prev, { id: nextId(), q, a }]);
    },
    [flow, askIdx]
  );

  const value = useMemo<AgentCtx>(
    () => ({
      flow,
      setFlow,
      panelOpen,
      openPanel,
      closePanel,
      panel,
      setPanel,
      dock,
      setDock,
      events,
      pushEvent,
      askLog,
      askAgent,
    }),
    [flow, setFlow, panelOpen, openPanel, closePanel, panel, dock, events, pushEvent, askLog, askAgent]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAgent() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAgent must be used within AgentProvider");
  return ctx;
}
