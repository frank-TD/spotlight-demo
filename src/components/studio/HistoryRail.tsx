"use client";
import { useEffect, useRef, useState } from "react";
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
import { toast } from "sonner";
import type { StudioGroup, StudioMode, StudioSession } from "@/lib/store";
import { useT } from "@/hooks/useT";
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

// Sentinel for the "ungrouped" drop zone so we can distinguish it from a real
// group id of null when tracking drag-over state.
const UNGROUPED_KEY = "__ungrouped__";

interface DragState {
  draggingId: string | null;
  overSessionId: string | null;
  overPosition: "before" | "after" | null;
  overGroupKey: string | null;
}

const INITIAL_DRAG: DragState = {
  draggingId: null,
  overSessionId: null,
  overPosition: null,
  overGroupKey: null,
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
  onReorderSession,
  onRenameGroup,
  onDeleteGroup,
  onToggleGroup,
  agentItem,
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
  onReorderSession: (
    sessionId: string,
    targetSessionId: string,
    position: "before" | "after"
  ) => void;
  onRenameGroup: (id: string, name: string) => void;
  onDeleteGroup: (id: string) => void;
  onToggleGroup: (id: string) => void;
  /* Pinned external-agent entry (Superstar Agent mock) shown above sessions. */
  agentItem?: { label: string; status: string; active: boolean; onClick: () => void } | null;
}) {
  const t = useT();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState>(INITIAL_DRAG);

  const ungrouped = sessions.filter((s) => !s.groupId);
  const byGroup = (gid: string) => sessions.filter((s) => s.groupId === gid);

  /* ── drag handlers ───────────────────────────────────────────────── */

  const onSessionDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDrag({ ...INITIAL_DRAG, draggingId: id });
  };
  const onDragEnd = () => setDrag(INITIAL_DRAG);

  const onSessionDragOver = (e: React.DragEvent, id: string) => {
    if (!drag.draggingId || drag.draggingId === id) return;
    e.preventDefault();
    // Stop bubbling so the enclosing group/ungrouped wrapper doesn't overwrite
    // our overSessionId / overPosition with its own group-level drop intent.
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const isAbove = e.clientY < rect.top + rect.height / 2;
    setDrag((d) => ({
      ...d,
      overSessionId: id,
      overPosition: isAbove ? "before" : "after",
      overGroupKey: null,
    }));
  };

  const onSessionDrop = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Read drag id from dataTransfer to avoid relying on a possibly stale
    // closure on the drag state, and compute the drop position from the cursor
    // so we don't depend on overPosition having flushed before drop fires.
    const draggedId = e.dataTransfer.getData("text/plain");
    if (draggedId && draggedId !== id) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const isAbove = e.clientY < rect.top + rect.height / 2;
      onReorderSession(draggedId, id, isAbove ? "before" : "after");
    }
    setDrag(INITIAL_DRAG);
  };

  const onGroupDragOver = (e: React.DragEvent, key: string) => {
    if (!drag.draggingId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDrag((d) => ({
      ...d,
      overGroupKey: key,
      overSessionId: null,
      overPosition: null,
    }));
  };

  const onGroupDrop = (e: React.DragEvent, gid: string | null) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    if (draggedId) onMoveSession(draggedId, gid);
    setDrag(INITIAL_DRAG);
  };

  const dragApi = {
    drag,
    onSessionDragStart,
    onSessionDragOver,
    onSessionDrop,
    onDragEnd,
    onGroupDragOver,
    onGroupDrop,
  };

  // Sessions can't share a name within the same scope (a project, or the
  // ungrouped bucket). Group names also can't collide. We wrap the parent's
  // raw rename callbacks here so the inline-edit input can stay dumb.
  const safeRenameSession = (id: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const sess = sessions.find((s) => s.id === id);
    if (!sess || sess.title === trimmed) return;
    const scope = sess.groupId ?? null;
    const conflict = sessions.find(
      (s) => s.id !== id && (s.groupId ?? null) === scope && s.title === trimmed
    );
    if (conflict) {
      toast.error(t.aigc.nameTakenSession);
      return;
    }
    onRenameSession(id, trimmed);
  };

  const safeRenameGroup = (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const grp = groups.find((g) => g.id === id);
    if (!grp || grp.name === trimmed) return;
    const conflict = groups.find((g) => g.id !== id && g.name === trimmed);
    if (conflict) {
      toast.error(t.aigc.nameTakenGroup);
      return;
    }
    onRenameGroup(id, trimmed);
  };

  return (
    <aside
      data-testid="studio-rail"
      className="w-[240px] shrink-0 hidden lg:flex flex-col gap-3 pr-1"
    >
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

      {/* Superstar Agent pinned task (mock) */}
      {agentItem && (
        <button
          type="button"
          onClick={() => agentItem.onClick()}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors",
            agentItem.active
              ? "border-primary/50 bg-primary-container/25"
              : "border-outline-variant/40 hover:border-primary/40"
          )}
        >
          <span className="shrink-0 inline-flex w-6 h-6 rounded-md items-center justify-center bg-primary text-on-primary font-label font-bold text-[10px]">
            S
          </span>
          <span className="flex-1 min-w-0">
            <span className="block font-body text-sm text-on-surface truncate">{agentItem.label}</span>
            <span className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant/80 mt-0.5">
              {agentItem.status}
            </span>
          </span>
          {agentItem.active && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />}
        </button>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 -mr-1 pr-1">
        {sessions.length === 0 && groups.length === 0 ? (
          <p className="font-body text-sm text-on-surface-variant/85 px-2 py-3">
            {t.aigc.noSessions}
          </p>
        ) : (
          <>
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
                  onRenameGroup={safeRenameGroup}
                  onDeleteGroup={onDeleteGroup}
                  onRenameSession={safeRenameSession}
                  onMoveSession={onMoveSession}
                  onDeleteSession={onDeleteSession}
                  groups={groups}
                  dragApi={dragApi}
                />
              );
            })}

            {/* Ungrouped section (always rendered as a drop target during drag,
                even when empty, so users can move sessions out of a group). */}
            {(ungrouped.length > 0 || drag.draggingId) && (
              <UngroupedSection
                sessions={ungrouped}
                currentId={currentId}
                editingId={editingId}
                setEditingId={setEditingId}
                onSelect={onSelect}
                onRenameSession={safeRenameSession}
                onMoveSession={onMoveSession}
                onDeleteSession={onDeleteSession}
                groups={groups}
                showHeader={groups.length > 0}
                dragApi={dragApi}
              />
            )}
          </>
        )}
      </div>
    </aside>
  );
}

