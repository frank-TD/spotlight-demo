"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import MouseGlow from "@/components/home/MouseGlow";
import { useStore } from "@/lib/store";
import { useT } from "@/hooks/useT";
import { getAgentReply } from "@/lib/agent-response";
import { CREATORS, findSessionForCounterpart } from "@/lib/mock-data";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sparkles, Send, Megaphone, Camera, Wand2, ArrowRight, Paperclip, X, Play, Star, MessageCircle, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Aspect = "portrait" | "tall" | "landscape" | "wide" | "square";
type Item = { id: number; title: string; creator: string; category: string; aspect: Aspect; seed: string };

// Discovery feed — 12 curated mock works. Images are picsum thumbnails seeded by id;
// the underlying gradient fills in if the network is unavailable.
const ITEMS: Item[] = [
  { id: 1, title: "Celestial Entity",  creator: "Aria Song",     category: "Character",    aspect: "portrait",  seed: "celestial" },
  { id: 2, title: "Neon Rain",         creator: "Marco Reyes",   category: "Cinematic",    aspect: "tall",      seed: "neonrain" },
  { id: 3, title: "Orbital Zen",       creator: "Yuki Tanaka",   category: "Architecture", aspect: "landscape", seed: "orbital" },
  { id: 4, title: "Golden Core",       creator: "Sofia Okonkwo", category: "Abstract",     aspect: "portrait",  seed: "goldencore" },
  { id: 5, title: "Aurora Crystal",    creator: "Aria Song",     category: "Nature",       aspect: "wide",      seed: "aurora" },
  { id: 6, title: "Cyber Ghost",       creator: "Marco Reyes",   category: "Character",    aspect: "portrait",  seed: "cyberghost" },
  { id: 7, title: "Biodome Alpha",     creator: "Yuki Tanaka",   category: "Architecture", aspect: "wide",      seed: "biodome" },
  { id: 8, title: "Dune Metropolis",   creator: "Sofia Okonkwo", category: "Sci-Fi",       aspect: "landscape", seed: "dune" },
  { id: 9, title: "Techno Ascetic",    creator: "Aria Song",     category: "Character",    aspect: "portrait",  seed: "techno" },
  { id: 10, title: "Iridescent Flow",  creator: "Marco Reyes",   category: "Abstract",     aspect: "square",    seed: "iridescent" },
  { id: 11, title: "Glassine Garden",  creator: "Yuki Tanaka",   category: "Nature",       aspect: "tall",      seed: "glassine" },
  { id: 12, title: "Static Bloom",     creator: "Sofia Okonkwo", category: "Sci-Fi",       aspect: "portrait",  seed: "staticbloom" },
];

const FILTERS = ["All", "Character", "Cinematic", "Architecture", "Abstract", "Nature", "Sci-Fi"];

const ASPECT_CLASS: Record<Aspect, string> = {
  portrait: "aspect-[2/3]",
  tall: "aspect-[9/16]",
  landscape: "aspect-[3/2]",
  wide: "aspect-video",
  square: "aspect-square",
};

const ASPECT_DIM: Record<Aspect, [number, number]> = {
  portrait: [600, 900],
  tall: [600, 1067],
  landscape: [900, 600],
  wide: [1600, 900],
  square: [600, 600],
};

const GRADIENTS = [
  "from-primary-container via-primary-fixed to-tertiary-container",
  "from-tertiary-container via-tertiary-fixed to-primary-container",
  "from-secondary-container via-secondary-fixed to-primary-container",
  "from-primary-container via-tertiary-fixed to-secondary-container",
];

