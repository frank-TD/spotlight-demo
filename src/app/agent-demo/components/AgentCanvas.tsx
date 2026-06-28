import { Sparkles, X } from "lucide-react";
import type { ReactNode } from "react";

// An Agent-generated artifact (a structured brief, a comparison table…). Framed
// so it clearly reads as something the Agent produced for the user to act on.
export default function AgentCanvas({
  title,
  subtitle,
  onClose,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose?: () => void;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-agent/30 bg-surface-container-lowest/70 backdrop-blur-md shadow-[0_30px_80px_rgba(0,0,0,0.45)] overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-outline-variant/40 bg-agent/[0.06]">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg bg-agent/15 text-agent">
            <Sparkles className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <p className="font-label text-[10px] uppercase tracking-[0.16em] text-agent">Agent Canvas</p>
            <p className="font-headline text-lg text-on-surface leading-tight truncate">{title}</p>
          </div>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close canvas"
            className="shrink-0 w-8 h-8 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-on-surface/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {subtitle ? (
        <p className="px-5 pt-4 font-body text-sm text-on-surface-variant leading-relaxed">{subtitle}</p>
      ) : null}

      <div className="p-5">{children}</div>

      {actions ? (
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-t border-outline-variant/40 bg-surface-container-lowest/40">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
