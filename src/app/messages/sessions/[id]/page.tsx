"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import AppShell from "@/components/layout/AppShell";
import { ORDER_ACTIVE, CREATORS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Send, Paperclip, Star, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";

const ARIA = CREATORS[0]; // u_creator_01

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
    setExtraMsgs(prev => [...prev, {
      id: `em_${Date.now()}`,
      senderId: activeRole === "backer" ? "u_backer_01" : "u_creator_01",
      senderName: activeRole === "backer" ? "Lucas Chen" : "Aria Song",
      senderRole: activeRole === "backer" ? t.chat.roleBacker : t.chat.roleCreator,
      text: trimmed,
      ts: new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
    }]);
    setInput("");
  };

  // Counterpart resolved from active role
  const counterpartIsCreator = activeRole === "backer";
  const counterpart = counterpartIsCreator
    ? {
        name: creatorEdits.nickname ?? ARIA.nickname,
        avatar: ARIA.avatar,
        avatarUrl: creatorEdits.avatarUrl,
        avatarColor: ARIA.avatarColor,
        role: t.chat.roleCreator,
        bio: creatorEdits.bio ?? ARIA.bio,
        specialties: creatorEdits.specialties ?? ARIA.specialties,
        rating: ARIA.rating,
        orders: ARIA.orders,
      }
    : {
        name: "Lucas Chen",
        avatar: "LC",
        avatarUrl: undefined as string | undefined,
        avatarColor: "bg-accent text-primary",
        role: t.chat.roleBacker,
        bio: t.profile.bioBackerDefault,
        specialties: [] as string[],
        rating: undefined as number | undefined,
        orders: undefined as number | undefined,
      };

  const allMsgs = [...ORDER_ACTIVE.messages, ...extraMsgs];

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 py-8 h-[calc(100vh-3.5rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <Link href="/market" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => setCounterpartOpen(true)}
            className="flex items-center gap-2.5 rounded-lg px-2 py-1 -mx-2 hover:bg-accent transition-colors text-left"
            aria-label="view counterpart profile"
          >
            {counterpart.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={counterpart.avatarUrl} alt={counterpart.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold", counterpart.avatarColor)}>
                {counterpart.avatar}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">{counterpart.name}</p>
              <p className="text-xs text-muted-foreground">{t.chat.sessionSubject}</p>
            </div>
          </button>
          <div className="ml-auto">
            <Link href="/orders/ord_001">
              <Button variant="outline" size="sm" className="text-xs">{t.chat.viewOrder}</Button>
            </Link>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-white border border-border rounded-xl p-4 space-y-3 mb-3">
          {allMsgs.map(msg => {
            if ((msg as { isCard?: boolean }).isCard) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="bg-accent border border-primary/20 rounded-lg px-4 py-2.5 text-xs text-foreground/80 text-center max-w-sm">
                    <span className="font-medium text-primary">{t.chat.spotlightBrand} · </span>
                    {msg.text}
                  </div>
                </div>
              );
            }
            const isMe = (activeRole === "backer" && msg.senderId === "u_backer_01") ||
                         (activeRole === "creator" && msg.senderId === "u_creator_01");
            return (
              <div key={msg.id} className={cn("flex gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
                {!isMe && (
                  <button
                    type="button"
                    onClick={() => setCounterpartOpen(true)}
                    className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-primary shrink-0 hover:ring-2 hover:ring-primary/30 transition-all overflow-hidden"
                    aria-label="view counterpart profile"
                  >
                    {counterpart.avatarUrl && counterpart.name.includes(msg.senderName) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={counterpart.avatarUrl} alt={msg.senderName} className="w-7 h-7 object-cover" />
                    ) : (
                      msg.senderName.split(" ").map((n: string) => n[0]).join("")
                    )}
                  </button>
                )}
                <div className={cn("flex flex-col gap-0.5 max-w-[70%]", isMe ? "items-end" : "items-start")}>
                  {!isMe && (
                    <span className="text-[10px] text-muted-foreground px-1">
                      {msg.senderName} · {msg.senderRole}
                    </span>
                  )}
                  <div className={cn(
                    "rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
                    isMe ? "bg-primary text-white rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"
                  )}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-muted-foreground px-1">{msg.ts}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 shrink-0">
          <button className="text-muted-foreground hover:text-foreground p-2">
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            className="flex-1 text-sm rounded-xl border border-input px-4 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder={t.chat.messagePlaceholder}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMsg()}
          />
          <Button onClick={sendMsg} className="rounded-xl px-4">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Counterpart profile dialog */}
      <Dialog open={counterpartOpen} onOpenChange={setCounterpartOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">{counterpart.name}</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="flex items-center gap-3">
              {counterpart.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={counterpart.avatarUrl} alt={counterpart.name} className="w-14 h-14 rounded-full object-cover shrink-0" />
              ) : (
                <div className={cn("w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0", counterpart.avatarColor)}>
                  {counterpart.avatar}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{counterpart.name}</p>
                <Badge variant="secondary" className="text-[10px] mt-1">{counterpart.role}</Badge>
                {counterpartIsCreator && counterpart.rating !== undefined && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs text-muted-foreground">{counterpart.rating} · {counterpart.orders} {t.creators.projectsLabel}</span>
                  </div>
                )}
                {!counterpartIsCreator && (
                  <p className="text-xs text-muted-foreground mt-1.5">{t.chat.backerCompany}</p>
                )}
              </div>
            </div>

            {counterpart.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {counterpart.specialties.map((s) => (
                  <span key={s} className="text-xs bg-accent text-primary px-2.5 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground leading-relaxed">{counterpart.bio}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCounterpartOpen(false)}>{t.chat.closeProfile}</Button>
            {counterpartIsCreator && (
              <Button
                className="gap-1.5"
                onClick={() => {
                  setCounterpartOpen(false);
                  router.push("/market/creators/u_creator_01");
                }}
              >
                {t.chat.viewFullProfile} <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
