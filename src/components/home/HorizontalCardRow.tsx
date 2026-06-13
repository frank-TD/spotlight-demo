"use client";
import { useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useT } from "@/hooks/useT";
import { cn } from "@/lib/utils";
import CreatorPreviewDialog, { type CreatorPreviewItem } from "./CreatorPreviewDialog";

export interface RowCard {
  id: string;
  title: string;
  creator: string;
  city: string;
  category: string;
  priceRange: string;
  seed: string;
}

// Category chip palette — same genres show up in both the Trending and
// "Commission like a studio" rows, so they share one map.
const CATEGORY_STYLE: Record<string, string> = {
  Cinematic: "bg-primary-container/70 text-on-primary-container",
  "Sci-Fi": "bg-secondary-container/70 text-on-secondary-container",
  Documentary: "bg-tertiary-container/70 text-on-tertiary-container",
  "Brand Film": "bg-primary/15 text-primary",
  Commercial: "bg-secondary/15 text-secondary",
  Architecture: "bg-tertiary/15 text-tertiary",
  Abstract: "bg-primary-container/50 text-on-primary-container",
  Nature: "bg-tertiary-container/50 text-on-tertiary-container",
  Drama: "bg-secondary/20 text-secondary",
  Character: "bg-primary/15 text-primary",
};

// Cinematic marquee: cards drift continuously right→left and pause on hover.
// Implementation is a pure CSS keyframe (GPU transform only) over a duplicated
// item list, so the loop is seamless without JS per-frame work. Bleeds to the
// viewport edges via negative margins for a "billboard wall" feel, with a soft
// alpha mask fading the leftmost / rightmost edges so cards drift in/out
// rather than popping at hard borders. Clicking a card opens the shared
// creator preview lightbox.
export default function HorizontalCardRow({ items }: { items: RowCard[] }) {
  const SECONDS_PER_CARD = 8;
  const duration = `${items.length * SECONDS_PER_CARD}s`;
  const [active, setActive] = useState<CreatorPreviewItem | null>(null);

  return (
    <>
      <div className="marquee-mask -mx-2 md:-mx-6 lg:-mx-12 overflow-hidden group/marquee">
        <ul
          className="marquee-track flex w-max gap-3 md:gap-4 px-2 md:px-6 lg:px-12"
          style={{ animationDuration: duration }}
        >
          {items.map((item) => (
            <li key={item.id} className="marquee-item">
              <Card item={item} onOpen={() => setActive(item)} />
            </li>
          ))}
          {/* Mirror copy — the keyframe scrolls exactly the width of one set,
              so reaching the first mirror item lands us back at item #1. */}
          {items.map((item) => (
            <li key={`mirror-${item.id}`} className="marquee-item" aria-hidden="true">
              <Card item={item} onOpen={() => setActive(item)} mirror />
            </li>
          ))}
        </ul>
      </div>
      <CreatorPreviewDialog item={active} onOpenChange={(o) => !o && setActive(null)} />
    </>
  );
}

function Card({
  item,
  onOpen,
  mirror = false,
}: {
  item: RowCard;
  onOpen: () => void;
  mirror?: boolean;
}) {
  const t = useT();
  const [loaded, setLoaded] = useState(false);
  const chip = CATEGORY_STYLE[item.category] ?? "bg-surface-container text-on-surface-variant";
  return (
    <button
      type="button"
      onClick={onOpen}
      // The mirror copy is duplicate content for screen readers — keep it
      // focusable only via the original set.
      tabIndex={mirror ? -1 : 0}
      aria-label={`${item.title} — ${item.creator}`}
      className="group relative rounded-2xl overflow-hidden aspect-[2/3] w-full bg-surface-container border border-outline-variant/30 text-left hover:border-primary/40 hover:shadow-[0_18px_50px_rgba(212,175,55,0.18)] transition-all"
    >
      {!loaded && <span className="shimmer-overlay" />}
      <Image
        src={`https://picsum.photos/seed/${item.seed}/600/900`}
        alt={item.title}
        fill
        sizes="(max-width: 768px) 55vw, 220px"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={cn(
          "object-cover transition-all duration-500 group-hover:scale-[1.04]",
          loaded ? "opacity-100" : "opacity-0"
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

      {/* Pricing pill — top right */}
      <span className="absolute top-3 right-3 font-label text-[12px] uppercase tracking-[0.2em] bg-black/55 text-primary px-2.5 py-1 rounded">
        {item.priceRange}
      </span>

      {/* Bottom info */}
      <span className="absolute inset-x-0 bottom-0 p-4 flex flex-col gap-2">
        <span
          className={cn(
            "self-start font-label text-[12px] uppercase tracking-[0.2em] px-2 py-1 rounded",
            chip
          )}
        >
          {item.category}
        </span>
        <span className="font-headline italic text-white text-xl leading-tight">{item.title}</span>
        <span className="font-label text-[12px] uppercase tracking-[0.18em] text-white/65">
          {item.creator} · {item.city}
        </span>
      </span>

      {/* Hover CTA */}
      <span className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/85 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
        <span className="font-label text-[12px] uppercase tracking-[0.18em] text-primary inline-flex items-center gap-1.5">
          {t.landing.cardCommission} <ArrowRight className="w-3 h-3" />
        </span>
      </span>
    </button>
  );
}
