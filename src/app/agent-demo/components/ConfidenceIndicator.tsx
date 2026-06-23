// A compact "Agent confidence" meter — cool agent accent, so it reads as the
// intelligence layer's certainty rather than a brand/progress bar.
export default function ConfidenceIndicator({
  value,
  label = "confidence",
}: {
  value: number;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-14 rounded-full bg-on-surface/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-agent transition-[width] duration-700 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="font-label text-[10px] uppercase tracking-[0.12em] text-on-surface-variant">
        {value}% {label}
      </span>
    </div>
  );
}
