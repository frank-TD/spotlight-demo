"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useT } from "@/hooks/useT";
import { cn } from "@/lib/utils";
import CreatorPreviewDialog, { type CreatorPreviewItem } from "./CreatorPreviewDialog";

type Aspect = "portrait" | "tall" | "landscape" | "wide" | "square";
type Item = {
  id: number;
  title: string;
  creator: string;
  category: string;
  aspect: Aspect;
  seed: string;
};

const ITEMS: Item[] = [
  {
    id: 1,
    title: "Celestial Entity",
    creator: "Aria Song",
    category: "Character",
    aspect: "portrait",
    seed: "celestial",
  },
  {
    id: 2,
    title: "Neon Rain",
    creator: "Marco Reyes",
    category: "Cinematic",
    aspect: "tall",
    seed: "neonrain",
  },
  {
    id: 3,
    title: "Orbital Zen",
    creator: "Yuki Tanaka",
    category: "Architecture",
    aspect: "landscape",
    seed: "orbital",
  },
  {
    id: 4,
    title: "Golden Core",
    creator: "Sofia Okonkwo",
    category: "Abstract",
    aspect: "portrait",
    seed: "goldencore",
  },
  {
    id: 5,
    title: "Aurora Crystal",
    creator: "Aria Song",
    category: "Nature",
    aspect: "wide",
    seed: "aurora",
  },
  {
    id: 6,
    title: "Cyber Ghost",
    creator: "Marco Reyes",
    category: "Character",
    aspect: "portrait",
    seed: "cyberghost",
  },
  {
    id: 7,
    title: "Biodome Alpha",
    creator: "Yuki Tanaka",
    category: "Architecture",
    aspect: "wide",
    seed: "biodome",
  },
  {
    id: 8,
    title: "Dune Metropolis",
    creator: "Sofia Okonkwo",
    category: "Sci-Fi",
    aspect: "landscape",
    seed: "dune",
  },
  {
    id: 9,
    title: "Techno Ascetic",
    creator: "Aria Song",
    category: "Character",
    aspect: "portrait",
    seed: "techno",
  },
  {
    id: 10,
    title: "Iridescent Flow",
    creator: "Marco Reyes",
    category: "Abstract",
    aspect: "square",
    seed: "iridescent",
  },
  {
    id: 11,
    title: "Glassine Garden",
    creator: "Yuki Tanaka",
    category: "Nature",
    aspect: "tall",
    seed: "glassine",
  },
  {
    id: 12,
    title: "Static Bloom",
    creator: "Sofia Okonkwo",
    category: "Sci-Fi",
    aspect: "portrait",
    seed: "staticbloom",
  },
];

const ASPECT_CLASS: Record<Aspect, string> = {
  portrait: "aspect-[2/3]",
  tall: "aspect-[9/16]",
  landscape: "aspect-[3/2]",
  wide: "aspect-video",
  square: "aspect-square",
};
const ASPECT_DIM: Record<Aspect, [number, number]> = {
  portrait: [600, 900],
  tall: [600, 1067],
  landscape: [900, 600],
  wide: [1600, 900],
  square: [600, 600],
};

export default function EndlessInspiration() {
  const t = useT();
  const [active, setActive] = useState<CreatorPreviewItem | null>(null);
  return (
    <section className="py-24 md:py-32">
      <div className="flex items-end justify-between gap-6 mb-12 flex-wrap">
        <h2 className="scroll-reveal font-headline text-4xl md:text-5xl text-on-surface leading-tight">
          {t.landing.inspirationTitle}
        </h2>
        <Link
          href="/market/creators"
          className="font-label text-[11px] uppercase tracking-[0.24em] text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-2"
        >
          {t.landing.inspirationExplore} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-3 md:gap-4">
        {ITEMS.map((item, i) => (
          <MasonryCard key={item.id} item={item} index={i} onOpen={() => setActive(item)} />
        ))}
      </div>
      <CreatorPreviewDialog item={active} onOpenChange={(o) => !o && setActive(null)} />
    </section>
  );
}

function MasonryCard({ item, index, onOpen }: { item: Item; index: number; onOpen: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const [w, h] = ASPECT_DIM[item.aspect];
  return (
    <figure
      className={cn(
        "break-inside-avoid mb-3 md:mb-4 relative overflow-hidden rounded-2xl bg-surface-container border border-outline-variant/30 group hover:border-primary/30 transition-all duration-500 scroll-reveal",
        ASPECT_CLASS[item.aspect]
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {!loaded && <span className="shimmer-overlay" />}
      <Image
        src={`https://picsum.photos/seed/${item.seed}/${w}/${h}`}
        alt={item.title}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={cn(
          "object-cover transition-all duration-700 group-hover:scale-[1.04]",
          loaded ? "opacity-100" : "opacity-0"
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <figcaption className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="font-label text-[10px] uppercase tracking-[0.22em] text-primary/90 mb-1.5 block">
          {item.category}
        </span>
        <p className="font-headline italic text-white text-base leading-tight">{item.title}</p>
        <p className="font-label text-white/65 text-[10px] uppercase tracking-[0.2em] mt-1">
          by {item.creator}
        </p>
      </figcaption>
      {/* Transparent click surface above the imagery — keeps the figure
          semantics intact while making the whole tile activatable. */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${item.title} — ${item.creator}`}
        className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
      />
    </figure>
  );
}
