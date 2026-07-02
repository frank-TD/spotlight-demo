"use client";
import { FileText, Send, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAgent } from "../agent-context";
import { CONTRACT_RISKS } from "../agent-data";
import type { Risk } from "../agent-types";
import ApprovalGate from "../components/ApprovalGate";
import HealthScoreCard from "../components/HealthScoreCard";
import InlineAgentCard from "../components/InlineAgentCard";
import { FlowIntro } from "./BriefAgentFlow";

const WEIGHT: Record<Risk, number> = { high: 12, medium: 9, low: 6 };

export default function ContractRiskFlow() {
  const { setPanel, setDock, pushEvent, openPanel } = useAgent();
  const [fixed, setFixed] = useState<Record<string, boolean>>({});
  const [gate, setGate] = useState(false);
  const [sent, setSent] = useState(false);

  const openRisks = CONTRACT_RISKS.filter((r) => !fixed[r.id]);
  const highOpen = openRisks.filter((r) => r.risk === "high").length;

  const health = useMemo(() => {
    const gained = CONTRACT_RISKS.reduce((sum, r) => (fixed[r.id] ? sum + WEIGHT[r.risk] : sum), 0);
    return Math.min(100, 50 + gained);
  }, [fixed]);

  useEffect(() => {
    setDock({ tone: "risk", label: "2 high-risk terms" });
    setPanel({
      title: "Contract Risk",
      context: ["Agent scanned the draft contract.", "5 risky or undefined terms found.", "2 are high-risk: revision limit, copyright scope."],
      suggestions: [
        { id: "k1", title: "Revision limit is undefined", detail: "Open-ended revisions are the top dispute cause.", confidence: 90, risk: "high", action: "Add terms" },
        { id: "k2", title: "Copyright scope is unclear", detail: "Specify full buyout + source files.", confidence: 87, risk: "high", action: "Add terms" },
      ],
    });
  }, [setPanel, setDock]);

  const syncDock = (nextFixed: Record<string, boolean>) => {
    const stillHigh = CONTRACT_RISKS.filter((r) => r.risk === "high" && !nextFixed[r.id]).length;
    const stillOpen = CONTRACT_RISKS.filter((r) => !nextFixed[r.id]).length;
    if (stillHigh > 0) setDock({ tone: "risk", label: `${stillHigh} high-risk term${stillHigh > 1 ? "s" : ""}` });
    else if (stillOpen > 0) setDock({ tone: "suggest", label: `${stillOpen} term${stillOpen > 1 ? "s" : ""} left` });
    else setDock({ tone: "watching", label: "Contract clean" });
  };

  const resolve = (id: string, label: string, how: "added" | "edited") => {
    const next = { ...fixed, [id]: true };
    setFixed(next);
    syncDock(next);
    pushEvent({
      kind: "success",
      title: how === "added" ? `Standard term added` : `Term edited`,
      detail: label,
    });
    toast.success(how === "added" ? "Suggested term added" : "Term marked edited", { description: label });
  };

  const waive = (label: string) => {
    pushEvent({ kind: "risk", title: "Risk accepted without fix", detail: `${label} — not recommended` });
    toast.warning("Continuing with this risk open", { description: "It will still show in the approval gate." });
  };

  const send = () => {
    setGate(false);
    setSent(true);
    setDock({ tone: "watching", label: "Contract sent" });
    pushEvent({ kind: "success", title: "Contract sent", detail: "Awaiting the creator's signature" });
    toast.success("Contract sent to creator", { description: "The Agent will watch for signature + delivery." });
  };

  return (
    <div className="space-y-8">
      <FlowIntro
        title="Catch contract risk before it's signed"
        body="The Agent reads the draft like a cautious producer — flagging undefined terms, suggesting standard language, and scoring overall contract health. Fix what matters, then send through an approval gate."
      />

      <div className="grid gap-5 md:grid-cols-[260px_1fr] items-start">
        <HealthScoreCard
          title="Contract health"
          score={health}
          caption={
            health >= 80
              ? "Solid — key protections are in place."
              : highOpen > 0
                ? `${highOpen} high-risk term${highOpen > 1 ? "s" : ""} still open.`
                : "Getting there — close the remaining gaps."
          }
        />
        <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest/60 p-5">
          <div className="flex items-center gap-2 text-on-surface-variant mb-3">
            <FileText className="w-4 h-4" />
            <p className="font-label text-[11px] uppercase tracking-[0.16em]">Draft contract</p>
          </div>
          <dl className="grid sm:grid-cols-2 gap-x-5 gap-y-3">
            <Meta label="Project" value="Nocturne — hero film" />
            <Meta label="Creator" value="Aria Song · Seoul" />
            <Meta label="Value" value="¥240,000 (escrow)" />
            <Meta label="Terms flagged" value={`${openRisks.length} open · ${CONTRACT_RISKS.length - openRisks.length} fixed`} />
          </dl>
          <p className="mt-4 pt-4 border-t border-outline-variant/30 font-body text-[13px] text-on-surface-variant/80 leading-snug">
            Standard Spotlight escrow agreement. The Agent flagged the clauses below as undefined or below platform norms.
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#ff5d5d]">
          <ShieldAlert className="w-4 h-4" />
          <h3 className="font-label text-[11px] uppercase tracking-[0.16em]">{CONTRACT_RISKS.length} terms flagged by the Agent</h3>
        </div>
        {CONTRACT_RISKS.map((r) => (
          <InlineAgentCard
            key={r.id}
            title={r.label}
            detail={r.detail}
            suggestion={r.suggestion}
            risk={r.risk}
            resolved={!!fixed[r.id]}
            actions={[
              { label: "Add suggested terms", primary: true, onClick: () => resolve(r.id, r.label, "added") },
              { label: "Edit manually", onClick: () => resolve(r.id, r.label, "edited") },
              { label: "Ask Agent", onClick: openPanel },
              { label: "Continue anyway", onClick: () => waive(r.label) },
            ]}
          />
        ))}
      </section>

      <div className="flex items-center justify-center gap-4">
        {openRisks.length > 0 ? (
          <p className="font-body text-[13px] text-on-surface-variant">
            {openRisks.length} term{openRisks.length > 1 ? "s" : ""} still open — you can still send
          </p>
        ) : (
          <p className="font-body text-[13px] text-[#46d18b]">All flagged terms resolved</p>
        )}
        <button
          type="button"
          onClick={() => setGate(true)}
          disabled={sent}
          className="inline-flex items-center gap-2 rounded-full bg-primary text-on-primary font-label text-[12px] uppercase tracking-[0.12em] px-6 py-3 hover:opacity-90 disabled:opacity-50 active:scale-95 transition-all"
        >
          <Send className="w-4 h-4" />
          {sent ? "Contract sent ✓" : "Send contract"}
        </button>
      </div>

      <ApprovalGate
        open={gate}
        onOpenChange={setGate}
        title="Send this contract?"
        summary="The Agent will send the contract to the creator for signature. Here's where each flagged term stands — you can send with open risks, but the Agent advises closing the high ones first."
        checklist={CONTRACT_RISKS.map((r) => ({ label: r.label, ok: !!fixed[r.id] }))}
        approveLabel="Approve & send"
        onApprove={send}
      />
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-label text-[10px] uppercase tracking-[0.12em] text-on-surface-variant/85">{label}</dt>
      <dd className="font-body text-[13px] text-on-surface mt-0.5">{value}</dd>
    </div>
  );
}
