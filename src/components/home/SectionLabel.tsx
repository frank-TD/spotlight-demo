// Tiny shared anchor for every section: `— SMALL UPPERCASE LABEL` in gold.
// Matches the netlify sample's section-tagging motif.
export default function SectionLabel({
  children,
  accent = "gold",
}: {
  children: React.ReactNode;
  accent?: "gold" | "muted";
}) {
  return (
    <p
      className={`font-label text-[12px] uppercase tracking-[0.2em] flex items-center gap-3 ${
        accent === "gold" ? "text-primary" : "text-on-surface-variant"
      }`}
    >
      <span
        className={
          accent === "gold" ? "h-px w-8 bg-primary/70" : "h-px w-8 bg-on-surface-variant/40"
        }
      />
      {children}
    </p>
  );
}
