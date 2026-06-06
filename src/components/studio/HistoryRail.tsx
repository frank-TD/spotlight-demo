"use client";
import type { StudioMode, StudioSession } from "@/lib/store";
import { useT } from "@/hooks/useT";
import { SquarePen, ImageIcon, Clapperboard, Mic, Music2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const MODE_ICON: Record<StudioMode, typeof ImageIcon> = {
  image: ImageIcon,
  video: Clapperboard,
  voiceover: Mic,
  music: Music2,
};

export default function HistoryRail({
  sessions,
  currentId,
  onSelect,
  onNew,
  onDelete,
}: {
  sessions: StudioSession[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  const t = useT();
  return (
    <aside className="w-[220px] shrink-0 hidden lg:flex flex-col gap-3 pr-1">
      <button
        onClick={onNew}
        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-on-primary font-label text-label-md uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all"
      >
        <SquarePen className="w-4 h-4" /> {t.aigc.newSession}
      </button>

      <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant px-2 pt-2">
        {t.aigc.sessionsTitle}
      </p>

      <div className="flex-1 overflow-y-auto space-y-1 -mr-1 pr-1">
        {sessions.length === 0 ? (
          <p className="font-body text-sm text-on-surface-variant/60 px-2 py-3">{t.aigc.noSessions}</p>
        ) : (
          sessions.map((s) => {
            const Icon = MODE_ICON[s.mode];
            const active = s.id === currentId;
            const title = s.assets.length > 0 ? s.title : t.aigc.untitled;
            return (
              <div
                key={s.id}
                className={cn(
                  "group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-colors",
                  active ? "bg-primary-container/50 ring-1 ring-primary/20" : "hover:bg-surface-container"
                )}
                onClick={() => onSelect(s.id)}
              >
                <Icon className={cn("w-4 h-4 shrink-0", active ? "text-primary" : "text-on-surface-variant")} />
                <span className="flex-1 min-w-0 font-body text-sm text-on-surface truncate">{title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(s.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-error transition-all shrink-0"
                  aria-label="delete session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