export default function DiscoveryPage() {
  const router = useRouter();
  const {
    isLoggedIn,
    hasHydrated,
    activeRole,
    roleConfirmed,
    confirmRole,
    locale,
    appendAgentMessages,
    openAgent,
    setAgentThinking,
  } = useStore();
  const t = useT();
  const [filter, setFilter] = useState("All");
  const [prompt, setPrompt] = useState("");
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);
  const [openItem, setOpenItem] = useState<Item | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);

  const startConversation = (creatorId: string) => {
    setOpenItem(null);
    const sid = findSessionForCounterpart("backer", creatorId);
    router.push(sid ? `/messages/sessions/${sid}` : "/messages");
  };

  // Collapse the prompt when clicking outside (unless the user has typed/attached).
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

  const formatSize = (b: number) =>
    b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;

  const onFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []).slice(0, 5 - files.length);
    setFiles((prev) => [...prev, ...picked.map((f) => ({ name: f.name, size: formatSize(f.size) }))]);
    e.target.value = "";
  };

  useEffect(() => {
    if (hasHydrated && !isLoggedIn) router.push("/login");
  }, [hasHydrated, isLoggedIn, router]);

  if (!hasHydrated || !isLoggedIn) return null;

  // Identity selection step
  if (!roleConfirmed) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto px-6 md:px-12 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-tertiary-container text-on-tertiary-container font-label text-[11px] uppercase tracking-[0.2em]">
            <Sparkles className="w-3 h-3" /> {t.discovery.badge}
          </div>
          <h1 className="font-headline text-5xl md:text-6xl text-on-surface leading-tight mb-4">
            {t.discovery.identityTitle}
          </h1>
          <p className="font-body text-on-surface-variant text-base md:text-lg italic mb-12 opacity-80">
            {t.discovery.identitySubtitle}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RoleCard
              icon={Megaphone}
              title={t.discovery.backerTitle}
              desc={t.discovery.backerDesc}
              cta={t.discovery.backerCta}
              onClick={() => confirmRole("backer")}
            />
            <RoleCard
              icon={Camera}
              title={t.discovery.creatorTitle}
              desc={t.discovery.creatorDesc}
              cta={t.discovery.creatorCta}
              onClick={() => confirmRole("creator")}
            />
          </div>
        </div>
      </AppShell>
    );
  }

  const filtered = filter === "All" ? ITEMS : ITEMS.filter((i) => i.category === filter);

  const sendPrompt = () => {
    const q = prompt.trim();
    if (!q && files.length === 0) return;
    const attached = files.length > 0 ? ` 📎 ${files.map((f) => f.name).join(", ")}` : "";
    const text = (q || "Files attached") + attached;
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

  return (
    <AppShell>
      <MouseGlow />
      <main className="max-w-[1800px] mx-auto px-4 md:px-6 pt-10 pb-48">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-up">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-tertiary-container text-on-tertiary-container font-label text-[11px] uppercase tracking-[0.2em]">
            <span className="relative inline-flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full bg-tertiary opacity-60 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-tertiary live-dot" />
            </span>
            {t.discovery.badge}
          </div>
          <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight leading-[1.05] [overflow:visible] px-2 md:px-4">
            <StaggerText text={t.discovery.title1} />
            <span>&nbsp;</span>
            <span
              className="italic font-headline animate-fade-in"
              style={{
                animationDelay: `${t.discovery.title1.length * 50 + 100}ms`,
                background: "linear-gradient(135deg, #6e5b47 0%, #dcc2aa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                paddingRight: "0.15em",
              }}
            >
              {t.discovery.title2}
            </span>
          </h1>
          <p
            className="font-headline italic font-light text-on-surface-variant text-lg md:text-2xl max-w-3xl mx-auto opacity-90 leading-relaxed tracking-tight animate-fade-up"
            style={{ animationDelay: `${(t.discovery.title1.length + t.discovery.title2.length) * 50 + 200}ms` }}
          >
            {t.discovery.subtitle}
          </p>
        </header>

        {/* Filter chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-12 animate-fade-up" style={{ animationDelay: "100ms" }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-5 py-1.5 rounded-full border font-label text-[11px] uppercase tracking-widest transition-all duration-300",
                filter === f
                  ? "bg-primary text-on-primary border-primary shadow-md shadow-primary/20"
                  : "border-outline-variant/40 text-on-surface-variant hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              {t.discovery.filters[f] ?? f}
            </button>
          ))}
        </div>

        {/* Masonry — re-keyed on filter so items replay the stagger entrance */}
        <div key={filter} className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-3 md:gap-4">
          {filtered.map((item, i) => (
            <MasonryCard
              key={item.id}
              item={item}
              index={i}
              gradient={GRADIENTS[i % GRADIENTS.length]}
              byLabel={t.discovery.by}
              onOpen={() => setOpenItem(item)}
            />
          ))}
        </div>
      </main>

      {/* Work preview dialog */}
      <Dialog open={!!openItem} onOpenChange={(o) => !o && setOpenItem(null)}>
        <DialogContent className="sm:max-w-5xl p-0 overflow-hidden max-h-[90vh]">
          {openItem && (() => {
            const creator = CREATORS.find((c) => c.nickname === openItem.creator);
            const previewW = 1280;
            const previewH = Math.round((previewW * 9) / 16);
            return (
              <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] max-h-[90vh] overflow-hidden">
                {/* Left: preview */}
                <div className="bg-[#0f0d0c] p-6 md:p-7 flex flex-col gap-4 overflow-y-auto">
                  <div className="aspect-video relative rounded-xl overflow-hidden bg-surface-container group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://picsum.photos/seed/${openItem.seed}/${previewW}/${previewH}`}
                      alt={openItem.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => toast.info(t.discovery.playbackToast)}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/45 transition-colors"
                      aria-label="play"
                    >
                      <span className="w-16 h-16 rounded-full bg-white/95 shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 text-on-surface ml-1" fill="currentColor" />
                      </span>
                    </button>
                  </div>
                  <div>
                    <span className="font-label text-[10px] uppercase tracking-widest bg-white/10 text-white/80 px-2.5 py-1 rounded">
                      {t.discovery.filters[openItem.category] ?? openItem.category}
                    </span>
                    <h2 className="font-headline italic text-white text-2xl md:text-3xl mt-3 leading-tight">
                      {openItem.title}
                    </h2>
                    <p className="font-label text-white/60 text-[11px] uppercase tracking-widest mt-2">
                      {t.discovery.by} {openItem.creator}
                    </p>
                  </div>
                </div>

                {/* Right: creator card */}
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
                          <Star className="w-3 h-3 fill-tertiary text-tertiary" />
                          <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                            {creator.rating} · {creator.orders} {t.creators.projectsLabel}
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
                        {t.creators.fromLabel}
                      </span>
                      <span className="font-headline text-[20px] text-on-surface">
                        ¥{creator.rateCard.from.toLocaleString()}+
                      </span>
                    </div>

                    <div className="space-y-2">
                      {activeRole === "backer" && (
                        <button
                          onClick={() => startConversation(creator.id)}
                          className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider py-3 rounded-lg hover:opacity-90 active:scale-95 transition-all"
                        >
                          <MessageCircle className="w-4 h-4" /> {t.chat.startConversation}
                        </button>
                      )}
                      <Link
                        href={`/market/creators/${creator.id}`}
                        onClick={() => setOpenItem(null)}
                        className="w-full flex items-center justify-center gap-1.5 font-label text-label-md uppercase tracking-wider py-3 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-colors"
                      >
                        {t.needDetail.viewProfile} <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Floating agent prompt — expands on focus with file upload */}
      <div
        className={cn(
          "fixed left-1/2 -translate-x-1/2 w-[94%] max-w-[820px] z-40 pointer-events-none transition-all duration-500 ease-out",
          promptExpanded ? "bottom-10" : "bottom-8"
        )}
      >
        <div
          ref={promptRef}
          onClick={() => setPromptExpanded(true)}
          className={cn(
            "pointer-events-auto rounded-[28px] border border-outline-variant/30 transition-all duration-500 ease-out overflow-hidden",
            promptExpanded
              ? "shadow-[0_24px_60px_rgba(110,91,71,0.28)] ring-1 ring-primary/15"
              : "shadow-2xl"
          )}
          style={{
            background: "rgba(255, 248, 245, 0.85)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
          }}
        >
          {/* Attachment chips */}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setFiles((prev) => prev.filter((_, idx) => idx !== i));
                    }}
                    className="ml-0.5 w-4 h-4 rounded-full hover:bg-on-primary-container/10 flex items-center justify-center"
                    aria-label="remove attachment"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Main row */}
          <div className="flex items-end gap-3 px-4 py-3">
            <Wand2 className={cn("text-primary shrink-0 transition-all duration-300", promptExpanded ? "w-5 h-5 mb-2.5" : "w-5 h-5 mb-1.5")} />
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
              placeholder={activeRole === "backer" ? t.discovery.promptBacker : t.discovery.promptCreator}
              className={cn(
                "flex-1 bg-transparent border-none resize-none focus:outline-none focus:ring-0 font-body text-base md:text-lg placeholder:text-on-surface-variant/60 transition-all duration-500 ease-out",
                promptExpanded ? "min-h-[96px]" : "min-h-[28px]"
              )}
              style={{ maxHeight: promptExpanded ? 200 : 28 }}
            />
            <button
              onClick={sendPrompt}
              disabled={!prompt.trim() && files.length === 0}
              className="bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-5 md:px-6 py-3 rounded-2xl hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <span className="hidden sm:inline">{t.discovery.send}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom toolbar — slides in when expanded */}
          {promptExpanded && (
            <div className="flex items-center gap-3 px-5 pb-3 pt-2 border-t border-outline-variant/20 animate-fade-up">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={onFilePick}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={files.length >= 5}
                className="flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider px-3 py-1.5 rounded-lg border border-outline-variant/40 hover:border-primary/40 hover:text-primary text-on-surface-variant transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Paperclip className="w-3.5 h-3.5" /> {t.discovery.attach}
              </button>
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">
                {files.length}/5
              </span>
              <span className="ml-auto font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60 hidden sm:inline">
                {t.discovery.shiftEnterHint}
              </span>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function MasonryCard({
  item,
  index,
  gradient,
  byLabel,
  onOpen,
}: {
  item: Item;
  index: number;
  gradient: string;
  byLabel: string;
  onOpen: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [w, h] = ASPECT_DIM[item.aspect];
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "break-inside-avoid mb-3 md:mb-4 relative overflow-hidden rounded-2xl bg-gradient-to-br group hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20 transition-all duration-500 cursor-pointer w-full text-left animate-fade-up",
        ASPECT_CLASS[item.aspect],
        gradient
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {!loaded && <span className="shimmer-overlay" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://picsum.photos/seed/${item.seed}/${w}/${h}`}
        alt={item.title}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105",
          loaded ? "opacity-100" : "opacity-0"
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <span className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-white">
          <Play className="w-3.5 h-3.5 ml-0.5" fill="currentColor" />
        </span>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
          <p className="font-headline italic text-white text-base md:text-lg leading-tight">{item.title}</p>
          <p className="font-label text-white/70 text-[10px] uppercase tracking-widest mt-1">
            {byLabel} {item.creator}
          </p>
        </div>
      </div>
    </button>
  );
}

function StaggerText({ text, baseDelay = 0, step = 50 }: { text: string; baseDelay?: number; step?: number }) {
  return (
    <>
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          className="inline-block animate-fade-up"
          style={{ animationDelay: `${baseDelay + i * step}ms` }}
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </>
  );
}

function RoleCard({
  icon: Icon,
  title,
  desc,
  cta,
  onClick,
}: {
  icon: typeof Megaphone;
  title: string;
  desc: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group text-left bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 hover:border-primary hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-1"
    >
      <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors">
        <Icon className="w-6 h-6" />
      </div>
      <h2 className="font-headline text-[28px] text-on-surface leading-tight mb-3">{title}</h2>
      <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-6">{desc}</p>
      <span className="inline-flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider text-primary">
        {cta} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </span>
    </button>
  );
}
