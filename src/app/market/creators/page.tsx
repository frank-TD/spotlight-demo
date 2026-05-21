"use client";
import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { CREATORS } from "@/lib/mock-data";
import Link from "next/link";
import { Star, Search, Sparkles, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";

const STYLE_FILTER_KEYS = ["All", "Cinematic", "Commercial", "Anime", "Documentary"];

type PriceTier = "all" | "low" | "mid" | "high";

export default function CreatorsPage() {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [priceTier, setPriceTier] = useState<PriceTier>("all");
  const t = useT();

  const matchPrice = (from: number) => {
    if (priceTier === "low") return from <= 2500;
    if (priceTier === "mid") return from > 2500 && from < 3500;
    if (priceTier === "high") return from >= 3500;
    return true;
  };

  const filtered = CREATORS.filter((c) => {
    const matchStyle = filter === "All" || c.specialties.some((s) => s.includes(filter));
    const matchQuery =
      !query ||
      c.nickname.toLowerCase().includes(query.toLowerCase()) ||
      c.specialties.some((s) => s.toLowerCase().includes(query.toLowerCase()));
    return matchStyle && matchQuery && matchPrice(c.rateCard.from);
  });

  return (
    <AppShell>
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 pt-10 pb-16">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-10">
          <div>
            <h1 className="font-headline text-headline-lg text-on-surface">{t.creators.title}</h1>
            <p className="text-on-surface-variant mt-2 font-body opacity-80 italic">
              {t.creators.available(CREATORS.length)}
            </p>
          </div>
          <span className="flex items-center gap-1 bg-primary-container text-on-primary-container px-3 py-1.5 rounded-full font-label text-label-md uppercase tracking-widest self-start md:self-auto">
            <Sparkles className="w-3.5 h-3.5" /> {t.creators.aiRanked}
          </span>
        </div>

        {/* Search + filters */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input
              className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:outline-none font-body text-sm"
              placeholder={t.creators.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {STYLE_FILTER_KEYS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "font-label text-label-md uppercase tracking-wider px-4 py-2 rounded-full border transition-colors",
                  filter === f
                    ? "bg-primary text-on-primary border-primary"
                    : "border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-primary/40"
                )}
              >
                {t.creators.styleFilters[f] ?? f}
              </button>
            ))}
            {/* Rate filter */}
            <select
              value={priceTier}
              onChange={(e) => setPriceTier(e.target.value as PriceTier)}
              className={cn(
                "font-label text-label-md uppercase tracking-wider px-4 py-2 rounded-full border bg-surface-container-low transition-colors cursor-pointer focus:outline-none focus:border-primary",
                priceTier !== "all"
                  ? "border-primary text-primary"
                  : "border-outline-variant text-on-surface-variant hover:border-primary/40"
              )}
            >
              <option value="all">{t.creators.priceAll}</option>
              <option value="low">{t.creators.priceLow}</option>
              <option value="mid">{t.creators.priceMid}</option>
              <option value="high">{t.creators.priceHigh}</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <p className="font-body text-sm text-on-surface-variant text-center py-20">{t.creators.noResults}</p>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((creator) => (
            <Link key={creator.id} href={`/market/creators/${creator.id}`}>
              <div className="group bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 h-full flex flex-col hover:shadow-md hover:border-primary/40 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold",
                      creator.avatarColor
                    )}
                  >
                    {creator.avatar}
                  </div>
                  <span className="w-9 h-9 flex items-center justify-center rounded-full border border-outline-variant text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary group-hover:border-primary transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>

                <p className="font-headline text-[20px] text-on-surface">{creator.nickname}</p>
                <div className="flex items-center gap-1.5 mt-1 mb-3">
                  <Star className="w-3 h-3 fill-tertiary text-tertiary" />
                  <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                    {creator.rating} · {creator.orders} {t.creators.projectsLabel}
                  </span>
                </div>

                <p className="font-body text-xs text-on-surface-variant leading-relaxed mb-4 flex-1 line-clamp-2">
                  {creator.bio}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {creator.specialties.slice(0, 2).map((s) => (
                    <span
                      key={s}
                      className="font-label text-[10px] uppercase tracking-widest bg-primary-container text-on-primary-container px-2.5 py-0.5 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
                  <span className="font-label text-label-md uppercase tracking-widest text-on-surface-variant">
                    {t.creators.fromLabel}
                  </span>
                  <span className="font-headline text-[16px] text-on-surface">
                    ¥{creator.rateCard.from.toLocaleString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        )}
      </div>
    </AppShell>
  );
}
