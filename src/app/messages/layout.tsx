"use client";
import AppShell from "@/components/layout/AppShell";
import { useStore } from "@/lib/store";
import { SESSIONS, PARTICIPANTS, ORDER_ACTIVE, type Session } from "@/lib/mock-data";
import { useT } from "@/hooks/useT";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const { activeRole, sessionExtraMessages, sessionInvitations, creatorEdits } = useStore();
  const t = useT();
  const pathname = usePathname();

  const visibleSessions = SESSIONS.filter((s) =>
    activeRole === "backer" ? s.backerId === "u_backer_01" : s.creatorId === "u_creator_01"
  );

  const sessionPreview = (s: Session) => {
    const base = s.id === "sess_001" ? ORDER_ACTIVE.messages : s.messages;
    const extras = sessionExtraMessages[s.id] ?? [];
    const all = [...base, ...extras];
    const last = all[all.length - 1];
    if (!last) return "";
    return (last as { isCard?: boolean }).isCard ? `· ${last.text}` : last.text;
  };

  const sessionTimestamp = (s: Session) => {
    const base = s.id === "sess_001" ? ORDER_ACTIVE.messages : s.messages;
    const extras = sessionExtraMessages[s.id] ?? [];
    const all = [...base, ...extras];
    return all[all.length - 1]?.ts ?? s.lastUpdated;
  };

  return (
    <AppShell>
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 pt-6 pb-10 h-[calc(100vh-80px)]">
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6 h-full">
          {/* Sidebar */}
          <aside className="hidden md:flex flex-col bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-outline-variant/30">
              <h2 className="font-headline text-[22px] text-on-surface mb-3">{t.chat.listTitle}</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                <input
                  className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary focus:outline-none font-body text-sm"
                  placeholder={t.chat.listSearch}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {visibleSessions.length === 0 && (
                <p className="text-center text-on-surface-variant font-body text-sm py-8">{t.chat.listEmpty}</p>
              )}
              {visibleSessions.map((s) => {
                const counterpartId = activeRole === "backer" ? s.creatorId : s.backerId;
                const cp = PARTICIPANTS[counterpartId];
                if (!cp) return null;
                const isActive = pathname.includes(`/messages/sessions/${s.id}`);
                const invited = s.invitationSent || !!sessionInvitations[s.id];
                const inCollab = !!s.orderId;
                const isOwnCreator = counterpartId === "u_creator_01";
                const avatarUrl = isOwnCreator ? creatorEdits.avatarUrl : undefined;
                return (
                  <Link
                    key={s.id}
                    href={`/messages/sessions/${s.id}`}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-colors",
                      isActive
                        ? "bg-primary-container/60"
                        : "hover:bg-surface-container"
                    )}
                  >
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt={cp.nickname} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0", cp.avatarColor)}>
                        {cp.avatar}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="font-body font-bold text-on-surface text-sm truncate">{cp.nickname}</p>
                        <span className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant/70 shrink-0">
                          {sessionTimestamp(s).slice(5, 10)}
                        </span>
                      </div>
                      <p className="font-body text-xs text-on-surface-variant truncate mt-0.5">{sessionPreview(s)}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        {inCollab && (
                          <span className="font-label text-[9px] uppercase tracking-widest bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded">
                            {t.chat.listInCollab}
                          </span>
                        )}
                        {!inCollab && invited && (
                          <span className="font-label text-[9px] uppercase tracking-widest bg-primary-container text-on-primary-container px-2 py-0.5 rounded">
                            {t.chat.invitationSentBadge}
                          </span>
                        )}
                        {!inCollab && !invited && (
                          <span className="font-label text-[9px] uppercase tracking-widest border border-outline-variant text-on-surface-variant px-2 py-0.5 rounded">
                            {t.chat.listNew}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </aside>

          {/* Right pane */}
          <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden h-full">
            {children}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
