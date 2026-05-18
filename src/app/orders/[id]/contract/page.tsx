"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ORDER_ACTIVE } from "@/lib/mock-data";
import { ArrowLeft, Check, Shield, FileText } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useT } from "@/hooks/useT";

export default function ContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const t = useT();
  const [backerSigned, setBackerSigned] = useState(false);
  const [creatorSigned] = useState(true); // pre-signed in demo
  const [confirming, setConfirming] = useState(false);

  const order = ORDER_ACTIVE;

  const handleConfirm = async () => {
    setConfirming(true);
    setBackerSigned(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success(t.contract.confirmedToast);
    setTimeout(() => router.push(`/orders/${id}`), 600);
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Link href={`/orders/${id}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> {t.contract.backToOrder}
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
            <FileText className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">{t.contract.title}</h1>
            <p className="text-sm text-muted-foreground">{t.contract.subtitle}</p>
          </div>
        </div>

        {/* Parties */}
        <div className="bg-white border border-border rounded-xl p-5 mb-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">{t.contract.parties}</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: t.projects.counterpartBacker, name: order.backer.nickname, avatar: order.backer.avatar, signed: backerSigned },
              { label: t.projects.counterpartCreator, name: order.creator.nickname, avatar: order.creator.avatar, signed: creatorSigned },
            ].map(p => (
              <div key={p.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-sm font-semibold text-primary">{p.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{p.label}</p>
                  <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                </div>
                {p.signed ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs gap-1 shrink-0">
                    <Check className="w-2.5 h-2.5" /> {t.contract.signed}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-muted-foreground shrink-0">{t.contract.pendingSign}</Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-white border border-border rounded-xl p-5 mb-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">{t.contract.projectSummary}</h2>
          <div className="space-y-2 text-sm">
            {[
              [t.contract.projectLabel, order.title],
              [t.contract.totalAmount, `¥${order.totalFiat.toLocaleString()}`],
              [t.contract.copyrightLabel, order.copyright],
              [t.contract.revisionLimit, t.contract.revisionLimitValue],
              [t.contract.autoAcceptance, t.contract.autoAcceptanceValue],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium text-foreground">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment stages */}
        <div className="bg-white border border-border rounded-xl p-5 mb-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">{t.contract.paymentSchedule}</h2>
          <div className="space-y-2">
            {order.stages.map((stage) => (
              <div key={stage.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{stage.name}</p>
                  <p className="text-xs text-muted-foreground">{Math.round(stage.ratio * 100)}{t.contract.ofTotal}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">¥{stage.amountFiat.toLocaleString()}</p>
              </div>
            ))}
            <div className="flex justify-between pt-2">
              <span className="text-sm font-semibold text-foreground">{t.contract.total}</span>
              <span className="text-sm font-bold text-primary">¥{order.totalFiat.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-accent border border-primary/20 rounded-xl p-4 mb-6 flex gap-3">
          <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-foreground/80 leading-relaxed">
            {t.contract.escrowNotice}
          </p>
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={backerSigned || confirming}
          onClick={handleConfirm}
        >
          {backerSigned ? t.contract.confirmed : confirming ? t.contract.confirming : t.contract.confirmBtn}
        </Button>
      </div>
    </AppShell>
  );
}
