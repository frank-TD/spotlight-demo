"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./editorial.module.css";

// Ghost cursor — the movement section's easter egg. A little ghost trails the
// pointer inside the section (lerped, so it floats a beat behind) and whispers
// "Boo!" when it catches up. Fine-pointer devices only; hidden entirely under
// prefers-reduced-motion (CSS) and never intercepts clicks.

export default function EditorialGhost() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const wrap = wrapRef.current?.parentElement; // the section
    const ghost = ghostRef.current;
    if (!wrap || !ghost) return;

    let raf = 0;
    let tx = 0, ty = 0; // target (pointer, section-local)
    let cx = 0, cy = 0; // current (lerped)
    let inside = false;

    const step = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      ghost.style.transform = `translate(${cx - 23}px, ${cy - 27}px)`;
      if (inside) raf = requestAnimationFrame(step);
    };
    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (!inside) {
        inside = true;
        cx = tx;
        cy = ty + 60;
        setOn(true);
        raf = requestAnimationFrame(step);
      }
    };
    const onLeave = () => {
      inside = false;
      setOn(false);
      cancelAnimationFrame(raf);
    };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    return () => {
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} aria-hidden="true">
      <div ref={ghostRef} className={`${styles.ghost} ${on ? styles.ghostOn : ""}`}>
        <svg viewBox="0 0 46 54">
          <path
            d="M23 2C11 2 4 11 4 23v25l6-5 6 5 7-5 7 5 6-5 6 5V23C42 11 35 2 23 2Z"
            fill="rgba(255,255,255,0.92)"
          />
          <circle cx="16" cy="22" r="3.4" fill="#0a1f1b" />
          <circle cx="30" cy="22" r="3.4" fill="#0a1f1b" />
          <path d="M18 32c3 2.6 7 2.6 10 0" stroke="#0a1f1b" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        </svg>
        <span className={styles.ghostBoo}>Boo!</span>
      </div>
    </div>
  );
}
