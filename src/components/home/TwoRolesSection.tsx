"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { ArrowRight, Check } from "lucide-react";
import SectionLabel from "./SectionLabel";
import { useT } from "@/hooks/useT";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function TwoRolesSection() {
  const t = useT();
  const router = useRouter();
  const isLoggedIn = useStore((s) => s.isLoggedIn);

  const go = (path: string, gateMsg: string) => {
    if (!isLoggedIn) {
      toast.info(gateMsg);
      router.push("/register");
      return;
    }
    router.push(path);
  };

  return (
    <section className="py-24 md:py-32 text-center">
      <div className="space-y-4 mb-16">
        <div className="scroll-reveal flex justify-center">
          <SectionLabel>{t.landing.rolesLabel}</SectionLabel>
        </div>
        <h2
          className="scroll-reveal font-headline text-4xl md:text-6xl text-on-surface leading-[1.05]"
          style={{ animationDelay: "90ms" }}
        >
          {t.landing.rolesTitle1}
          <br />
          <span className="italic">{t.landing.rolesTitle2}</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto text-left">
        <RoleCard
          seed="patron-stage"
          chip={t.landing.patronChip}
          chipColor="gold"
          title={t.landing.patronTitle}
          body={t.landing.patronBody}
          bullets={[t.landing.patronB1, t.landing.patronB2, t.landing.patronB3, t.landing.patronB4]}
          cta={t.landing.patronCta}
          onClick={() => go("/market", t.landing.signupToastBrief)}
        />
        <RoleCard
          seed="creator-stage"
          chip={t.landing.creatorChip}
          chipColor="blue"
          title={t.landing.creatorTitle}
          body={t.landing.creatorBody}
          bullets={[
            t.landing.creatorB1,
            t.landing.creatorB2,
            t.landing.creatorB3,
            t.landing.creatorB4,
          ]}
          cta={t.landing.creatorCta}
          onClick={() => go("/register", t.landing.signupToastBrowse)}
          delay={120}
        />
      </div>
    </section>
  );
}

function RoleCard({
  seed,
  chip,
  chipColor,
  title,
  body,
  bullets,
  cta,
  onClick,
  delay = 0,
}: {
  seed: string;
  chip: string;
  chipColor: "gold" | "blue";
  title: string;
  body: string;
  bullets: string[];
  cta: string;
  onClick: () => void;
  delay?: number;
}) {
  return (
    <button
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
      className="scroll-reveal group rounded-3xl bg-surface-container-lowest border border-outline-variant/40 overflow-hidden text-left hover:border-primary/40 hover:shadow-[0_30px_70px_rgba(0,0,0,0.5)] transition-all"
    >
      {/* Top photo with category-tinted gradient overlay */}
      <div className="relative aspect-[16/10] bg-surface-container overflow-hidden">
        <Image
          src={`https://picsum.photos/seed/${seed}/1200/750`}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover opacity-70 group-hover:scale-[1.03] transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/85" />
      </div>

      <div className="p-7 md:p-9">
        <span
          className={cn(
            "inline-flex items-center font-label text-[10px] uppercase tracking-[0.22em] px-2.5 py-1.5 rounded mb-5",
            chipColor === "gold"
              ? "bg-primary/15 text-primary border border-primary/30"
              : "bg-secondary/15 text-secondary border border-secondary/30"
          )}
        >
          {chip}
        </span>
        <h3 className="font-headline text-2xl md:text-3xl text-on-surface leading-tight mb-3">
          {title}
        </h3>
        <p className="font-body text-on-surface-variant text-sm md:text-base leading-relaxed mb-6">
          {body}
        </p>
        <ul className="space-y-2.5 mb-8">
          {bullets.map((b) => (
            <li
              key={b}
              className="flex items-start gap-2.5 font-body text-sm text-on-surface-variant"
            >
              <Check
                className={cn(
                  "w-4 h-4 mt-0.5 shrink-0",
                  chipColor === "gold" ? "text-primary" : "text-secondary"
                )}
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <span
          className={cn(
            "inline-flex items-center gap-2 font-label text-[11px] uppercase tracking-[0.24em] transition-transform group-hover:translate-x-1",
            chipColor === "gold" ? "text-primary" : "text-secondary"
          )}
        >
          {cta} <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </button>
  );
}
