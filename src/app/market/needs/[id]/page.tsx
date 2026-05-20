"use client";
import { use } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { NEEDS, BIDS_NEED_001 } from "@/lib/mock-data";
import Link from "next/link";
import { ArrowLeft, Clock, DollarSign, Film, Star, Check, X, ChevronRight, Paperclip, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useT } from "@/hooks/useT";

export default function NeedDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isLoggedIn, activeRole, myBidStatus, submitBid } = useStore();
  const router = useRouter();
  const t = useT();
  const [bidOpen, setBidOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [acceptedBid, setAcceptedBid] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Array<{ id: string; name: string; size: string; note: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoggedIn) router.push("/login");
  }, [isLoggedIn, router]);

  const need = NEEDS.find((n) => n.id === id) ?? NEEDS[0];
  const bids = id === "need_001" ? BIDS_NEED_001 : [];

  const handleAccept = (bidId: string) => {
    setAcceptedBid(bidId);
    setManageOpen(false);
    toast.success(t.needDetail.collaborationConfirmedToast);
    setTimeout(() => router.push("/orders/ord_001/contract"), 800);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = 5 - attachments.length;
    if (files.length > remaining) toast.error(t.needDetail.attachmentLimitToast);
    const next = files.slice(0, remaining).map((f) => ({
      id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: f.name,
      size: formatSize(f.size),
      note: "",
    }));
    setAttachments((prev) => [...prev, ...next]);
    e.target.value = "";
  };

  const updateAttachmentNote = (id: string, note: string) =>
    setAttachments((prev) => prev.map((a) => (a.id === id ? { ...a, note } : a)));
  const removeAttachment = (id: string) => setAttachments((prev) => prev.filter((a) => a.id !== id));
  const resetBidForm = () => setAttachments([]);

  if (!isLoggedIn) return null;

  const inputCls =
    "w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:outline-none font-body text-sm";

  return (
    <AppShell>
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 pt-8 pb-16">
        <Link
          href="/market"
          className="inline-flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider text-on-surface-variant hover:text-on-surface mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> {t.needDetail.backToMarket}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="min-w-0">
                  <span className="font-label text-[10px] uppercase tracking-widest bg-secondary-container text-on-secondary-container px-2.5 py-1 rounded">
                    {need.contentType}
                  </span>
                  <h1 className="font-headline text-headline-md text-on-surface leading-snug mt-3">{need.title}</h1>
                  <p className="font-body text-sm text-on-surface-variant mt-1 italic">
                    {t.needDetail.postedBy} <span className="font-bold not-italic">{need.backerNickname}</span> · {need.publishedAt}
                  </p>
                </div>
                <span
                  className={cn(
                    "font-label text-[11px] uppercase tracking-widest px-3 py-1 rounded-full shrink-0",
                    need.status === "open"
                      ? "bg-tertiary-container text-on-tertiary-container"
                      : "bg-primary-container text-on-primary-container"
                  )}
                >
                  {need.status === "open" ? t.needDetail.openForBids : t.common.inProgress}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: DollarSign, label: t.needDetail.budget, value: `¥${need.budget.toLocaleString()}` },
                  { icon: Clock, label: t.needDetail.deliveryLabel, value: `${need.deliveryDays} ${t.common.days}` },
                  { icon: Film, label: t.needDetail.duration, value: `${need.durationSec}s` },
                  { icon: Film, label: t.needDetail.episodes, value: `${need.episodes} ep` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-surface-container rounded-xl px-4 py-3 flex items-center gap-3">
                    <Icon className="w-4 h-4 text-on-surface-variant shrink-0" />
                    <div>
                      <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                        {label}
                      </p>
                      <p className="font-body font-bold text-on-surface mt-0.5 text-sm">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Brief */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8">
              <h2 className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant mb-4">
                {t.needDetail.projectBrief}
              </h2>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">{need.brief}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {need.styles.map((s) => (
                  <span
                    key={s}
                    className="font-label text-[11px] uppercase tracking-widest bg-primary-container text-on-primary-container px-2.5 py-1 rounded-full"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Terms */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8">
              <h2 className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant mb-4">
                {t.needDetail.terms}
              </h2>
              <div className="space-y-3">
                {[
                  [t.needDetail.copyright, need.copyright],
                  [t.needDetail.aiGeneration, need.allowAI ? t.needDetail.allowed : t.needDetail.notAllowed],
                  [t.needDetail.ndaRequired, need.nda ? t.needDetail.yes : t.needDetail.no],
                  [t.needDetail.revisionLimit, `${need.modifyLimit} ${t.needDetail.roundsPerStage}`],
                  [t.needDetail.aspectRatio, need.aspectRatio],
                  [t.needDetail.platforms, need.platforms.join(", ")],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between font-body text-sm">
                    <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">{k}</span>
                    <span className="font-bold text-on-surface">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 sticky top-24">
              <div className="text-center mb-5">
                <p className="font-headline text-[36px] text-on-surface leading-none">¥{need.budget.toLocaleString()}</p>
                <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mt-2">
                  {t.needDetail.projectBudget}
                </p>
              </div>

              {activeRole === "creator" && need.status === "open" && (
                <>
                  {myBidStatus === "none" ? (
                    <button
                      onClick={() => setBidOpen(true)}
                      className="w-full bg-primary text-on-primary font-label text-label-md uppercase tracking-wider py-3 rounded-lg hover:opacity-90 active:scale-95 transition-all"
                    >
                      {t.needDetail.applyBtn}
                    </button>
                  ) : (
                    <div className="text-center">
                      <span className="font-label text-[11px] uppercase tracking-widest bg-primary-container text-on-primary-container px-3 py-1 rounded-full inline-block">
                        {t.needDetail.applicationSubmitted}
                      </span>
                      <p className="font-body text-xs text-on-surface-variant mt-2">{t.needDetail.waitingDecision}</p>
                    </div>
                  )}
                </>
              )}

              {activeRole === "backer" && (
                <button
                  disabled={bids.length === 0}
                  onClick={() => setManageOpen(true)}
                  className="w-full bg-primary text-on-primary font-label text-label-md uppercase tracking-wider py-3 rounded-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                >
                  {t.needDetail.manageBids(bids.length)}
                </button>
              )}

              <div className="mt-5 pt-5 border-t border-outline-variant/30 space-y-2.5">
                {[
                  [t.common.applications, need.bids],
                  [t.common.posted, need.publishedAt],
                  [t.common.delivery, `${need.deliveryDays} ${t.common.days}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">{k}</span>
                    <span className="font-body font-bold text-on-surface text-sm">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manage bids */}
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-headline text-[22px]">{t.needDetail.applicationsTitle(bids.length)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {bids.length === 0 ? (
              <p className="font-body text-sm text-on-surface-variant text-center py-8">
                {t.needDetail.waitingDecision}
              </p>
            ) : (
              bids.map((bid) => (
                <div key={bid.id} className="border border-outline-variant/40 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold", bid.creator.avatarColor)}>
                        {bid.creator.avatar}
                      </div>
                      <div>
                        <p className="font-headline text-[16px] text-on-surface">{bid.creator.nickname}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Star className="w-3 h-3 fill-tertiary text-tertiary" />
                          <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                            {bid.creator.rating} · {bid.creator.orders} {t.common.projects}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-headline text-[18px] text-on-surface">¥{bid.quote.toLocaleString()}</p>
                      <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mt-0.5">
                        {bid.submittedAt}
                      </p>
                    </div>
                  </div>
                  <p className="font-body text-xs text-on-surface-variant mt-3 leading-relaxed">{bid.note}</p>
                  <div className="flex gap-2 mt-4">
                    {acceptedBid === bid.id ? (
                      <span className="font-label text-[11px] uppercase tracking-widest bg-tertiary-container text-on-tertiary-container px-3 py-1.5 rounded-full">
                        {t.needDetail.accepted}
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAccept(bid.id)}
                          className="flex items-center gap-1 font-label text-label-md uppercase tracking-wider px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90"
                        >
                          <Check className="w-3.5 h-3.5" /> {t.needDetail.confirmBtn}
                        </button>
                        <button className="flex items-center gap-1 font-label text-label-md uppercase tracking-wider px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-high text-on-surface-variant">
                          <X className="w-3.5 h-3.5" /> {t.needDetail.declineBtn}
                        </button>
                        <Link
                          href={`/market/creators/${bid.creatorId}`}
                          className="flex items-center gap-1 font-label text-label-md uppercase tracking-wider px-4 py-2 text-primary hover:bg-primary-container/40 rounded-lg"
                        >
                          {t.needDetail.viewProfile} <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <button
              onClick={() => setManageOpen(false)}
              className="font-label text-label-md uppercase tracking-wider px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-high"
            >
              {t.common.cancel}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bid dialog */}
      <Dialog
        open={bidOpen}
        onOpenChange={(open) => {
          setBidOpen(open);
          if (!open) resetBidForm();
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-headline text-[22px]">{t.needDetail.bidDialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="font-label text-label-md uppercase tracking-wider text-on-surface-variant block mb-2">
                {t.needDetail.yourQuote}
              </label>
              <input className={inputCls} defaultValue="3800" />
            </div>
            <div>
              <label className="font-label text-label-md uppercase tracking-wider text-on-surface-variant block mb-2">
                {t.needDetail.proposal}
              </label>
              <textarea rows={4} className={cn(inputCls, "resize-none")} defaultValue={t.needDetail.proposalDefault} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                  {t.needDetail.attachments}
                </label>
                <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                  {attachments.length}/5
                </span>
              </div>
              <p className="font-body text-xs text-on-surface-variant mb-2">{t.needDetail.attachmentsHint}</p>

              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFilePick} />

              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((a) => (
                    <div key={a.id} className="border border-outline-variant/40 rounded-xl p-3 bg-surface-container-low">
                      <div className="flex items-start gap-2">
                        <Paperclip className="w-4 h-4 text-on-surface-variant shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-xs font-bold text-on-surface truncate">{a.name}</p>
                          <p className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant mt-0.5">
                            {a.size}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(a.id)}
                          className="text-on-surface-variant hover:text-error shrink-0"
                          aria-label="remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        value={a.note}
                        onChange={(e) => updateAttachmentNote(a.id, e.target.value)}
                        placeholder={t.needDetail.attachmentNotePlaceholder}
                        className="mt-2 w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-primary focus:outline-none font-body text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                disabled={attachments.length >= 5}
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 w-full flex items-center justify-center gap-1.5 font-label text-label-md uppercase tracking-wider py-2.5 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors disabled:opacity-50"
              >
                <Paperclip className="w-4 h-4" /> {t.needDetail.addAttachment}
              </button>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                setBidOpen(false);
                resetBidForm();
              }}
              className="font-label text-label-md uppercase tracking-wider px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-high"
            >
              {t.common.cancel}
            </button>
            <button
              onClick={() => {
                submitBid();
                setBidOpen(false);
                resetBidForm();
                toast.success(t.needDetail.applicationSubmittedToast);
              }}
              className="font-label text-label-md uppercase tracking-wider px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90"
            >
              {t.needDetail.submitApplication}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
