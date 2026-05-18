"use client";
import AppShell from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Wand2 } from "lucide-react";
import { useT } from "@/hooks/useT";
import { toast } from "sonner";

export default function StudioPage() {
  const t = useT();

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">{t.studio.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t.studio.subtitle}</p>
        </div>

        <div className="bg-white border border-border rounded-2xl px-6 py-20 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-5">
            <Wand2 className="w-6 h-6 text-primary" />
          </div>
          <Badge variant="outline" className="text-primary border-primary/30 bg-accent gap-1 text-xs mb-4">
            <Sparkles className="w-3 h-3" /> {t.studio.comingSoon}
          </Badge>
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed mb-6">
            {t.studio.comingSoonDesc}
          </p>
          <Button variant="outline" size="sm" onClick={() => toast.success(t.studio.notifyMe)}>
            {t.studio.notifyMe}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
