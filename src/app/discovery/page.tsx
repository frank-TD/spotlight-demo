"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useStore } from "@/lib/store";
import { useT } from "@/hooks/useT";
import { getAgentReply } from "@/lib/agent-response";
import { Sparkles, Send, Megaphone, Camera, Wand2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
  } = useStore();
  const t = useT();
  const [filter, setFilter] = useState("All");
  const [prompt, setPrompt] = useState("");

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
    if (!q) return;
    const resp = getAgentReply(q, locale);
    appendAgentMessages([
      { role: "user", text: q },
      { role: "agent", text: resp.a, link: resp.link },
    ]);
    setPrompt("");
    openAgent();
  };

  return (
    <AppShell>
      <main className="max-w-[1800px] mx-auto px-4 md:px-6 pt-10 pb-48">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-up">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-tertiary-container text-on-tertiary-container font-label text-[11px] uppercase tracking-[0.2em]">
            <Sparkles className="w-3 h-3" /> {t.discovery.badge}
          </div>
          <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tighter leading-[0.95]">
            {t.discovery.title1}{" "}
            <span
              className="italic font-headline"
              style={{
                background: "linear-gradient(135deg, #6e5b47 0%, #dcc2aa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t.discovery.title2}
            </span>
          </h1>
          <p className="font-body text-on-surface-variant text-base md:text-xl max-w-3xl mx-auto opacity-80 leading-relaxed">
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

        {/* Masonry */}
        <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-3 md:gap-4">
          {filtered.map((item, i) => {
            const grad = GRADIENTS[i % GRADIENTS.length];
            const [w, h] = ASPECT_DIM[item.aspect];
            return (
              <div
                key={item.id}
                className={cn(
                  "break-inside-avoid mb-3 md:mb-4 relative overflow-hidden rounded-2xl bg-gradient-to-br group hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20 transition-all duration-500",
                  ASPECT_CLASS[item.aspect],
                  grad
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://picsum.photos/seed/${item.seed}/${w}/${h}`}
                  alt={item.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="font-headline italic text-white text-base md:text-lg leading-tight">{item.title}</p>
                    <p className="font-label text-white/70 text-[10px] uppercase tracking-widest mt-1">
                      {t.discovery.by} {item.creator}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating agent prompt */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[94%] max-w-[820px] z-40 pointer-events-none">
        <div
          className="pointer-events-auto rounded-[28px] shadow-2xl border border-outline-variant/30 flex items-center gap-3 px-3 py-3 transition-all"
          style={{
            background: "rgba(255, 248, 245, 0.78)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
          }}
        >
          <Wand2 className="w-5 h-5 text-primary shrink-0 ml-2" />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendPrompt()}
            placeholder={activeRole === "backer" ? t.discovery.promptBacker : t.discovery.promptCreator}
            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 font-body text-base md:text-lg placeholder:text-on-surface-variant/60"
          />
          <button
            onClick={sendPrompt}
            disabled={!prompt.trim()}
            className="bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-5 md:px-6 py-3 rounded-2xl hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline">{t.discovery.send}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </AppShell>
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
