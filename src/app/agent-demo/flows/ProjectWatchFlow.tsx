"use client";
import { Activity, Bell, Check, CircleDot } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAgent } from "../agent-context";
import { PROJECT, PROJECT_ALERTS, PROJECT_EVENTS } from "../agent-data";
import AgentActivityFeed from "../components/AgentActivityFeed";
import HealthScoreCard from "../components/HealthScoreCard";
import InlineAgentCard from "../components/InlineAgentCard";
import { FlowIntro } from "./BriefAgentFlow";

const BREAKDOWN = [
  { label: "Timeline", value: 48 },
  { label: "Communication", value: 58 },
  { label: "Delivery", value: 70 },
  { label: "Budget", value: 90 },
];

export default function ProjectWatchFlow() {
  const { setPanel, setDock, pushEvent, openPanel } = useAgent();
  const [handled, setHandled] = useState<Record<string, "done" | "ignored">>({});

  const handledCount = Object.keys(handled).length;
  const openAlerts = PROJECT_ALERTS.filter((a) => !handled[a.id]);
  const health = useMemo(() => Math.min(92, 64 + Object.values(handled).filter((v) => v === "done").length * 9), [handled]);

  useEffect(() => {
    setDock({ tone: "action", label: "3 alerts need action" });
    setPanel({
      title: "Project Watch",
      context: [PROJECT.title, PROJECT.creator, `Progress ${PROJECT.progress}% · ${PROJECT.delivery}`],
      suggestions: [
        { id: "p1", title: "First cut is 2 days late", detail: "Send a reminder and pre-approve one extra revision round.", confidence: 84, risk: "high", action: "Send reminder" },
        { id: "p2", title: "Source file is missing", detail: "Request it and pause the auto-accept clock.", confidence: 80, risk: "medium", action: "Request file" },
      ],
    });
  }, [setPanel, setDock]);

  const syncDock = (next: Record<string, "done" | "ignored">) => {
    const remaining = PROJECT_ALERTS.filter((a) => !next[a.id]).length;
    if (remaining === 0) setDock({ tone: "watching", label: "Project on track" });
    else setDock({ tone: "action", label: `${remaining} alert${remaining > 1 ? "s" : ""} need action` });
  };

  const handle = (id: string, title: string, action: string) => {
    const next = { ...handled, [id]: "done" as const };
    setHandled(next);
    syncDock(next);
    pushEvent({ kind: "success", title: `${action}`, detail: title });
    toast.success(action, { description: title });
  };

  const ignore = (id: string, title: string) => {
    const next = { ...handled, [id]: "ignored" as const };
    setHandled(next);
    syncDock(next);
    pushEvent({ kind: "info", title: "Alert dismissed", detail: title });
  };

  return (
    <div className="space-y-8">
      <FlowIntro
        title="Keep every project on track, automatically"
        body="Once a project is live, the Agent watches milestones, payments and delivery — surfacing what slipped and what to do about it, while you stay in control of every action."
      />

      {/* Project header */}
      <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest/60 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="font-headline text-xl text-on-surface leading-tight">{PROJECT.title}</h3>
            <p className="font-body text-[13px] text-on-surface-variant mt-1">{PROJECT.creator} · {PROJECT.budget}</p>
          </div>
          <div className="text-right">
            <p className="font-headline text-2xl text-on-surface leading-none">{PROJECT.progress}%</p>
            <p className="font-label text-[10px] uppercase tracking-[0.12em] text-on-surface-variant mt-1">Complete</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 mt-4 rounded-full bg-on-surface/10 overflow-hidden">
          <div className="h-full rounded-full bg-agent transition-[width] duration-700" style={{ width: `${PROJECT.progress}%` }} />
        </div>

        {/* Milestones */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {PROJECT.milestones.map((m) => (
            <div key={m.label} className="flex items-center gap-2">
              <span
                className={[
                  "inline-flex w-6 h-6 shrink-0 items-center justify-center rounded-full border",
                  m.state === "done"
                    ? "bg-[#46d18b]/15 border-[#46d18b]/50 text-[#46d18b]"
                    : m.state === "active"
                      ? "bg-agent/15 border-agent/50 text-agent"
                      : "border-outline-variant/50 text-on-surface-variant/50",
                ].join(" ")}
              >
                {m.state === "done" ? <Check className="w-3.5 h-3.5" /> : <CircleDot className="w-3.5 h-3.5" />}
              </span>
              <span className={["font-body text-[12px] leading-tight", m.state === "todo" ? "text-on-surface-variant/60" : "text-on-surface"].join(" ")}>
                {m.label}
              </span>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mt-5 pt-4 border-t border-outline-variant/30">
          <Meta label="Payment" value={PROJECT.payment} />
          <Meta label="Delivery" value={PROJECT.delivery} warn />
        </div>
      </div>

      {/* Health + activity feed */}
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr] items-start">
        <HealthScoreCard
          title="Project health"
          score={health}
          caption={openAlerts.length === 0 ? "Back on track — alerts cleared." : "Pulled down by the late first cut + quiet thread."}
          breakdown={BREAKDOWN}
        />
        <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest/60 p-5">
          <div className="flex items-center gap-2 text-agent mb-4">
            <Activity className="w-4 h-4" />
            <p className="font-label text-[11px] uppercase tracking-[0.16em]">Agent activity feed</p>
          </div>
          <AgentActivityFeed events={PROJECT_EVENTS} />
        </div>
      </div>

      {/* Alerts */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#d4af37]">
            <Bell className="w-4 h-4" />
            <h3 className="font-label text-[11px] uppercase tracking-[0.16em]">Agent alerts</h3>
          </div>
          <span className="font-body text-[12px] text-on-surface-variant">
            {openAlerts.length === 0 ? "All handled" : `${openAlerts.length} open · ${handledCount} handled`}
          </span>
        </div>

        {PROJECT_ALERTS.map((a) => {
          const status = handled[a.id];
          return (
            <InlineAgentCard
              key={a.id}
              title={a.title}
              detail={a.detail}
              risk={a.risk}
              resolved={!!status}
              resolvedNote={status === "ignored" ? "Dismissed by you" : "Handled · Agent notified"}
              actions={[
                { label: "Send reminder", primary: true, onClick: () => handle(a.id, a.title, "Reminder sent") },
                { label: "Open chat", onClick: openPanel },
                { label: "Adjust milestone", onClick: () => handle(a.id, a.title, "Milestone adjusted") },
                { label: "Ignore", onClick: () => ignore(a.id, a.title) },
              ]}
            />
          );
        })}
      </section>
    </div>
  );
}

function Meta({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div>
      <dt className="font-label text-[10px] uppercase tracking-[0.12em] text-on-surface-variant/70">{label}</dt>
      <dd className={["font-body text-[13px] mt-0.5", warn ? "text-[#ff5d5d]" : "text-on-surface"].join(" ")}>{value}</dd>
    </div>
  );
}
