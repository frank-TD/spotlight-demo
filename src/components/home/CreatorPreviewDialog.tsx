"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star, Play, MessageCircle, ArrowUpRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { useT } from "@/hooks/useT";
import { CREATORS, findSessionForCounterpart } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export interface CreatorPreviewItem {
  title: string;
  creator: string;
  category: string;
  seed: string;
}

// Lightbox triggered from any work-card on the marketing homepage. Mirrors the
// behavior on /discovery (see src/app/discovery/page.tsx) — left side is the
// work preview, right side is the creator's card. Looks the creator up by
// nickname; if they aren't in CREATORS (e.g. some demo entries in Trending
// like "NeoFrame Studio"), the right column collapses gracefully.
export default function CreatorPreviewDialog({
  item,
  onOpenChange,
}: {
  item: CreatorPreviewItem | null;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const router = useRouter();
  const isLoggedIn = useStore((s) => s.isLoggedIn);
  const activeRole = useStore((s) => s.activeRole);
  const viewerRole = isLoggedIn ? activeRole : "backer";

  const creator = item ? CREATORS.find((c) => c.nickname === item.creator) : undefined;
  const previewW = 1280;
  const previewH = Math.round((previewW * 9) / 16);

  // Backer wants to chat → real session if available, else the message inbox
  // (where the demo flow takes them through invitation). Anonymous users are
  // gated through /register.
  const startConversation = (creatorId: string) => {
    onOpenChange(false);
    if (!isLoggedIn) {
      toast.info(t.landing.signupToastBrief);
      router.push("/register");
      return;
    }
    const sid = findSessionForCounterpart("backer", creatorId);
    router.push(sid ? `/messages/sessions/${sid}` : "/messages");
  };

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl p-0 overflow-hidden max-h-[90vh]">
        {item && (
          <div
            className={cn(
              "grid grid-cols-1 max-h-[90vh] overflow-hidden",
              creator && "md:grid-cols-[3fr_2fr]"
            )}
          >
            {/* Left: work preview */}
            <div className="bg-[#08080a] p-6 md:p-7 flex flex-col gap-4 overflow-y-auto">
              <div className="aspect-video relative rounded-xl overflow-hidden bg-surface-container group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://picsum.photos/seed/${item.seed}/${previewW}/${previewH}`}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => toast.info(t.discovery.playbackToast)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/45 transition-colors"
                  aria-label="play"
                >
                  <span className="w-16 h-16 rounded-full bg-primary/95 text-on-primary shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 ml-1" fill="currentColor" />
                  </span>
                </button>
              </div>
              <div>
                <span className="font-label text-[10px] uppercase tracking-widest bg-white/10 text-white/80 px-2.5 py-1 rounded">
                  {t.discovery.filters[item.category] ?? item.category}
                </span>
                <h2 className="font-headline italic text-white text-2xl md:text-3xl mt-3 leading-tight">
                  {item.title}
                </h2>
                <p className="font-label text-white/60 text-[11px] uppercase tracking-widest mt-2">
                  {t.discovery.by} {item.creator}
                </p>
              </div>
            </div>

            {/* Right: creator card (omitted when the creator isn't in our roster) */}
            {creator && (
              <div className="p-6 md:p-7 flex flex-col overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0",
                      creator.avatarColor
                    )}
                  >
                    {creator.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="font-headline text-[20px] text-on-surface truncate">
                      {creator.nickname}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Star className="w-3 h-3 fill-primary text-primary" />
                      <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                        {creator.rating} · {creator.orders} {t.creators.projectsLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {creator.specialties.map((s) => (
                    <span
                      key={s}
                      className="font-label text-[10px] uppercase tracking-widest bg-primary-container text-on-primary-container px-2.5 py-1 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-5 line-clamp-4 flex-1">
                  {creator.bio}
                </p>

                <div className="bg-surface-container rounded-xl p-4 mb-4 flex items-center justify-between">
                  <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                    {t.creators.fromLabel}
                  </span>
                  <span className="font-headline text-[20px] text-on-surface">
                    ¥{creator.rateCard.from.toLocaleString()}+
                  </span>
                </div>

                <div className="space-y-2">
                  {viewerRole === "backer" && (
                    <button
                      type="button"
                      onClick={() => startConversation(creator.id)}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider py-3 rounded-lg hover:opacity-90 active:scale-95 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" /> {t.chat.startConversation}
                    </button>
                  )}
                  <Link
                    href={`/market/creators/${creator.id}`}
                    onClick={() => onOpenChange(false)}
                    className="w-full flex items-center justify-center gap-1.5 font-label text-label-md uppercase tracking-wider py-3 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-colors"
                  >
                    {t.needDetail.viewProfile} <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
