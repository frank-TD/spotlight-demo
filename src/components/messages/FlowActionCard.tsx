"use client";
import { useState } from "react";
import Link from "next/link";
import { useStore, flowActor, type SessionFlow } from "@/lib/store";
import { useT } from "@/hooks/useT";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ChevronDown,
  AlertCircle,
  Clock,
  CheckCircle2,
  Check,
  X,
  Send,
  Wallet,
  Upload,
  FileText,
  ArrowUpRight,
  RotateCcw,
} from "lucide-react";

type Role = "backer" | "creator";

export default function FlowActionCard({
  sessionId,
  viewerRole,
  flow,
  orderId,
}: {
  sessionId: string;
  viewerRole: Role;
  flow: SessionFlow;
  orderId: string;
}) {
  const t = useT();
  const { acceptInvitation, declineInvitation, resetFlow } = useStore();
  const actor = flowActor(flow);
  const isActor = actor === viewerRole;
  // Pinned and collapsed by default; the acting party expands it to respond.
  const [open, setOpen] = useState(false);

  const f = t.flow;

  // Declined invitation: backer can revise and re-invite; creator sees a passive note.
  if (flow.phase === "rejected") {
    const backerView = viewerRole === "backer";
    return (
      <div className="shrink-0 border-b bg-surface-container border-outline-variant/30 flex items-center gap-3 px-5 py-3">
        <span className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0">
          <X className="w-4 h-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-headline text-[15px] text-on-surface leading-tight">{f.rejTitle}</p>
          <p className="font-body text-xs text-on-surface-variant leading-relaxed">
            {backerView ? f.rejActor : f.rejWait}
          </p>
        </div>
        {backerView && (
          <button
            onClick={() => resetFlow(sessionId)}
            className="shrink-0 inline-flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider px-4 py-2 rounded-lg bg-primary text-on-primary hover:opacity-90 transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" /> {f.reInvite}
          </button>
        )}
      </div>
    );
  }
  const stageName = f.stageNames[flow.stageIndex] ?? "";
  const orderHref = `/orders/${orderId}`;
  const contractHref = `/orders/${orderId}/contract`;

  let title = "";
  let desc = "";
  let nav: { label: string; href: string } | null = null;
  let invitation = false;
  let done = false;
  let Icon = Send;

  switch (flow.phase) {
    case "invitation":
      title = f.invTitle;
      desc = isActor ? f.invActor : f.invWait;
      invitation = true;
      Icon = Send;
      break;
    case "contract_draft":
      title = f.cdTitle;
      desc = isActor ? f.cdActor : f.cdWait;
      nav = { label: f.goDraftContract, href: contractHref };
      Icon = FileText;
      break;
    case "contract_confirm":
      title = f.ccTitle;
      desc = isActor ? f.ccActor : f.ccWait;
      nav = { label: f.goConfirmContract, href: contractHref };
      Icon = FileText;
      break;
    case "deposit":
      title = f.depTitle;
      desc = isActor ? f.depActor : f.depWait;
      nav = { label: f.goPayDeposit, href: orderHref };
      Icon = Wallet;
      break;
    case "submit":
      title = f.subTitle(stageName);
      desc = isActor ? f.subActor : f.subWait(stageName);
      nav = { label: f.goSubmit, href: orderHref };
      Icon = Upload;
      break;
    case "review":
      title = f.revTitle(stageName);
      desc = isActor ? f.revActor : f.revWait(stageName);
      nav = { label: f.goReview, href: orderHref };
      Icon = Check;
      break;
    case "completed":
      title = f.doneTitle;
      desc = f.doneDesc;
      done = true;
      Icon = CheckCircle2 as typeof Send;
      break;
  }

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
          <Icon className="w-4 h-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-headline text-[15px] text-on-surface leading-tight truncate">
            {title}
          </p>
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
        <ChevronDown
          className={cn(
            "w-4 h-4 text-on-surface-variant shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Expanded body */}
      {open && (
        <div className="px-5 pb-4 pl-16">
          <p className="font-body text-sm text-on-surface-variant leading-relaxed">{desc}</p>

          {/* Invitation is decided inline; every other action navigates to its page */}
          {isActor && invitation && (
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => {
                  acceptInvitation(sessionId);
                  toast.success(f.toastAccepted);
                }}
                className="flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider px-4 py-2 rounded-lg bg-primary text-on-primary hover:opacity-90 transition-all active:scale-95"
              >
                <Check className="w-3.5 h-3.5" /> {f.accept}
              </button>
              <button
                onClick={() => {
                  declineInvitation(sessionId);
                  toast.info(f.toastDeclined);
                }}
                className="flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider px-4 py-2 rounded-lg border border-error/40 text-error hover:bg-error-container/40 transition-all active:scale-95"
              >
                <X className="w-3.5 h-3.5" /> {f.decline}
              </button>
            </div>
          )}

          {isActor && nav && (
            <Link
              href={nav.href}
              className="inline-flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider px-4 py-2 mt-3 rounded-lg bg-primary text-on-primary hover:opacity-90 transition-all active:scale-95"
            >
              {nav.label} <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
