"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
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
  const [creatorSigned] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const order = ORDER_ACTIVE;

  const handleConfirm = async () => {
    setConfirming(true);
    setBackerSigned(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success(t.contract.confirmedToast);
    setTimeout(() => router.push(`/orders/${id}`), 600);
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 md:px-12 pt-8 pb-16">
        <Link
          href={`/orders/${id}`}
          className="inline-flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider text-on-surface-variant hover:text-on-surface mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> {t.contract.backToOrder}
        </Link>

        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-on-primary-container" />
          </div>
          <div>
            <h1 className="font-headline text-headline-md text-on-surface">{t.contract.title}</h1>
            <p className="font-body text-sm text-on-surface-variant italic mt-1">{t.contract.subtitle}</p>
          </div>
        </div>

        {/* Parties */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 mb-5">
          <h2 className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant mb-4">
            {t.contract.parties}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: t.projects.counterpartBacker, name: order.backer.nickname, avatar: order.backer.avatar, signed: backerSigned },
              { label: t.projects.counterpartCreator, name: order.creator.nickname, avatar: order.creator.avatar, signed: creatorSigned },
            ].map((p) => (
              <div key={p.label} className="flex items-center gap-3 p-4 rounded-xl bg-surface-container">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-sm font-bold">
                  {p.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">{p.label}</p>
                  <p className="font-body font-bold text-on-surface text-sm truncate">{p.name}</p>
                </div>
                {p.signed ? (
                  <span className="flex items-center gap-1 font-label text-[10px] uppercase tracking-widest bg-tertiary-container text-on-tertiary-container px-2.5 py-1 rounded-full">
                    <Check className="w-3 h-3" /> {t.contract.signed}
                  </span>
                ) : (
                  <span className="font-label text-[10px] uppercase tracking-widest border border-outline-variant text-on-surface-variant px-2.5 py-1 rounded-full">
                    {t.contract.pendingSign}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Project summary */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 mb-5">
          <h2 className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant mb-4">
            {t.contract.projectSummary}
          </h2>
          <div className="space-y-3 font-body text-sm">
            {[
              [t.contract.projectLabel, order.title],
              [t.contract.totalAmount, `¥${order.totalFiat.toLocaleString()}`],
              [t.contract.copyrightLabel, order.copyright],
              [t.contract.revisionLimit, t.contract.revisionLimitValue],
              [t.contract.autoAcceptance, t.contract.autoAcceptanceValue],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">{k}</span>
                <span className="font-bold text-on-surface text-right ml-4">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment schedule */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 mb-5">
          <h2 className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant mb-4">
            {t.contract.paymentSchedule}
          </h2>
          <div className="space-y-2">
            {order.stages.map((stage) => (
              <div
                key={stage.id}
                className="flex items-center justify-between py-3 border-b border-outline-variant/30 last:border-0"
              >
                <div>
                  <p className="font-body font-bold text-on-surface text-sm">{stage.name}</p>
                  <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mt-0.5">
                    {Math.round(stage.ratio * 100)}{t.contract.ofTotal}
                  </p>
                </div>
                <p className="font-headline text-[18px] text-on-surface">¥{stage.amountFiat.toLocaleString()}</p>
              </div>
            ))}
            <div className="flex justify-between pt-3">
              <span className="font-label text-label-md uppercase tracking-wider text-on-surface">{t.contract.total}</span>
              <span className="font-headline text-[20px] text-primary">¥{order.totalFiat.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Escrow notice */}
        <div className="bg-primary-container/40 border-l-4 border-primary p-5 rounded-r-xl flex gap-3 mb-8">
          <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="font-body text-sm text-on-primary-container leading-relaxed">{t.contract.escrowNotice}</p>
        </div>

        <button
          disabled={backerSigned || confirming}
          onClick={handleConfirm}
          className="w-full bg-primary text-on-primary font-label text-label-md uppercase tracking-wider py-4 rounded-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 text-base"
        >
          {backerSigned ? t.contract.confirmed : confirming ? t.contract.confirming : t.contract.confirmBtn}
        </button>
      </div>
    </AppShell>
  );
}
