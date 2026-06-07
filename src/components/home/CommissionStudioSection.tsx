"use client";
import Link from "next/link";
import { useT } from "@/hooks/useT";
import { ArrowRight } from "lucide-react";
import SectionLabel from "./SectionLabel";
import HorizontalCardRow, { type RowCard } from "./HorizontalCardRow";

const STUDIO: RowCard[] = [
  { id: "s1", title: "Dune Metropolis", creator: "Aria Song",      city: "Shanghai", category: "Brand Film",  priceRange: "¥150K–520K", seed: "dune" },
  { id: "s2", title: "Static Bloom II", creator: "Sofia Okonkwo",  city: "Seoul",    category: "Commercial",  priceRange: "¥90K–280K",  seed: "staticbloom2" },
  { id: "s3", title: "Biodome Alpha",   creator: "Yuki Tanaka",    city: "Osaka",    category: "Architecture",priceRange: "¥130K–400K", seed: "biodome" },
  { id: "s4", title: "Iridescent Flow", creator: "Marco Reyes",    city: "Tokyo",    category: "Abstract",    priceRange: "¥160K–500K", seed: "iridescent" },
  { id: "s5", title: "Glassine Garden", creator: "Yuki Tanaka",    city: "Osaka",    category: "Nature",      priceRange: "¥80K–320K",  seed: "glassine" },
];

export default function CommissionStudioSection() {
  const t = useT();
  return (
    <section className="py-24 md:py-32">
      <div className="flex items-end justify-between gap-6 mb-12 flex-wrap">
        <div className="space-y-4">
          <SectionLabel>{t.landing.commissionLabel}</SectionLabel>
          <h2 className="font-headline text-4xl md:text-5xl text-on-surface leading-tight max-w-3xl">
            {t.landing.commissionTitle}
          </h2>
        </div>
        <Link
          href="/market/creators"
          className="font-label text-[11px] uppercase tracking-[0.24em] text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-2"
        >
          {t.landing.commissionSeeAll} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <HorizontalCardRow items={STUDIO} />
    </section>
  );
}
