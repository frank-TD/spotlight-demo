"use client";
import { use, useState } from "react";
import { useStore } from "@/lib/store";
import AppShell from "@/components/layout/AppShell";
import { ORDER_ACTIVE } from "@/lib/mock-data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, Check, X, Download, MessageSquare, FileText, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const STATUS_COLORS: Record<string, string> = {
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  submitted: "bg-amber-50 text-amber-700 border-amber-200",
  pending: "bg-muted text-muted-foreground border-border",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  auto_accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const STATUS_LABELS: Record<string, string> = {
  accepted: "Approved",
  submitted: "Awaiting Review",
  pending: "Pending",
  in_progress: "In Progress",
  rejected: "Revision Requested",
  auto_accepted: "Auto-approved",
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { activeRole, orderStages, acceptStage, rejectStage, submitStage } = useStore();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitTarget, setSubmitTarget] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"stages" | "messages" | "ledger">("stages");

  const order = ORDER_ACTIVE;
  const stages = orderStages;

  const completedCount = stages.filter(s => s.status === "accepted" || s.status === "auto_accepted").length;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link href="/projects" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> My Projects
        </Link>

        {/* Header */}
        <div className="bg-white border border-border rounded-xl p-6 mb-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-lg font-bold text-foreground leading-snug">{order.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {activeRole === "backer" ? `with ${order.creator.nickname}` : `for ${order.backer.nickname}`} · ¥{order.totalFiat.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">In Progress</Badge>
              <Link href={`/orders/${id}/contract`}>
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground">
                  <FileText className="w-3.5 h-3.5" /> Contract
                </Button>
              </Link>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{completedCount} of {stages.length} stages complete</span>
              <span>{Math.round((completedCount / stages.length) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / stages.length) * 100}%` }}
              />
            </div>
            <div className="flex gap-1 mt-2">
              {stages.map((s) => (
                <div key={s.id} className="flex-1 flex flex-col items-center gap-1">
                  <div className={cn(
                    "w-full h-1 rounded-full",
                    s.status === "accepted" || s.status === "auto_accepted" ? "bg-primary" :
                    s.status === "submitted" ? "bg-amber-400" :
                    s.status === "in_progress" ? "bg-primary/30" : "bg-border"
                  )} />
                  <span className="text-[9px] text-muted-foreground text-center leading-tight">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-5 gap-0">
          {(["stages", "messages", "ledger"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px",
                activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === "stages" ? "Stages & Deliverables" : tab === "messages" ? "Conversation" : "Payments"}
            </button>
          ))}
        </div>

        {/* Stages tab */}
        {activeTab === "stages" && (
          <div className="space-y-4">
            {stages.map((stage, idx) => {
              const deliverables = (order.deliverables as Record<string, Array<{ id: string; name: string; size: string; type: string; uploadedAt: string }>>)[stage.id] ?? [];
              const isActive = stage.status === "submitted" || stage.status === "in_progress";
              return (
                <div
                  key={stage.id}
                  className={cn(
                    "bg-white border rounded-xl p-5 transition-all",
                    isActive ? "border-primary/40 shadow-sm" : "border-border"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                        stage.status === "accepted" || stage.status === "auto_accepted" ? "bg-emerald-100 text-emerald-700" :
                        stage.status === "submitted" ? "bg-amber-100 text-amber-700" :
                        stage.status === "in_progress" ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"
                      )}>
                        {stage.status === "accepted" || stage.status === "auto_accepted" ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{stage.name}</p>
                        <p className="text-xs text-muted-foreground">¥{stage.amountFiat.toLocaleString()} · {Math.round(stage.ratio * 100)}%</p>
                      </div>
                    </div>
                    <Badge className={cn("text-xs", STATUS_COLORS[stage.status])}>
                      {STATUS_LABELS[stage.status]}
                    </Badge>
                  </div>

                  {/* Auto-accept countdown */}
                  {stage.status === "submitted" && activeRole === "backer" && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600 mb-3 bg-amber-50 rounded-lg px-3 py-2">
                      <Clock className="w-3.5 h-3.5" />
                      Auto-accepted on May 24 if no action taken
                    </div>
                  )}

                  {/* Deliverables */}
                  {deliverables.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {deliverables.map(d => (
                        <div key={d.id} className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{d.type === "video" ? "🎬" : d.type === "pdf" ? "📄" : "📦"}</span>
                            <div>
                              <p className="text-xs font-medium text-foreground">{d.name}</p>
                              <p className="text-[10px] text-muted-foreground">{d.size} · {d.uploadedAt}</p>
                            </div>
                          </div>
                          <button className="text-muted-foreground hover:text-primary">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-1">
                    {/* Backer actions */}
                    {activeRole === "backer" && stage.status === "submitted" && (
                      <>
                        <Button size="sm" className="text-xs h-8 gap-1.5" onClick={() => { acceptStage(stage.id); toast.success(`Stage approved! ¥${stage.amountFiat.toLocaleString()} released to Aria Song.`); }}>
                          <Check className="w-3 h-3" /> Approve & Release
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5"
                          onClick={() => { setRejectTarget(stage.id); setRejectOpen(true); }}>
                          <X className="w-3 h-3" /> Request Revision
                        </Button>
                      </>
                    )}
                    {/* Creator actions */}
                    {activeRole === "creator" && stage.status === "in_progress" && (
                      <Button size="sm" className="text-xs h-8 gap-1.5" onClick={() => { setSubmitTarget(stage.id); setSubmitOpen(true); }}>
                        <Upload className="w-3 h-3" /> Submit Deliverable
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Messages tab */}
        {activeTab === "messages" && (
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="h-[460px] overflow-y-auto p-4 space-y-3">
              {order.messages.map(msg => {
                if (msg.isCard) {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <div className="bg-accent border border-primary/20 rounded-lg px-4 py-2 text-xs text-foreground/80 text-center max-w-xs">
                        {msg.text}
                      </div>
                    </div>
                  );
                }
                const isMe = (activeRole === "backer" && msg.senderId === "u_backer_01") ||
                             (activeRole === "creator" && msg.senderId === "u_creator_01");
                return (
                  <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-primary mr-2 shrink-0 mt-0.5">
                        {msg.senderName.split(" ").map(n => n[0]).join("")}
                      </div>
                    )}
                    <div className={cn("max-w-[70%]", isMe ? "items-end" : "items-start", "flex flex-col gap-0.5")}>
                      {!isMe && <span className="text-[10px] text-muted-foreground px-1">{msg.senderName} · {msg.senderRole}</span>}
                      <div className={cn(
                        "rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
                        isMe ? "bg-primary text-white rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"
                      )}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-muted-foreground px-1">{msg.ts}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-border p-3 flex gap-2">
              <input className="flex-1 text-sm rounded-lg border border-input px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Type a message..." />
              <Button size="sm">Send</Button>
            </div>
          </div>
        )}

        {/* Ledger tab */}
        {activeTab === "ledger" && (
          <div className="bg-white border border-border rounded-xl p-5">
            <div className="space-y-3">
              {order.ledger.map((entry, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{entry.note}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{entry.date}</p>
                  </div>
                  <div className={cn("text-sm font-semibold", entry.type === "Release" ? "text-emerald-600" : "text-foreground")}>
                    {entry.type === "Release" ? "+" : "-"}¥{entry.amount.toLocaleString()}
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-2">
                <span className="text-sm text-muted-foreground">Total released</span>
                <span className="text-sm font-bold text-primary">
                  ¥{order.ledger.filter(e => e.type === "Release").reduce((a, b) => a + b.amount, 0).toLocaleString()}
                  <span className="text-muted-foreground font-normal"> / ¥{order.totalFiat.toLocaleString()}</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-base">Request Revision</DialogTitle></DialogHeader>
          <Textarea className="resize-none text-sm" rows={3} placeholder="Describe what needs to change..." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              if (rejectTarget) rejectStage(rejectTarget);
              setRejectOpen(false);
              toast.info("Revision requested. Creator has been notified.");
            }}>Send Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit dialog */}
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-base">Submit Deliverable</DialogTitle></DialogHeader>
          <div className="py-2 space-y-3">
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
              <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Drop files here or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">Video, PDF, ZIP · up to 10 GB</p>
            </div>
            <div className="bg-muted rounded-lg px-3 py-2.5 flex items-center gap-2">
              <span className="text-sm">🎬</span>
              <div className="flex-1">
                <p className="text-xs font-medium">final_cut_v2.mp4</p>
                <p className="text-[10px] text-muted-foreground">890 MB · Ready to submit</p>
              </div>
              <Check className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (submitTarget) submitStage(submitTarget);
              setSubmitOpen(false);
              toast.success("Deliverable submitted! Backer has been notified.");
            }}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
