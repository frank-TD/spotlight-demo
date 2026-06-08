"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Counts from 0 (or a `from` value) up to `value` on mount.
 * Re-runs if `value` changes, so balances and stats animate when they update.
 */
export default function CountUp({
  value,
  from = 0,
  duration = 1200,
  format = (n: number) => n.toLocaleString(),
}: {
  value: number;
  from?: number;
  duration?: number;
  format?: (n: number) => string;
}) {
  const [display, setDisplay] = useState(from);
  const prevRef = useRef(from);

  useEffect(() => {
    const start = prevRef.current;
    const target = value;
    if (start === target) {
      setDisplay(target);
      return;
    }
    const startTime = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - t) ** 3;
      const next = start + (target - start) * eased;
      setDisplay(Number.isInteger(target) ? Math.round(next) : Number(next.toFixed(1)));
      if (t < 1) raf = requestAnimationFrame(tick);
      else prevRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{format(display)}</>;
}
