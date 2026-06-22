"use client";
import { useEffect, useState } from "react";
import styles from "./editorial.module.css";
import MobileHeroVideo from "@/components/home/MobileHeroVideo";
import { HERO_VIDEO_CLIPS } from "@/lib/mock-data";

// Editorial hero background — the same three-clip cross-fade reel as the live
// homepage, behind the editorial scrim + grid. Falls back to the original
// cinematic still when the user prefers reduced motion. The dark scrim renders
// on top (later sibling) so the headline stays legible over the footage.
const STILL = "/posters/aurora-crystal.jpg";

export default function EditorialHeroVideo() {
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionAllowed(!media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const sync = () => setPageVisible(document.visibilityState === "visible");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return (
    <div className={styles.heroPhoto} aria-hidden="true">
      {motionAllowed ? (
        <MobileHeroVideo clips={HERO_VIDEO_CLIPS} playing={pageVisible} />
      ) : (
        <div className={styles.heroPhotoStill} style={{ backgroundImage: `url(${STILL})` }} />
      )}
      <div className={styles.heroScrim} />
    </div>
  );
}
