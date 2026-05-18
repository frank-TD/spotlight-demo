"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import AppShell from "@/components/layout/AppShell";
import { MY_ASSETS_CREATED, MY_ASSETS_PURCHASED } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, Trash2, Star, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

export default function AssetsPage() {
  const [tab, setTab] = useState<"created" | "purchased">("created");

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">Asset Library</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Your created and purchased works</p>
          </div>
          {tab === "created" && (
            <Button size="sm" className="gap-1.5 text-xs" onClick={() => toast.info("Upload dialog would open here")}>
              <Upload className="w-3.5 h-3.5" /> Upload
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-6 gap-0">
          {(["created", "purchased"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px",
                tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "created" ? `My Creations (${MY_ASSETS_CREATED.length})` : `Purchased (${MY_ASSETS_PURCHASED.length})`}
            </button>
          ))}
        </div>

        {tab === "created" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MY_ASSETS_CREATED.map(asset => (
              <div key={asset.id} className="bg-white border border-border rounded-xl overflow-hidden">
                <div className="h-32 bg-accent flex items-center justify-center">
                  <span className="text-4xl">🎬</span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-medium text-foreground leading-snug">{asset.title}</p>
                    {asset.showcased && (
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{asset.size} · {asset.type}</p>
                  {asset.orderId && (
                    <Link href={`/orders/${asset.orderId}`} className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                      {asset.orderTitle} <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1 text-xs h-7 gap-1">
                      <Download className="w-3 h-3" /> Download
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs h-7 text-destructive hover:bg-destructive/5"
                      onClick={() => toast.error("Assets linked to active orders cannot be deleted")}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "purchased" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MY_ASSETS_PURCHASED.map(asset => (
              <div key={asset.id} className="bg-white border border-border rounded-xl overflow-hidden">
                <div className="h-32 bg-accent flex items-center justify-center">
                  <span className="text-4xl">🎬</span>
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-foreground mb-1">{asset.title}</p>
                  <p className="text-xs text-muted-foreground mb-1">by {asset.creatorName} · {asset.size}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] text-primary border-primary/30 bg-accent">{asset.copyright}</Badge>
                    {!asset.subLicensable && <span className="text-[10px] text-muted-foreground">Non-transferable</span>}
                  </div>
                  <Link href={`/orders/${asset.orderId}`} className="text-[10px] text-primary hover:underline flex items-center gap-0.5 mb-3">
                    Source order <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                  <Button size="sm" className="w-full text-xs h-7 gap-1">
                    <Download className="w-3 h-3" /> Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
