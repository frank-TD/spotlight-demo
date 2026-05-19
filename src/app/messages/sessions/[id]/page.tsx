"use client";
import { use, useState } from "react";
import { useStore } from "@/lib/store";
import AppShell from "@/components/layout/AppShell";
import { ORDER_ACTIVE, ORDER_COMPLETED, CREATORS } from "@/lib/mock-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Send, Paperclip, Star, Film, FileVideo } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";

const ARIA = CREATORS[0];
const INDUSTRIES = ["AI Tech", "Brand Film", "Product Launch"];

type ShowcaseItem = { id: string; title: string; duration: string; description?: string; fileName?: string };

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  use(params);
  const { activeRole, creatorEdits, showcaseEdits } = useStore();
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

  // Resolved creator data (with overlay edits)
  const ariaProfile = {
    name: creatorEdits.nickname ?? ARIA.nickname,
    avatar: ARIA.avatar,
    avatarUrl: creatorEdits.avatarUrl,
    avatarColor: ARIA.avatarColor,
    bio: creatorEdits.bio ?? ARIA.bio,
    specialties: creatorEdits.specialties ?? ARIA.specialties,
    rating: ARIA.rating,
    orders: ARIA.orders,
    completion: ARIA.completion,
    punctuality: ARIA.punctuality,
    rateFrom: creatorEdits.rateFrom ?? ARIA.rateCard.from,
    activeHours: creatorEdits.activeHours ?? ARIA.activeHours,
    showcase: (showcaseEdits ?? ARIA.showcase.map((s) => ({ id: s.id, title: s.title, duration: s.duration }))) as ShowcaseItem[],
  };

  // Resolved backer data
  const commissioned = [ORDER_ACTIVE, ORDER_COMPLETED];
  const lucasProfile = {
    name: "Lucas Chen",
    avatar: "LC",
    company: t.chat.backerCompany,
    bio: t.profile.bioBackerDefault,
    commissionedCount: commissioned.length,
    totalSpent: commissioned.reduce((sum, o) => sum + o.totalFiat, 0),
  };

  const counterpart = counterpartIsCreator
    ? {
        name: ariaProfile.name,
        avatar: ariaProfile.avatar,
        avatarUrl: ariaProfile.avatarUrl,
        avatarColor: ariaProfile.avatarColor,
        role: t.chat.roleCreator,
      }
    : {
        name: lucasProfile.name,
        avatar: lucasProfile.avatar,
        avatarUrl: undefined as string | undefined,
        avatarColor: "bg-primary-container text-on-primary-container",
        role: t.chat.roleBacker,
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
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold", counterpart.avatarColor)}>
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

      {/* Full profile dialog */}
      <Dialog open={counterpartOpen} onOpenChange={setCounterpartOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-headline text-[22px]">{counterpart.name}</DialogTitle>
          </DialogHeader>

          {counterpartIsCreator ? (
            <CreatorProfileBody data={ariaProfile} />
          ) : (
            <BackerProfileBody data={lucasProfile} />
          )}

          <DialogFooter>
            <button
              onClick={() => setCounterpartOpen(false)}
              className="font-label text-label-md uppercase tracking-wider px-5 py-2.5 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity"
            >
              {t.chat.closeProfile}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

/* ───── Profile bodies ───────────────────────────────────────────────── */

type CreatorProfileData = {
  name: string;
  avatar: string;
  avatarUrl: string | undefined;
  avatarColor: string;
  bio: string;
  specialties: string[];
  rating: number;
  orders: number;
  completion: number;
  punctuality: number;
  rateFrom: number;
  activeHours: string;
  showcase: ShowcaseItem[];
};

function CreatorProfileBody({ data }: { data: CreatorProfileData }) {
  const t = useT();
  return (
    <div className="py-2 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        {data.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.avatarUrl} alt={data.name} className="w-16 h-16 rounded-full object-cover shrink-0" />
        ) : (
          <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shrink-0", data.avatarColor)}>
            {data.avatar}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-headline text-[20px] text-on-surface">{data.name}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="font-label text-[10px] uppercase tracking-widest bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded">
              {t.chat.roleCreator}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-tertiary text-tertiary" />
              <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                {data.rating} · {data.orders} {t.creators.projectsLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      {data.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.specialties.map((s) => (
            <span
              key={s}
              className="font-label text-[11px] uppercase tracking-widest bg-primary-container text-on-primary-container px-2.5 py-1 rounded-full"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Bio */}
      <p className="font-body text-sm text-on-surface-variant leading-relaxed">{data.bio}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 pt-1">
        <StatTile label={t.creatorProfile.completionRate} value={`${data.completion}%`} />
        <StatTile label={t.creatorProfile.onTimeDelivery} value={`${data.punctuality}%`} />
        <StatTile label={t.creators.fromLabel} value={`¥${data.rateFrom.toLocaleString()}+`} />
      </div>

      {/* Hours */}
      <div className="flex items-center gap-2 pt-1">
        <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
          {t.creatorProfile.activeLabel}
        </span>
        <span className="font-body text-sm text-on-surface">{data.activeHours}</span>
      </div>

      {/* Showcase */}
      {data.showcase.length > 0 && (
        <div className="pt-2">
          <p className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant mb-3">
            {t.creatorProfile.showcase}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {data.showcase.slice(0, 3).map((work, i) => (
              <div
                key={work.id}
                className="rounded-xl overflow-hidden bg-surface-container border border-outline-variant/30"
              >
                <div
                  className={cn(
                    "aspect-video flex items-center justify-center bg-gradient-to-br",
                    i % 3 === 0 && "from-primary-container via-primary-fixed to-tertiary-container",
                    i % 3 === 1 && "from-tertiary-container via-tertiary-fixed to-primary-container",
                    i % 3 === 2 && "from-secondary-container via-secondary-fixed to-primary-container"
                  )}
                >
                  <FileVideo className="w-6 h-6 text-primary opacity-70" />
                </div>
                <div className="p-2.5">
                  <p className="font-body font-bold text-xs text-on-surface truncate">{work.title}</p>
                  <p className="font-label text-[9px] uppercase tracking-wider text-on-surface-variant mt-0.5">
                    {work.duration}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BackerProfileBody({ data }: { data: { name: string; avatar: string; company: string; bio: string; commissionedCount: number; totalSpent: number } }) {
  const t = useT();
  const commissioned = [ORDER_ACTIVE, ORDER_COMPLETED];

  return (
    <div className="py-2 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xl font-bold shrink-0">
          {data.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-headline text-[20px] text-on-surface">{data.name}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="font-label text-[10px] uppercase tracking-widest bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded">
              {t.chat.roleBacker}
            </span>
            <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
              {data.company}
            </span>
          </div>
        </div>
      </div>

      {/* Industries */}
      <div className="flex flex-wrap gap-1.5">
        {INDUSTRIES.map((s) => (
          <span
            key={s}
            className="font-label text-[11px] uppercase tracking-widest bg-primary-container text-on-primary-container px-2.5 py-1 rounded-full"
          >
            {s}
          </span>
        ))}
      </div>

      {/* Bio */}
      <p className="font-body text-sm text-on-surface-variant leading-relaxed">{data.bio}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 pt-1">
        <StatTile label={t.chat.backerProjectsCommissioned} value={String(data.commissionedCount)} />
        <StatTile label={t.chat.backerTotalSpent} value={`¥${data.totalSpent.toLocaleString()}`} />
        <StatTile label={t.chat.backerJoinedAt} value={t.chat.backerJoinedAtValue} />
      </div>

      {/* Commissioned list */}
      <div className="pt-2">
        <p className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant mb-3">
          {t.chat.backerProjectsCommissioned}
        </p>
        <div className="space-y-2">
          {commissioned.map((order, i) => (
            <div
              key={order.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br",
                  i % 2 === 0
                    ? "from-primary-container via-primary-fixed to-tertiary-container"
                    : "from-tertiary-container via-tertiary-fixed to-primary-container"
                )}
              >
                <Film className="w-4 h-4 text-primary opacity-70" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body font-bold text-on-surface text-sm truncate">{order.title}</p>
                <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mt-0.5">
                  {t.projects.counterpartCreator}: {order.creator.nickname} · ¥{order.totalFiat.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-container rounded-xl p-3 text-center">
      <p className="font-headline text-[18px] text-on-surface leading-none">{value}</p>
      <p className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant mt-1.5">{label}</p>
    </div>
  );
}

