"use client";
import { AlertTriangle, Bell, Eye, Sparkles } from "lucide-react";
import { useAgent } from "../agent-context";
import type { DockTone } from "../agent-types";

const TONE: Record<DockTone, { c: string; Icon: typeof Eye }> = {
  watching: { c: "#6ea8ff", Icon: Eye },
  suggest: { c: "#6ea8ff", Icon: Sparkles },
  risk: { c: "#ff5d5d", Icon: AlertTriangle },
  action: { c: "#d4af37", Icon: Bell },
};

export default function AgentDock() {
  const { dock, panelOpen, openPanel } = useAgent();
  const t = TONE[dock.tone];
  if (panelOpen) return null;
  return (
    <button
      type="button"
      onClick={openPanel}
      className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-3 rounded-full border bg-surface-container-low/90 backdrop-blur-md pl-3 pr-5 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.5)] transition-all hover:-translate-y-0.5"
      style={{ borderColor: `${t.c}55` }}
      aria-label="Open Agent panel"
    >
      <span className="relative inline-flex w-9 h-9 items-center justify-center rounded-full" style={{ background: `${t.c}1f`, color: t.c }}>
        <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: t.c, animationDuration: "2.6s" }} />
        <t.Icon className="relative w-4 h-4" />
      </span>
      <span className="text-left">
        <span className="block font-label text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">Spotlight Agent</span>
        <span className="block font-body text-sm font-semibold leading-tight" style={{ color: t.c }}>
          {dock.label}
        </span>
      </span>
    </button>
  );
}
