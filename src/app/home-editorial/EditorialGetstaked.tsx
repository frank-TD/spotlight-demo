"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./editorial.module.css";

// Top of the Week — the redesigned featured panel. A full-width trailer leads,
// a compact meta row follows, and a snap-scroll poster carousel closes it out;
// the poster nearest the centre scales up (Netflix-style) and clicking one
// swaps the feature. Respects reduced motion (still frame, no scaling).

type Film = {
  id: string;
  title: string;
  status: string;
  meta: string;
  logline: string;
  credit: string;
  seeking: string;
  clip?: string;
  still?: string;
  poster?: string;
};

const FILMS: Film[] = [
  {
    id: "stay-for-tonight",
    title: "Stay For Tonight",
    status: "Open to back",
    meta: "Drama · Feature Film · 98 Mins",
    logline:
      "One restless night in the city, two strangers make a pact to stay awake until sunrise — and decide whether the morning gets to change everything.",
    credit: "By Noa Vance · Berlin",
    seeking: "Seeking a backer · Est. ¥150K–520K",
    clip: "/videos/clips/hero-0.mp4",
    still: "/posters/stay-for-tonight.webp",
  },
  {
    id: "past-lives",
    title: "Past Lives",
    status: "Open to back",
    meta: "Romance · Feature Film · 106 Mins",
    logline:
      "Two childhood friends, separated as kids in Seoul, reunite two decades later — caught between the life they imagined and the one they chose.",
    credit: "By Aria Song · Seoul",
    seeking: "Seeking a backer · Est. ¥120K–480K",
    clip: "/videos/clips/hero-0b.mp4",
    poster: "/posters/past-lives.jpg",
  },
  {
    id: "the-bear",
    title: "The Bear",
    status: "In production",
    meta: "Drama · Series · 8 Episodes",
    logline:
      "A fine-dining chef comes home to run his late brother's chaotic sandwich shop — one impossible dinner service at a time.",
    credit: "By Marco Reyes · Chicago",
    seeking: "Commissioned · In production",
    clip: "/videos/clips/hero-1.mp4",
    poster: "/posters/the-bear.jpg",
  },
  {
    id: "die-my-love",
    title: "Die My Love",
    status: "Open to back",
    meta: "Drama · Feature Film · 118 Mins",
    logline:
      "A new mother slowly unravels in a remote farmhouse, where love curdles into something feral and unrecognisable.",
    credit: "By Yuki Tanaka · Montana",
    seeking: "Seeking a backer · Est. ¥200K–600K",
    clip: "/videos/clips/hero-2.mp4",
    poster: "/posters/die-my-love.jpg",
  },
  {
    id: "fish-bone",
    title: "Fish Bone",
    status: "Released",
    meta: "Drama · Short Film · 22 Mins",
    logline:
      "Two sisters gut the day's catch in a steaming back-kitchen, and old wounds rise to the surface with the tide.",
    credit: "By Sofia Okonkwo · Wenzhou",
    seeking: "Released · Streaming worldwide",
    clip: "/videos/clips/hero-3.mp4",
    poster: "/posters/fish-bone.jpg",
  },
];

export default function EditorialGetstaked() {
  const [active, setActive] = useState(0);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const film = FILMS[active];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionAllowed(!media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  // Netflix-style focus: the card nearest the rail's centre grows. Writes a
  // CSS var per card from a rAF-throttled scroll handler (no React state).
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || !motionAllowed) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = rail.scrollLeft + rail.clientWidth / 2;
      for (const el of Array.from(rail.children) as HTMLElement[]) {
        const centre = el.offsetLeft + el.offsetWidth / 2;
        const d = Math.min(1, Math.abs(centre - mid) / (rail.clientWidth * 0.55));
        el.style.setProperty("--tow-scale", (1.16 - d * 0.2).toFixed(3));
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    rail.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      rail.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [motionAllowed]);

  const pick = (i: number) => {
    setActive(i);
    const rail = railRef.current;
    const el = rail?.children[i] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <div>
      {/* Feature player */}
      <div className={`${styles.towMedia} scroll-reveal`}>
        {film.clip && motionAllowed ? (
          <video
            key={film.id}
            src={film.clip}
            preload="auto"
            autoPlay
            muted
            loop
            playsInline
            aria-label={`${film.title} trailer`}
          />
        ) : (
          <span
            className={styles.towStill}
            style={{ backgroundImage: `url(${film.poster ?? film.still})` }}
          />
        )}
      </div>

      {/* Meta row */}
      <div className={`${styles.towMetaRow} scroll-reveal`}>
        <h3>{film.title}</h3>
        <p>
          {film.meta} · {film.credit}
        </p>
        <Link href="/market" className={`${styles.btn} ${styles.btnOrange} ${styles.towBack}`}>
          {film.status === "Released" ? "Watch the film →" : "Back this project"}
        </Link>
      </div>

      {/* Poster carousel */}
      <div ref={railRef} className={`${styles.towCarousel} scroll-reveal`}>
        {FILMS.map((f, i) => (
          <button
            key={f.id}
            type="button"
            onClick={() => pick(i)}
            aria-label={`Show ${f.title}`}
            aria-pressed={i === active}
            className={i === active ? `${styles.towCard} ${styles.towCardOn}` : styles.towCard}
          >
            <span
              className={styles.towPoster}
              style={{ backgroundImage: `url(${f.poster ?? f.still})` }}
            />
            <span className={styles.towCardText}>
              <span className={styles.towCardTitle}>{f.title}</span>
              {f.meta}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
