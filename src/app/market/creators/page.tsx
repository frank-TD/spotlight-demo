"use client";
import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { CREATORS } from "@/lib/mock-data";
import Link from "next/link";
import { Star, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STYLE_FILTERS = ["All", "Cinematic", "Commercial", "Anime", "Documentary"];

export default function CreatorsPage() {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = CREATORS.filter(c => {
    const matchStyle = filter === "All" || c.specialties.some(s => s.includes(filter));
    const matchQuery = !query || c.nickname.toLowerCase().includes(query.toLowerCase()) || c.specialties.some(s => s.toLowerCase().includes(query.toLowerCase()));
    return matchStyle && matchQuery;
  });

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">Discover Creators</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{CREATORS.length} creators available</p>
          </div>
          <Badge variant="outline" className="text-primary border-primary/30 bg-accent gap-1 text-xs">
            <Sparkles className="w-3 h-3" /> AI-ranked for you
          </Badge>
        </div>

        {/* Search + filter */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9 text-sm"
              placeholder="Search by name or style..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5">
            {STYLE_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full border transition-colors",
                  filter === f ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary/50"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map(creator => (
            <Link key={creator.id} href={`/market/creators/${creator.id}`}>
              <div className="bg-white border border-border rounded-xl p-5 hover:border-primary/40 transition-colors cursor-pointer group h-full flex flex-col">
                {/* Avatar */}
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold mb-3", creator.avatarColor)}>
                  {creator.avatar}
                </div>

                {/* Info */}
                <p className="text-sm font-semibold text-foreground">{creator.nickname}</p>
                <div className="flex items-center gap-1 mt-0.5 mb-2">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-muted-foreground">{creator.rating} · {creator.orders} projects</span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed mb-3 flex-1 line-clamp-2">{creator.bio}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {creator.specialties.slice(0, 2).map(s => (
                    <span key={s} className="text-[10px] bg-accent text-primary px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>

                {/* Rate */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">From</span>
                  <span className="text-sm font-semibold text-foreground">¥{creator.rateCard.from.toLocaleString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
