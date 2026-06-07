"use client";
import { useState } from "react";
import { useT } from "@/hooks/useT";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function HorizontalCardRow({ items }: { items: RowCard[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {items.map((item, i) => (
        <Card key={item.id} item={item} delayMs={i * 70} />
      ))}
    </div>
  );
}

function Card({ item, delayMs }: { item: RowCard; delayMs: number }) {
  const t = useT();
  const [loaded, setLoaded] = useState(false);
  const chip = CATEGORY_STYLE[item.category] ?? "bg-surface-container text-on-surface-variant";
  return (
    <figure
      className="group relative rounded-2xl overflow-hidden aspect-[2/3] bg-surface-container border border-outline-variant/30 cursor-pointer hover:border-primary/40 hover:shadow-[0_18px_50px_rgba(212,175,55,0.18)] transition-all animate-fade-up"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {!loaded && <span className="shimmer-overlay" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://picsum.photos/seed/${item.seed}/600/900`}
        alt={item.title}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.04]",
          loaded ? "opacity-100" : "opacity-0"
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

      {/* Pricing pill — top right */}
      <span className="absolute top-3 right-3 font-label text-[10px] uppercase tracking-[0.2em] bg-black/55 text-primary px-2.5 py-1 rounded">
        {item.priceRange}
      </span>

      {/* Bottom info */}
      <figcaption className="absolute inset-x-0 bottom-0 p-4 flex flex-col gap-2">
        <span className={cn("self-start font-label text-[10px] uppercase tracking-[0.2em] px-2 py-1 rounded", chip)}>
          {item.category}
        </span>
        <h3 className="font-headline italic text-white text-xl leading-tight">{item.title}</h3>
        <p className="font-label text-[10px] uppercase tracking-[0.18em] text-white/65">
          {item.creator} · {item.city}
        </p>
      </figcaption>

      {/* Hover CTA */}
      <span className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/85 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
        <span className="font-label text-[10px] uppercase tracking-[0.24em] text-primary inline-flex items-center gap-1.5">
          {t.landing.cardCommission} <ArrowRight className="w-3 h-3" />
        </span>
      </span>
    </figure>
  );
}
