"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, Maximize2 } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FEATURED_PROJECTS, VIDEO_CLIP_BY_ID } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";

type Project = (typeof FEATURED_PROJECTS)[number];

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const posterOf = (p: Project) =>
  p.clipId && VIDEO_CLIP_BY_ID[p.clipId]
    ? VIDEO_CLIP_BY_ID[p.clipId].poster
    : `https://picsum.photos/seed/${p.seed}/600/900`;

// 3D coverflow for the featured slate: the centered card faces the viewer, the
// flanking cards rotate back into a perspective arc and dim. Drag, the arrows,
// or the dots move the focus; clicking a side card brings it to centre, and
// clicking the centred card opens its project in a dialog (where the clip
// plays). Cards never autoplay in the carousel itself.
export default function FeaturedCoverflow({ projects }: { projects: Project[] }) {
  const t = useT();
  const n = projects.length;
  const [active, setActive] = useState(Math.floor((n - 1) / 2));
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState(false);
  const [dialog, setDialog] = useState<Project | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startActive: number; w: number; value: number } | null>(null);
  const movedRef = useRef(false);
  const dirRef = useRef(1);

  const meta = (p: Project) =>
    [
      t.homeV2.featMeta1,
      t.homeV2.featMeta2,
      t.homeV2.featMeta3,
      t.homeV2.featMeta4,
      t.homeV2.featMeta5,
      t.homeV2.featMeta6,
      t.homeV2.featMeta7,
    ][p.copyKey - 1] ?? "";

  const clamp = (v: number) => Math.max(0, Math.min(n - 1, v));

  // ── drag (pointer) ──────────────────────────────────────────────────────
  const onMove = (e: PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 5) movedRef.current = true;
    d.value = -dx / (d.w * 0.62);
    setDrag(d.value);
  };
  const onEnd = () => {
    const d = dragRef.current;
    if (!d) return;
    setActive(clamp(Math.round(d.startActive + d.value)));
    setDrag(0);
    setDragging(false);
    dragRef.current = null;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onEnd);
  };
  const onDown = (e: React.PointerEvent) => {
    movedRef.current = false;
    const card = wrapRef.current?.querySelector<HTMLElement>("[data-cf-card]");
    dragRef.current = {
      startX: e.clientX,
      startActive: active,
      w: card?.clientWidth ?? 280,
      value: 0,
    };
    setDragging(true);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
  };

  // ── ambient auto-advance, ping-ponging at the ends ──────────────────────
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setInterval(() => {
      if (hover || dragRef.current || dialog || document.hidden) return;
      setActive((a) => {
        let d = dirRef.current;
        if (a >= n - 1) d = -1;
        else if (a <= 0) d = 1;
        dirRef.current = d;
        return clamp(a + d);
      });
    }, 3800);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hover, dialog, n]);

  const onCardClick = (i: number, p: Project) => {
    if (movedRef.current) return; // it was a drag, not a tap
    if (i === active) setDialog(p);
    else setActive(i);
  };

  return (
    <div className="relative mt-20 md:mt-28">
      <div
        ref={wrapRef}
        className="relative h-[420px] sm:h-[480px] md:h-[540px] select-none touch-pan-y cursor-grab active:cursor-grabbing"
        style={{ perspective: "1700px" }}
        onPointerDown={onDown}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {projects.map((p, i) => {
          const off = i - active - drag;
          const abs = Math.abs(off);
          if (abs > 3.3) return null;
          const c = Math.max(-3, Math.min(3, off));
          const tx = c * 56; // % of card width
          const ry = -c * 34; // deg
          const tz = -abs * 140; // px
          const scale = Math.max(0.6, 1 - abs * 0.13);
          const op = Math.max(0, 1 - abs * 0.32);
          const isCenter = abs < 0.5;
          return (
            <div
              key={p.id}
              data-cf-card
              role="button"
              tabIndex={op > 0.4 ? 0 : -1}
              aria-label={p.title}
              onClick={() => onCardClick(i, p)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (i === active) setDialog(p);
                  else setActive(i);
                }
              }}
              className="absolute top-1/2 left-1/2 w-[210px] sm:w-[260px] md:w-[300px] aspect-[2/3] outline-none"
              style={{
                transform: `translate(-50%,-50%) translateX(${tx}%) translateZ(${tz}px) rotateY(${ry}deg) scale(${scale})`,
                opacity: op,
                zIndex: 100 - Math.round(abs * 10),
                transition: dragging
                  ? "none"
                  : "transform 600ms cubic-bezier(0.22,0.61,0.36,1), opacity 600ms",
                pointerEvents: op < 0.25 ? "none" : "auto",
              }}
            >
              <CoverCard project={p} center={isCenter} t={t} />
            </div>
          );
        })}
      </div>

      {/* Controls — arrows + dots. */}
      <div className="flex items-center justify-center gap-6 mt-8">
        <CarouselArrow dir="prev" onClick={() => setActive(clamp(active - 1))} disabled={active === 0} />
        <div className="flex items-center gap-2.5">
          {projects.map((p, i) => (
            <button
              key={p.id}
              type="button"
              aria-label={`Show ${p.title}`}
              onClick={() => setActive(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === active ? "w-7 bg-primary" : "w-1.5 bg-on-surface-variant/40 hover:bg-on-surface-variant"
              )}
            />
          ))}
        </div>
        <CarouselArrow
          dir="next"
          onClick={() => setActive(clamp(active + 1))}
          disabled={active === n - 1}
        />
      </div>

      <ProjectDialog
        project={dialog}
        meta={dialog ? meta(dialog) : ""}
        onOpenChange={(open) => !open && setDialog(null)}
      />
    </div>
  );
}

