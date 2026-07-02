"use client";
import { useEffect, useRef, useState } from "react";
import { useT } from "@/hooks/useT";
import styles from "./editorial.module.css";

// The homepage "agents in the room" demo: Marlow (backer's agent) and Wren
// (creator's agent) negotiate a deal turn-by-turn. The 4-turn exchange
// auto-types itself once scrolled into view, then the deal-agreed summary lights
// up — reusing the localized negotiation copy from t.landing.deal*. Styled in
// the editorial CSS-module language so it sits with the rest of the homepage.
export default function EditorialNegotiationCard() {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(0);

  const bubbles = [
    { who: "marlow" as const, role: t.landing.dealRoleMarlow, text: t.landing.dealMsg1 },
    { who: "wren" as const, role: t.landing.dealRoleWren, text: t.landing.dealMsg2 },
    { who: "marlow" as const, role: t.landing.dealRoleMarlow, text: t.landing.dealMsg3 },
    { who: "wren" as const, role: t.landing.dealRoleWren, text: t.landing.dealMsg4 },
  ];
  const total = bubbles.length;

  useEffect(() => {
    // Reduced-motion / no-IO: show the whole exchange immediately.
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (rm.matches) {
      setRevealed(total);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        for (let i = 0; i < total; i++) {
          setTimeout(() => setRevealed((r) => Math.max(r, i + 1)), 500 + i * 1100);
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const done = revealed >= total;

  return (
    <div ref={ref} className={styles.negCard}>
      <header className={styles.negHeader}>
        <span className={styles.negDots} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <div>
          <p className={styles.negSession}>{t.landing.dealSession}</p>
          <p className={styles.negMeta}>{t.landing.dealSessionMeta}</p>
        </div>
      </header>

      <div className={styles.negBody}>
        {bubbles.map((b, i) => (
          <div
            key={b.text}
            className={[
              styles.negBubble,
              b.who === "wren" ? styles.negBubbleWren : "",
              i < revealed ? styles.negShown : "",
            ].join(" ")}
          >
            <span className={styles.negAvatar} aria-hidden="true">
              {b.who === "marlow" ? "M" : "W"}
            </span>
            <div className={styles.negMsg}>
              <p className={styles.negRole}>{b.role}</p>
              <p className={styles.negText}>{b.text}</p>
            </div>
          </div>
        ))}
        {!done && (
          <div className={styles.negTyping} aria-hidden="true">
            <span className="typing-dot" />
            <span className="typing-dot" style={{ animationDelay: "0.15s" }} />
            <span className="typing-dot" style={{ animationDelay: "0.3s" }} />
          </div>
        )}
      </div>

      <footer className={[styles.negDeal, done ? styles.negDealDone : ""].join(" ")}>
        <b>✓ {t.landing.dealAgreed}</b>
        <span>{t.landing.dealAgreedMeta}</span>
      </footer>
    </div>
  );
}
