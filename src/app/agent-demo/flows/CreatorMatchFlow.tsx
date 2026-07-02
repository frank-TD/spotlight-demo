"use client";
import Image from "next/image";
import { Check, GitCompare, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAgent } from "../agent-context";
import { CREATORS } from "../agent-data";
import type { Creator, CreatorTag } from "../agent-types";
import AgentCanvas from "../components/AgentCanvas";
import RiskBadge from "../components/RiskBadge";
import { FlowIntro } from "./BriefAgentFlow";

const TAG_TONE: Record<CreatorTag["tone"], string> = {
  match: "#6ea8ff",
  speed: "#3fd0c9",
  budget: "#d4af37",
  reliable: "#46d18b",
  risk: "#ff5d5d",
};

export default function CreatorMatchFlow() {
  const { setPanel, setDock, pushEvent, openPanel } = useAgent();
  const [selected, setSelected] = useState<string[]>([]);
  const [compare, setCompare] = useState(false);

  useEffect(() => {
    setDock({ tone: "suggest", label: "3 creators recommended" });
    setPanel({
      title: "Creator Match",
      context: ["Agent ranked the creator pool for this brief.", "3 shortlisted by style, price, speed, reliability."],
      suggestions: [
        { id: "m0", title: "Aria Song is the safest pick", detail: "96% style match · 94% on-time across 31 projects.", confidence: 94, action: "Why recommended?" },
      ],
    });
  }, [setPanel, setDock]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      setDock(
        next.length >= 2
          ? { tone: "action", label: `Compare ${next.length} creators` }
          : { tone: "suggest", label: "3 creators recommended" }
      );
      return next;
    });
  };

  const why = (c: Creator) => {
    openPanel();
    pushEvent({ kind: "info", title: `Why ${c.name}?`, detail: "Opened the Agent's reasoning" });
    setPanel({
      title: `Why ${c.name}?`,
      context: [`${c.specialty} · ${c.city}`, `Rate ${c.rate}`, c.riskNote],
      suggestions: c.why.map((w, i) => ({
        id: `${c.id}-w${i}`,
        title: i === 0 ? "Top reason" : `Reason ${i + 1}`,
        detail: w,
        confidence: [c.scores.style, c.scores.reliability, c.scores.price][i] ?? 80,
      })),
    });
  };

  const openCompare = () => {
    setCompare(true);
    setDock({ tone: "action", label: "Comparison ready" });
    pushEvent({ kind: "action", title: "Comparison generated", detail: `${selected.length} creators side by side` });
  };

  const act = (label: string, name: string) => {
    pushEvent({ kind: "success", title: `${label} · ${name}`, detail: "Logged in this demo" });
    toast.success(`${label} — ${name}`, { description: "Demo action recorded." });
  };

  const chosen = CREATORS.filter((c) => selected.includes(c.id));

  return (
    <div className="space-y-8">
      <FlowIntro
        title="Match the right creator, with the Agent's reasoning"
        body="Every card carries the Agent's tags and a transparent “why”. Select a few and let the Agent build a side-by-side comparison — it recommends, you decide."
      />

      <div className="grid gap-5 md:grid-cols-3">
        {CREATORS.map((c) => {
          const isSel = selected.includes(c.id);
          return (
            <article
              key={c.id}
              className={[
                "group relative rounded-2xl border bg-surface-container-lowest/60 overflow-hidden transition-colors",
                isSel ? "border-agent/60" : "border-outline-variant/40 hover:border-on-surface/30",
              ].join(" ")}
            >
              <button
                type="button"
                onClick={() => toggle(c.id)}
                aria-label={isSel ? `Deselect ${c.name}` : `Select ${c.name}`}
                className={[
                  "absolute top-3 right-3 z-10 w-7 h-7 rounded-full border flex items-center justify-center transition-all",
                  isSel ? "bg-agent border-agent text-[#05101f]" : "border-outline-variant/70 bg-black/40 text-transparent hover:border-agent/60",
                ].join(" ")}
              >
                <Check className="w-4 h-4" />
              </button>

              <div className="relative h-36 w-full">
                <Image src={c.avatar} alt={c.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/20 to-transparent" />
              </div>

              <div className="p-4 -mt-8 relative">
                <h3 className="font-headline text-lg text-on-surface leading-tight">{c.name}</h3>
                <p className="font-body text-[12px] text-on-surface-variant mt-0.5">
                  {c.specialty} · {c.city}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {c.tags.map((t) => (
                    <span
                      key={t.label}
                      className="inline-flex items-center rounded-full px-2 py-0.5 font-label text-[9px] font-semibold uppercase tracking-[0.1em]"
                      style={{ color: TAG_TONE[t.tone], background: `${TAG_TONE[t.tone]}1a`, border: `1px solid ${TAG_TONE[t.tone]}33` }}
                    >
                      {t.label}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
                  <Score label="Style" value={c.scores.style} />
                  <Score label="Price fit" value={c.scores.price} />
                  <Score label="Speed" value={c.scores.speed} />
                  <Score label="Reliability" value={c.scores.reliability} />
                </div>

                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-outline-variant/30">
                  <span className="font-body text-[12px] text-on-surface-variant">{c.rate}</span>
                  <button
                    type="button"
                    onClick={() => why(c)}
                    className="inline-flex items-center gap-1.5 font-label text-[10px] uppercase tracking-[0.1em] text-agent hover:text-agent-bright transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Why recommended?
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Compare bar */}
      <div className="flex items-center justify-center gap-4">
        <p className="font-body text-[13px] text-on-surface-variant">
          {selected.length === 0
            ? "Select 2+ creators to compare with the Agent"
            : `${selected.length} selected`}
        </p>
        <button
          type="button"
          onClick={openCompare}
          disabled={selected.length < 2}
          className="inline-flex items-center gap-2 rounded-full bg-agent text-[#05101f] font-label text-[12px] uppercase tracking-[0.12em] px-5 py-2.5 hover:bg-agent-bright disabled:opacity-40 disabled:hover:bg-agent active:scale-95 transition-all"
        >
          <GitCompare className="w-4 h-4" />
          Compare with Agent
        </button>
      </div>

      {compare && chosen.length >= 2 ? (
        <AgentCanvas
          title="Creator comparison"
          subtitle="Normalized by the Agent against this brief. Suggested actions reflect overall fit, not just price."
          onClose={() => setCompare(false)}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant/40">
                  {["Creator", "Style", "Price fit", "Speed", "Reliability", "Risk", "Suggested action"].map((h) => (
                    <th key={h} className="py-2.5 pr-4 font-label text-[10px] uppercase tracking-[0.12em] text-on-surface-variant/85 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chosen.map((c) => (
                  <tr key={c.id} className="border-b border-outline-variant/20 align-top">
                    <td className="py-3.5 pr-4">
                      <p className="font-body text-sm font-semibold text-on-surface whitespace-nowrap">{c.name}</p>
                      <p className="font-body text-[11px] text-on-surface-variant">{c.rate}</p>
                    </td>
                    <Cell value={c.scores.style} />
                    <Cell value={c.scores.price} />
                    <Cell value={c.scores.speed} />
                    <Cell value={c.scores.reliability} />
                    <td className="py-3.5 pr-4">
                      <RiskBadge level={c.risk} />
                    </td>
                    <td className="py-3.5 pr-2 min-w-[180px]">
                      <p className="font-body text-[12px] text-on-surface-variant mb-2">{c.suggestedAction}</p>
                      <div className="flex flex-wrap gap-1.5">
                        <RowBtn label="Invite" primary onClick={() => act("Invited", c.name)} />
                        <RowBtn label="Ask questions" onClick={() => act("Questions sent to", c.name)} />
                        <RowBtn label="Save" onClick={() => act("Saved", c.name)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AgentCanvas>
      ) : null}
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="font-label text-[9px] uppercase tracking-[0.1em] text-on-surface-variant/85">{label}</span>
        <span className="font-mono text-[10px] text-on-surface-variant">{value}</span>
      </div>
      <div className="h-1 mt-1 rounded-full bg-on-surface/10 overflow-hidden">
        <div className="h-full rounded-full bg-agent" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Cell({ value }: { value: number }) {
  return (
    <td className="py-3.5 pr-4">
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-12 rounded-full bg-on-surface/10 overflow-hidden">
          <div className="h-full rounded-full bg-agent" style={{ width: `${value}%` }} />
        </div>
        <span className="font-mono text-[11px] text-on-surface-variant">{value}</span>
      </div>
    </td>
  );
}

function RowBtn({ label, onClick, primary }: { label: string; onClick: () => void; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full px-3 py-1 font-label text-[10px] uppercase tracking-[0.1em] transition-colors whitespace-nowrap",
        primary
          ? "bg-agent text-[#05101f] hover:bg-agent-bright"
          : "border border-outline-variant/60 text-on-surface-variant hover:text-on-surface hover:border-on-surface/40",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
