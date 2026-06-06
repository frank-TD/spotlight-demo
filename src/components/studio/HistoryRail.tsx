"use client";
import { useEffect, useRef, useState } from "react";
import type { StudioGroup, StudioMode, StudioSession } from "@/lib/store";
import { useT } from "@/hooks/useT";
import {
  SquarePen,
  FolderPlus,
  ImageIcon,
  Clapperboard,
  Mic,
  Music2,
  MoreHorizontal,
  Trash2,
  Pencil,
  ChevronRight,
  ChevronDown,
  ArrowRightLeft,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const MODE_ICON: Record<StudioMode, typeof ImageIcon> = {
  image: ImageIcon,
  video: Clapperboard,
  voiceover: Mic,
  music: Music2,
};

export default function HistoryRail({
  sessions,
  groups,
  currentId,
  onSelect,
  onNewSession,
  onNewGroup,
  onDeleteSession,
  onRenameSession,
  onMoveSession,
  onRenameGroup,
  onDeleteGroup,
  onToggleGroup,
}: {
  sessions: StudioSession[];
  groups: StudioGroup[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNewSession: () => void;
  onNewGroup: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, title: string) => void;
  onMoveSession: (sessionId: string, groupId: string | null) => void;
  onRenameGroup: (id: string, name: string) => void;
  onDeleteGroup: (id: string) => void;
  onToggleGroup: (id: string) => void;
}) {
  const t = useT();
  const [editingId, setEditingId] = useState<string | null>(null);

  const ungrouped = sessions.filter((s) => !s.groupId);
  const byGroup = (gid: string) => sessions.filter((s) => s.groupId === gid);

  return (
    <aside data-testid="studio-rail" className="w-[240px] shrink-0 hidden lg:flex flex-col gap-3 pr-1">
      <div className="flex gap-2">
        <button
          onClick={onNewSession}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-primary text-on-primary font-label text-label-md uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all"
        >
          <SquarePen className="w-3.5 h-3.5" /> {t.aigc.newSession}
        </button>
        <button
          onClick={onNewGroup}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
          title={t.aigc.newProject}
          aria-label={t.aigc.newProject}
        >
          <FolderPlus className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant px-2 pt-2">
        {t.aigc.sessionsTitle}
      </p>

      <div className="flex-1 overflow-y-auto space-y-3 -mr-1 pr-1">
        {sessions.length === 0 && groups.length === 0 ? (
          <p className="font-body text-sm text-on-surface-variant/60 px-2 py-3">{t.aigc.noSessions}</p>
        ) : (
          <>
            {/* Groups */}
            {groups.map((g) => {
              const items = byGroup(g.id);
              const collapsed = g.collapsed ?? false;
              return (
                <GroupSection
                  key={g.id}
                  group={g}
                  sessions={items}
                  collapsed={collapsed}
                  currentId={currentId}
                  editingId={editingId}
                  setEditingId={setEditingId}
                  onSelect={onSelect}
                  onToggleGroup={onToggleGroup}
                  onRenameGroup={onRenameGroup}
                  onDeleteGroup={onDeleteGroup}
                  onRenameSession={onRenameSession}
                  onMoveSession={onMoveSession}
                  onDeleteSession={onDeleteSession}
                  groups={groups}
                />
              );
            })}

            {/* Ungrouped sessions */}
            {ungrouped.length > 0 && (
              <div>
                {groups.length > 0 && (
                  <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60 px-2 pb-1.5">
                    {t.aigc.ungrouped}
                  </p>
                )}
                <div className="space-y-0.5">
                  {ungrouped.map((s) => (
                    <SessionRow
                      key={s.id}
                      session={s}
                      currentId={currentId}
                      isEditing={editingId === s.id}
                      onStartEdit={() => setEditingId(s.id)}
                      onEndEdit={() => setEditingId(null)}
                      onSelect={onSelect}
                      onRenameSession={onRenameSession}
                      onMoveSession={onMoveSession}
                      onDeleteSession={onDeleteSession}
                      groups={groups}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

/* ── Group section ───────────────────────────────────────────────────── */

function GroupSection({
  group,
  sessions,
  collapsed,
  currentId,
  editingId,
  setEditingId,
  onSelect,
  onToggleGroup,
  onRenameGroup,
  onDeleteGroup,
  onRenameSession,
  onMoveSession,
  onDeleteSession,
  groups,
}: {
  group: StudioGroup;
  sessions: StudioSession[];
  collapsed: boolean;
  currentId: string | null;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onSelect: (id: string) => void;
  onToggleGroup: (id: string) => void;
  onRenameGroup: (id: string, name: string) => void;
  onDeleteGroup: (id: string) => void;
  onRenameSession: (id: string, title: string) => void;
  onMoveSession: (sessionId: string, groupId: string | null) => void;
  onDeleteSession: (id: string) => void;
  groups: StudioGroup[];
}) {
  const t = useT();
  const editingGroup = editingId === `group:${group.id}`;
  return (
    <div>
      <div className="group/grp flex items-center gap-1 px-1 py-1 rounded-lg hover:bg-surface-container/60 transition-colors">
        <button
          onClick={() => onToggleGroup(group.id)}
          className="text-on-surface-variant"
          aria-label="toggle group"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        {editingGroup ? (
          <InlineEdit
            initial={group.name}
            onCommit={(v) => {
              onRenameGroup(group.id, v.trim() || group.name);
              setEditingId(null);
            }}
            onCancel={() => setEditingId(null)}
            className="font-label text-[11px] uppercase tracking-widest"
          />
        ) : (
          <button
            onClick={() => onToggleGroup(group.id)}
            className="flex-1 text-left font-label text-[11px] uppercase tracking-widest text-on-surface truncate"
          >
            {group.name}
          </button>
        )}
        <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/70 shrink-0">
          {sessions.length}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger className="opacity-0 group-hover/grp:opacity-100 text-on-surface-variant hover:text-on-surface transition-opacity">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[140px]">
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setEditingId(`group:${group.id}`)}>
              <Pencil className="w-3.5 h-3.5" /> {t.aigc.rename}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 cursor-pointer text-error"
              onClick={() => {
                if (confirm(t.aigc.deleteGroupConfirm)) onDeleteGroup(group.id);
              }}
            >
              <Trash2 className="w-3.5 h-3.5" /> {t.aigc.deleteAction}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {!collapsed && (
        <div className="pl-3 mt-0.5 space-y-0.5 border-l border-outline-variant/40 ml-3">
          {sessions.length === 0 ? (
            <p className="font-body text-xs text-on-surface-variant/50 px-2 py-1.5">
              {t.aigc.noSessions}
            </p>
          ) : (
            sessions.map((s) => (
              <SessionRow
                key={s.id}
                session={s}
                currentId={currentId}
                isEditing={editingId === s.id}
                onStartEdit={() => setEditingId(s.id)}
                onEndEdit={() => setEditingId(null)}
                onSelect={onSelect}
                onRenameSession={onRenameSession}
                onMoveSession={onMoveSession}
                onDeleteSession={onDeleteSession}
                groups={groups}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ── Single session row ──────────────────────────────────────────────── */

function SessionRow({
  session,
  currentId,
  isEditing,
  onStartEdit,
  onEndEdit,
  onSelect,
  onRenameSession,
  onMoveSession,
  onDeleteSession,
  groups,
}: {
  session: StudioSession;
  currentId: string | null;
  isEditing: boolean;
  onStartEdit: () => void;
  onEndEdit: () => void;
  onSelect: (id: string) => void;
  onRenameSession: (id: string, title: string) => void;
  onMoveSession: (sessionId: string, groupId: string | null) => void;
  onDeleteSession: (id: string) => void;
  groups: StudioGroup[];
}) {
  const t = useT();
  const Icon = MODE_ICON[session.mode];
  const active = session.id === currentId;
  const title = session.assets.length > 0 ? session.title : t.aigc.untitled;

  return (
    <div
      className={cn(
        "group/sess flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors",
        active ? "bg-primary-container/50 ring-1 ring-primary/20" : "hover:bg-surface-container"
      )}
      onClick={() => !isEditing && onSelect(session.id)}
    >
      <Icon className={cn("w-3.5 h-3.5 shrink-0", active ? "text-primary" : "text-on-surface-variant")} />
      {isEditing ? (
        <InlineEdit
          initial={title}
          onCommit={(v) => {
            const next = v.trim();
            if (next) onRenameSession(session.id, next);
            onEndEdit();
          }}
          onCancel={onEndEdit}
          className="font-body text-sm"
        />
      ) : (
        <span
          className="flex-1 min-w-0 font-body text-sm text-on-surface truncate"
          onDoubleClick={(e) => {
            e.stopPropagation();
            onStartEdit();
          }}
        >
          {title}
        </span>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover/sess:opacity-100 text-on-surface-variant hover:text-on-surface transition-opacity shrink-0"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[180px]">
          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit();
            }}
          >
            <Pencil className="w-3.5 h-3.5" /> {t.aigc.rename}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="px-2 py-1 font-label text-[10px] uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
            <ArrowRightLeft className="w-3 h-3" /> {t.aigc.moveTo}
          </div>
          <DropdownMenuItem
            className="gap-2 cursor-pointer pl-7"
            onClick={(e) => {
              e.stopPropagation();
              onMoveSession(session.id, null);
            }}
          >
            {!session.groupId ? <Check className="w-3.5 h-3.5 text-primary" /> : <span className="w-3.5 h-3.5" />}
            {t.aigc.noGroup}
          </DropdownMenuItem>
          {groups.map((g) => (
            <DropdownMenuItem
              key={g.id}
              className="gap-2 cursor-pointer pl-7"
              onClick={(e) => {
                e.stopPropagation();
                onMoveSession(session.id, g.id);
              }}
            >
              {session.groupId === g.id ? (
                <Check className="w-3.5 h-3.5 text-primary" />
              ) : (
                <span className="w-3.5 h-3.5" />
              )}
              <span className="truncate">{g.name}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 cursor-pointer text-error"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteSession(session.id);
            }}
          >
            <Trash2 className="w-3.5 h-3.5" /> {t.aigc.deleteAction}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/* ── Inline edit input — commits on Enter/blur, cancels on Esc ──────── */

function InlineEdit({
  initial,
  onCommit,
  onCancel,
  className,
}: {
  initial: string;
  onCommit: (v: string) => void;
  onCancel: () => void;
  className?: string;
}) {
  const [value, setValue] = useState(initial);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);
  return (
    <input
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onCommit(value);
        else if (e.key === "Escape") onCancel();
      }}
      onBlur={() => onCommit(value)}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "flex-1 min-w-0 bg-surface text-on-surface border border-primary/50 rounded px-1.5 py-0.5 outline-none",
        className
      )}
    />
  );
}