/* ── shared drag API type ────────────────────────────────────────────── */

interface DragApi {
  drag: DragState;
  onSessionDragStart: (e: React.DragEvent, id: string) => void;
  onSessionDragOver: (e: React.DragEvent, id: string) => void;
  onSessionDrop: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onGroupDragOver: (e: React.DragEvent, key: string) => void;
  onGroupDrop: (e: React.DragEvent, gid: string | null) => void;
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
  dragApi,
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
  dragApi: DragApi;
}) {
  const t = useT();
  const editingGroup = editingId === `group:${group.id}`;
  const over = dragApi.drag.overGroupKey === group.id;

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- drag-and-drop reorder target; keyboard reordering is out of scope for this bundle
    <div
      onDragOver={(e) => dragApi.onGroupDragOver(e, group.id)}
      onDrop={(e) => dragApi.onGroupDrop(e, group.id)}
      className={cn(
        "rounded-lg transition-colors",
        over && "bg-primary-container/40 ring-1 ring-primary/30"
      )}
    >
      <div className="group/grp flex items-center gap-1 px-1 py-1 rounded-lg hover:bg-surface-container/60 transition-colors">
        <button
          onClick={() => onToggleGroup(group.id)}
          className="text-on-surface-variant"
          aria-label="toggle group"
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
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
        <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/85 shrink-0">
          {sessions.length}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger className="opacity-0 group-hover/grp:opacity-100 text-on-surface-variant hover:text-on-surface transition-opacity">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[140px]">
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => setEditingId(`group:${group.id}`)}
            >
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
            <p className="font-body text-xs text-on-surface-variant/85 px-2 py-1.5">
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
                dragApi={dragApi}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ── Ungrouped section (drop target wrapper) ─────────────────────────── */

