"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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
  UserPlus,
  X,
  Check,
  Plus,
  Play,
  Send,
  Paperclip,
  Star,
  MessageCircle,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useT } from "@/hooks/useT";
import AppShell from "@/components/layout/AppShell";
import { CREATORS, NEEDS, findSessionForCounterpart } from "@/lib/mock-data";
import { getAgentReply } from "@/lib/agent-response";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Marketplace = the merged Discover + Marketplace surface, role-driven and
// publicly browsable. Backer: an inspiration feed of works/creators + "Post a
// Need". Creator: open briefs then an inspiration feed + "Start Creating". Any
// transaction action (post / apply / invite / start / chat / send) gates on
// signup. The old /discovery path redirects here (see next.config). Copy is
// localized via the i18n system (t.market.guest).

type Role = "backer" | "creator";
type Aspect = "portrait" | "tall" | "landscape" | "wide" | "square";
type Work = {
  id: number;
  title: string;
  creatorId: string;
  creator: string;
  category: string;
  poster: string;
  aspect: Aspect;
};

const ASPECT: Record<Aspect, string> = {
  portrait: "aspect-[2/3]",
  tall: "aspect-[9/16]",
  landscape: "aspect-[3/2]",
  wide: "aspect-video",
  square: "aspect-square",
};

const WORKS: Work[] = [
  { id: 1, title: "Past Lives", creatorId: "u_creator_01", creator: "Aria Song", category: "Romance", poster: "/posters/past-lives.jpg", aspect: "portrait" },
  { id: 2, title: "The Bear", creatorId: "u_creator_02", creator: "Marco Reyes", category: "Drama", poster: "/posters/the-bear.jpg", aspect: "portrait" },
  { id: 3, title: "Die My Love", creatorId: "u_creator_03", creator: "Yuki Tanaka", category: "Drama", poster: "/posters/die-my-love.jpg", aspect: "portrait" },
  { id: 4, title: "Marty Supreme", creatorId: "u_creator_04", creator: "Sofia Okonkwo", category: "Drama", poster: "/posters/marty-supreme.jpg", aspect: "portrait" },
  { id: 5, title: "Exit 8", creatorId: "u_creator_05", creator: "Liang Wei", category: "Thriller", poster: "/posters/exit-8.jpg", aspect: "portrait" },
  { id: 6, title: "Dallas Buyers Club", creatorId: "u_creator_06", creator: "Nadia Haddad", category: "Drama", poster: "/posters/dallas-buyers-club.jpg", aspect: "portrait" },
  { id: 7, title: "Gringo", creatorId: "u_creator_05", creator: "Liang Wei", category: "Comedy", poster: "/posters/gringo.jpg", aspect: "portrait" },
  { id: 8, title: "Fish Bone", creatorId: "u_creator_03", creator: "Yuki Tanaka", category: "Drama", poster: "/posters/fish-bone.jpg", aspect: "portrait" },
  { id: 9, title: "Love Will Tear Us Apart", creatorId: "u_creator_01", creator: "Aria Song", category: "Romance", poster: "/posters/love-tears-us-apart.jpg", aspect: "portrait" },
  { id: 10, title: "Who Are You?", creatorId: "u_creator_06", creator: "Nadia Haddad", category: "Documentary", poster: "/posters/who-are-you.jpg", aspect: "portrait" },
];

const CATEGORIES = ["All", "Drama", "Romance", "Thriller", "Comedy", "Documentary"];
const BRIEF_FILTERS = ["All Briefs", "AI Film", "Brand Film", "Music Video", "Trailer", "High Budget"];

const BRIEF_POSTER: Record<string, string> = {
  need_001: "/posters/the-bear.jpg",
  need_003: "/posters/exit-8.jpg",
  need_006: "/posters/marty-supreme.jpg",
};

type Creator = (typeof CREATORS)[number];
type Brief = (typeof NEEDS)[number];

