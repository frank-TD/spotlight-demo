"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Search,
  PlusCircle,
  Wand2,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  ShieldCheck,
  CalendarDays,
  Repeat,
  Users,
  UserPlus,
  X,
  Check,
  Plus,
  Play,
} from "lucide-react";
import { useStore } from "@/lib/store";
import AppShell from "@/components/layout/AppShell";
import { CREATORS, NEEDS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

// Merged Marketplace + Discover — one role-driven surface. Backer: an
// inspiration feed of works/creators + "Post a Need". Creator: find work first
// (open briefs) then an inspiration feed, + "Start Creating" → AIGC Studio.
// Routing/nav merge is deferred; this is the combined design at /market.
// Copy is hardcoded English for this design pass; i18n is a follow-up.

type Role = "backer" | "creator";
type Aspect = "portrait" | "tall" | "landscape" | "wide" | "square";

const ASPECT: Record<Aspect, string> = {
  portrait: "aspect-[2/3]",
  tall: "aspect-[9/16]",
  landscape: "aspect-[3/2]",
  wide: "aspect-video",
  square: "aspect-square",
};

// Inspiration works — local cinematic stills so the feed renders reliably.
const WORKS: {
  id: number;
  title: string;
  creatorId: string;
  creator: string;
  category: string;
  poster: string;
  aspect: Aspect;
}[] = [
  { id: 1, title: "Aurora Crystal", creatorId: "u_creator_01", creator: "Aria Song", category: "Sci-Fi", poster: "/posters/aurora-crystal.jpg", aspect: "tall" },
  { id: 2, title: "Golden Core", creatorId: "u_creator_02", creator: "Marco Reyes", category: "Abstract", poster: "/posters/golden-core.jpg", aspect: "landscape" },
  { id: 3, title: "Neon Rain", creatorId: "u_creator_03", creator: "Yuki Tanaka", category: "Cinematic", poster: "/posters/neon-rain.jpg", aspect: "portrait" },
  { id: 4, title: "Paper Lanterns", creatorId: "u_creator_04", creator: "Sofia Okonkwo", category: "Nature", poster: "/posters/paper-lanterns.jpg", aspect: "portrait" },
  { id: 5, title: "Crimson Mirage", creatorId: "u_creator_05", creator: "Liang Wei", category: "Character", poster: "/posters/crimson-mirage.jpg", aspect: "wide" },
  { id: 6, title: "The Eighth Day", creatorId: "u_creator_06", creator: "Nadia Haddad", category: "Cinematic", poster: "/posters/the-eighth-day.jpg", aspect: "tall" },
  { id: 7, title: "Voidbound", creatorId: "u_creator_05", creator: "Liang Wei", category: "Sci-Fi", poster: "/posters/crimson-mirage.jpg", aspect: "portrait" },
  { id: 8, title: "Stellar Bloom", creatorId: "u_creator_03", creator: "Yuki Tanaka", category: "Nature", poster: "/posters/neon-rain.jpg", aspect: "landscape" },
  { id: 9, title: "Glass Garden", creatorId: "u_creator_01", creator: "Aria Song", category: "Architecture", poster: "/posters/aurora-crystal.jpg", aspect: "portrait" },
  { id: 10, title: "Maison Aurelle", creatorId: "u_creator_06", creator: "Nadia Haddad", category: "Abstract", poster: "/posters/the-eighth-day.jpg", aspect: "square" },
];

const CATEGORIES = ["All", "Cinematic", "Character", "Sci-Fi", "Abstract", "Nature", "Architecture"];
const BRIEF_FILTERS = ["All Briefs", "AI Film", "Brand Film", "Music Video", "Trailer", "High Budget"];

const COPY = {
  backer: {
    subtitle: "Discover creators through their work — then post your need.",
    searchPlaceholder: "Search creators, styles, tools...",
  },
  creator: {
    subtitle: "Find film projects ready for creators — and fuel your next one.",
    searchPlaceholder: "Search briefs, genres, budgets...",
  },
} as const;

type Creator = (typeof CREATORS)[number];
type Brief = (typeof NEEDS)[number];

const deadlineFor = (n: Brief) => {
  const d = new Date(n.publishedAt);
  d.setDate(d.getDate() + n.deliveryDays);
  return d.toISOString().slice(0, 10);
};

export default function MarketPage() {
  const { isLoggedIn, activeRole, switchRole, hasHydrated } = useStore();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [inviteFor, setInviteFor] = useState<Creator | null>(null);

  useEffect(() => {
    if (hasHydrated && !isLoggedIn) router.push("/login");
  }, [hasHydrated, isLoggedIn, router]);

  if (!hasHydrated || !isLoggedIn) return null;

  const isBacker = activeRole === "backer";
  const copy = isBacker ? COPY.backer : COPY.creator;
  const chips = isBacker ? CATEGORIES : BRIEF_FILTERS;
  const activeFilter = chips.includes(filter) ? filter : chips[0];

  const setRole = (r: Role) => {
    switchRole(r);
    setQuery("");
    setFilter(r === "backer" ? "All" : "All Briefs");
  };

  const q = query.trim().toLowerCase();
  const works = WORKS.filter((w) => {
    const mq = !q || w.title.toLowerCase().includes(q) || w.creator.toLowerCase().includes(q);
    const mf = isBacker
      ? activeFilter === "All" || w.category === activeFilter
      : true;
    return mq && mf;
  });
  const briefs = NEEDS.filter((n) => n.status === "open").filter((n) => {
    const mq =
      !q ||
      n.title.toLowerCase().includes(q) ||
      n.contentType.toLowerCase().includes(q) ||
      n.styles.some((s) => s.toLowerCase().includes(q));
    const mf =
      activeFilter === "AI Film"
        ? /narrative|short|film/i.test(n.contentType)
        : activeFilter === "Brand Film"
          ? /commercial|brand/i.test(n.contentType)
          : activeFilter === "Music Video"
            ? /music/i.test(n.contentType)
            : activeFilter === "Trailer"
              ? /trailer/i.test(n.contentType)
              : activeFilter === "High Budget"
                ? n.budget >= 5000
                : true;
    return mq && mf;
  });

  return (
    <AppShell>
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 pt-10 pb-24">
        {/* ── Hero header ────────────────────────────────────────────────── */}
        <header className="flex flex-col gap-7 mb-12">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="font-headline text-5xl md:text-6xl text-on-surface leading-[1.05]">
                Marketplace
              </h1>
              <p className="mt-3 font-headline italic text-lg md:text-xl text-on-surface-variant">
                {copy.subtitle}
              </p>
              {/* role primary CTA */}
              <div className="mt-6">
                {isBacker ? (
                  <Link
                    href="/market/needs/new"
                    className="group inline-flex items-center gap-2.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-widest px-8 py-4 rounded-full hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_8px_30px_rgba(212,175,55,0.25)]"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Post a Need
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <Link
                    href="/studio"
                    className="group inline-flex items-center gap-2.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-widest px-8 py-4 rounded-full hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_8px_30px_rgba(212,175,55,0.25)]"
                  >
                    <Wand2 className="w-4 h-4" />
                    Start Creating
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                )}
              </div>
            </div>
            <RoleSwitch role={activeRole} onChange={setRole} />
          </div>

          {/* search + filter chips */}
          <div className="flex flex-col gap-4">
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={copy.searchPlaceholder}
                aria-label={copy.searchPlaceholder}
                className="w-full pl-12 pr-4 py-3.5 rounded-full bg-surface-container-low border border-outline-variant/60 font-body text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar md:flex-wrap md:overflow-visible -mx-1 px-1">
              {chips.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    "shrink-0 font-label text-[11px] uppercase tracking-wider px-4 py-2 rounded-full border whitespace-nowrap transition-colors",
                    activeFilter === f
                      ? "bg-primary text-on-primary border-primary"
                      : "border-outline-variant/70 text-on-surface-variant hover:text-on-surface hover:border-primary/40"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        {isBacker ? (
          <section>
            <SectionHead label={`${works.length} works in the spotlight`} hint="Tap a still to open the creator" />
            {works.length ? (
              <Masonry works={works} onInvite={setInviteFor} showInvite />
            ) : (
              <Empty label="works" />
            )}
          </section>
        ) : (
          <div className="flex flex-col gap-16">
            {/* 1 — find work */}
            <section>
              <SectionHead label="Open briefs" hint={`${briefs.length} ready for creators`} />
              {briefs.length ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {briefs.map((n) => (
                    <BriefCard key={n.id} n={n} />
                  ))}
                </div>
              ) : (
                <Empty label="briefs" />
              )}
            </section>
            {/* 2 — inspiration */}
            <section>
              <SectionHead label="For inspiration" hint="What the network is making" />
              <Masonry works={WORKS} onInvite={setInviteFor} showInvite={false} />
            </section>
          </div>
        )}
      </div>

      {inviteFor && <InviteDialog creator={inviteFor} onClose={() => setInviteFor(null)} />}
    </AppShell>
  );
}

/* ── Layout bits ──────────────────────────────────────────────────────────── */

function SectionHead({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <h2 className="font-label text-[12px] uppercase tracking-[0.2em] text-on-surface-variant">{label}</h2>
      <span className="font-label text-[11px] uppercase tracking-wider text-on-surface-variant/60">{hint}</span>
    </div>
  );
}

function Masonry({
  works,
  onInvite,
  showInvite,
}: {
  works: typeof WORKS;
  onInvite: (c: Creator) => void;
  showInvite: boolean;
}) {
  return (
    <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
      {works.map((w) => (
        <WorkCard key={w.id} w={w} onInvite={onInvite} showInvite={showInvite} />
      ))}
    </div>
  );
}

function WorkCard({
  w,
  onInvite,
  showInvite,
}: {
  w: (typeof WORKS)[number];
  onInvite: (c: Creator) => void;
  showInvite: boolean;
}) {
  const creator = CREATORS.find((c) => c.id === w.creatorId);
  return (
    <div className="group break-inside-avoid mb-4 relative rounded-2xl overflow-hidden border border-outline-variant/30 bg-surface-container">
      <Link href={`/market/creators/${w.creatorId}`} className="block">
        <div className={cn("relative", ASPECT[w.aspect])}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={w.poster}
            alt={w.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,10,0.05)_0%,transparent_34%,rgba(8,8,10,0.5)_70%,rgba(8,8,10,0.92)_100%)]" />
          <span className="absolute top-3 left-3 inline-flex items-center justify-center w-9 h-9 rounded-full bg-[rgba(8,8,10,0.5)] backdrop-blur-sm border border-outline-variant/40 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-3.5 h-3.5 ml-0.5" fill="currentColor" />
          </span>
          <div className="absolute inset-x-0 bottom-0 p-4">
            <span className="font-label text-[9px] uppercase tracking-widest text-on-surface/70">
              {w.category}
            </span>
            <p className="font-headline italic text-on-surface text-[17px] leading-tight mt-0.5">
              {w.title}
            </p>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface/65 mt-1">
              by {w.creator}
            </p>
          </div>
        </div>
      </Link>
      {showInvite && creator && (
        <button
          type="button"
          onClick={() => onInvite(creator)}
          className="absolute top-3 right-3 inline-flex items-center gap-1.5 font-label text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full bg-[rgba(8,8,10,0.5)] backdrop-blur-sm border border-primary/40 text-primary opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-on-primary transition-all"
        >
          <UserPlus className="w-3 h-3" />
          Invite
        </button>
      )}
    </div>
  );
}

