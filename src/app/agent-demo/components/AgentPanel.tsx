"use client";
import { ArrowUp, Layers, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useAgent } from "../agent-context";
import AgentActivityFeed from "./AgentActivityFeed";
import ConfidenceIndicator from "./ConfidenceIndicator";
import RiskBadge from "./RiskBadge";

// The right-side Agent Panel. It's the persistent surface for the intelligence
// layer: what the Agent currently sees (Current Context), what it suggests
// (Agent Suggestions), a place to Ask Agent, and a log of Recent Agent Events.
// Content is driven by useAgent() — it changes with the active tab + selection.
export default function AgentPanel() {
  const { panelOpen, closePanel, panel, events, askLog, askAgent } = useAgent();
  const [draft, setDraft] = useState("");

  const submit = () => {
    const q = draft.trim();
    if (!q) return;
    askAgent(q);
    setDraft("");
  };

  return (
    <>
      {/* Scrim */}
      <div
        onClick={closePanel}
        aria-hidden
        className={cnScrim(panelOpen)}
      />

      <aside
        className={[
          "fixed top-0 right-0 z-50 h-full w-[380px] max-w-[90vw]",
          "flex flex-col border-l border-agent/25 bg-surface-container-low/95 backdrop-blur-xl",
          "shadow-[-30px_0_80px_rgba(0,0,0,0.55)] transition-transform duration-300 ease-out",
          panelOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        aria-hidden={!panelOpen}
      >
        {/* Header */}
        <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-outline-variant/40">
          <div className="flex items-center gap-2.5">
            <span className="relative inline-flex w-9 h-9 items-center justify-center rounded-full bg-agent/15 text-agent">
              <span className="absolute inset-0 rounded-full animate-ping opacity-25 bg-agent" style={{ animationDuration: "2.6s" }} />
              <Sparkles className="relative w-4 h-4" />
            </span>
            <div>
              <p className="font-label text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">Spotlight Agent</p>
              <p className="font-headline text-lg text-on-surface leading-tight">{panel.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closePanel}
            aria-label="Close Agent panel"
            className="shrink-0 w-8 h-8 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-on-surface/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Scroll body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">
          {/* Current Context */}
          <section>
            <SectionTitle icon={<Layers className="w-3.5 h-3.5" />} label="Current context" />
            <ul className="mt-3 space-y-2">
              {panel.context.map((c) => (
                <li key={c} className="flex gap-2.5 font-body text-[13px] text-on-surface-variant leading-snug">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-agent/70 shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </section>

          {/* Agent Suggestions */}
          <section>
            <SectionTitle icon={<Sparkles className="w-3.5 h-3.5" />} label="Agent suggestions" />
            <div className="mt-3 space-y-3">
              {panel.suggestions.length === 0 ? (
                <p className="font-body text-[13px] text-on-surface-variant/70 italic">
                  No active suggestions — the Agent is watching this step.
                </p>
              ) : (
                panel.suggestions.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-xl border border-agent/20 bg-surface-container-lowest/55 p-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-body text-sm font-semibold text-on-surface">{s.title}</p>
                      {s.risk ? <RiskBadge level={s.risk} /> : null}
                    </div>
                    <p className="font-body text-[13px] text-on-surface-variant mt-1 leading-snug">{s.detail}</p>
                    <div className="flex items-center justify-between gap-3 mt-2.5">
                      <ConfidenceIndicator value={s.confidence} />
                      {s.action ? (
                        <span className="font-label text-[10px] uppercase tracking-[0.1em] text-agent">{s.action}</span>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Ask Agent log */}
          {askLog.length > 0 ? (
            <section className="space-y-3">
              {askLog.map((entry) => (
                <div key={entry.id} className="space-y-2">
                  <div className="ml-6 rounded-2xl rounded-tr-sm bg-surface-container-high/70 px-3.5 py-2.5">
                    <p className="font-body text-[13px] text-on-surface leading-snug">{entry.q}</p>
                  </div>
                  <div className="mr-6 rounded-2xl rounded-tl-sm border border-agent/20 bg-agent/[0.06] px-3.5 py-2.5">
                    <p className="font-label text-[9px] uppercase tracking-[0.16em] text-agent mb-1">Agent</p>
                    <p className="font-body text-[13px] text-on-surface-variant leading-snug">{entry.a}</p>
                  </div>
                </div>
              ))}
            </section>
          ) : null}

          {/* Recent Agent Events */}
          <section>
            <SectionTitle icon={<Layers className="w-3.5 h-3.5" />} label="Recent agent events" />
            <div className="mt-3.5">
              <AgentActivityFeed events={events} />
            </div>
          </section>
        </div>

        {/* Ask Agent input */}
        <div className="border-t border-outline-variant/40 px-4 py-3.5">
          <div className="flex items-center gap-2 rounded-full border border-outline-variant/60 bg-surface-container-lowest/70 pl-4 pr-1.5 py-1.5 focus-within:border-agent/50 transition-colors">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              aria-label="Ask the Agent"
              placeholder="Ask the Agent…"
              className="flex-1 bg-transparent font-body text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none"
            />
            <button
              type="button"
              onClick={submit}
              aria-label="Send to Agent"
              className="shrink-0 w-8 h-8 rounded-full bg-agent text-[#05101f] flex items-center justify-center hover:bg-agent-bright disabled:opacity-40 transition-colors"
              disabled={!draft.trim()}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-2 px-1 font-label text-[10px] uppercase tracking-[0.12em] text-on-surface-variant/50">
            Demo · canned responses · no real model
          </p>
        </div>
      </aside>
    </>
  );
}

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-agent">
      <span className="inline-flex w-6 h-6 items-center justify-center rounded-md bg-agent/12">{icon}</span>
      <span className="font-label text-[11px] uppercase tracking-[0.16em]">{label}</span>
    </div>
  );
}

function cnScrim(open: boolean) {
  return [
    "fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300",
    open ? "opacity-100" : "opacity-0 pointer-events-none",
  ].join(" ");
}
