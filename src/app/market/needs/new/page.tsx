"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useT } from "@/hooks/useT";

const STYLE_OPTIONS = ["Cinematic", "Minimal", "Tech", "Anime", "Surreal", "Warm", "Commercial", "Documentary", "Abstract", "Neon"];
const PLATFORMS = ["YouTube", "TikTok", "Instagram", "Bilibili", "Netflix", "Website", "LinkedIn"];

export default function NewNeedPage() {
  const router = useRouter();
  const t = useT();
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success(t.postNeed.publishedToast);
    router.push("/market");
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link href="/market" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> {t.common.back}
        </Link>

        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">{t.postNeed.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.postNeed.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic info */}
          <div className="bg-white border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">{t.postNeed.basicInfo}</h2>
            <div>
              <Label className="text-sm">{t.postNeed.projectTitle}</Label>
              <Input className="mt-1.5" placeholder={t.postNeed.projectTitlePlaceholder} defaultValue="" />
            </div>
            <div>
              <Label className="text-sm">{t.postNeed.contentType}</Label>
              <select className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                {t.postNeed.contentTypes.map(ct => <option key={ct}>{ct}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-sm">{t.postNeed.visualStyleTags}</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {STYLE_OPTIONS.map(s => (
                  <button
                    key={s} type="button"
                    onClick={() => toggle(selectedStyles, setSelectedStyles, s)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selectedStyles.includes(s) ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm">{t.postNeed.projectBrief}</Label>
              <Textarea className="mt-1.5 resize-none text-sm" rows={4} placeholder={t.postNeed.projectBriefPlaceholder} />
            </div>
          </div>

          {/* Production specs */}
          <div className="bg-white border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">{t.postNeed.productionSpecs}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">{t.postNeed.duration}</Label>
                <Input className="mt-1.5" type="number" defaultValue="90" />
              </div>
              <div>
                <Label className="text-sm">{t.postNeed.episodesLabel}</Label>
                <Input className="mt-1.5" type="number" defaultValue="1" />
              </div>
              <div>
                <Label className="text-sm">{t.postNeed.aspectRatio}</Label>
                <select className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  <option>16:9</option>
                  <option>9:16</option>
                  <option>1:1</option>
                  <option>4:3</option>
                </select>
              </div>
              <div>
                <Label className="text-sm">{t.postNeed.revisionLimit}</Label>
                <Input className="mt-1.5" type="number" defaultValue="3" />
              </div>
            </div>
            <div>
              <Label className="text-sm">{t.postNeed.publishPlatforms}</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {PLATFORMS.map(p => (
                  <button
                    key={p} type="button"
                    onClick={() => toggle(selectedPlatforms, setSelectedPlatforms, p)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selectedPlatforms.includes(p) ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Commercial terms */}
          <div className="bg-white border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">{t.postNeed.commercialTerms}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">{t.postNeed.budget}</Label>
                <Input className="mt-1.5" type="number" defaultValue="4500" />
              </div>
              <div>
                <Label className="text-sm">{t.postNeed.deliveryDays}</Label>
                <Input className="mt-1.5" type="number" defaultValue="21" />
              </div>
            </div>
            <div>
              <Label className="text-sm">{t.postNeed.copyrightLabel}</Label>
              <select className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                {t.postNeed.copyrightOptions.map(co => <option key={co}>{co}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-border accent-primary" />
                {t.postNeed.aiAllowed}
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="rounded border-border accent-primary" />
                {t.postNeed.ndaRequired}
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>{t.postNeed.saveAsDraft}</Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? t.postNeed.publishing : t.postNeed.publishNeed}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
