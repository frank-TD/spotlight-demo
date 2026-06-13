"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionLabel from "./SectionLabel";
import HorizontalCardRow, { type RowCard } from "./HorizontalCardRow";
import { useT } from "@/hooks/useT";

const TRENDING: RowCard[] = [
  {
    id: "t1",
    title: "Celestial Entity",
    creator: "Sofia Okonkwo",
    city: "Seoul",
    category: "Cinematic",
    priceRange: "¥120K–480K",
    seed: "celestial",
  },
  {
    id: "t2",
    title: "Neon Rain",
    creator: "Yuki Tanaka",
    city: "Osaka",
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
    creator: "Sofia Okonkwo",
    city: "Seoul",
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
          <div className="scroll-reveal">
            <SectionLabel>{t.landing.trendingLabel}</SectionLabel>
          </div>
          <h2
            className="scroll-reveal font-headline text-4xl md:text-5xl text-on-surface leading-tight max-w-3xl"
            style={{ animationDelay: "90ms" }}
          >
            {t.landing.trendingTitle}
          </h2>
        </div>
        <Link
          href="/market/creators"
          className="font-label text-[12px] uppercase tracking-[0.18em] text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-2"
        >
          {t.landing.trendingSeeAll} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <HorizontalCardRow items={TRENDING} />
    </section>
  );
}
