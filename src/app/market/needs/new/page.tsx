"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { useT } from "@/hooks/useT";
import { cn } from "@/lib/utils";

const STYLE_OPTIONS = [
  "Cinematic",
  "Minimal",
  "Tech",
  "Anime",
  "Surreal",
  "Warm",
  "Commercial",
  "Documentary",
  "Abstract",
  "Neon",
];
const PLATFORMS = ["YouTube", "TikTok", "Instagram", "Bilibili", "Netflix", "Website", "LinkedIn"];

export default function NewNeedPage() {
  const router = useRouter();
  const t = useT();
  const { addNeed } = useStore();
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState(t.postNeed.contentTypes[0]);
  const [brief, setBrief] = useState("");
  const [duration, setDuration] = useState(90);
  const [episodes, setEpisodes] = useState(1);
  const [budget, setBudget] = useState(4500);
  const [deliveryDays, setDeliveryDays] = useState(21);

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    addNeed({
      id: `need_custom_${Date.now()}`,
      backerId: "u_backer_01",
      title: title.trim() || contentType,
      contentType,
      styles: selectedStyles,
      budget,
      deliveryDays,
      durationSec: duration,
      episodes,
      status: "open",
      publishedAt: new Date().toISOString().slice(0, 10),
      brief: brief.trim(),
    });
    toast.success(t.postNeed.publishedToast);
    router.push("/market");
  };

  const inputCls =
    "w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:outline-none font-body text-sm";
  const labelCls =
    "font-label text-label-md uppercase tracking-wider text-on-surface-variant block mb-2";

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 md:px-12 pt-8 pb-16">
        <Link
          href="/market"
          className="inline-flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider text-on-surface-variant hover:text-on-surface mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> {t.common.back}
        </Link>

        <div className="mb-10">
          <h1 className="font-headline text-headline-lg text-on-surface">{t.postNeed.title}</h1>
          <p className="text-on-surface-variant font-body opacity-80 italic mt-2">
            {t.postNeed.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic info */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-7 space-y-5">
            <h2 className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant">
              {t.postNeed.basicInfo}
            </h2>
            <div>
              <label className={labelCls}>{t.postNeed.projectTitle}</label>
              <input
                className={inputCls}
                placeholder={t.postNeed.projectTitlePlaceholder}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>{t.postNeed.contentType}</label>
              <select
                className={inputCls}
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
              >
                {t.postNeed.contentTypes.map((ct) => (
                  <option key={ct}>{ct}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>{t.postNeed.visualStyleTags}</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {STYLE_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggle(selectedStyles, setSelectedStyles, s)}
                    className={cn(
                      "font-label text-label-md uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors",
                      selectedStyles.includes(s)
                        ? "bg-primary text-on-primary border-primary"
                        : "border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-primary/40"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>{t.postNeed.projectBrief}</label>
              <textarea
                rows={4}
                className={cn(inputCls, "resize-none")}
                placeholder={t.postNeed.projectBriefPlaceholder}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
              />
            </div>
          </div>

          {/* Specs */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-7 space-y-5">
            <h2 className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant">
              {t.postNeed.productionSpecs}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t.postNeed.duration}</label>
                <input
                  className={inputCls}
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className={labelCls}>{t.postNeed.episodesLabel}</label>
                <input
                  className={inputCls}
                  type="number"
                  value={episodes}
                  onChange={(e) => setEpisodes(Number(e.target.value) || 1)}
                />
              </div>
              <div>
                <label className={labelCls}>{t.postNeed.aspectRatio}</label>
                <select className={inputCls}>
                  <option>16:9</option>
                  <option>9:16</option>
                  <option>1:1</option>
                  <option>4:3</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>{t.postNeed.revisionLimit}</label>
                <input className={inputCls} type="number" defaultValue="3" />
              </div>
            </div>
            <div>
              <label className={labelCls}>{t.postNeed.publishPlatforms}</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => toggle(selectedPlatforms, setSelectedPlatforms, p)}
                    className={cn(
                      "font-label text-label-md uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors",
                      selectedPlatforms.includes(p)
                        ? "bg-primary text-on-primary border-primary"
                        : "border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-primary/40"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Commercial terms */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-7 space-y-5">
            <h2 className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant">
              {t.postNeed.commercialTerms}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t.postNeed.budget}</label>
                <input
                  className={inputCls}
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className={labelCls}>{t.postNeed.deliveryDays}</label>
                <input
                  className={inputCls}
                  type="number"
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(Number(e.target.value) || 0)}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>{t.postNeed.copyrightLabel}</label>
              <select className={inputCls}>
                {t.postNeed.copyrightOptions.map((co) => (
                  <option key={co}>{co}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-6 font-body text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-outline-variant accent-primary"
                />
                {t.postNeed.aiAllowed}
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-outline-variant accent-primary" />
                {t.postNeed.ndaRequired}
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 font-label text-label-md uppercase tracking-wider py-3 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors"
            >
              {t.postNeed.saveAsDraft}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 font-label text-label-md uppercase tracking-wider py-3 bg-primary text-on-primary rounded-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
            >
              {submitting ? t.postNeed.publishing : t.postNeed.publishNeed}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
