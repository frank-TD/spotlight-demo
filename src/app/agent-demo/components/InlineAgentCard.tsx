import { Check, Sparkles } from "lucide-react";
import type { Risk } from "../agent-types";
import RiskBadge from "./RiskBadge";
import { cn } from "@/lib/utils";

export type InlineAction = { label: string; onClick: () => void; primary?: boolean };

// An Agent suggestion embedded inline in the workflow (not a popup). A cool
// agent rail on the left marks it as the intelligence layer; resolved cards
// dim to a confirmed state.
export default function InlineAgentCard({
  title,
  detail,
  suggestion,
  risk,
  actions = [],
  resolved = false,
  resolvedNote = "Resolved · added to draft",
}: {
  title: string;
  detail?: string;
  suggestion?: string;
  risk?: Risk;
  actions?: InlineAction[];
  resolved?: boolean;
  resolvedNote?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-surface-container-lowest/55 pl-4 pr-4 py-3.5 transition-colors",
        resolved ? "border-[#46d18b]/30" : "border-agent/25"
      )}
    >
      <span
        className={cn("absolute left-0 top-0 bottom-0 w-[3px]", resolved ? "bg-[#46d18b]" : "bg-agent")}
        aria-hidden
      />
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 inline-flex w-6 h-6 shrink-0 items-center justify-center rounded-md",
            resolved ? "bg-[#46d18b]/12 text-[#46d18b]" : "bg-agent/12 text-agent"
          )}
        >
          {resolved ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="font-body text-sm font-semibold text-on-surface">{title}</p>
            {risk && !resolved ? <RiskBadge level={risk} /> : null}
          </div>
          {detail ? <p className="font-body text-[13px] text-on-surface-variant mt-0.5 leading-snug">{detail}</p> : null}
          {suggestion ? (
            <p className="font-body text-[13px] text-agent-bright/90 mt-1.5 leading-snug">
              <span className="text-agent">Agent ·</span> {suggestion}
            </p>
          ) : null}

          {!resolved && actions.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {actions.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={() => a.onClick()}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 font-label text-[11px] uppercase tracking-[0.1em] transition-colors",
                    a.primary
                      ? "bg-agent text-[#05101f] hover:bg-agent-bright"
                      : "border border-outline-variant/60 text-on-surface-variant hover:text-on-surface hover:border-on-surface/40"
                  )}
                >
                  {a.label}
                </button>
              ))}
            </div>
          ) : null}
          {resolved ? (
            <p className="font-label text-[11px] uppercase tracking-[0.12em] text-[#46d18b] mt-2">{resolvedNote}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
