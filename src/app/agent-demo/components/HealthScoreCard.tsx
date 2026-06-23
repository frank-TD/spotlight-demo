// A health / completeness score — circular ring + value, with an optional
// breakdown. Ring colour tracks the score (red → gold → green).
function tone(score: number) {
  if (score >= 80) return "#46d18b";
  if (score >= 55) return "#d4af37";
  return "#ff5d5d";
}

export default function HealthScoreCard({
  title,
  score,
  caption,
  breakdown,
}: {
  title: string;
  score: number;
  caption?: string;
  breakdown?: { label: string; value: number }[];
}) {
  const c = tone(score);
  const r = 30;
  const circ = 2 * Math.PI * r;
  return (
    <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest/60 p-5 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <svg width="76" height="76" viewBox="0 0 76 76" className="-rotate-90">
            <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <circle
              cx="38"
              cy="38"
              r={r}
              fill="none"
              stroke={c}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ - (circ * score) / 100}
              style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-headline text-2xl leading-none text-on-surface" style={{ color: c }}>
              {score}
            </span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="font-label text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">{title}</p>
          {caption ? <p className="font-body text-sm text-on-surface-variant/80 mt-1 leading-snug">{caption}</p> : null}
        </div>
      </div>

      {breakdown && breakdown.length > 0 ? (
        <div className="mt-4 pt-4 border-t border-outline-variant/30 space-y-2.5">
          {breakdown.map((b) => (
            <div key={b.label} className="flex items-center gap-3">
              <span className="font-label text-[10px] uppercase tracking-[0.1em] text-on-surface-variant w-28 shrink-0">
                {b.label}
              </span>
              <div className="h-1.5 flex-1 rounded-full bg-on-surface/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{ width: `${b.value}%`, background: tone(b.value) }}
                />
              </div>
              <span className="font-mono text-[11px] text-on-surface-variant w-8 text-right">{b.value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
