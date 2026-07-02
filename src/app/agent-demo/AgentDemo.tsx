"use client";
import Link from "next/link";
import { Activity, FileSignature, PenLine, Users } from "lucide-react";
import { useAgent } from "./agent-context";
import type { Flow } from "./agent-types";
import AgentDock from "./components/AgentDock";
import AgentPanel from "./components/AgentPanel";
import BriefAgentFlow from "./flows/BriefAgentFlow";
import ContractRiskFlow from "./flows/ContractRiskFlow";
import CreatorMatchFlow from "./flows/CreatorMatchFlow";
import ProjectWatchFlow from "./flows/ProjectWatchFlow";

const TABS: { id: Flow; label: string; desc: string; Icon: typeof PenLine }[] = [
  { id: "brief", label: "Brief Agent", desc: "Structure a brief", Icon: PenLine },
  { id: "match", label: "Creator Match", desc: "Compare creators", Icon: Users },
  { id: "contract", label: "Contract Risk", desc: "Scan the contract", Icon: FileSignature },
  { id: "project", label: "Project Watch", desc: "Track delivery", Icon: Activity },
];

export default function AgentDemo() {
  const { flow, setFlow } = useAgent();

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Standalone demo chrome */}
      <header className="sticky top-0 z-30 border-b border-outline-variant/15 bg-surface/80 backdrop-blur-xl">
        <div className="max-w-[1180px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between gap-4 h-[64px]">
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/" className="font-headline text-2xl md:text-[26px] font-extrabold tracking-tight text-primary leading-none whitespace-nowrap">
                Spotlight
              </Link>
              <span className="hidden sm:inline-block w-px h-5 bg-outline-variant/40" />
              <span className="hidden sm:inline-flex items-center gap-2 font-label text-[11px] uppercase tracking-[0.18em] text-agent">
                <span className="w-1.5 h-1.5 rounded-full bg-agent" />
                Agent Prototype
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden md:inline font-label text-[10px] uppercase tracking-[0.14em] text-on-surface-variant/85">
                Frontend demo · mock data · no real AI
              </span>
              <Link
                href="/"
                className="font-label text-[11px] uppercase tracking-[0.12em] text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Exit
              </Link>
            </div>
          </div>

          {/* Flow tabs */}
          <nav className="flex gap-1 overflow-x-auto -mb-px">
            {TABS.map((t) => {
              const active = flow === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFlow(t.id)}
                  aria-label={t.label}
                  className={[
                    "group relative flex items-center gap-2.5 px-3.5 md:px-4 py-3 whitespace-nowrap transition-colors",
                    active ? "text-on-surface" : "text-on-surface-variant hover:text-on-surface",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "inline-flex w-7 h-7 items-center justify-center rounded-lg transition-colors",
                      active ? "bg-agent/15 text-agent" : "bg-surface-container-high/60 text-on-surface-variant group-hover:text-on-surface",
                    ].join(" ")}
                  >
                    <t.Icon className="w-4 h-4" />
                  </span>
                  <span className="text-left">
                    <span className="block font-body text-sm font-semibold leading-tight">{t.label}</span>
                    <span className="hidden md:block font-label text-[9px] uppercase tracking-[0.12em] text-on-surface-variant/85">{t.desc}</span>
                  </span>
                  <span
                    className={[
                      "absolute left-3 right-3 -bottom-px h-0.5 rounded-full transition-all",
                      active ? "bg-agent opacity-100" : "opacity-0",
                    ].join(" ")}
                  />
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Active flow */}
      <main className="animate-fade-up max-w-[1180px] mx-auto px-4 md:px-8 py-10 pb-32">
        {flow === "brief" ? <BriefAgentFlow /> : null}
        {flow === "match" ? <CreatorMatchFlow /> : null}
        {flow === "contract" ? <ContractRiskFlow /> : null}
        {flow === "project" ? <ProjectWatchFlow /> : null}
      </main>

      {/* Global Agent surfaces */}
      <AgentDock />
      <AgentPanel />
    </div>
  );
}
