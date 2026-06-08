"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Play, Pause } from "lucide-react";
import SectionLabel from "./SectionLabel";
import { useT } from "@/hooks/useT";
import { cn } from "@/lib/utils";

// Reuse the optimized hero clips as the showcase footage (the only real video
// assets we ship). Each card embeds its own <video> and plays inline on click.
const SHOWCASE_CLIPS = [
  "/videos/hero/optimized/16079919_hero.mp4",
  "/videos/hero/optimized/16022209_hero.mp4",
  "/videos/hero/optimized/16107702_hero.mp4",
  "/videos/hero/optimized/16049416_hero.mp4",
];

export default function AigcStudioShowcase() {
  const t = useT();
  const router = useRouter();

  const cards = [
    {
      title: t.landing.aigcCard1Title,
      tags: t.landing.aigcCard1Tags,
      sub: t.landing.aigcCard1Sub,
      seed: "glass-strawberry",
    },
    {
      title: t.landing.aigcCard2Title,
      tags: t.landing.aigcCard2Tags,
      sub: t.landing.aigcCard2Sub,
      seed: "golden-hour-coast",
    },
    {
      title: t.landing.aigcCard3Title,
      tags: t.landing.aigcCard3Tags,
      sub: t.landing.aigcCard3Sub,
      seed: "saturn-field",
    },
    {
      title: t.landing.aigcCard4Title,
      tags: t.landing.aigcCard4Tags,
      sub: t.landing.aigcCard4Sub,
      seed: "kaiju-city",
    },
  ];

  return (
    <section className="py-24 md:py-32">
      <div className="text-center space-y-4 mb-16">
        <div className="scroll-reveal flex justify-center">
          <SectionLabel>{t.landing.aigcLabel}</SectionLabel>
        </div>
        <h2
          className="scroll-reveal font-headline text-4xl md:text-6xl text-on-surface leading-[1.05]"
          style={{ animationDelay: "90ms" }}
        >
          {t.landing.aigcTitle1}
          <br />
          <span className="italic text-primary">{t.landing.aigcTitle2}</span>
        </h2>
        <p
          className="scroll-reveal font-body text-on-surface-variant max-w-2xl mx-auto leading-relaxed"
          style={{ animationDelay: "170ms" }}
        >
          {t.landing.aigcSub}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {cards.map((c, i) => (
          <ShowcaseCard
            key={c.seed}
            card={c}
            clip={SHOWCASE_CLIPS[i % SHOWCASE_CLIPS.length]}
            delayMs={i * 90}
          />
        ))}
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={() => router.push("/discovery/workspace")}
          className="group inline-flex items-center gap-2.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-widest px-7 py-4 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-[0_8px_30px_rgba(212,175,55,0.25)]"
        >
          {t.landing.aigcCta}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </section>
  );
}

function ShowcaseCard({
  card,
  clip,
  delayMs,
}: {
  card: { title: string; tags: string; sub: string; seed: string };
  clip: string;
  delayMs: number;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      setStarted(true);
      void video.play();
    } else {
      video.pause();
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`${playing ? "Pause" : "Play"} ${card.title}`}
      className="scroll-reveal group relative rounded-2xl overflow-hidden aspect-[3/4] bg-surface-container border border-outline-variant/40 text-left hover:border-primary/40 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {/* Poster image stays mounted until playback starts, so the grid paints
          instantly and we only fetch video on demand. */}
      {!started && (
        <Image
          src={`https://picsum.photos/seed/${card.seed}/600/800`}
          alt={card.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
        />
      )}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        playsInline
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src={clip} type="video/mp4" />
        <track kind="captions" />
      </video>

      <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

      {/* Play / pause affordance — pause icon only shows on hover while playing
          so it doesn't cover the footage. */}
      <span
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary/90 text-on-primary shadow-2xl flex items-center justify-center transition-all",
          playing ? "opacity-0 group-hover:opacity-100" : "opacity-100 group-hover:scale-110"
        )}
      >
        {playing ? (
          <Pause className="w-6 h-6" fill="currentColor" />
        ) : (
          <Play className="w-6 h-6 ml-1" fill="currentColor" />
        )}
      </span>

      {/* Caption fades out during playback to keep the frame clean. */}
      <span
        className={cn(
          "absolute inset-x-0 bottom-0 p-4 flex flex-col transition-opacity",
          playing ? "opacity-0" : "opacity-100"
        )}
      >
        <span className="font-label text-[10px] uppercase tracking-[0.22em] text-primary/80 mb-1.5">
          {card.tags}
        </span>
        <span className="font-headline italic text-xl text-white leading-tight">{card.title}</span>
        <span className="font-body text-[12px] text-white/65 mt-1.5">{card.sub}</span>
      </span>
    </button>
  );
}