function UngroupedSection({
  sessions,
  currentId,
  editingId,
  setEditingId,
  onSelect,
  onRenameSession,
  onMoveSession,
  onDeleteSession,
  groups,
  showHeader,
  dragApi,
}: {
  sessions: StudioSession[];
  currentId: string | null;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onSelect: (id: string) => void;
  onRenameSession: (id: string, title: string) => void;
  onMoveSession: (sessionId: string, groupId: string | null) => void;
  onDeleteSession: (id: string) => void;
  groups: StudioGroup[];
  showHeader: boolean;
  dragApi: DragApi;
}) {
  const t = useT();
  const over = dragApi.drag.overGroupKey === UNGROUPED_KEY;
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- drag-and-drop reorder target; keyboard reordering is out of scope for this bundle
    <div
      onDragOver={(e) => dragApi.onGroupDragOver(e, UNGROUPED_KEY)}
      onDrop={(e) => dragApi.onGroupDrop(e, null)}
      className={cn(
        "rounded-lg transition-colors",
        over && "bg-primary-container/40 ring-1 ring-primary/30"
      )}
    >
      {showHeader && (
        <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/85 px-2 pb-1.5">
          {t.aigc.ungrouped}
        </p>
      )}
      <div className="space-y-0.5 min-h-[2px]">
        {sessions.length === 0 ? (
          <p className="font-body text-xs text-on-surface-variant/85 px-2 py-1">·</p>
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
              dragApi={dragApi}
            />
          ))
        )}
      </div>
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
  dragApi,
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
  dragApi: DragApi;
}) {
  const t = useT();
  const Icon = MODE_ICON[session.mode];
  const active = session.id === currentId;
  const title = session.assets.length > 0 ? session.title : t.aigc.untitled;

  const isDragging = dragApi.drag.draggingId === session.id;
  const isOver = dragApi.drag.overSessionId === session.id;
  const showTopIndicator = isOver && dragApi.drag.overPosition === "before";
  const showBottomIndicator = isOver && dragApi.drag.overPosition === "after";

  return (
    <div
      draggable={!isEditing}
      role="button"
      tabIndex={isEditing ? -1 : 0}
      aria-current={active ? true : undefined}
      onDragStart={(e) => dragApi.onSessionDragStart(e, session.id)}
      onDragOver={(e) => dragApi.onSessionDragOver(e, session.id)}
      onDrop={(e) => dragApi.onSessionDrop(e, session.id)}
      onDragEnd={dragApi.onDragEnd}
      className={cn(
        "relative group/sess flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors",
        active ? "bg-primary-container/50 ring-1 ring-primary/20" : "hover:bg-surface-container",
        isDragging && "opacity-40"
      )}
      onClick={() => !isEditing && onSelect(session.id)}
      onKeyDown={(e) => {
        if (!isEditing && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect(session.id);
        }
      }}
    >
      {showTopIndicator && (
        <span className="absolute left-0 right-0 -top-0.5 h-0.5 bg-primary rounded-full" />
      )}
      {showBottomIndicator && (
        <span className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-primary rounded-full" />
      )}
      <Icon
        className={cn("w-3.5 h-3.5 shrink-0", active ? "text-primary" : "text-on-surface-variant")}
      />
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
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- double-click-to-rename is an enhancement; the Rename action is also in the row menu
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
            {!session.groupId ? (
              <Check className="w-3.5 h-3.5 text-primary" />
            ) : (
              <span className="w-3.5 h-3.5" />
            )}
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
      aria-label="rename"
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
