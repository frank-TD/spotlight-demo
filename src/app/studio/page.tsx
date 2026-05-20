"use client";
import AppShell from "@/components/layout/AppShell";
import { Sparkles, Wand2 } from "lucide-react";
import { useT } from "@/hooks/useT";
import { toast } from "sonner";

export default function StudioPage() {
  const t = useT();

  return (
    <AppShell>
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 pt-10 pb-16">
        <div className="animate-fade-up mb-12 text-center md:text-left" style={{ animationDelay: "0ms" }}>
          <h1 className="font-headline text-headline-lg text-on-surface">{t.studio.title}</h1>
          <p className="text-on-surface-variant mt-2 font-body opacity-80 italic">{t.studio.subtitle}</p>
        </div>

        <div
          className="animate-fade-up bg-surface-container-lowest border border-outline-variant/30 rounded-2xl px-6 py-24 flex flex-col items-center text-center"
          style={{ animationDelay: "120ms" }}
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center mb-6">
            <Wand2 className="w-7 h-7 text-on-primary-container" />
          </div>
          <span className="flex items-center gap-1 bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full font-label text-[11px] tracking-widest uppercase mb-6">
            <Sparkles className="w-3 h-3" /> {t.studio.comingSoon}
          </span>
          <p className="font-body text-on-surface-variant max-w-md leading-relaxed mb-8">
            {t.studio.comingSoonDesc}
          </p>
          <button
            onClick={() => toast.success(t.studio.notifyMe)}
            className="font-label text-label-md uppercase tracking-wider px-6 py-3 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors"
          >
            {t.studio.notifyMe}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
