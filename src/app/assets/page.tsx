"use client";
import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { MY_ASSETS_CREATED, MY_ASSETS_PURCHASED } from "@/lib/mock-data";
import { Upload, Download, Trash2, Star, ExternalLink, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import { useT } from "@/hooks/useT";

export default function AssetsPage() {
  const [tab, setTab] = useState<"created" | "purchased">("created");
  const t = useT();

  return (
    <AppShell>
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 pt-10 pb-16">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h1 className="font-headline text-headline-lg text-on-surface">{t.assets.title}</h1>
            <p className="text-on-surface-variant mt-2 font-body opacity-80 italic">{t.assets.subtitle}</p>
          </div>
          {tab === "created" && (
            <button
              onClick={() => toast.info(t.assets.uploadToast)}
              className="flex items-center gap-1.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-5 py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition-all"
            >
              <Upload className="w-4 h-4" /> {t.assets.uploadBtn}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-outline-variant/30 mb-8 gap-2">
          {(["created", "purchased"] as const).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={cn(
                "px-4 py-3 font-label text-label-md uppercase tracking-wider transition-colors border-b-2 -mb-px",
                tab === tabKey
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              )}
            >
              {tabKey === "created"
                ? t.assets.myCreations(MY_ASSETS_CREATED.length)
                : t.assets.purchased(MY_ASSETS_PURCHASED.length)}
            </button>
          ))}
        </div>

        {tab === "created" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MY_ASSETS_CREATED.map((asset, i) => (
              <div
                key={asset.id}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden group hover:shadow-md transition-shadow"
              >
                <div
                  className={cn(
                    "aspect-video bg-gradient-to-br flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500",
                    i % 3 === 0 && "from-primary-container via-primary-fixed to-tertiary-container",
                    i % 3 === 1 && "from-tertiary-container via-tertiary-fixed to-primary-container",
                    i % 3 === 2 && "from-secondary-container via-secondary-fixed to-primary-container"
                  )}
                >
                  <Film className="w-10 h-10 text-primary opacity-70" />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-headline text-[18px] text-on-surface leading-snug">{asset.title}</p>
                    {asset.showcased && <Star className="w-4 h-4 fill-tertiary text-tertiary shrink-0 mt-1" />}
                  </div>
                  <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mb-1">
                    {asset.size} · {asset.duration}
                  </p>
                  {asset.orderId && (
                    <Link
                      href={`/orders/${asset.orderId}`}
                      className="font-label text-[11px] tracking-wider text-primary hover:underline flex items-center gap-1 mt-2"
                    >
                      {asset.orderTitle} <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 flex items-center justify-center gap-1.5 border border-outline-variant rounded-lg px-3 py-2 font-label text-label-md uppercase tracking-wider hover:bg-surface-container-high transition-colors">
                      <Download className="w-3.5 h-3.5" /> {t.assets.downloadBtn}
                    </button>
                    <button
                      onClick={() => toast.error(t.assets.cannotDeleteToast)}
                      className="px-3 py-2 text-on-surface-variant hover:text-error hover:bg-error-container/40 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "purchased" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MY_ASSETS_PURCHASED.map((asset, i) => (
              <div
                key={asset.id}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden group hover:shadow-md transition-shadow"
              >
                <div
                  className={cn(
                    "aspect-video bg-gradient-to-br flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500",
                    i % 3 === 0 && "from-primary-container via-primary-fixed to-tertiary-container",
                    i % 3 === 1 && "from-tertiary-container via-tertiary-fixed to-primary-container",
                    i % 3 === 2 && "from-secondary-container via-secondary-fixed to-primary-container"
                  )}
                >
                  <Film className="w-10 h-10 text-primary opacity-70" />
                </div>
                <div className="p-5">
                  <p className="font-headline text-[18px] text-on-surface mb-1">{asset.title}</p>
                  <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mb-3">
                    {t.assets.byAuthor} {asset.creatorName} · {asset.size}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-label text-[10px] uppercase tracking-widest bg-primary-container text-on-primary-container px-2 py-1 rounded">
                      {asset.copyright}
                    </span>
                    {!asset.subLicensable && (
                      <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                        {t.assets.nonTransferable}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/orders/${asset.orderId}`}
                    className="font-label text-[11px] tracking-wider text-primary hover:underline flex items-center gap-1 mb-4"
                  >
                    {t.assets.sourceOrder} <ExternalLink className="w-3 h-3" />
                  </Link>
                  <button className="w-full flex items-center justify-center gap-1.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                    <Download className="w-3.5 h-3.5" /> {t.assets.downloadBtn}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
