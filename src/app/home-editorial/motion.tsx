"use client";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import styles from "./editorial.module.css";

// Client-side motion helpers for the editorial homepage — the editorial-native
// adaptations of the live homepage's effects (orange accents, no WebGL):
// a cursor-following orange border glow for the agent deal cards, a draw-in
// pipeline line for the steps, and an accordion FAQ. Scroll-reveal, count-up
// and fade-up entrances are handled with shared utilities / CSS classes.

// Feed the conic border glow: which edge to light (--cursor-angle) and how
// close the cursor is to it (--edge-proximity). Same math as the live agent card.
function setBorderGlow(el: HTMLElement, clientX: number, clientY: number) {
  const rect = el.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const dx = clientX - rect.left - cx;
  const dy = clientY - rect.top - cy;
  const kx = dx !== 0 ? cx / Math.abs(dx) : Infinity;
  const ky = dy !== 0 ? cy / Math.abs(dy) : Infinity;
  const edge = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  if (deg < 0) deg += 360;
  el.style.setProperty("--edge-proximity", (edge * 100).toFixed(2));
  el.style.setProperty("--cursor-angle", `${deg.toFixed(2)}deg`);
}

export function GlowDealCard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  return (
    <article
      ref={ref}
      onPointerMove={(e) => ref.current && setBorderGlow(ref.current, e.clientX, e.clientY)}
      className={`${styles.agentCard} border-glow-card`}
      style={{ "--glow-color": "#f25a05" } as CSSProperties}
    >
      <span className="border-glow" aria-hidden="true" />
      {children}
    </article>
  );
}

// The pipeline line that draws left→right when the steps scroll into view.
export function DrawLine() {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <span
      ref={ref}
      className={styles.stepsLine}
      style={{ transform: inView ? "scaleX(1)" : "scaleX(0)" }}
      aria-hidden="true"
    />
  );
}

// Accordion FAQ — one row open at a time, with a rotating + and a smooth
// 0fr→1fr height transition (no measuring).
export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className={styles.faqList}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className={styles.faqRow}>
            <button
              type="button"
              className={styles.faqQ}
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? -1 : i)}
            >
              <span>{item.q}</span>
              <i className={isOpen ? styles.faqIconOpen : styles.faqIcon}>+</i>
            </button>
            <div className={`${styles.faqBody} ${isOpen ? styles.faqBodyOpen : ""}`}>
              <div className={styles.faqBodyInner}>
                <p className={styles.faqA}>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
