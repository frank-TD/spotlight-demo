"use client";
import { use, useState } from "react";
import { useStore, flowToStages } from "@/lib/store";
import AppShell from "@/components/layout/AppShell";
import { ORDER_ACTIVE } from "@/lib/mock-data";
import Link from "next/link";
import { ArrowLeft, Upload, Check, X, Download, FileText, Clock, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useT } from "@/hooks/useT";

const STATUS_PILL: Record<string, string> = {
  accepted: "bg-tertiary-container text-on-tertiary-container",
  submitted: "bg-primary-container text-on-primary-container",
  pending: "bg-surface-container text-on-surface-variant",
  in_progress: "bg-primary-container text-on-primary-container",
  rejected: "bg-error-container text-on-error-container",
  auto_accepted: "bg-tertiary-container text-on-tertiary-container",
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { activeRole, sessionFlows, payDeposit, submitDelivery, approveDelivery, requestRevision } = useStore();
  const t = useT();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"stages" | "ledger">("stages");

  const SESSION_ID = "sess_001";
  const flow = sessionFlows[SESSION_ID];
  const order = ORDER_ACTIVE;
  const stages = flowToStages(flow);
  // Deliverables (static mock) mapped by stage index → only shown once delivered.
  const deliverablesByIdx: Record<number, Array<{ id: string; name: string; size: string; type: string; uploadedAt: string }>> = {
    1: order.deliverables.stg_002,
    2: order.deliverables.stg_003,
  };
  const completedCount = stages.filter((s) => s.status === "accepted").length;

  const inputCls =
    "w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:outline-none font-body text-sm";

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-6 md:px-12 pt-8 pb-16">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider text-on-surface-variant hover:text-on-surface mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> {t.orderDetail.backToProjects}
        </Link>

        {/* Header */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 mb-6">
          <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
            <div className="min-w-0">
              <h1 className="font-headline text-headline-md text-on-surface leading-snug">{order.title}</h1>
              <p className="font-body text-sm text-on-surface-variant italic mt-1.5">
                {activeRole === "backer"
                  ? t.orderDetail.withCounterpart(order.creator.nickname)
                  : t.orderDetail.forCounterpart(order.backer.nickname)}{" "}
                · ¥{order.totalFiat.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-label text-[11px] uppercase tracking-widest bg-primary-container text-on-primary-container px-3 py-1 rounded-full">
                {t.common.inProgress}
              </span>
              <Link
                href={`/messages/sessions/${SESSION_ID}`}
                className="flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider px-3 py-1.5 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" /> {t.orderDetail.tabConversation}
              </Link>
              <Link
                href={`/orders/${id}/contract`}
                className="flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider px-3 py-1.5 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                <FileText className="w-3.5 h-3.5" /> {t.orderDetail.contract}
              </Link>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between font-label text-label-md uppercase tracking-wider text-on-surface-variant">
              <span>{t.orderDetail.stagesComplete(completedCount, stages.length)}</span>
              <span>{Math.round((completedCount / stages.length) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-outline-variant/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(completedCount / stages.length) * 100}%` }}
              />
            </div>
            <div className="flex gap-1 mt-3">
              {stages.map((s) => (
                <div key={s.idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "w-full h-1 rounded-full",
                      s.status === "accepted"
                        ? "bg-primary"
                        : s.status === "submitted"
                        ? "bg-tertiary"
                        : s.status === "in_progress"
                        ? "bg-primary/40"
                        : "bg-outline-variant/30"
                    )}
                  />
                  <span className="font-label text-[9px] uppercase tracking-wider text-on-surface-variant text-center leading-tight">
                    {s.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-outline-variant/30 mb-6">
          {(["stages", "ledger"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-3 font-label text-label-md uppercase tracking-wider transition-colors border-b-2 -mb-px",
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              )}
            >
              {tab === "stages" ? t.orderDetail.tabStages : t.orderDetail.tabPayments}
            </button>
          ))}
        </div>

        {/* Stages */}
        {activeTab === "stages" && (
          <div className="space-y-4">
            {stages.map((stage, idx) => {
              const deliverables =
                stage.status === "submitted" || stage.status === "accepted" ? deliverablesByIdx[stage.idx] ?? [] : [];
              const isActive = stage.status === "submitted" || stage.status === "in_progress";
              return (
                <div
                  key={stage.idx}
                  className={cn(
                    "bg-surface-container-lowest border rounded-2xl p-6 transition-all",
                    isActive ? "border-primary/40 shadow-sm" : "border-outline-variant/30"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                          stage.status === "accepted" || stage.status === "auto_accepted"
                            ? "bg-tertiary-container text-on-tertiary-container"
                            : stage.status === "submitted"
                            ? "bg-primary-container text-on-primary-container"
                            : stage.status === "in_progress"
                            ? "bg-primary text-on-primary"
                            : "bg-surface-container text-on-surface-variant"
                        )}
                      >
                        {stage.status === "accepted" || stage.status === "auto_accepted" ? <Check className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div>
                        <p className="font-headline text-[18px] text-on-surface">{stage.name}</p>
                        <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mt-1">
                          ¥{stage.amountFiat.toLocaleString()} · {Math.round(stage.ratio * 100)}%
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "font-label text-[11px] uppercase tracking-widest px-3 py-1 rounded-full",
                        STATUS_PILL[stage.status]
                      )}
                    >
                      {t.orderDetail.statusLabels[stage.status as keyof typeof t.orderDetail.statusLabels]}
                    </span>
                  </div>

                  {stage.status === "submitted" && activeRole === "backer" && (
                    <div className="flex items-center gap-2 bg-primary-container/40 border-l-4 border-primary rounded-r-lg px-3 py-2 mt-3">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-body text-xs text-on-primary-container">{t.orderDetail.autoAcceptNotice}</span>
                    </div>
                  )}

                  {deliverables.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {deliverables.map((d) => (
                        <div
                          key={d.id}
                          className="flex items-center justify-between bg-surface-container rounded-xl px-4 py-2.5"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-base">{d.type === "video" ? "🎬" : d.type === "pdf" ? "📄" : "📦"}</span>
                            <div>
                              <p className="font-body text-sm font-bold text-on-surface">{d.name}</p>
                              <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                                {d.size} · {d.uploadedAt}
                              </p>
                            </div>
                          </div>
                          <button className="text-on-surface-variant hover:text-primary">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    {/* Deposit (stage 0) — backer pays */}
                    {activeRole === "backer" && stage.idx === 0 && stage.status === "in_progress" && (
                      <button
                        onClick={() => {
                          payDeposit(SESSION_ID);
                          toast.success(t.flow.toastDeposit);
                        }}
                        className="flex items-center gap-1.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-4 py-2 rounded-lg hover:opacity-90"
                      >
                        <Check className="w-3.5 h-3.5" /> {t.flow.payDeposit(stage.amountFiat)}
                      </button>
                    )}
                    {/* Delivery stages — backer reviews */}
                    {activeRole === "backer" && stage.idx >= 1 && stage.status === "submitted" && (
                      <>
                        <button
                          onClick={() => {
                            approveDelivery(SESSION_ID);
                            toast.success(t.orderDetail.approvedToast(stage.amountFiat));
                          }}
                          className="flex items-center gap-1.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-4 py-2 rounded-lg hover:opacity-90"
                        >
                          <Check className="w-3.5 h-3.5" /> {t.orderDetail.approveRelease}
                        </button>
                        <button
                          onClick={() => setRejectOpen(true)}
                          className="flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider px-4 py-2 border border-error/40 text-error rounded-lg hover:bg-error-container/40"
                        >
                          <X className="w-3.5 h-3.5" /> {t.orderDetail.requestRevision}
                        </button>
                      </>
                    )}
                    {/* Delivery stages — creator submits */}
                    {activeRole === "creator" && stage.idx >= 1 && stage.status === "in_progress" && (
                      <button
                        onClick={() => setSubmitOpen(true)}
                        className="flex items-center gap-1.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-4 py-2 rounded-lg hover:opacity-90"
                      >
                        <Upload className="w-3.5 h-3.5" /> {t.orderDetail.submitDeliverable}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Ledger */}
        {activeTab === "ledger" && (
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6">
            <div className="space-y-3">
              {order.ledger.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-outline-variant/30 last:border-0"
                >
                  <div>
                    <p className="font-body font-bold text-on-surface text-sm">{entry.note}</p>
                    <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mt-0.5">
                      {entry.date}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "font-headline text-[18px]",
                      entry.type === "Release" ? "text-tertiary" : "text-on-surface"
                    )}
                  >
                    {entry.type === "Release" ? "+" : "-"}¥{entry.amount.toLocaleString()}
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-3">
                <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                  {t.orderDetail.totalReleased}
                </span>
                <span className="font-headline text-[20px] text-primary">
                  ¥{order.ledger.filter((e) => e.type === "Release").reduce((a, b) => a + b.amount, 0).toLocaleString()}
                  <span className="font-body text-sm text-on-surface-variant font-normal"> / ¥{order.totalFiat.toLocaleString()}</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-[20px]">{t.orderDetail.rejectDialogTitle}</DialogTitle>
          </DialogHeader>
          <textarea rows={3} className={cn(inputCls, "resize-none")} placeholder={t.orderDetail.rejectPlaceholder} />
          <DialogFooter>
            <button
              onClick={() => setRejectOpen(false)}
              className="font-label text-label-md uppercase tracking-wider px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-high"
            >
              {t.common.cancel}
            </button>
            <button
              onClick={() => {
                requestRevision(SESSION_ID);
                setRejectOpen(false);
                toast.info(t.orderDetail.revisionRequestedToast);
              }}
              className="font-label text-label-md uppercase tracking-wider px-4 py-2 bg-error text-on-error rounded-lg hover:opacity-90"
            >
              {t.orderDetail.sendFeedback}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit dialog */}
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-[20px]">{t.orderDetail.submitDialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <div className="border-2 border-dashed border-outline-variant rounded-2xl p-8 text-center">
              <Upload className="w-7 h-7 text-on-surface-variant mx-auto mb-2" />
              <p className="font-body text-sm text-on-surface-variant">{t.orderDetail.dropFiles}</p>
              <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant/80 mt-1">
                {t.orderDetail.fileTypes}
              </p>
            </div>
            <div className="bg-surface-container rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="text-base">🎬</span>
              <div className="flex-1">
                <p className="font-body text-xs font-bold text-on-surface">final_cut_v2.mp4</p>
                <p className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant">
                  890 MB · {t.orderDetail.readyToSubmit}
                </p>
              </div>
              <Check className="w-4 h-4 text-tertiary" />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setSubmitOpen(false)}
              className="font-label text-label-md uppercase tracking-wider px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-high"
            >
              {t.common.cancel}
            </button>
            <button
              onClick={() => {
                submitDelivery(SESSION_ID);
                setSubmitOpen(false);
                toast.success(t.orderDetail.submittedToast);
              }}
              className="font-label text-label-md uppercase tracking-wider px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90"
            >
              {t.common.submit}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