function RoleSwitch({ role, onChange }: { role: Role; onChange: (r: Role) => void }) {
  const segs: [Role, string, string][] = [
    ["backer", "Hire Creators", "Backer"],
    ["creator", "Find Projects", "Creator"],
  ];
  return (
    <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl border border-outline-variant/40 bg-surface-container-low w-full lg:w-auto shrink-0">
      {segs.map(([r, main, cap]) => {
        const active = role === r;
        return (
          <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            className={cn(
              "flex flex-col items-center lg:items-start px-6 md:px-8 py-3 rounded-xl transition-colors",
              active
                ? "bg-primary text-on-primary shadow-[0_8px_24px_rgba(212,175,55,0.22)]"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <span className="font-headline text-[19px] leading-none">{main}</span>
            <span
              className={cn(
                "mt-1.5 font-label text-[10px] uppercase tracking-[0.2em]",
                active ? "text-on-primary/80" : "text-on-surface-variant/70"
              )}
            >
              {cap}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function BriefCard({ n }: { n: Brief }) {
  return (
    <article className="group flex flex-col rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6 transition-colors hover:border-primary/40">
      <div className="flex items-center justify-between gap-3">
        <span className="font-label text-[10px] uppercase tracking-widest bg-primary-container text-on-primary-container px-3 py-1 rounded-full">
          {n.contentType}
        </span>
        <span className="inline-flex items-center gap-1.5 font-label text-[11px] uppercase tracking-wider text-on-surface-variant">
          <Users className="w-3.5 h-3.5" />
          {n.bids} bids
        </span>
      </div>

      <h3 className="mt-4 font-headline text-[22px] md:text-[24px] text-on-surface leading-snug line-clamp-2">
        {n.title}
      </h3>

      <div className="mt-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center font-label text-[10px] text-on-surface-variant">
          {n.backerAvatar}
        </span>
        <span className="font-label text-[11px] uppercase tracking-wider text-on-surface-variant">
          {n.backerNickname}
        </span>
        <BadgeCheck className="w-3.5 h-3.5 text-primary" />
        <span className="font-label text-[10px] uppercase tracking-wider text-primary">Verified</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-outline-variant/30 pt-5">
        <Meta label="Budget" value={`¥${n.budget.toLocaleString()}`} gold />
        <Meta label="Deadline" value={deadlineFor(n)} icon={CalendarDays} />
        <Meta label="Revisions" value={`${n.modifyLimit} revisions`} icon={Repeat} />
        <Meta label="Escrow" value="Protected" icon={ShieldCheck} />
      </div>

      <div className="mt-auto pt-6 flex items-center gap-2.5">
        <Link
          href={`/market/needs/${n.id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-primary text-on-primary font-label text-[11px] uppercase tracking-widest px-4 py-2.5 rounded-full hover:opacity-90 transition-opacity"
        >
          View Brief
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
        <button
          type="button"
          onClick={() => toast.success(`Application started · ${n.title}`)}
          className="inline-flex items-center gap-1.5 border border-primary/50 text-on-primary-container font-label text-[11px] uppercase tracking-widest px-5 py-2.5 rounded-full hover:bg-primary/10 transition-colors"
        >
          Apply
        </button>
      </div>
    </article>
  );
}

function Meta({
  label,
  value,
  icon: Icon,
  gold,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  gold?: boolean;
}) {
  return (
    <div>
      <span className="block font-label text-[10px] uppercase tracking-widest text-on-surface-variant/70">
        {label}
      </span>
      <span
        className={cn(
          "mt-1 flex items-center gap-1.5 font-label text-[12px] uppercase tracking-wide",
          gold ? "text-primary" : "text-on-surface"
        )}
      >
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {value}
      </span>
    </div>
  );
}

// Invite flow — pick which of the backer's open briefs to invite the creator to.
function InviteDialog({ creator, onClose }: { creator: Creator; onClose: () => void }) {
  const myNeeds = NEEDS.filter((n) => n.backerId === "u_backer_01" && n.status === "open");
  const [sel, setSel] = useState(myNeeds[0]?.id ?? "");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const send = () => {
    const n = myNeeds.find((x) => x.id === sel);
    toast.success(n ? `Invited ${creator.nickname} to “${n.title}”` : `Invited ${creator.nickname}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(8,8,10,0.72)] backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-6 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-headline text-[22px] text-on-surface">Invite {creator.nickname}</h3>
            <p className="mt-1 font-body text-sm text-on-surface-variant">
              Choose a brief to invite them to.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 w-9 h-9 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-primary/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 space-y-2">
          {myNeeds.length === 0 ? (
            <p className="font-body text-sm text-on-surface-variant py-4">You have no open briefs yet.</p>
          ) : (
            myNeeds.map((n) => {
              const active = sel === n.id;
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setSel(n.id)}
                  className={cn(
                    "w-full text-left rounded-xl border p-4 transition-colors",
                    active
                      ? "border-primary bg-primary/[0.06]"
                      : "border-outline-variant/40 hover:border-primary/40"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-headline text-[15px] text-on-surface line-clamp-1">
                      {n.title}
                    </span>
                    {active && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </div>
                  <div className="mt-1 font-label text-[10px] uppercase tracking-wider text-on-surface-variant">
                    ¥{n.budget.toLocaleString()} · {n.bids} bids
                  </div>
                </button>
              );
            })
          )}
          <Link
            href="/market/needs/new"
            className="flex items-center gap-2 rounded-xl border border-dashed border-outline-variant/50 p-4 font-label text-[11px] uppercase tracking-widest text-on-surface-variant hover:text-primary hover:border-primary/40 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Post a new need
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant px-5 py-2.5 rounded-full border border-outline-variant/50 hover:text-on-surface transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={send}
            disabled={!sel}
            className="inline-flex items-center gap-1.5 bg-primary text-on-primary font-label text-[11px] uppercase tracking-widest px-6 py-2.5 rounded-full hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Send invite
          </button>
        </div>
      </div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <p className="text-center py-24 font-body text-on-surface-variant">No {label} match your search.</p>
  );
}