// One poster card — caption overlaid (per the brief). No autoplay: shows the
// clip's first-frame poster. The centred card surfaces an "open" affordance.
function CoverCard({
  project,
  center,
  t,
}: {
  project: Project;
  center: boolean;
  t: ReturnType<typeof useT>;
}) {
  return (
    <div
      className={cn(
        "relative w-full h-full rounded-lg overflow-hidden bg-surface-container-low ring-1 transition-[box-shadow,ring-color] duration-500",
        center
          ? "ring-primary/50 shadow-[0_40px_90px_rgba(0,0,0,0.55)]"
          : "ring-outline-variant/40 shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={posterOf(project)}
        alt={project.title}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,10,0.1)_0%,transparent_30%,rgba(8,8,10,0.4)_62%,rgba(8,8,10,0.93)_100%)] pointer-events-none" />

      <div className="absolute top-3.5 left-3.5">
        <StatusBadge status={project.status} small overlay />
      </div>

      {/* open affordance on the focused card */}
      <span
        className={cn(
          "absolute top-3.5 right-3.5 inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface/60 backdrop-blur-sm text-on-surface transition-opacity duration-300",
          center ? "opacity-90" : "opacity-0"
        )}
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </span>

      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="font-headline text-[26px] md:text-[30px] leading-tight text-on-surface">
          {project.title}
        </h3>
        <p className="font-label text-[12px] uppercase tracking-[0.18em] text-primary/95 mt-2.5">
          {t.homeV2.filmBy} {project.creator}
        </p>
      </div>
    </div>
  );
}

function CarouselArrow({
  dir,
  onClick,
  disabled,
}: {
  dir: "prev" | "next";
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Previous project" : "Next project"}
      className="w-11 h-11 rounded-full border border-outline-variant/60 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/60 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
    >
      {dir === "prev" ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
    </button>
  );
}

// Project preview dialog — opened from the focused card. The clip finally plays
// here (muted, looped); info + a single CTA into the marketplace alongside.
function ProjectDialog({
  project,
  meta,
  onOpenChange,
}: {
  project: Project | null;
  meta: string;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const clip = project?.clipId ? VIDEO_CLIP_BY_ID[project.clipId] : undefined;
  return (
    <Dialog open={!!project} onOpenChange={onOpenChange}>
      {project && (
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-surface-container-lowest ring-outline-variant/40">
          <DialogTitle className="sr-only">{project.title}</DialogTitle>
          <div className="grid sm:grid-cols-[5fr_4fr]">
            <div className="relative aspect-[3/4] sm:aspect-auto sm:min-h-[360px] bg-surface-container-low">
              {clip ? (
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  poster={clip.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src={clip.src} type="video/mp4" />
                </video>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={posterOf(project)}
                  alt={project.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(212,175,55,0.08),transparent_40%,rgba(8,8,10,0.4)_95%)] pointer-events-none" />
            </div>

            <div className="p-7 md:p-8 flex flex-col">
              <StatusBadge status={project.status} small />
              <h3 className="font-headline text-4xl text-on-surface leading-[1.05] mt-5">
                {project.title}
              </h3>
              <p className="font-label text-[12px] uppercase tracking-[0.2em] text-primary mt-3">
                {meta}
              </p>
              <p className="font-label text-[12px] uppercase tracking-[0.18em] text-on-surface mt-6 pt-5 border-t border-outline-variant/40">
                {t.homeV2.filmBy} {project.creator}
                {project.city ? ` · ${project.city}` : ""}
              </p>
              <Link
                href="/discovery"
                className="group inline-flex items-center gap-2.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-widest px-6 py-3.5 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-[0_8px_30px_rgba(212,175,55,0.25)] mt-auto self-start"
              >
                {project.status === "open" ? t.homeV2.backProject : t.homeV2.viewProject}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
