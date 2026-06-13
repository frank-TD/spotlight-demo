"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import SectionLabel from "./SectionLabel";
import CreatorPreviewDialog, { type CreatorPreviewItem } from "./CreatorPreviewDialog";
import { useT } from "@/hooks/useT";
import { cn } from "@/lib/utils";

// "Built for every genre" — a scroll-pinned showcase modelled on Fanvue's
// niche module. On desktop the section pins to the viewport and the centre
// column of genres highlights top→bottom as the user scrolls; the two flanking
// work-cards crossfade to match the active genre. After the last genre the pin
// releases and the page scrolls on. On touch / reduced-motion we drop the pin
// and fall back to a compact auto-rotating layout (see `pinned` below).

type Niche = {
  key: string; // matches a key in discovery.filters so labels stay localised
  left: CreatorPreviewItem;
  right: CreatorPreviewItem;
};

// Each work reuses a real creator nickname + seed from the existing rosters so
// the CreatorPreviewDialog resolves the right-hand creator card on click.
const NICHES: Niche[] = [
  {
    key: "Cinematic",
    left: { title: "Neon Rain", creator: "Marco Reyes", category: "Cinematic", seed: "neonrain" },
    right: { title: "Golden Core", creator: "Aria Song", category: "Cinematic", seed: "goldencore" },
  },
  {
    key: "Sci-Fi",
    left: { title: "Dune Metropolis", creator: "Sofia Okonkwo", category: "Sci-Fi", seed: "dune" },
    right: { title: "Cyber Ghost", creator: "Marco Reyes", category: "Sci-Fi", seed: "cyberghost" },
  },
  {
    key: "Character",
    left: { title: "Celestial Entity", creator: "Aria Song", category: "Character", seed: "celestial" },
    right: { title: "Techno Ascetic", creator: "Yuki Tanaka", category: "Character", seed: "techno" },
  },
  {
    key: "Architecture",
    left: { title: "Orbital Zen", creator: "Yuki Tanaka", category: "Architecture", seed: "orbital" },
    right: { title: "Biodome Alpha", creator: "Sofia Okonkwo", category: "Architecture", seed: "biodome" },
  },
  {
    key: "Nature",
    left: { title: "Aurora Crystal", creator: "Aria Song", category: "Nature", seed: "aurora" },
    right: { title: "Glassine Garden", creator: "Yuki Tanaka", category: "Nature", seed: "glassine" },
  },
];

