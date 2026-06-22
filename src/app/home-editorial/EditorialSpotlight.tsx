"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./editorial.module.css";

// In the Spotlight — an interactive featured panel. The lead film "Stay For
// Tonight" plays a mock-up trailer (a hero clip); the rest show their posters.
// The thumbnail strip below switches the featured film (media + info). A
// "Discover More" CTA closes it out. Respects reduced motion (still frame).

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
    meta: "Drama · Feature Film · 98 min",
    logline:
      "One restless night in the city, two strangers make a pact to stay awake until sunrise — and decide whether the morning gets to change everything.",
    credit: "A film by Noa Vance · Berlin",
    seeking: "Seeking a backer · Est. ¥150K–520K",
    clip: "/videos/clips/hero-1.mp4",
    still: "/posters/stay-for-tonight.webp",
  },
  {
    id: "past-lives",
    title: "Past Lives",
    status: "Open to back",
    meta: "Romance · Feature Film · 106 min",
    logline:
      "Two childhood friends, separated as kids in Seoul, reunite two decades later — caught between the life they imagined and the one they chose.",
    credit: "A film by Aria Song · Seoul",
    seeking: "Seeking a backer · Est. ¥120K–480K",
    poster: "/posters/past-lives.jpg",
  },
  {
    id: "the-bear",
    title: "The Bear",
    status: "In production",
    meta: "Drama · Series · 8 Episodes",
    logline:
      "A fine-dining chef comes home to run his late brother's chaotic sandwich shop — one impossible dinner service at a time.",
    credit: "A film by Marco Reyes · Chicago",
    seeking: "Commissioned · In production",
    poster: "/posters/the-bear.jpg",
  },
  {
    id: "die-my-love",
    title: "Die My Love",
    status: "Open to back",
    meta: "Drama · Feature Film · 118 min",
    logline:
      "A new mother slowly unravels in a remote farmhouse, where love curdles into something feral and unrecognisable.",
    credit: "A film by Yuki Tanaka · Montana",
    seeking: "Seeking a backer · Est. ¥200K–600K",
    poster: "/posters/die-my-love.jpg",
  },
  {
    id: "fish-bone",
    title: "Fish Bone",
    status: "Released",
    meta: "Drama · Short Film · 22 min",
    logline:
      "Two sisters gut the day's catch in a steaming back-kitchen, and old wounds rise to the surface with the tide.",
    credit: "A film by Sofia Okonkwo · Wenzhou",
    seeking: "Released · Streaming worldwide",
    poster: "/posters/fish-bone.jpg",
  },
];

export default function EditorialSpotlight() {
  const [active, setActive] = useState(0);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const film = FILMS[active];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionAllowed(!media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return (
    <div>
      <div className={`${styles.leadSpread} scroll-reveal`}>
        <div className={styles.leadMedia}>
          {film.clip && motionAllowed ? (
            <video
              key={film.id}
              className={styles.leadVideo}
              src={film.clip}
              poster={film.still}
              autoPlay
              muted
              loop
              playsInline
              aria-label={`${film.title} trailer`}
            />
          ) : (
            <span
              className={styles.leadImg}
              style={{ backgroundImage: `url(${film.poster ?? film.still})` }}
            />
          )}
        </div>

        <div className={styles.leadInfo}>
          <span className={styles.statusPill}>{film.status}</span>
          <h3>{film.title}</h3>
          <p className={styles.leadMeta}>{film.meta}</p>
          <p className={styles.leadLog}>{film.logline}</p>
          <div className={styles.leadCredit}>
            <b>{film.credit}</b>
            <span>{film.seeking}</span>
          </div>
          <Link href="/market" className={`${styles.btn} ${styles.btnOrange}`}>
            {film.status === "Released" ? "Watch the film →" : "Back this project →"}
          </Link>
        </div>
      </div>

      <div className={styles.spotSwitch}>
        {FILMS.map((f, i) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show ${f.title}`}
            aria-pressed={i === active}
            className={i === active ? styles.spotThumbOn : styles.spotThumb}
          >
            <span
              className={styles.spotThumbImg}
              style={{ backgroundImage: `url(${f.poster ?? f.still})` }}
            >
              {f.clip ? (
                <span className={styles.spotPlay}>
                  <span>▶</span>
                </span>
              ) : null}
            </span>
          </button>
        ))}

        <Link href="/market" className={`${styles.btn} ${styles.btnGhost} ${styles.discoverBtn}`}>
          Discover More →
        </Link>
      </div>
    </div>
  );
}
