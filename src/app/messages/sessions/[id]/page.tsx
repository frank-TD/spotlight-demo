"use client";
import { use, useState } from "react";
import { useStore } from "@/lib/store";
import {
  ORDER_ACTIVE,
  ORDER_COMPLETED,
  CREATORS,
  SESSIONS,
  PARTICIPANTS,
} from "@/lib/mock-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Send, Paperclip, Star, Film, FileVideo } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";

const ARIA = CREATORS[0];
const INDUSTRIES = ["AI Tech", "Brand Film", "Product Launch"];

type ShowcaseItem = { id: string; title: string; duration: string; description?: string; fileName?: string };
type ExtraMsg = { id: string; senderId: string; senderName: string; senderRole: string; text: string; ts: string; isCard?: boolean };

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const {
    activeRole,
    creatorEdits,
    showcaseEdits,
    sessionExtraMessages,
    appendSessionMessage,
    sessionInvitations,
    sendSessionInvitation,
  } = useStore();
  const t = useT();
  const [input, setInput] = useState("");
  const [counterpartOpen, setCounterpartOpen] = useState(false);

  const session = SESSIONS.find((s) => s.id === id);
  if (!session) {
    return (
      <div className="h-full flex items-center justify-center font-body text-sm text-on-surface-variant">
        {t.chat.listEmpty}
      </div>
    );
  }

  const counterpartId = activeRole === "backer" ? session.creatorId : session.backerId;
  const cp = PARTICIPANTS[counterpartId];
  const myId = activeRole === "backer" ? "u_backer_01" : "u_creator_01";
  const myParticipant = PARTICIPANTS[myId];

  const counterpartIsCreator = cp?.role === "creator";
  const counterpartIsAria = counterpartId === "u_creator_01";

  const invitationSentLocal = !!sessionInvitations[session.id];
  const invitationActive = session.invitationSent || invitationSentLocal;
  const hasOrder = !!session.orderId;

  const baseMessages = (session.id === "sess_001" ? (ORDER_ACTIVE.messages as ExtraMsg[]) : session.messages) ?? [];
  const extras = sessionExtraMessages[session.id] ?? [];
  const allMsgs = [...baseMessages, ...extras];

  const sendMsg = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const now = new Date();
    appendSessionMessage(session.id, {
      id: `em_${now.getTime()}`,
      senderId: myId,
      senderName: myParticipant.nickname,
      senderRole: myParticipant.role === "backer" ? t.chat.roleBacker : t.chat.roleCreator,
      text: trimmed,
      ts: now.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
    });
    setInput("");
  };

  const handleSendInvitation = () => {
    sendSessionInvitation(session.id);
    const now = new Date();
    appendSessionMessage(session.id, {
      id: `inv_${now.getTime()}`,
      senderId: "system",
      senderName: t.chat.spotlightBrand,
      senderRole: "system",
      text: t.chat.invitationCard(myParticipant.nickname),
      ts: now.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
      isCard: true,
    });
  };

  // Counterpart full profile data (for dialog)
  const ariaProfile = {
    name: counterpartIsAria ? (creatorEdits.nickname ?? ARIA.nickname) : cp?.nickname ?? "",
    avatar: counterpartIsAria ? ARIA.avatar : cp?.avatar ?? "?",
    avatarUrl: counterpartIsAria ? creatorEdits.avatarUrl : undefined,
    avatarColor: counterpartIsAria ? ARIA.avatarColor : cp?.avatarColor ?? "",
    bio: counterpartIsAria ? (creatorEdits.bio ?? ARIA.bio) : CREATORS.find((c) => c.id === counterpartId)?.bio ?? "",
    specialties: counterpartIsAria ? (creatorEdits.specialties ?? ARIA.specialties) : CREATORS.find((c) => c.id === counterpartId)?.specialties ?? [],
    rating: CREATORS.find((c) => c.id === counterpartId)?.rating ?? 0,
    orders: CREATORS.find((c) => c.id === counterpartId)?.orders ?? 0,
    completion: CREATORS.find((c) => c.id === counterpartId)?.completion ?? 0,
    punctuality: CREATORS.find((c) => c.id === counterpartId)?.punctuality ?? 0,
    rateFrom: counterpartIsAria
      ? (creatorEdits.rateFrom ?? ARIA.rateCard.from)
      : CREATORS.find((c) => c.id === counterpartId)?.rateCard.from ?? 0,
    activeHours: counterpartIsAria
      ? (creatorEdits.activeHours ?? ARIA.activeHours)
      : CREATORS.find((c) => c.id === counterpartId)?.activeHours ?? "",
    showcase: counterpartIsAria
      ? ((showcaseEdits ?? ARIA.showcase.map((s) => ({ id: s.id, title: s.title, duration: s.duration }))) as ShowcaseItem[])
      : (CREATORS.find((c) => c.id === counterpartId)?.showcase.map((s) => ({ id: s.id, title: s.title, duration: s.duration })) as ShowcaseItem[] | undefined) ?? [],
  };

  const commissioned = [ORDER_ACTIVE, ORDER_COMPLETED];
  const backerProfile = {
    name: cp?.nickname ?? "",
    avatar: cp?.avatar ?? "?",
    company: t.chat.backerCompany,
    bio: t.profile.bioBackerDefault,
    commissionedCount: commissioned.length,
    totalSpent: commissioned.reduce((sum, o) => sum + o.totalFiat, 0),
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-outline-variant/30 shrink-0">
        <button
          type="button"
          onClick={() => setCounterpartOpen(true)}
          className="flex items-center gap-3 rounded-xl px-2 py-1 -mx-2 hover:bg-surface-container transition-colors text-left"
          aria-label="view counterpart profile"
        >
          {ariaProfile.avatarUrl && counterpartIsAria ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ariaProfile.avatarUrl} alt={ariaProfile.name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold", cp?.avatarColor)}>
              {cp?.avatar}
            </div>
          )}
          <div>
            <p className="font-headline text-[18px] text-on-surface leading-tight">{cp?.nickname}</p>
            <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mt-0.5">
              {session.subject}
            </p>
          </div>
        </button>

        {/* Right action */}
        <div className="ml-auto">
          {hasOrder ? (
            <Link
              href={`/orders/${session.orderId}`}
              className="font-label text-label-md uppercase tracking-wider px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors"
            >
              {t.chat.viewOrder}
            </Link>
          ) : invitationActive ? (
            <span className="font-label text-[11px] uppercase tracking-widest bg-primary-container text-on-primary-container px-3 py-1.5 rounded-full">
              {t.chat.invitationSentBadge}
            </span>
          ) : activeRole === "backer" ? (
            <button
              onClick={handleSendInvitation}
              className="flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90"
            >
              <Send className="w-3.5 h-3.5" /> {t.chat.sendInvitation}
            </button>
          ) : null}
        </div>
      </div>

      {/* Messages scroll area */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {allMsgs.map((msg) => {
          if (msg.isCard) {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="bg-primary-container/40 border border-primary/20 rounded-lg px-4 py-2.5 font-body text-xs text-on-primary-container text-center max-w-md">
                  <span className="font-bold text-primary">{t.chat.spotlightBrand} · </span>
                  {msg.text}
                </div>
              </div>
            );
          }
          const isMe = msg.senderId === myId;
          return (
            <div key={msg.id} className={cn("flex gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
              {!isMe && (
                <button
                  type="button"
                  onClick={() => setCounterpartOpen(true)}
                  className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xs font-bold shrink-0 hover:ring-2 hover:ring-primary/30 transition-all overflow-hidden"
                  aria-label="view counterpart profile"
                >
                  {ariaProfile.avatarUrl && counterpartIsAria ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ariaProfile.avatarUrl} alt={msg.senderName} className="w-8 h-8 object-cover" />
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
                    isMe ? "bg-primary text-on-primary rounded-br-sm" : "bg-surface-container text-on-surface rounded-bl-sm"
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
      <div className="flex items-center gap-3 px-5 py-3 border-t border-outline-variant/30 shrink-0">
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

      {/* Counterpart profile dialog */}
      <Dialog open={counterpartOpen} onOpenChange={setCounterpartOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-headline text-[22px]">{cp?.nickname}</DialogTitle>
          </DialogHeader>

          {counterpartIsCreator ? (
            <CreatorProfileBody data={ariaProfile} />
          ) : (
            <BackerProfileBody data={backerProfile} />
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
    </div>
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

      <p className="font-body text-sm text-on-surface-variant leading-relaxed">{data.bio}</p>

      <div className="grid grid-cols-3 gap-3 pt-1">
        <StatTile label={t.creatorProfile.completionRate} value={`${data.completion}%`} />
        <StatTile label={t.creatorProfile.onTimeDelivery} value={`${data.punctuality}%`} />
        <StatTile label={t.creators.fromLabel} value={`¥${data.rateFrom.toLocaleString()}+`} />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
          {t.creatorProfile.activeLabel}
        </span>
        <span className="font-body text-sm text-on-surface">{data.activeHours}</span>
      </div>

      {data.showcase.length > 0 && (
        <div className="pt-2">
          <p className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant mb-3">
            {t.creatorProfile.showcase}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {data.showcase.slice(0, 3).map((work, i) => (
              <div key={work.id} className="rounded-xl overflow-hidden bg-surface-container border border-outline-variant/30">
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

function BackerProfileBody({
  data,
}: {
  data: { name: string; avatar: string; company: string; bio: string; commissionedCount: number; totalSpent: number };
}) {
  const t = useT();
  const commissioned = [ORDER_ACTIVE, ORDER_COMPLETED];

  return (
    <div className="py-2 space-y-5">
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

      <p className="font-body text-sm text-on-surface-variant leading-relaxed">{data.bio}</p>

      <div className="grid grid-cols-3 gap-3 pt-1">
        <StatTile label={t.chat.backerProjectsCommissioned} value={String(data.commissionedCount)} />
        <StatTile label={t.chat.backerTotalSpent} value={`¥${data.totalSpent.toLocaleString()}`} />
        <StatTile label={t.chat.backerJoinedAt} value={t.chat.backerJoinedAtValue} />
      </div>

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
