"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import AppShell from "@/components/layout/AppShell";
import { ORDER_ACTIVE, CREATORS } from "@/lib/mock-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Send, Paperclip, Star, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";

const ARIA = CREATORS[0];

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  use(params);
  const { activeRole, creatorEdits } = useStore();
  const router = useRouter();
  const t = useT();
  const [input, setInput] = useState("");
  const [extraMsgs, setExtraMsgs] = useState<Array<{ id: string; senderId: string; senderName: string; senderRole: string; text: string; ts: string }>>([]);
  const [counterpartOpen, setCounterpartOpen] = useState(false);

  const sendMsg = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setExtraMsgs((prev) => [
      ...prev,
      {
        id: `em_${Date.now()}`,
        senderId: activeRole === "backer" ? "u_backer_01" : "u_creator_01",
        senderName: activeRole === "backer" ? "Lucas Chen" : "Aria Song",
        senderRole: activeRole === "backer" ? t.chat.roleBacker : t.chat.roleCreator,
        text: trimmed,
        ts: new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setInput("");
  };

  const counterpartIsCreator = activeRole === "backer";
  const counterpart = counterpartIsCreator
    ? {
        name: creatorEdits.nickname ?? ARIA.nickname,
        avatar: ARIA.avatar,
        avatarUrl: creatorEdits.avatarUrl,
        role: t.chat.roleCreator,
        bio: creatorEdits.bio ?? ARIA.bio,
        specialties: creatorEdits.specialties ?? ARIA.specialties,
        rating: ARIA.rating as number | undefined,
        orders: ARIA.orders as number | undefined,
      }
    : {
        name: "Lucas Chen",
        avatar: "LC",
        avatarUrl: undefined as string | undefined,
        role: t.chat.roleBacker,
        bio: t.profile.bioBackerDefault,
        specialties: [] as string[],
        rating: undefined as number | undefined,
        orders: undefined as number | undefined,
      };

  const allMsgs = [...ORDER_ACTIVE.messages, ...extraMsgs];

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 md:px-12 pt-6 pb-10 h-[calc(100vh-80px)] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <Link href="/market" className="text-on-surface-variant hover:text-on-surface">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <button
            type="button"
            onClick={() => setCounterpartOpen(true)}
            className="flex items-center gap-3 rounded-xl px-2 py-1 -mx-2 hover:bg-surface-container transition-colors text-left"
            aria-label="view counterpart profile"
          >
            {counterpart.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={counterpart.avatarUrl} alt={counterpart.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-sm font-bold">
                {counterpart.avatar}
              </div>
            )}
            <div>
              <p className="font-headline text-[18px] text-on-surface leading-tight">{counterpart.name}</p>
              <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mt-0.5">
                {t.chat.sessionSubject}
              </p>
            </div>
          </button>
          <Link
            href="/orders/ord_001"
            className="ml-auto font-label text-label-md uppercase tracking-wider px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors"
          >
            {t.chat.viewOrder}
          </Link>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 space-y-4 mb-4">
          {allMsgs.map((msg) => {
            if ((msg as { isCard?: boolean }).isCard) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="bg-primary-container/40 border border-primary/20 rounded-lg px-4 py-2.5 font-body text-xs text-on-primary-container text-center max-w-sm">
                    <span className="font-bold text-primary">{t.chat.spotlightBrand} · </span>
                    {msg.text}
                  </div>
                </div>
              );
            }
            const isMe =
              (activeRole === "backer" && msg.senderId === "u_backer_01") ||
              (activeRole === "creator" && msg.senderId === "u_creator_01");
            return (
              <div key={msg.id} className={cn("flex gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
                {!isMe && (
                  <button
                    type="button"
                    onClick={() => setCounterpartOpen(true)}
                    className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xs font-bold shrink-0 hover:ring-2 hover:ring-primary/30 transition-all overflow-hidden"
                    aria-label="view counterpart profile"
                  >
                    {counterpart.avatarUrl && counterpart.name.includes(msg.senderName) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={counterpart.avatarUrl} alt={msg.senderName} className="w-8 h-8 object-cover" />
                    ) : (
                      msg.senderName.split(" ").map((n: string) => n[0]).join("")
                    )}
                  </button>
                )}
                <div className={cn("flex flex-col gap-1 max-w-[70%]", isMe ? "items-end" : "items-start")}>
                  {!isMe && (
                    <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant px-1">
                      {msg.senderName} · {msg.senderRole}
                    </span>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 font-body text-sm leading-relaxed",
                      isMe
                        ? "bg-primary text-on-primary rounded-br-sm"
                        : "bg-surface-container text-on-surface rounded-bl-sm"
                    )}
                  >
                    {msg.text}
                  </div>
                  <span className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant/70 px-1">
                    {msg.ts}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="flex items-center gap-3 shrink-0">
          <button className="text-on-surface-variant hover:text-on-surface p-2">
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            className="flex-1 font-body text-sm rounded-xl border border-outline-variant px-4 py-3 bg-surface-container-low focus:border-primary focus:outline-none"
            placeholder={t.chat.messagePlaceholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMsg()}
          />
          <button
            onClick={sendMsg}
            className="rounded-xl px-5 py-3 bg-primary text-on-primary hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Counterpart profile dialog */}
      <Dialog open={counterpartOpen} onOpenChange={setCounterpartOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-[22px]">{counterpart.name}</DialogTitle>
          </DialogHeader>
          <div className="py-3 space-y-4">
            <div className="flex items-center gap-4">
              {counterpart.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={counterpart.avatarUrl} alt={counterpart.name} className="w-16 h-16 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xl font-bold shrink-0">
                  {counterpart.avatar}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-headline text-[18px] text-on-surface">{counterpart.name}</p>
                <span className="inline-block font-label text-[10px] uppercase tracking-widest bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded mt-1">
                  {counterpart.role}
                </span>
                {counterpartIsCreator && counterpart.rating !== undefined && (
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-3.5 h-3.5 fill-tertiary text-tertiary" />
                    <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                      {counterpart.rating} · {counterpart.orders} {t.creators.projectsLabel}
                    </span>
                  </div>
                )}
                {!counterpartIsCreator && (
                  <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mt-2">
                    {t.chat.backerCompany}
                  </p>
                )}
              </div>
            </div>

            {counterpart.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {counterpart.specialties.map((s) => (
                  <span
                    key={s}
                    className="font-label text-[11px] uppercase tracking-widest bg-primary-container text-on-primary-container px-2.5 py-1 rounded-full"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            <p className="font-body text-sm text-on-surface-variant leading-relaxed">{counterpart.bio}</p>
          </div>
          <DialogFooter>
            <button
              onClick={() => setCounterpartOpen(false)}
              className="font-label text-label-md uppercase tracking-wider px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors"
            >
              {t.chat.closeProfile}
            </button>
            {counterpartIsCreator && (
              <button
                onClick={() => {
                  setCounterpartOpen(false);
                  router.push("/market/creators/u_creator_01");
                }}
                className="flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity"
              >
                {t.chat.viewFullProfile} <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
