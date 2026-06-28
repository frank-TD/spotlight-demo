import { AlertTriangle, Bell, CheckCircle2, Eye, Sparkles } from "lucide-react";
import type { AgentEvent } from "../agent-types";

const KIND = {
  info: { Icon: Eye, c: "#6ea8ff" },
  suggest: { Icon: Sparkles, c: "#6ea8ff" },
  risk: { Icon: AlertTriangle, c: "#ff5d5d" },
  action: { Icon: Bell, c: "#d4af37" },
  success: { Icon: CheckCircle2, c: "#46d18b" },
} as const;

export default function AgentActivityFeed({ events }: { events: AgentEvent[] }) {
  return (
    <ol className="relative">
      <span className="absolute left-[15px] top-2 bottom-2 w-px bg-outline-variant/40" aria-hidden />
      {events.map((e) => {
        const k = KIND[e.kind];
        return (
          <li key={e.id} className="relative flex gap-3.5 pb-5 last:pb-0">
            <span
              className="relative z-10 mt-0.5 inline-flex w-8 h-8 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest border"
              style={{ color: k.c, borderColor: `${k.c}55` }}
            >
              <k.Icon className="w-3.5 h-3.5" />
            </span>
            <div className="min-w-0 pt-1">
              <div className="flex items-baseline gap-2 flex-wrap">
                <p className="font-body text-sm font-medium text-on-surface">{e.title}</p>
                <span className="font-label text-[10px] uppercase tracking-[0.1em] text-on-surface-variant/70">{e.time}</span>
              </div>
              {e.detail ? <p className="font-body text-[13px] text-on-surface-variant mt-0.5 leading-snug">{e.detail}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
