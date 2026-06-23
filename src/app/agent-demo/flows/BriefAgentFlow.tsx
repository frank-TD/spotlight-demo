"use client";
import { Sparkles, Wand2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAgent } from "../agent-context";
import { BRIEF_CANVAS, MISSING_FIELDS, SAMPLE_BRIEF, STRUCTURED_FIELDS } from "../agent-data";
import AgentCanvas from "../components/AgentCanvas";
import ApprovalGate from "../components/ApprovalGate";
import HealthScoreCard from "../components/HealthScoreCard";
import InlineAgentCard from "../components/InlineAgentCard";

export default function BriefAgentFlow() {
  const { setPanel, setDock, pushEvent, openPanel } = useAgent();
  const [brief, setBrief] = useState(SAMPLE_BRIEF);
  const [structured, setStructured] = useState(false);
  const [resolved, setResolved] = useState<Record<string, boolean>>({});
  const [canvas, setCanvas] = useState(false);
  const [gate, setGate] = useState(false);
  const [published, setPublished] = useState(false);

  // Baseline Agent context for this tab.
  useEffect(() => {
    setDock({ tone: "watching", label: "Watching · Brief" });
    setPanel({
      title: "Brief Agent",
      context: ["Backer is drafting a brief.", "Nothing structured yet — the Agent is standing by."],
      suggestions: [],
    });
  }, [setPanel, setDock]);

  const resolvedCount = Object.values(resolved).filter(Boolean).length;
  const completeness = structured ? Math.min(100, 60 + resolvedCount * 10) : 0;

  const fields = useMemo(() => STRUCTURED_FIELDS.map((f) => {
      if (f.key === "budget" && resolved.budget) return { ...f, value: "¥180K – ¥320K (Agent band)", filled: true };
      if (f.key === "deadline" && resolved.deadline) return { ...f, value: "28 days from commission", filled: true };
      return f;
    }), [resolved]);

  const structure = () => {
    setStructured(true);
    setDock({ tone: "suggest", label: "4 fields need attention" });
    pushEvent({ kind: "suggest", title: "Brief structured", detail: "Extracted 6 fields · 4 need attention" });
    setPanel({
      title: "Brief Agent",
      context: [
        "Brief parsed into 6 structured fields.",
        "2 fields empty: budget, deadline.",
        "2 fields vague: copyright scope, references.",
      ],
      suggestions: [
        { id: "b1", title: "Add a budget band", detail: "Briefs with a budget get ~3× more quality proposals.", confidence: 88, risk: "high", action: "Apply fix" },
        { id: "b2", title: "Set a firm deadline", detail: "“About a month” is too soft for milestone planning.", confidence: 82, risk: "medium", action: "Apply fix" },
      ],
    });
  };

  const resolveField = (key: string, label: string) => {
    setResolved((r) => ({ ...r, [key]: true }));
    setDock({ tone: "suggest", label: "Brief improving" });
    pushEvent({ kind: "success", title: `${label} resolved`, detail: "Agent suggestion added to the draft" });
    toast.success(`${label} added to brief`, { description: "Agent applied its suggested value." });
  };

  const generate = () => {
    setCanvas(true);
    setDock({ tone: "action", label: "Canvas ready · review" });
    pushEvent({ kind: "action", title: "Brief Canvas generated", detail: "Structured brief ready for approval" });
    setPanel({
      title: "Brief Agent",
      context: [`Completeness ${completeness}/100.`, "Brief Canvas generated.", "Awaiting your approval to publish."],
      suggestions: [
        { id: "b3", title: "Publish to the marketplace", detail: "Brief is above the 80-point quality bar.", confidence: 91, action: "Approval gate" },
      ],
    });
  };

  const publish = () => {
    setGate(false);
    setPublished(true);
    setDock({ tone: "watching", label: "Brief live · watching" });
    pushEvent({ kind: "success", title: "Brief published", detail: "Now live · matching creators" });
    toast.success("Brief published", { description: "The Agent is now matching creators." });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <FlowIntro
        title="Turn a rough idea into a structured brief"
        body="Write the brief the way you'd say it out loud. The Agent structures it, flags what's missing, and assembles a publish-ready brief — you stay the approver."
      />

      {/* Natural-language brief */}
      <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest/60 p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <label htmlFor="brief-input" className="font-label text-[11px] uppercase tracking-[0.16em] text-on-surface-variant">Your brief</label>
          <button
            type="button"
            onClick={() => setBrief(SAMPLE_BRIEF)}
            className="font-label text-[10px] uppercase tracking-[0.12em] text-agent hover:text-agent-bright transition-colors"
          >
            Use sample
          </button>
        </div>
        <textarea
          id="brief-input"
          aria-label="Your brief"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={4}
          className="w-full resize-none rounded-xl border border-outline-variant/50 bg-surface-container-lowest/80 px-4 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none focus:border-agent/50 transition-colors"
          placeholder="Describe the film you want to commission…"
        />
        <div className="flex items-center justify-end mt-3">
          <button
            type="button"
            onClick={structure}
            className="inline-flex items-center gap-2 rounded-full bg-agent text-[#05101f] font-label text-[12px] uppercase tracking-[0.12em] px-5 py-2.5 hover:bg-agent-bright active:scale-95 transition-all"
          >
            <Wand2 className="w-4 h-4" />
            {structured ? "Re-structure with Agent" : "Structure with Agent"}
          </button>
        </div>
      </div>

      {structured ? (
        <>
          {/* Completeness + structured fields */}
          <div className="grid gap-5 md:grid-cols-[260px_1fr] items-start">
            <HealthScoreCard
              title="Brief completeness"
              score={completeness}
              caption={completeness >= 80 ? "Above the quality bar — ready to publish." : "Resolve the flagged fields to clear the bar."}
            />
            <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest/60 p-5">
              <p className="font-label text-[11px] uppercase tracking-[0.16em] text-on-surface-variant mb-3.5">Structured fields</p>
              <dl className="grid sm:grid-cols-2 gap-x-5 gap-y-3.5">
                {fields.map((f) => (
                  <div key={f.key}>
                    <dt className="font-label text-[10px] uppercase tracking-[0.12em] text-on-surface-variant/70">{f.label}</dt>
                    <dd className={f.filled ? "font-body text-[13px] text-on-surface mt-0.5 leading-snug" : "font-body text-[13px] text-[#d4af37] mt-0.5"}>
                      {f.filled ? f.value : "Missing — Agent flagged"}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Inline Agent cards for missing/weak fields */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-agent">
              <Sparkles className="w-4 h-4" />
              <h3 className="font-label text-[11px] uppercase tracking-[0.16em]">Agent found {MISSING_FIELDS.length} things to fix</h3>
            </div>
            {MISSING_FIELDS.map((m) => (
              <InlineAgentCard
                key={m.key}
                title={m.label}
                detail={m.detail}
                suggestion={m.suggestion}
                risk={m.risk}
                resolved={!!resolved[m.key]}
                actions={[
                  { label: "Apply suggestion", primary: true, onClick: () => resolveField(m.key, m.label) },
                  { label: "Ask Agent", onClick: openPanel },
                ]}
              />
            ))}
          </section>

          {/* Generate canvas */}
          {!canvas ? (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={generate}
                className="inline-flex items-center gap-2 rounded-full border border-agent/40 bg-agent/10 text-agent font-label text-[12px] uppercase tracking-[0.12em] px-6 py-3 hover:bg-agent/15 active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Generate Brief Canvas
              </button>
            </div>
          ) : (
            <AgentCanvas
              title="Brief Canvas"
              subtitle="A publish-ready brief the Agent assembled from your input + its suggestions."
              actions={
                <>
                  <button
                    type="button"
                    onClick={() => setGate(true)}
                    disabled={published}
                    className="inline-flex items-center gap-2 rounded-full bg-primary text-on-primary font-label text-[12px] uppercase tracking-[0.12em] px-6 py-2.5 hover:opacity-90 disabled:opacity-50 active:scale-95 transition-all"
                  >
                    {published ? "Published ✓" : "Publish brief"}
                  </button>
                  <span className="font-label text-[10px] uppercase tracking-[0.12em] text-on-surface-variant/60">
                    Opens an approval gate first
                  </span>
                </>
              }
            >
              <CanvasBody />
            </AgentCanvas>
          )}
        </>
      ) : null}

      <ApprovalGate
        open={gate}
        onOpenChange={setGate}
        title="Publish this brief?"
        summary="The Agent will publish your brief to the Spotlight marketplace and begin matching creators. Confirm the essentials below."
        checklist={BRIEF_CANVAS.risks}
        approveLabel="Approve & publish"
        onApprove={publish}
      />
    </div>
  );
}

function CanvasBody() {
  return (
    <div className="space-y-5">
      <CanvasBlock label="Brief summary">
        <p className="font-body text-sm text-on-surface-variant leading-relaxed">{BRIEF_CANVAS.summary}</p>
      </CanvasBlock>

      <div className="grid sm:grid-cols-2 gap-5">
        <CanvasBlock label="Creator requirements">
          <ul className="space-y-1.5">
            {BRIEF_CANVAS.requirements.map((r) => (
              <li key={r} className="font-body text-[13px] text-on-surface-variant flex gap-2">
                <span className="text-agent">·</span> {r}
              </li>
            ))}
          </ul>
        </CanvasBlock>
        <CanvasBlock label="Deliverables">
          <ul className="space-y-1.5">
            {BRIEF_CANVAS.deliverables.map((d) => (
              <li key={d} className="font-body text-[13px] text-on-surface-variant flex gap-2">
                <span className="text-agent">·</span> {d}
              </li>
            ))}
          </ul>
        </CanvasBlock>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <CanvasBlock label="Timeline">
          <ul className="space-y-2">
            {BRIEF_CANVAS.timeline.map((t) => (
              <li key={t.label} className="flex items-center justify-between gap-3">
                <span className="font-body text-[13px] text-on-surface-variant">{t.label}</span>
                <span className="font-mono text-[11px] text-on-surface-variant/70">{t.days}</span>
              </li>
            ))}
          </ul>
        </CanvasBlock>
        <CanvasBlock label="Budget suggestion">
          <p className="font-headline text-xl text-on-surface">{BRIEF_CANVAS.budget.range}</p>
          <p className="font-body text-[13px] text-on-surface-variant/80 mt-1">{BRIEF_CANVAS.budget.note}</p>
        </CanvasBlock>
      </div>

      <CanvasBlock label="Risk checklist">
        <ul className="space-y-2">
          {BRIEF_CANVAS.risks.map((r) => (
            <li key={r.label} className="flex items-center gap-2.5">
              <span
                className="inline-flex w-4 h-4 items-center justify-center rounded-full text-[10px]"
                style={{ color: r.ok ? "#46d18b" : "#d4af37", background: r.ok ? "#46d18b1f" : "#d4af371f" }}
              >
                {r.ok ? "✓" : "!"}
              </span>
              <span className="font-body text-[13px] text-on-surface-variant">{r.label}</span>
            </li>
          ))}
        </ul>
      </CanvasBlock>
    </div>
  );
}

function CanvasBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest/40 p-4">
      <p className="font-label text-[10px] uppercase tracking-[0.16em] text-agent mb-2.5">{label}</p>
      {children}
    </div>
  );
}

export function FlowIntro({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2 className="font-headline text-2xl sm:text-3xl text-on-surface leading-tight">{title}</h2>
      <p className="font-body text-sm text-on-surface-variant mt-2 max-w-2xl leading-relaxed">{body}</p>
    </div>
  );
}
