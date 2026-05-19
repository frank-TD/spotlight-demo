"use client";
import { useEffect, useState } from "react";

export default function MouseGlow() {
  const [pos, setPos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      aria-hidden
      className="fixed pointer-events-none z-0 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 hidden md:block"
      style={{
        left: pos.x,
        top: pos.y,
        background: "radial-gradient(circle, rgba(110,91,71,0.06) 0%, transparent 70%)",
      }}
    />
  );
}
