"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./editorial.module.css";
import CountUp from "@/components/common/CountUp";
import { EDITORIAL_RELEASES } from "@/lib/mock-data";

// Editorial Distribution "report" — proof that films shipped: a lead released
// poster + its post-release metrics counting up, with a thumbnail switcher for
// the other releases. Reuses the live homepage's RELEASED_SHOWCASE data so the
// titles, posters and figures stay consistent. Metrics count up once the panel
// scrolls into view and re-count when you switch films.

export default function EditorialDistribution() {
  const films = EDITORIAL_RELEASES;
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const film = films[active];

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className={styles.relShowcase} ref={rootRef}>
      <div className={styles.relHead}>
        <span>Released through Spotlight</span>
        <span className={styles.relReport}>Distribution Report</span>
      </div>

      <div className={styles.relMain}>
        <figure
          className={styles.relPoster}
          style={{ backgroundImage: `url(${film.poster})` }}
          aria-label={`${film.title} poster`}
        >
          <span className={styles.relBadge}>Released · {film.releaseDate}</span>
        </figure>

        <div className={styles.relMeta}>
          <h3>{film.title}</h3>
          <p className={styles.relType}>{film.type}</p>
          <div className={styles.relMetrics}>
            {film.metrics.map((m) => (
              <div key={m.label} className={styles.relMetric}>
                <b>
                  {inView ? (
                    <CountUp
                      key={`${active}-${m.label}`}
                      value={m.value}
                      duration={1300}
                      format={(n) => n.toFixed(m.decimals)}
                    />
                  ) : (
                    "0"
                  )}
                  <em>{m.suffix}</em>
                </b>
                <span>{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.relSwitch}>
        {films.map((f, i) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show ${f.title}`}
            aria-pressed={i === active}
            className={i === active ? styles.relThumbOn : styles.relThumb}
          >
            <span className={styles.relThumbImg} style={{ backgroundImage: `url(${f.poster})` }} />
            <span className={styles.relThumbDate}>{f.releaseDate}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
