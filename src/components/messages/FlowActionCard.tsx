"use client";
import { useState } from "react";
import { useStore, stageAmount, flowActor, type SessionFlow } from "@/lib/store";
import { useT } from "@/hooks/useT";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ChevronDown, AlertCircle, Clock, CheckCircle2, Check, X, Send, Wallet, Upload } from "lucide-react";

type Role = "backer" | "creator";

export default function FlowActionCard({
  sessionId,
  viewerRole,
  flow,
}: {
  sessionId: string;
  viewerRole: Role;
  flow: SessionFlow;
}) {
  const t = useT();
  const {
    acceptInvitation,
    declineInvitation,
    payDeposit,
    submitDelivery,
    approveDelivery,
    requestRevision,
  } = useStore();
  const actor = flowActor(flow);
  const isActor = actor === viewerRole;
  // Pinned and collapsed by default; the acting party expands it to respond.
  const [open, setOpen] = useState(false);

  if (flow.phase === "rejected") return null;

  const f = t.flow;
  const stageName = f.stageNames[flow.stageIndex] ?? "";
  const depAmt = stageAmount(flow.total, 0);
  const stageAmt = stageAmount(flow.total, flow.stageIndex);

  type Action = { label: string; onClick: () => void; tone: "primary" | "danger" };
  let title = "";
  let desc = "";
  let actions: Action[] = [];
  let done = false;

  switch (flow.phase) {
    case "invitation":
      title = f.invTitle;
      desc = isActor ? f.invActor : f.invWait;
      actions = isActor
        ? [
            {
              label: f.accept,
              tone: "primary",
              onClick: () => {
                acceptInvitation(sessionId);
                toast.success(f.toastAccepted);
              },
            },
            {
              label: f.decline,
              tone: "danger",
              onClick: () => {
                declineInvitation(sessionId);
                toast.info(f.toastDeclined);
              },
            },
          ]
        : [];
      break;
    case "deposit":
      title = f.depTitle;
      desc = isActor ? f.depActor : f.depWait;
      actions = isActor
        ? [
            {
              label: f.payDeposit(depAmt),
              tone: "primary",
              onClick: () => {
                payDeposit(sessionId);
                toast.success(f.toastDeposit);
              },
            },
          ]
        : [];
      break;
    case "submit":
      title = f.subTitle(stageName);
      desc = isActor ? f.subActor : f.subWait(stageName);
      actions = isActor
        ? [
            {
              label: f.submit,
              tone: "primary",
              onClick: () => {
                submitDelivery(sessionId);
                toast.success(f.toastSubmitted);
              },
            },
          ]
        : [];
      break;
    case "review":
      title = f.revTitle(stageName);
      desc = isActor ? f.revActor : f.revWait(stageName);
      actions = isActor
        ? [
            {
              label: f.approve(stageAmt),
              tone: "primary",
              onClick: () => {
                approveDelivery(sessionId);
                toast.success(f.toastApproved);
              },
            },
            {
              label: f.requestChanges,
              tone: "danger",
              onClick: () => {
                requestRevision(sessionId);
                toast.info(f.toastRevision);
              },
            },
          ]
        : [];
      break;
    case "completed":
      title = f.doneTitle;
      desc = f.doneDesc;
      done = true;
      break;
  }

  const phaseIcon =
    flow.phase === "invitation" ? Send : flow.phase === "deposit" ? Wallet : flow.phase === "submit" ? Upload : Check;
  const PhaseIcon = done ? CheckCircle2 : phaseIcon;

  return (
    <div
      className={cn(
        "shrink-0 border-b",
        done
          ? "bg-tertiary-container/30 border-tertiary/20"
          : isActor
          ? "bg-primary-container/40 border-primary/30"
          : "bg-surface-container border-outline-variant/30"
      )}
    >
      {/* Collapsed header row — always visible, pinned at top */}
      <button
        type="button"
        data-testid="flow-card-toggle"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-3 text-left"
      >
        <span
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
            done
              ? "bg-tertiary text-on-tertiary"
              : isActor
              ? "bg-primary text-on-primary"
              : "bg-surface-container-high text-on-surface-variant"
          )}
        >
          <PhaseIcon className="w-4 h-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-headline text-[15px] text-on-surface leading-tight truncate">{title}</p>
          {flow.revisions > 0 && flow.phase !== "completed" && (
            <span className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant">
              {f.revisionTag(flow.revisions)}
            </span>
          )}
        </div>
        {!done && (
          <span
            className={cn(
              "font-label text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1",
              isActor
                ? "bg-primary text-on-primary"
                : "bg-surface-container-high text-on-surface-variant"
            )}
          >
            {isActor ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            {isActor ? f.actionNeeded : f.waiting}
          </span>
        )}
        <ChevronDown className={cn("w-4 h-4 text-on-surface-variant shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {/* Expanded body */}
      {open && (
        <div className="px-5 pb-4 pl-16">
          <p className="font-body text-sm text-on-surface-variant leading-relaxed">{desc}</p>
          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {actions.map((a) => (
                <button
                  key={a.label}
                  onClick={a.onClick}
                  className={cn(
                    "flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider px-4 py-2 rounded-lg transition-all active:scale-95",
                    a.tone === "primary"
                      ? "bg-primary text-on-primary hover:opacity-90"
                      : "border border-error/40 text-error hover:bg-error-container/40"
                  )}
                >
                  {a.tone === "danger" ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
