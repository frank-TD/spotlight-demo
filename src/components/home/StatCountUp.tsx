"use client";
import CountUp from "@/components/common/CountUp";

// Adapter around the shared numeric <CountUp>. Stat figures arrive as opaque
// i18n strings ("2,400+", "¥18M+", "¥1.8 亿+", "98%"); this parses out the
// numeric token, rolls just that part up from 0, and re-wraps the original
// currency prefix / unit suffix with the same grouping + decimals.
export default function StatCountUp({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  const match = value.match(/^(\D*)([\d,]+(?:\.\d+)?)(.*)$/);
  if (!match) return <span className={className}>{value}</span>;

  const [, prefix, numberStr, suffix] = match;
  const grouped = numberStr.includes(",");
  const decimals = numberStr.includes(".") ? numberStr.split(".")[1].length : 0;
  const target = parseFloat(numberStr.replace(/,/g, ""));

  const format = (n: number) => {
    const body = grouped
      ? n.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : n.toFixed(decimals);
    return `${prefix}${body}${suffix}`;
  };

  return (
    <span className={className}>
      <CountUp value={target} duration={1900} format={format} />
    </span>
  );
}
