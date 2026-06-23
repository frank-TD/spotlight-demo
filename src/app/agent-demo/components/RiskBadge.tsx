import type { Risk } from "../agent-types";

// Risk / success uses red / gold / green (distinct from the cool Agent accent).
const MAP: Record<Risk, { c: string; label: string }> = {
  low: { c: "#46d18b", label: "Low" },
  medium: { c: "#d4af37", label: "Medium" },
  high: { c: "#ff5d5d", label: "High" },
};

export default function RiskBadge({ level, label }: { level: Risk; label?: string }) {
  const m = MAP[level];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-label text-[10px] font-semibold uppercase tracking-[0.12em] whitespace-nowrap"
      style={{ color: m.c, background: `${m.c}1f`, border: `1px solid ${m.c}40` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.c }} />
      {label ?? `${m.label} risk`}
    </span>
  );
}
