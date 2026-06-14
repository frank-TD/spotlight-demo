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
    : p.poster ?? `https://picsum.photos/seed/${p.seed}/600/900`;

// 3D coverflow for the featured slate: the centred card faces the viewer, the
// flanking cards rotate back into a perspective arc and dim. It loops forever —
// drag, the arrows, or the dots move the focus; clicking a side card brings it
// to centre, and clicking the centred card opens its project in a dialog (where
// the clip plays). Cards never autoplay in the carousel itself.
export default function FeaturedCoverflow({ projects }: { projects: Project[] }) {
  const t = useT();
  const n = projects.length;
  // `active` is an unbounded virtual index: the carousel loops forever, so there
  // is no first/last card to clamp against. The project shown in any slot k is
  // projects[k mod n]; scrolling past the end seamlessly continues from the start.
  const [active, setActive] = useState(Math.floor((n - 1) / 2));
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState(false);
  const [dialog, setDialog] = useState<Project | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startActive: number; w: number; value: number } | null>(null);
  const movedRef = useRef(false);
  const rafRef = useRef(0);
  const inViewRef = useRef(true);
  const imgPoolRef = useRef<HTMLImageElement[]>([]);

  // Cards sit on a concave arc (a cylinder seen from the front) so they abut
  // edge-to-edge with no overlap: the centred card faces the viewer and is the
  // furthest/sharpest, the flanking cards fold toward you, growing and tilting.
  // STEP (the angle between adjacent cards) is kept gentle so ~5 cards stay in
  // view; paired with cardW it lands the off=±2 cards at the 1280 content edges.
  const STEP = 0.43; // radians (~25°)
  const [cardW, setCardW] = useState(336);
  const radius = cardW / STEP; // edge-to-edge: arc length per card == card width
  useEffect(() => {
    const sync = () => {
      const w = window.innerWidth;
      setCardW(w < 480 ? 230 : w < 768 ? 288 : w < 1280 ? 336 : 384);
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

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

  // Wrap a virtual slot index into a real project (the infinite loop).
  const projAt = (k: number) => projects[((k % n) + n) % n];

  // ── drag (pointer) ──────────────────────────────────────────────────────
  const onMove = (e: PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 5) movedRef.current = true;
    // ~match the on-screen horizontal step between cards on the arc.
    d.value = -dx / (d.w * 0.85);
    // Coalesce pointermove into one state update per frame: a 120Hz pointer
    // otherwise fires several 7-card re-renders inside a single frame.
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        if (dragRef.current) setDrag(dragRef.current.value);
      });
    }
  };
  const onEnd = () => {
    const d = dragRef.current;
    if (!d) return;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    setActive(Math.round(d.startActive + d.value)); // unbounded — wraps freely
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

  // ── ambient auto-advance — one direction, forever (the loop has no end) ──
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setInterval(() => {
      if (hover || dragRef.current || dialog || document.hidden || !inViewRef.current) return;
      setActive((a) => a + 1);
    }, 3800);
    return () => window.clearInterval(id);
  }, [hover, dialog]);

  // Pause auto-advance when the carousel is off-screen, and warm every poster
  // the first time it nears the viewport so a card entering the window never
  // blocks on a network fetch or a synchronous decode (the first-loop hitch).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting && imgPoolRef.current.length === 0) {
          imgPoolRef.current = projects.map((p) => {
            const img = new Image();
            img.decoding = "async";
            img.src = posterOf(p);
            return img;
          });
        }
      },
      { rootMargin: "300px", threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [projects]);

  const onCardClick = (k: number, p: Project) => {
    if (movedRef.current) return; // it was a drag, not a tap
    if (k === Math.round(active)) setDialog(p);
    else setActive(k);
  };

  // Dot → jump to the nearest instance of project i on the ring.
  const goToProject = (i: number) => {
    const cur = ((active % n) + n) % n;
    let d = (i - cur) % n;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    setActive(active + d);
  };

  // Render a fixed window of virtual slots around the continuous position. The
  // outermost pair rides the edges at opacity 0, so cards fade in/out there and
  // the wrap is seamless — with a 7-slot window over n projects, the one repeat
  // is always the invisible edge pair, so no project is ever shown twice.
  const pos = active + drag;
  const center = Math.round(pos);
  const HALF = 3;
  const slots = Array.from({ length: HALF * 2 + 1 }, (_, idx) => center - HALF + idx);
  const activeIdx = ((Math.round(active) % n) + n) % n;

  return (
    <div className="relative mt-20 md:mt-28">
      {/* Break out of the section's px-6/px-12 padding so the arc spans the full
          1280 content area and the off=±2 cards reach its edges. */}
      <div className="-mx-6 md:-mx-12 overflow-x-clip">
        <div
          ref={wrapRef}
          className="relative h-[440px] sm:h-[500px] md:h-[580px] select-none touch-pan-y cursor-grab active:cursor-grabbing"
          style={{ perspective: "1700px" }}
          onPointerDown={onDown}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {slots.map((k) => {
            const p = projAt(k);
            const off = k - pos;
            const abs = Math.abs(off);
            const theta = off * STEP; // angle along the arc
            const tx = radius * Math.sin(theta); // px
            const tz = -radius * Math.cos(theta); // px — centre furthest back
            const ry = (-theta * 180) / Math.PI; // deg — each card stays tangent
            // ~5 cards stay legible; the 6th/7th slots ride the edges at op 0.
            const op = abs <= 2 ? 1 - abs * 0.1 : Math.max(0, (3 - abs) * 0.8);
            const isCenter = abs < 0.5;
            // Depth-of-field: the focused card is sharp, the folding sides soften
            // and dim. Kept shallow (≤2.5px) and never animated — a transitioned
            // blur re-rasterises every frame, which is the carousel's worst cost.
            const blur = dragging || abs < 0.5 ? 0 : Math.min(2.5, (abs - 0.5) * 1.5);
            const bright = abs < 0.5 ? 1 : Math.max(0.58, 1 - (abs - 0.5) * 0.26);
            return (
              <div
                key={k}
                data-cf-card
                role="button"
                tabIndex={op > 0.5 ? 0 : -1}
                aria-label={p.title}
                onClick={() => onCardClick(k, p)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (k === Math.round(active)) setDialog(p);
                    else setActive(k);
                  }
                }}
                className="absolute top-1/2 left-1/2 aspect-[2/3] outline-none"
                style={{
                  width: cardW,
                  transform: `translate(-50%,-50%) translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg)`,
                  opacity: op,
                  filter: `blur(${blur}px) brightness(${bright})`,
                  zIndex: 100 - Math.round(abs * 10),
                  willChange: "transform, opacity",
                  // Animate only compositor-friendly props; blur/brightness snap
                  // to their target (masked by the slide) rather than being
                  // re-rasterised for 600ms every step — the main perf win.
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
      </div>

      {/* Controls — arrows + dots (loop-aware, never disabled). */}
      <div className="flex items-center justify-center gap-6 mt-8">
        <CarouselArrow dir="prev" onClick={() => setActive(active - 1)} />
        <div className="flex items-center gap-2.5">
          {projects.map((p, i) => (
            <button
              key={p.id}
              type="button"
              aria-label={`Show ${p.title}`}
              onClick={() => goToProject(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === activeIdx
                  ? "w-7 bg-primary"
                  : "w-1.5 bg-on-surface-variant/40 hover:bg-on-surface-variant"
              )}
            />
          ))}
        </div>
        <CarouselArrow dir="next" onClick={() => setActive(active + 1)} />
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
        decoding="async"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,10,0.1)_0%,transparent_30%,rgba(8,8,10,0.4)_62%,rgba(8,8,10,0.93)_100%)] pointer-events-none" />

      <div className="absolute top-3.5 left-3.5">
        <StatusBadge status={project.status} small overlay />
      </div>

      {/* open affordance on the focused card */}
      <span
        className={cn(
          "absolute top-3.5 right-3.5 inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface/75 text-on-surface transition-opacity duration-300",
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
