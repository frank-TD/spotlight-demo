"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Search,
  PlusCircle,
  FolderOpen,
  Star,
  BadgeCheck,
  ShieldCheck,
  CalendarDays,
  Repeat,
  Users,
  UserPlus,
  ArrowUpRight,
  X,
  Check,
  Plus,
} from "lucide-react";
import { useStore } from "@/lib/store";
import AppShell from "@/components/layout/AppShell";
import { CREATORS, NEEDS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

// The Marketplace is Spotlight's trading floor — a single, role-driven discovery
// surface. Backers find creators (and post a need); creators find open briefs
// (and track applications). Personal workflow — active orders, posted needs,
// my projects — lives in My Projects / Orders, not here. Copy is intentionally
// hardcoded English for this design pass; i18n wiring is a follow-up.

type Role = "backer" | "creator";

const COPY = {
  backer: {
    subtitle: "Find creators for your next AI-powered film.",
    searchPlaceholder: "Search creators, styles, tools...",
  },
  creator: {
    subtitle: "Find film projects ready for creators.",
    searchPlaceholder: "Search briefs, genres, budgets...",
  },
} as const;

const BACKER_FILTERS = [
  "All",
  "AI Short Film",
  "Trailer",
  "Music Video",
  "Brand Film",
  "Animation",
  "Available Now",
  "Top Rated",
  "Under ¥5,000",
];
const CREATOR_FILTERS = [
  "All Briefs",
  "AI Film",
  "Brand Film",
  "Music Video",
  "Trailer",
  "High Budget",
  "Ending Soon",
  "Escrow Protected",
  "Remote",
];

// Availability is a marketplace-only signal; map it deterministically per creator.
const AVAILABILITY: Record<string, { label: string; open: boolean }> = {
  u_creator_01: { label: "Available this week", open: true },
  u_creator_02: { label: "Booked till next week", open: false },
  u_creator_03: { label: "Available now", open: true },
  u_creator_04: { label: "Taking briefs", open: true },
  u_creator_05: { label: "Available this week", open: true },
  u_creator_06: { label: "Booked till next week", open: false },
};
const availabilityFor = (id: string) => AVAILABILITY[id] ?? { label: "Available", open: true };

// Reel still per creator — the card's hero. Uses the local cinematic poster
// assets so the marketplace reads as a film-talent floor (and loads offline).
const REEL: Record<string, string> = {
  u_creator_01: "/posters/aurora-crystal.jpg",
  u_creator_02: "/posters/golden-core.jpg",
  u_creator_03: "/posters/neon-rain.jpg",
  u_creator_04: "/posters/paper-lanterns.jpg",
  u_creator_05: "/posters/crimson-mirage.jpg",
  u_creator_06: "/posters/the-eighth-day.jpg",
};
const reelFor = (id: string) => REEL[id] ?? "/posters/golden-core.jpg";

type Creator = (typeof CREATORS)[number];
type Brief = (typeof NEEDS)[number];

const isVerified = (c: Creator) => c.disputes === 0 && c.completion >= 96;

const deadlineFor = (n: Brief) => {
  const d = new Date(n.publishedAt);
  d.setDate(d.getDate() + n.deliveryDays);
  return d.toISOString().slice(0, 10);
};
const daysLeft = (n: Brief) =>
  Math.round((new Date(deadlineFor(n)).getTime() - Date.now()) / 86_400_000);

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
  const filters = isBacker ? BACKER_FILTERS : CREATOR_FILTERS;
  // Role drives the page; if the held filter isn't valid for the active role
  // (e.g. after a role switch or hydration), fall back to that role's default.
  const activeFilter = filters.includes(filter) ? filter : filters[0];

  // Switching role is a full context change — reset the query and filter.
  const setRole = (r: Role) => {
    switchRole(r);
    setQuery("");
    setFilter(r === "backer" ? "All" : "All Briefs");
  };

  const creators = filterCreators(query, activeFilter);
  const briefs = filterBriefs(query, activeFilter);
  const count = isBacker ? creators.length : briefs.length;

  return (
    <AppShell>
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 pt-10 pb-20">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="flex flex-col gap-8 mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="font-headline text-headline-lg text-on-surface">Marketplace</h1>
              <p className="mt-2 font-body text-on-surface-variant">{copy.subtitle}</p>
            </div>
            <RoleSwitch role={activeRole} onChange={setRole} />
          </div>

          {/* search + single primary action */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={copy.searchPlaceholder}
                aria-label={copy.searchPlaceholder}
                className="w-full pl-12 pr-4 py-3.5 rounded-full bg-surface-container-low border border-outline-variant/60 font-body text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            {isBacker ? (
              <Link
                href="/market/needs/new"
                className="shrink-0 inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-label text-label-md uppercase tracking-widest px-7 py-3.5 rounded-full hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_8px_30px_rgba(212,175,55,0.25)]"
              >
                <PlusCircle className="w-4 h-4" />
                Post a Need
              </Link>
            ) : (
              <Link
                href="/projects"
                className="shrink-0 inline-flex items-center justify-center gap-2 border border-primary/55 text-on-primary-container font-label text-label-md uppercase tracking-widest px-7 py-3.5 rounded-full hover:bg-primary/10 transition-colors"
              >
                <FolderOpen className="w-4 h-4" />
                My Applications
              </Link>
            )}
          </div>

          {/* filter bar — scrolls horizontally on mobile, wraps on desktop */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar md:flex-wrap md:overflow-visible -mx-1 px-1">
            {filters.map((f) => (
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
        </header>

        {/* ── Supply count ───────────────────────────────────────────────── */}
        <p className="font-label text-[11px] uppercase tracking-[0.2em] text-on-surface-variant mb-6">
          {count} {isBacker ? "creators available" : "open briefs"}
        </p>

        {/* ── Market grid ────────────────────────────────────────────────── */}
        {isBacker ? (
          creators.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {creators.map((c) => (
                <CreatorCard key={c.id} c={c} onInvite={setInviteFor} />
              ))}
            </div>
          ) : (
            <Empty label="creators" />
          )
        ) : briefs.length ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {briefs.map((n) => (
              <BriefCard key={n.id} n={n} />
            ))}
          </div>
        ) : (
          <Empty label="briefs" />
        )}
      </div>

      {inviteFor && <InviteDialog creator={inviteFor} onClose={() => setInviteFor(null)} />}
    </AppShell>
  );
}

/* ── Filtering ────────────────────────────────────────────────────────────── */

function filterCreators(query: string, filter: string): Creator[] {
  const q = query.trim().toLowerCase();
  const out = CREATORS.filter((c) => {
    const matchQ =
      !q ||
      c.nickname.toLowerCase().includes(q) ||
      c.specialties.some((s) => s.toLowerCase().includes(q));
    const has = (re: RegExp) => c.specialties.some((s) => re.test(s));
    const matchF =
      filter === "AI Short Film"
        ? has(/short|narrative|sci-fi|film/i)
        : filter === "Trailer"
          ? has(/trailer/i)
          : filter === "Music Video"
            ? has(/music/i)
            : filter === "Brand Film"
              ? has(/brand|commercial|product|fashion/i)
              : filter === "Animation"
                ? has(/anim|anime|character/i)
                : filter === "Available Now"
                  ? availabilityFor(c.id).open
                  : filter === "Top Rated"
                    ? c.rating >= 4.8
                    : filter === "Under ¥5,000"
                      ? c.rateCard.from < 5000
                      : true;
    return matchQ && matchF;
  });
  if (filter === "Top Rated") out.sort((a, b) => b.rating - a.rating);
  return out;
}

function filterBriefs(query: string, filter: string): Brief[] {
  const q = query.trim().toLowerCase();
  const out = NEEDS.filter((n) => n.status === "open").filter((n) => {
    const matchQ =
      !q ||
      n.title.toLowerCase().includes(q) ||
      n.contentType.toLowerCase().includes(q) ||
      n.styles.some((s) => s.toLowerCase().includes(q));
    const matchF =
      filter === "AI Film"
        ? /narrative|short|film/i.test(n.contentType)
        : filter === "Brand Film"
          ? /commercial|brand/i.test(n.contentType)
          : filter === "Music Video"
            ? /music/i.test(n.contentType)
            : filter === "Trailer"
              ? /trailer/i.test(n.contentType)
              : filter === "High Budget"
                ? n.budget >= 5000
                : true; // All Briefs / Ending Soon / Escrow Protected / Remote → all
    return matchQ && matchF;
  });
  if (filter === "Ending Soon") out.sort((a, b) => daysLeft(a) - daysLeft(b));
  if (filter === "High Budget") out.sort((a, b) => b.budget - a.budget);
  return out;
}

/* ── Components ───────────────────────────────────────────────────────────── */

function RoleSwitch({ role, onChange }: { role: Role; onChange: (r: Role) => void }) {
  const segs: [Role, string, string][] = [
    ["backer", "Hire Creators", "Backer"],
    ["creator", "Find Projects", "Creator"],
  ];
  return (
    <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl border border-outline-variant/40 bg-surface-container-low w-full lg:w-auto">
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

function CreatorCard({ c, onInvite }: { c: Creator; onInvite: (c: Creator) => void }) {
  const avail = availabilityFor(c.id);
  const reel = c.showcase[0];
  return (
    <article className="group flex flex-col rounded-2xl border border-outline-variant/40 bg-surface-container-lowest overflow-hidden transition-all hover:border-primary/40 hover:-translate-y-0.5">
      {/* Reel still — the card's hero, work-first like a film talent floor. */}
      <Link href={`/market/creators/${c.id}`} className="relative block aspect-[16/10] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={reelFor(c.id)}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,10,0.05)_0%,transparent_32%,rgba(8,8,10,0.55)_72%,rgba(8,8,10,0.92)_100%)]" />
        <span
          className={cn(
            "absolute top-3 right-3 inline-flex items-center gap-1.5 font-label text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-outline-variant/40 bg-[rgba(8,8,10,0.55)] backdrop-blur-sm",
            avail.open ? "text-primary" : "text-on-surface-variant"
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              avail.open ? "bg-primary" : "bg-on-surface-variant/60"
            )}
          />
          {avail.label}
        </span>
        {reel && (
          <div className="absolute inset-x-4 bottom-3 flex items-center justify-between gap-2">
            <span className="font-label text-[10px] uppercase tracking-wider text-on-surface/85 truncate">
              {reel.title}
            </span>
            <span className="font-label text-[10px] text-on-surface/60 shrink-0">{reel.duration}</span>
          </div>
        )}
      </Link>

      {/* Identity + meta */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
              c.avatarColor
            )}
          >
            {c.avatar}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-headline text-[19px] text-on-surface truncate">{c.nickname}</h3>
              {isVerified(c) && (
                <BadgeCheck className="w-4 h-4 text-primary shrink-0" aria-label="Verified" />
              )}
            </div>
            <div className="flex items-center gap-1.5 font-label text-[11px] uppercase tracking-wider text-on-surface-variant">
              <Star className="w-3 h-3 fill-primary text-primary" />
              {c.rating} · {c.orders} completed
            </div>
          </div>
        </div>

        <p className="mt-4 font-label text-[11px] uppercase tracking-[0.14em] text-on-surface-variant/90">
          {c.specialties.join(" · ")}
        </p>

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between border-t border-outline-variant/30 pt-4 mb-4">
            <div>
              <span className="block font-label text-[10px] uppercase tracking-widest text-on-surface-variant/70">
                From
              </span>
              <span className="font-headline text-[19px] text-on-surface">
                ¥{c.rateCard.from.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href={`/market/creators/${c.id}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-primary text-on-primary font-label text-[11px] uppercase tracking-widest px-4 py-2.5 rounded-full hover:opacity-90 transition-opacity"
            >
              View Profile
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => onInvite(c)}
              className="inline-flex items-center gap-1.5 border border-primary/50 text-on-primary-container font-label text-[11px] uppercase tracking-widest px-4 py-2.5 rounded-full hover:bg-primary/10 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Invite
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// Invite flow — pick which of the backer's open briefs to invite the creator to
// (a real action, not just a toast). Closes on backdrop / Escape / cancel.
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

function Empty({ label }: { label: string }) {
  return (
    <p className="text-center py-24 font-body text-on-surface-variant">
      No {label} match your search.
    </p>
  );
}