export default function MarketPage() {
  const {
    isLoggedIn,
    activeRole,
    switchRole,
    hasHydrated,
    locale,
    appendAgentMessages,
    openAgent,
    setAgentThinking,
    openSignupGate,
  } = useStore();
  const t = useT();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [inviteFor, setInviteFor] = useState<Creator | null>(null);
  const [openWork, setOpenWork] = useState<Work | null>(null);

  // Marlow prompt dock
  const [prompt, setPrompt] = useState("");
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);
  const promptRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!promptExpanded) return;
    const onDown = (e: MouseEvent) => {
      if (promptRef.current && !promptRef.current.contains(e.target as Node)) {
        if (!prompt.trim() && files.length === 0) setPromptExpanded(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [promptExpanded, prompt, files.length]);

  if (!hasHydrated) return null; // public, but wait for persisted role to avoid a flip

  const isBacker = activeRole === "backer";
  const copy = isBacker ? t.market.guest.backer : t.market.guest.creator;
  const chips = isBacker ? CATEGORIES : BRIEF_FILTERS;
  const chipLabels = isBacker ? t.market.guest.categories : t.market.guest.briefFilters;
  const activeFilter = chips.includes(filter) ? filter : chips[0];

  const setRole = (r: Role) => {
    switchRole(r);
    setQuery("");
    setFilter(r === "backer" ? "All" : "All Briefs");
  };

  // Browsing is free; acting (and opening full detail) converges on the single
  // signup gate. returnTo drops the user back where they were after auth.
  const requireSignup = (returnTo?: string) => openSignupGate(returnTo);
  // Guard for full-detail navigation: guests get the gate with the locked page
  // as returnTo; members follow the link normally.
  const gateDetail = (href: string) => (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      openSignupGate(href);
    }
  };
  const handlePostNeed = () => (isLoggedIn ? router.push("/market/needs/new") : requireSignup());
  const handleStartCreating = () =>
    isLoggedIn ? router.push("/discovery/workspace") : requireSignup();
  const handleApply = (n: Brief) =>
    isLoggedIn ? toast.success(t.market.guest.applicationStarted(n.title)) : requireSignup(`/market/needs/${n.id}`);
  const handleInvite = (c: Creator) => (isLoggedIn ? setInviteFor(c) : requireSignup());
  const startConversation = (creatorId: string) => {
    setOpenWork(null);
    if (!isLoggedIn) return requireSignup(`/market/creators/${creatorId}`);
    const sid = findSessionForCounterpart("backer", creatorId);
    router.push(sid ? `/messages/sessions/${sid}` : "/messages");
  };

  const formatSize = (b: number) =>
    b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;
  const onFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []).slice(0, 5 - files.length);
    setFiles((prev) => [...prev, ...picked.map((f) => ({ name: f.name, size: formatSize(f.size) }))]);
    e.target.value = "";
  };
  const sendPrompt = () => {
    const qq = prompt.trim();
    if (!qq && files.length === 0) return;
    if (!isLoggedIn) return requireSignup();
    const attached = files.length > 0 ? ` 📎 ${files.map((f) => f.name).join(", ")}` : "";
    const text = (qq || t.market.guest.filesAttached) + attached;
    appendAgentMessages([{ role: "user", text }]);
    setPrompt("");
    setFiles([]);
    setPromptExpanded(false);
    openAgent();
    setAgentThinking(true);
    const resp = getAgentReply(text, locale);
    setTimeout(() => {
      appendAgentMessages([{ role: "agent", text: resp.a, link: resp.link }]);
      setAgentThinking(false);
    }, 800);
  };

  const q = query.trim().toLowerCase();
  const matchWork = (w: Work) =>
    !q ||
    w.title.toLowerCase().includes(q) ||
    w.creator.toLowerCase().includes(q) ||
    w.category.toLowerCase().includes(q);
  const worksQ = WORKS.filter(matchWork);
  const backerWorks = worksQ.filter((w) => activeFilter === "All" || w.category === activeFilter);
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
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 pt-10 pb-40">
        {/* ── Hero header ────────────────────────────────────────────────── */}
        <header className="flex flex-col gap-7 mb-12">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="animate-fade-up font-headline text-5xl md:text-6xl font-extrabold uppercase tracking-tight text-on-surface leading-[1.02]">
                {t.market.title}
              </h1>
              <p
                className="animate-fade-up mt-3 font-body text-lg md:text-xl text-on-surface-variant"
                style={{ animationDelay: "80ms" }}
              >
                {copy.subtitle}
              </p>
              <div className="animate-fade-up mt-6" style={{ animationDelay: "160ms" }}>
                <button
                  type="button"
                  onClick={isBacker ? handlePostNeed : handleStartCreating}
                  className="group inline-flex items-center gap-2.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-widest px-8 py-4 rounded-full hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_8px_30px_rgba(198,255,52,0.25)]"
                >
                  {isBacker ? <PlusCircle className="w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
                  {isBacker ? t.market.postANeed : t.market.guest.startCreating}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
            <div
              className="animate-fade-up w-full lg:w-auto shrink-0"
              style={{ animationDelay: "120ms" }}
            >
              <RoleSwitch role={activeRole} onChange={setRole} />
            </div>
          </div>

          <div className="animate-fade-up flex flex-col gap-4" style={{ animationDelay: "220ms" }}>
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={copy.searchPlaceholder}
                aria-label={copy.searchPlaceholder}
                className="w-full pl-12 pr-4 py-3.5 rounded-full bg-surface-container-low border border-outline-variant/60 font-body text-sm text-on-surface placeholder:text-on-surface-variant/75 focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar md:flex-wrap md:overflow-visible -mx-1 px-1">
              {chips.map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={activeFilter === f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "shrink-0 font-label text-[11px] uppercase tracking-wider px-4 py-2 rounded-full border whitespace-nowrap transition-colors",
                    activeFilter === f
                      ? "bg-primary text-on-primary border-primary"
                      : "border-outline-variant/70 text-on-surface-variant hover:text-on-surface hover:border-primary/40"
                  )}
                >
                  {chipLabels[f] ?? f}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        {isBacker ? (
          <section>
            <SectionHead
              label={t.market.guest.worksInSpotlight(backerWorks.length)}
              hint={t.market.guest.tapStill}
            />
            {backerWorks.length ? (
              <Masonry works={backerWorks} onOpen={setOpenWork} onInvite={handleInvite} showInvite />
            ) : (
              <Empty label={t.market.guest.nounWorks} />
            )}
          </section>
        ) : (
          <div className="flex flex-col">
            <section>
              <SectionHead label={t.market.guest.openBriefs} hint={t.market.guest.readyForCreators(briefs.length)} />
              {briefs.length ? (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
                  {briefs.map((n) => (
                    <BriefCard key={n.id} n={n} onApply={handleApply} onGate={gateDetail} />
                  ))}
                </div>
              ) : (
                <Empty label={t.market.guest.nounBriefs} />
              )}
            </section>

            {/* AIGC CTA — the "Get funded" side's path into the studio; gates for guests. */}
            <section className="mt-10">
              <div className="rounded-3xl border border-primary/30 bg-primary/[0.06] px-8 py-8 md:px-12 md:py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-xl">
                  <span className="font-label text-[11px] uppercase tracking-[0.3em] text-primary">
                    {t.market.guest.aigcEyebrow}
                  </span>
                  <h3 className="mt-2 font-headline text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-on-surface leading-tight">
                    {t.market.guest.aigcHeading}
                  </h3>
                  <p className="mt-2 font-body text-sm text-on-surface-variant leading-relaxed">
                    {t.market.guest.aigcBody}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleStartCreating}
                  className="group shrink-0 inline-flex items-center gap-2.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-widest px-8 py-4 rounded-full hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_8px_30px_rgba(198,255,52,0.25)]"
                >
                  <Wand2 className="w-4 h-4" />
                  {t.market.guest.openAigcStudio}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </section>

            <section>
              <div className="text-center max-w-2xl mx-auto my-16 md:my-20">
                <span className="font-label text-[11px] uppercase tracking-[0.3em] text-primary">
                  {t.market.guest.forInspiration}
                </span>
                <h2 className="mt-3 font-headline text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-on-surface leading-[1.02]">
                  {t.market.guest.networkMaking}
                </h2>
              </div>
              {worksQ.length ? (
                <Masonry works={worksQ} onOpen={setOpenWork} onInvite={handleInvite} showInvite={false} />
              ) : (
                <Empty label={t.market.guest.nounWorks} />
              )}
            </section>
          </div>
        )}
      </div>

      {/* Work detail dialog (ported from Discover) */}
      <WorkDialog
        work={openWork}
        viewerIsBacker={isBacker}
        onClose={() => setOpenWork(null)}
        onStartConversation={startConversation}
        onGate={gateDetail}
      />

      {inviteFor && <InviteDialog creator={inviteFor} onClose={() => setInviteFor(null)} />}

      {/* Floating Marlow prompt dock (ported from Discover) */}
      <div
        className={cn(
          "fixed left-1/2 -translate-x-1/2 w-[94%] max-w-[820px] z-40 pointer-events-none transition-all duration-500 ease-out",
          promptExpanded ? "bottom-10" : "bottom-8"
        )}
      >
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- click-to-expand convenience wrapper around a textarea and controls; keyboard users focus those, which expands the dock via onFocus */}
        <div
          ref={promptRef}
          onClick={() => setPromptExpanded(true)}
          onFocus={() => setPromptExpanded(true)}
          className={cn(
            "pointer-events-auto rounded-[28px] border border-outline-variant/40 transition-all duration-500 ease-out overflow-hidden",
            promptExpanded ? "shadow-[0_24px_60px_rgba(0,0,0,0.6)] ring-1 ring-primary/20" : "shadow-2xl"
          )}
          style={{
            background: "rgba(20, 20, 26, 0.85)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
          }}
        >
          {files.length > 0 && (
            <div className="px-5 pt-3 flex flex-wrap gap-2 animate-fade-up">
              {files.map((f, i) => (
                <span
                  key={`${f.name}-${i}`}
                  className="inline-flex items-center gap-1.5 bg-primary-container/60 text-on-primary-container rounded-full pl-2.5 pr-1.5 py-1 font-body text-xs"
                >
                  <Paperclip className="w-3 h-3" />
                  <span className="max-w-[160px] truncate">{f.name}</span>
                  <span className="opacity-60 font-label text-[9px] uppercase tracking-wider">{f.size}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFiles((prev) => prev.filter((_, idx) => idx !== i));
                    }}
                    className="ml-0.5 w-4 h-4 rounded-full hover:bg-on-primary-container/10 flex items-center justify-center"
                    aria-label={t.market.guest.removeAttachment}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex items-end gap-3 px-4 py-3">
            <Wand2 className="text-primary shrink-0 w-5 h-5 mb-2" />
            <textarea
              rows={1}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={() => setPromptExpanded(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendPrompt();
                }
              }}
              placeholder={copy.prompt}
              aria-label={copy.prompt}
              className={cn(
                "flex-1 bg-transparent border-none resize-none focus:outline-none focus:ring-0 font-body text-base md:text-lg placeholder:text-on-surface-variant/75 transition-all duration-500 ease-out",
                promptExpanded ? "min-h-[96px]" : "min-h-[28px]"
              )}
              style={{ maxHeight: promptExpanded ? 200 : 28 }}
            />
            <button
              type="button"
              onClick={sendPrompt}
              disabled={!prompt.trim() && files.length === 0}
              className="bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-5 md:px-6 py-3 rounded-2xl hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <span className="hidden sm:inline">{t.common.send}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {promptExpanded && (
            <div className="flex items-center gap-3 px-5 pb-3 pt-2 border-t border-outline-variant/20 animate-fade-up">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                aria-label={t.market.guest.attachFiles}
                className="hidden"
                onChange={onFilePick}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={files.length >= 5}
                className="flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider px-3 py-1.5 rounded-lg border border-outline-variant/40 hover:border-primary/40 hover:text-primary text-on-surface-variant transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Paperclip className="w-3.5 h-3.5" /> {t.market.guest.attach}
              </button>
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/85">
                {t.market.guest.fileCount(files.length)}
              </span>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

/* ── Layout bits ──────────────────────────────────────────────────────────── */

function SectionHead({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <h2 className="font-label text-[12px] uppercase tracking-[0.2em] text-on-surface-variant">{label}</h2>
      <span className="font-label text-[11px] uppercase tracking-wider text-on-surface-variant/85">{hint}</span>
    </div>
  );
}

function Masonry({
  works,
  onOpen,
  onInvite,
  showInvite,
}: {
  works: Work[];
  onOpen: (w: Work) => void;
  onInvite: (c: Creator) => void;
  showInvite: boolean;
}) {
  return (
    <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
      {works.map((w) => (
        <WorkCard key={w.id} w={w} onOpen={onOpen} onInvite={onInvite} showInvite={showInvite} />
      ))}
    </div>
  );
}

function WorkCard({
  w,
  onOpen,
  onInvite,
  showInvite,
}: {
  w: Work;
  onOpen: (w: Work) => void;
  onInvite: (c: Creator) => void;
  showInvite: boolean;
}) {
  const t = useT();
  const creator = CREATORS.find((c) => c.id === w.creatorId);
  return (
    <div className="group break-inside-avoid mb-4 relative rounded-2xl overflow-hidden border border-outline-variant/30 bg-surface-container">
      <button type="button" onClick={() => onOpen(w)} className="block w-full text-left">
        <div className={cn("relative", ASPECT[w.aspect])}>
          <Image
            src={w.poster}
            alt={w.title}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
            className="absolute inset-0 object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,10,0.05)_0%,transparent_34%,rgba(8,8,10,0.5)_70%,rgba(8,8,10,0.92)_100%)]" />
          <span className="absolute top-3 left-3 inline-flex items-center justify-center w-9 h-9 rounded-full bg-[rgba(8,8,10,0.5)] backdrop-blur-sm border border-outline-variant/40 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-3.5 h-3.5 ml-0.5" fill="currentColor" />
          </span>
          <div className="absolute inset-x-0 bottom-0 p-4">
            <span className="font-label text-[9px] uppercase tracking-widest text-on-surface/70">
              {w.category}
            </span>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface/65 mt-1">
              {t.market.guest.byCreator(w.creator)}
            </p>
          </div>
        </div>
      </button>
      {showInvite && creator && (
        <button
          type="button"
          onClick={() => onInvite(creator)}
          className="absolute top-3 right-3 inline-flex items-center gap-1.5 font-label text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full bg-[rgba(8,8,10,0.5)] backdrop-blur-sm border border-primary/40 text-primary opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-on-primary transition-all"
        >
          <UserPlus className="w-3 h-3" />
          {t.market.guest.invite}
        </button>
      )}
    </div>
  );
}

function RoleSwitch({ role, onChange }: { role: Role; onChange: (r: Role) => void }) {
  const t = useT();
  const segs: [Role, string, string][] = [
    ["backer", t.market.guest.fundIt, t.market.roleBacker],
    ["creator", t.market.guest.getFunded, t.market.roleCreator],
  ];
  return (
    <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl border border-outline-variant/40 bg-surface-container-low w-full lg:w-auto shrink-0">
      {segs.map(([r, main, cap]) => {
        const active = role === r;
        return (
          <button
            key={r}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(r)}
            className={cn(
              "flex flex-col items-center lg:items-start px-6 md:px-8 py-3 rounded-xl transition-colors",
              active
                ? "bg-primary text-on-primary shadow-[0_8px_24px_rgba(198,255,52,0.22)]"
                : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <span className="font-headline text-[19px] leading-none">{main}</span>
            <span
              className={cn(
                "mt-1.5 font-label text-[10px] uppercase tracking-[0.2em]",
                active ? "text-on-primary/80" : "text-on-surface-variant/85"
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

function BriefCard({
  n,
  onApply,
  onGate,
}: {
  n: Brief;
  onApply: (n: Brief) => void;
  onGate: (href: string) => (e: React.MouseEvent) => void;
}) {
  const t = useT();
  const g = t.market.guest;
  const poster = BRIEF_POSTER[n.id];
  const dur = n.durationSec < 120 ? g.durSeconds(n.durationSec) : g.durMinutes(Math.round(n.durationSec / 60));
  const deliverable = g.deliverable(dur, g.deliverableWords[n.contentType] ?? g.deliverableWordDefault);
  return (
    <article className="group break-inside-avoid mb-5 flex flex-col rounded-2xl border border-outline-variant/40 bg-surface-container-lowest overflow-hidden transition-colors hover:border-primary/40">
      {poster && (
        <Link
          href={`/market/needs/${n.id}`}
          onClick={onGate(`/market/needs/${n.id}`)}
          className="relative block aspect-[16/10] overflow-hidden"
        >
          <Image
            src={poster}
            alt=""
            fill
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,10,0.05)_0%,transparent_45%,rgba(8,8,10,0.7)_100%)]" />
          <span className="absolute top-3 left-3 font-label text-[10px] uppercase tracking-widest px-3 py-1 rounded-full bg-[rgba(8,8,10,0.55)] backdrop-blur-sm border border-outline-variant/40 text-primary">
            {n.contentType}
          </span>
        </Link>
      )}

      <div className="flex flex-col flex-1 p-6">
        {!poster && (
          <span className="font-label text-[10px] uppercase tracking-widest text-primary mb-3">
            {n.contentType}
          </span>
        )}

        <h3 className="font-headline text-[22px] text-on-surface leading-snug">{n.title}</h3>
        {n.brief && (
          <p className="mt-2 font-body text-sm text-on-surface-variant leading-relaxed line-clamp-2">
            {n.brief}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-surface-container-high flex items-center justify-center font-label text-[9px] text-on-surface-variant">
            {n.backerAvatar}
          </span>
          <span className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant">
            {n.backerNickname}
          </span>
          <BadgeCheck className="w-3.5 h-3.5 text-primary" aria-label={g.verifiedBuyer} />
        </div>

        <div className="mt-4 pt-4 border-t border-outline-variant/30">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-headline text-[26px] text-primary">¥{n.budget.toLocaleString()}</span>
            <span className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant">
              {deliverable}
            </span>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-label text-[10px] uppercase tracking-wider text-on-surface-variant">
            <span>{g.daysLeft(n.deliveryDays)}</span>
            <span className="text-on-surface-variant/85">·</span>
            <span>{g.bidsCount(n.bids)}</span>
            <span className="text-on-surface-variant/85">·</span>
            <span>{g.revisions(n.modifyLimit)}</span>
            <span className="inline-flex items-center gap-1 text-on-surface-variant/90">
              <ShieldCheck className="w-3 h-3 text-primary" />
              {g.escrow}
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2.5">
          <Link
            href={`/market/needs/${n.id}`}
            onClick={onGate(`/market/needs/${n.id}`)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-primary text-on-primary font-label text-[11px] uppercase tracking-widest px-4 py-2.5 rounded-full hover:opacity-90 transition-opacity"
          >
            {g.viewBrief}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => onApply(n)}
            className="inline-flex items-center gap-1.5 border border-primary/50 text-on-primary-container font-label text-[11px] uppercase tracking-widest px-5 py-2.5 rounded-full hover:bg-primary/10 transition-colors"
          >
            {g.apply}
          </button>
        </div>
      </div>
    </article>
  );
}

// Work preview — a still + the creator behind it, with the role-appropriate
// next step (backer → start a conversation; anyone → view the full profile).
function WorkDialog({
  work,
  viewerIsBacker,
  onClose,
  onStartConversation,
  onGate,
}: {
  work: Work | null;
  viewerIsBacker: boolean;
  onClose: () => void;
  onStartConversation: (creatorId: string) => void;
  onGate: (href: string) => (e: React.MouseEvent) => void;
}) {
  const t = useT();
  const creator = work ? CREATORS.find((c) => c.id === work.creatorId) : undefined;
  return (
    <Dialog open={!!work} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-5xl p-0 overflow-hidden max-h-[90vh]">
        {work && (
          <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] max-h-[90vh] overflow-hidden">
            <DialogTitle className="sr-only">{work.title}</DialogTitle>
            <div className="bg-[#08080a] p-6 md:p-7 flex flex-col gap-4 overflow-y-auto">
              <div className="aspect-video relative rounded-xl overflow-hidden bg-surface-container group">
                <Image
                  src={work.poster}
                  alt={work.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="absolute inset-0 object-cover"
                />
                <button
                  type="button"
                  onClick={() => toast.info(t.market.guest.playbackDemo)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/45 transition-colors"
                  aria-label={t.market.guest.play}
                >
                  <span className="w-16 h-16 rounded-full bg-primary/95 text-on-primary shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 ml-1" fill="currentColor" />
                  </span>
                </button>
              </div>
              <div>
                <span className="font-label text-[10px] uppercase tracking-widest bg-white/10 text-white/80 px-2.5 py-1 rounded">
                  {work.category}
                </span>
                <h2 className="font-headline font-extrabold text-white text-2xl md:text-3xl mt-3 leading-tight">
                  {work.title}
                </h2>
                <p className="font-label text-white/60 text-[11px] uppercase tracking-widest mt-2">
                  {t.market.guest.byCreator(work.creator)}
                </p>
              </div>
            </div>

            {creator && (
              <div className="p-6 md:p-7 flex flex-col overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0",
                      creator.avatarColor
                    )}
                  >
                    {creator.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="font-headline text-[20px] text-on-surface truncate">{creator.nickname}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Star className="w-3 h-3 fill-primary text-primary" />
                      <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                        {creator.rating} · {t.market.guest.completedCount(creator.orders)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {creator.specialties.map((s) => (
                    <span
                      key={s}
                      className="font-label text-[10px] uppercase tracking-widest bg-primary-container text-on-primary-container px-2.5 py-1 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-5 line-clamp-4 flex-1">
                  {creator.bio}
                </p>

                <div className="bg-surface-container rounded-xl p-4 mb-4 flex items-center justify-between">
                  <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                    {t.common.from}
                  </span>
                  <span className="font-headline text-[20px] text-on-surface">
                    ¥{creator.rateCard.from.toLocaleString()}+
                  </span>
                </div>

                <div className="space-y-2">
                  {viewerIsBacker && (
                    <button
                      type="button"
                      onClick={() => onStartConversation(creator.id)}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider py-3 rounded-lg hover:opacity-90 active:scale-95 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" /> {t.market.guest.startConversation}
                    </button>
                  )}
                  <Link
                    href={`/market/creators/${creator.id}`}
                    onClick={(e) => {
                      onGate(`/market/creators/${creator.id}`)(e);
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 font-label text-label-md uppercase tracking-wider py-3 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-colors"
                  >
                    {t.market.guest.viewProfile} <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Invite flow — pick which of the backer's open briefs to invite the creator to.
function InviteDialog({ creator, onClose }: { creator: Creator; onClose: () => void }) {
  const t = useT();
  const myNeeds = NEEDS.filter((n) => n.backerId === "u_backer_01" && n.status === "open");
  const [sel, setSel] = useState(myNeeds[0]?.id ?? "");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Move focus into the dialog on open, and restore it to the control that
  // opened it on close (this component unmounts when the invite flow closes).
  useEffect(() => {
    const prevFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => prevFocused?.focus?.();
  }, []);

  const send = () => {
    const n = myNeeds.find((x) => x.id === sel);
    toast.success(n ? t.market.guest.invitedTo(creator.nickname, n.title) : t.market.guest.invited(creator.nickname));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t.market.guest.close}
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(8,8,10,0.72)] backdrop-blur-sm"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-dialog-title"
        tabIndex={-1}
        className="relative w-full max-w-md rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-6 shadow-[0_30px_80px_rgba(0,0,0,0.6)] focus:outline-none"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3
              id="invite-dialog-title"
              className="font-headline text-[22px] text-on-surface"
            >
              {t.market.guest.inviteTitle(creator.nickname)}
            </h3>
            <p className="mt-1 font-body text-sm text-on-surface-variant">
              {t.market.guest.inviteSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.market.guest.close}
            className="shrink-0 w-9 h-9 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-primary/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 space-y-2">
          {myNeeds.length === 0 ? (
            <p className="font-body text-sm text-on-surface-variant py-4">{t.market.guest.noOpenBriefs}</p>
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
                    active ? "border-primary bg-primary/[0.06]" : "border-outline-variant/40 hover:border-primary/40"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-headline text-[15px] text-on-surface line-clamp-1">{n.title}</span>
                    {active && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </div>
                  <div className="mt-1 font-label text-[10px] uppercase tracking-wider text-on-surface-variant">
                    ¥{n.budget.toLocaleString()} · {t.market.guest.bidsCount(n.bids)}
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
            {t.market.guest.postNewNeed}
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant px-5 py-2.5 rounded-full border border-outline-variant/50 hover:text-on-surface transition-colors"
          >
            {t.common.cancel}
          </button>
          <button
            type="button"
            onClick={send}
            disabled={!sel}
            className="inline-flex items-center gap-1.5 bg-primary text-on-primary font-label text-[11px] uppercase tracking-widest px-6 py-2.5 rounded-full hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {t.market.guest.sendInvite}
          </button>
        </div>
      </div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  const t = useT();
  return (
    <p className="text-center py-24 font-body text-on-surface-variant">{t.market.guest.emptyMatch(label)}</p>
  );
}