// Scroll distance (in viewport heights) allotted to each genre's dwell zone.
const STEP_VH = 80;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function NicheShowcase() {
  const t = useT();
  const [active, setActive] = useState(0);
  const [preview, setPreview] = useState<CreatorPreviewItem | null>(null);
  // pinned = desktop + motion OK. Starts false so SSR and first client paint
  // both render the safe fallback; we upgrade after measuring on mount.
  const [pinned, setPinned] = useState(false);
  const [reduced, setReduced] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Pick the interaction mode from viewport width + motion preference.
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const decide = () => {
      setReduced(rm.matches);
      setPinned(wide.matches && !rm.matches);
    };
    decide();
    wide.addEventListener("change", decide);
    rm.addEventListener("change", decide);
    return () => {
      wide.removeEventListener("change", decide);
      rm.removeEventListener("change", decide);
    };
  }, []);

  // Pinned mode: translate scroll progress through the tall wrapper into the
  // active genre index. rAF-throttled, passive listener — pure read, no layout.
  useEffect(() => {
    if (!pinned) return;
    let raf = 0;
    const compute = () => {
      raf = 0;
      const el = wrapperRef.current;
      if (!el) return;
      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = clamp(-el.getBoundingClientRect().top / scrollable, 0, 1);
      setActive(clamp(Math.floor(progress * NICHES.length), 0, NICHES.length - 1));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    compute();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pinned]);

  // Fallback mode: gently auto-rotate, unless the user prefers reduced motion.
  useEffect(() => {
    if (pinned || reduced) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % NICHES.length), 2800);
    return () => window.clearInterval(id);
  }, [pinned, reduced]);

  // Centre-column click → smooth-scroll the window to that genre's dwell zone.
  const scrollToIndex = useCallback((i: number) => {
    const el = wrapperRef.current;
    if (!el) return;
    const scrollable = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + ((i + 0.5) / NICHES.length) * scrollable, behavior: "smooth" });
  }, []);

  const onSelectLabel = (i: number) => (pinned ? scrollToIndex(i) : setActive(i));
  const niche = NICHES[active];

  return (
    <section className="py-24 md:py-32">
      <div className="text-center max-w-2xl mx-auto">
        <div className="scroll-reveal flex justify-center">
          <SectionLabel>{t.landing.nicheLabel}</SectionLabel>
        </div>
        <h2
          className="scroll-reveal font-headline text-4xl md:text-5xl text-on-surface leading-tight mt-5"
          style={{ animationDelay: "90ms" }}
        >
          {t.landing.nicheTitle}
        </h2>
        <p
          className="scroll-reveal font-body text-on-surface-variant mt-4"
          style={{ animationDelay: "160ms" }}
        >
          {t.landing.nicheSubtitle}
        </p>
      </div>

      {pinned ? (
        // Tall track: each genre gets STEP_VH of scroll; the inner panel pins.
        <div ref={wrapperRef} style={{ height: `${NICHES.length * STEP_VH}vh` }} className="mt-8">
          <div className="sticky top-0 h-screen flex items-center">
            <div className="w-full grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-8 xl:gap-16 pt-[80px]">
              <div className="justify-self-start w-full max-w-[300px] -translate-y-10">
                <SideCard
                  key={`l-${active}`}
                  work={niche.left}
                  onOpen={() => setPreview(niche.left)}
                />
              </div>
              <CenterColumn active={active} onSelect={onSelectLabel} />
              <div className="justify-self-end w-full max-w-[300px] translate-y-10">
                <SideCard
                  key={`r-${active}`}
                  work={niche.right}
                  onOpen={() => setPreview(niche.right)}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Fallback: horizontal genre row + two stacked work-cards, auto-rotating.
        <div className="mt-10">
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 mb-7">
            {NICHES.map((n, i) => (
              <button
                key={n.key}
                type="button"
                onClick={() => onSelectLabel(i)}
                className={cn(
                  "font-headline leading-tight transition-colors duration-300",
                  i === active
                    ? "text-on-surface text-2xl"
                    : "text-on-surface-variant/40 text-xl hover:text-on-surface-variant"
                )}
              >
                {t.discovery.filters[n.key] ?? n.key}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            <SideCard key={`fl-${active}`} work={niche.left} onOpen={() => setPreview(niche.left)} />
            <SideCard
              key={`fr-${active}`}
              work={niche.right}
              onOpen={() => setPreview(niche.right)}
            />
          </div>
        </div>
      )}

      <CreatorPreviewDialog item={preview} onOpenChange={(o) => !o && setPreview(null)} />
    </section>
  );
}

function CenterColumn({
  active,
  onSelect,
}: {
  active: number;
  onSelect: (i: number) => void;
}) {
  const t = useT();
  return (
    <div className="flex flex-col items-center select-none">
      <ul className="flex flex-col items-center gap-1 md:gap-2">
        {NICHES.map((n, i) => {
          const on = i === active;
          return (
            <li key={n.key}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={on ? "true" : undefined}
                className={cn(
                  "font-headline leading-[1.05] transition-all duration-500 ease-out focus-visible:outline-none focus-visible:text-primary",
                  on
                    ? "text-on-surface text-5xl md:text-7xl"
                    : "text-on-surface-variant/25 hover:text-on-surface-variant/55 text-4xl md:text-6xl"
                )}
              >
                {t.discovery.filters[n.key] ?? n.key}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-7 font-mono text-[12px] tracking-[0.2em] text-on-surface-variant/80">
        {String(active + 1).padStart(2, "0")} / {String(NICHES.length).padStart(2, "0")}
      </div>
    </div>
  );
}

function SideCard({ work, onOpen }: { work: CreatorPreviewItem; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${work.title} — ${work.creator}`}
      className="group relative block w-full overflow-hidden rounded-3xl border border-outline-variant/30 bg-surface-container animate-fade-in transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="aspect-[3/4] relative">
        <Image
          src={`https://picsum.photos/seed/${work.seed}/600/800`}
          alt={work.title}
          fill
          sizes="(max-width: 1024px) 45vw, 24vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
        <div className="absolute inset-x-3 bottom-3 flex justify-start">
          <div className="flex items-center gap-2 rounded-full bg-black/45 backdrop-blur-md border border-white/15 px-2.5 py-1.5 max-w-full">
            <span className="grid place-items-center w-6 h-6 shrink-0 rounded-full bg-primary/90 text-on-primary text-[12px] font-bold">
              {initials(work.creator)}
            </span>
            <span className="font-label text-white text-[12px] tracking-wide truncate">
              {work.creator}
            </span>
            <span className="text-white/35">·</span>
            <span className="font-label text-white/70 text-[12px] truncate">{work.title}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
