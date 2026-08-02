"use client";
import { type FeaturedStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";

// Status pill for featured projects: open / in-production / released, each in
// its own accent. `overlay` swaps the translucent fill for a blurred dark chip
// so it stays legible sitting directly on poster artwork.
export default function StatusBadge({
  status,
  small = false,
  overlay = false,
}: {
  status: FeaturedStatus;
  small?: boolean;
  overlay?: boolean;
}) {
  const t = useT();
  // Homepage accent semantics: flame = open money moments ("back this"),
  // sage = quietly in the works, mint = live product you can stream.
  const config: Record<FeaturedStatus, { label: string; text: string; border: string; dot: string }> =
    {
      open: {
        label: t.homeV2.statusOpen,
        text: "text-tertiary",
        border: "border-tertiary/50",
        dot: "bg-tertiary",
      },
      production: {
        label: t.homeV2.statusProduction,
        text: "text-secondary",
        border: "border-secondary/40",
        dot: "bg-secondary",
      },
      released: {
        label: t.homeV2.statusReleased,
        text: "text-primary",
        border: "border-primary/45",
        dot: "bg-primary",
      },
    };
  const { label, text, border, dot } = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-label uppercase border rounded-full",
        small ? "text-[12px] tracking-[0.18em] px-2.5 py-1" : "text-[12px] tracking-[0.2em] px-3.5 py-1.5",
        text,
        border,
        overlay ? "bg-surface/85" : "bg-surface-container/60"
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}
