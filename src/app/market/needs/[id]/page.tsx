"use client";
import { use } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NEEDS, BIDS_NEED_001, CREATORS } from "@/lib/mock-data";
import Link from "next/link";
import { ArrowLeft, Clock, DollarSign, Film, Star, Check, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/hooks/useT";

export default function NeedDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isLoggedIn, activeRole, myBidStatus, submitBid } = useStore();
  const router = useRouter();
  const t = useT();
  const [bidOpen, setBidOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [acceptedBid, setAcceptedBid] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) router.push("/login");
  }, [isLoggedIn, router]);

  const need = NEEDS.find(n => n.id === id) ?? NEEDS[0];
  const bids = id === "need_001" ? BIDS_NEED_001 : [];

  const handleAccept = (bidId: string) => {
    setAcceptedBid(bidId);
    setManageOpen(false);
    toast.success(t.needDetail.collaborationConfirmedToast);
    setTimeout(() => router.push("/orders/ord_001/contract"), 800);
  };

  if (!isLoggedIn) return null;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Back */}
        <Link href="/market" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> {t.needDetail.backToMarket}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            {/* Header */}
            <div className="bg-white border border-border rounded-xl p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <Badge variant="secondary" className="text-xs mb-2">{need.contentType}</Badge>
                  <h1 className="text-lg font-bold text-foreground leading-snug">{need.title}</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t.needDetail.postedBy} <span className="text-foreground font-medium">{need.backerNickname}</span> · {need.publishedAt}
                  </p>
                </div>
                <Badge className={cn("shrink-0 text-xs", need.status === "open" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-accent text-primary border-primary/20")}>
                  {need.status === "open" ? t.needDetail.openForBids : t.common.inProgress}
                </Badge>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: DollarSign, label: t.needDetail.budget, value: `¥${need.budget.toLocaleString()}` },
                  { icon: Clock, label: t.needDetail.deliveryLabel, value: `${need.deliveryDays} ${t.common.days}` },
                  { icon: Film, label: t.needDetail.duration, value: `${need.durationSec}s` },
                  { icon: Film, label: t.needDetail.episodes, value: `${need.episodes} ep` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-muted rounded-lg px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Brief */}
            <div className="bg-white border border-border rounded-xl p-6">
              <h2 className="text-sm font-semibold text-foreground mb-3">{t.needDetail.projectBrief}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{need.brief}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {need.styles.map(s => (
                  <span key={s} className="text-xs bg-accent text-primary px-2.5 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>

            {/* Contract terms */}
            <div className="bg-white border border-border rounded-xl p-6">
              <h2 className="text-sm font-semibold text-foreground mb-3">{t.needDetail.terms}</h2>
              <div className="space-y-2 text-sm">
                {[
                  [t.needDetail.copyright, need.copyright],
                  [t.needDetail.aiGeneration, need.allowAI ? t.needDetail.allowed : t.needDetail.notAllowed],
                  [t.needDetail.ndaRequired, need.nda ? t.needDetail.yes : t.needDetail.no],
                  [t.needDetail.revisionLimit, `${need.modifyLimit} ${t.needDetail.roundsPerStage}`],
                  [t.needDetail.aspectRatio, need.aspectRatio],
                  [t.needDetail.platforms, need.platforms.join(", ")],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium text-foreground">{v}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Action card */}
            <div className="bg-white border border-border rounded-xl p-5 sticky top-20">
              <div className="text-center mb-4">
                <p className="text-2xl font-bold text-foreground">¥{need.budget.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.needDetail.projectBudget}</p>
              </div>

              {activeRole === "creator" && need.status === "open" && (
                <>
                  {myBidStatus === "none" ? (
                    <Button className="w-full" onClick={() => setBidOpen(true)}>{t.needDetail.applyBtn}</Button>
                  ) : (
                    <div className="text-center">
                      <Badge className="bg-accent text-primary border-0 text-xs">{t.needDetail.applicationSubmitted}</Badge>
                      <p className="text-xs text-muted-foreground mt-2">{t.needDetail.waitingDecision}</p>
                    </div>
                  )}
                </>
              )}

              {activeRole === "backer" && (
                <Button
                  className="w-full"
                  disabled={bids.length === 0}
                  onClick={() => setManageOpen(true)}
                >
                  {t.needDetail.manageBids(bids.length)}
                </Button>
              )}

              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t.common.applications}</span>
                  <span className="font-medium">{need.bids}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t.common.posted}</span>
                  <span className="font-medium">{need.publishedAt}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t.common.delivery}</span>
                  <span className="font-medium">{need.deliveryDays} {t.common.days}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manage bids dialog — Backer view */}
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">{t.needDetail.applicationsTitle(bids.length)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {bids.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {t.needDetail.waitingDecision}
              </p>
            ) : (
              bids.map((bid) => (
                <div key={bid.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold", bid.creator.avatarColor)}>
                        {bid.creator.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{bid.creator.nickname}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs text-muted-foreground">{bid.creator.rating} · {bid.creator.orders} {t.common.projects}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">¥{bid.quote.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{bid.submittedAt}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{bid.note}</p>
                  <div className="flex gap-2 mt-3">
                    {acceptedBid === bid.id ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">{t.needDetail.accepted}</Badge>
                    ) : (
                      <>
                        <Button size="sm" className="text-xs h-7" onClick={() => handleAccept(bid.id)}>
                          <Check className="w-3 h-3 mr-1" /> {t.needDetail.confirmBtn}
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs h-7 text-muted-foreground">
                          <X className="w-3 h-3 mr-1" /> {t.needDetail.declineBtn}
                        </Button>
                        <Link href={`/market/creators/${bid.creatorId}`}>
                          <Button size="sm" variant="ghost" className="text-xs h-7 text-primary">
                            {t.needDetail.viewProfile} <ChevronRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManageOpen(false)}>{t.common.cancel}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bid dialog */}
      <Dialog open={bidOpen} onOpenChange={setBidOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">{t.needDetail.bidDialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm">{t.needDetail.yourQuote}</Label>
              <Input className="mt-1.5" defaultValue="3800" />
            </div>
            <div>
              <Label className="text-sm">{t.needDetail.proposal}</Label>
              <Textarea className="mt-1.5 resize-none text-sm" rows={4} defaultValue={t.needDetail.proposalDefault} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBidOpen(false)}>{t.common.cancel}</Button>
            <Button onClick={() => { submitBid(); setBidOpen(false); toast.success(t.needDetail.applicationSubmittedToast); }}>
              {t.needDetail.submitApplication}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
