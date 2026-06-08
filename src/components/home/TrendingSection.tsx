"use client";
import Link from "next/link";
import { useT } from "@/hooks/useT";
import { ArrowRight } from "lucide-react";
import SectionLabel from "./SectionLabel";
import HorizontalCardRow, { type RowCard } from "./HorizontalCardRow";

const TRENDING: RowCard[] = [
  {
    id: "t1",
    title: "Celestial Entity",
    creator: "Luna Chen",
    city: "Hong Kong",
    category: "Cinematic",
    priceRange: "¥120K–480K",
    seed: "celestial",
  },
  {
    id: "t2",
    title: "Neon Rain",
    creator: "NeoFrame Studio",
    city: "Taipei",
    category: "Sci-Fi",
    priceRange: "¥200K–650K",
    seed: "neonrain",
  },
  {
    id: "t3",
    title: "Golden Core",
    creator: "Aria Song",
    city: "Shanghai",
    category: "Cinematic",
    priceRange: "¥150K–520K",
    seed: "goldencore",
  },
  {
    id: "t4",
    title: "Aurora Crystal",
    creator: "Marcus Yip",
    city: "Singapore",
    category: "Documentary",
    priceRange: "¥80K–320K",
    seed: "aurora",
  },
  {
    id: "t5",
    title: "Cyber Ghost",
    creator: "Marco Reyes",
    city: "Tokyo",
    category: "Sci-Fi",
    priceRange: "¥200K–650K",
    seed: "cyberghost",
  },
];

export default function TrendingSection() {
  const t = useT();
  return (
    <section className="py-24 md:py-32">
      <div className="flex items-end justify-between gap-6 mb-12 flex-wrap">
        <div className="space-y-4">
          <SectionLabel>{t.landing.trendingLabel}</SectionLabel>
          <h2 className="font-headline text-4xl md:text-5xl text-on-surface leading-tight max-w-3xl">
            {t.landing.trendingTitle}
          </h2>
        </div>
        <Link
          href="/market/creators"
          className="font-label text-[11px] uppercase tracking-[0.24em] text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-2"
        >
          {t.landing.trendingSeeAll} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <HorizontalCardRow items={TRENDING} />
    </section>
  );
}
