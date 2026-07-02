"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Shield, FileText } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import AppShell from "@/components/layout/AppShell";
import { ORDER_ACTIVE, SESSIONS } from "@/lib/mock-data";
import { useStore, STAGE_META, stageAmount } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";

const COPYRIGHT_CHOICES = ["Buyout", "Sub-licensable", "Licensed"];

export default function ContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const t = useT();
  const { sessionFlows, submitContract, confirmContract, rejectContract } = useStore();

  const order = ORDER_ACTIVE;
  const sessionId = SESSIONS.find((s) => s.orderId === id)?.id ?? "sess_001";
  const flow = sessionFlows[sessionId];

  const isDraft = flow?.phase === "contract_draft";
  const isConfirm = flow?.phase === "contract_confirm";
  // Contract is fully signed once the flow has moved past the contract phases.
  const contractDone =
    !!flow &&
    !["invitation", "rejected", "contract_draft", "contract_confirm"].includes(flow.phase);
  // Reached the contract page before it has been drafted (e.g. during invitation).
  const beforeContract = !flow || flow.phase === "invitation" || flow.phase === "rejected";

  // Editable terms (draft mode); otherwise reflect what the flow has stored.
  const [total, setTotal] = useState(flow?.total ?? order.totalFiat);
  const [copyright, setCopyright] = useState(flow?.terms?.copyright ?? order.copyright);
  const [revisionLimit, setRevisionLimit] = useState(flow?.terms?.revisionLimit ?? 3);
  const [autoAcceptDays, setAutoAcceptDays] = useState(flow?.terms?.autoAcceptDays ?? 7);
  const [busy, setBusy] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // Display values: draft uses live edits, others use stored flow terms.
  const dTotal = isDraft ? total : (flow?.total ?? order.totalFiat);
  const dCopyright = isDraft ? copyright : (flow?.terms?.copyright ?? order.copyright);
  const dRevisions = isDraft ? revisionLimit : (flow?.terms?.revisionLimit ?? 3);
  const dDays = isDraft ? autoAcceptDays : (flow?.terms?.autoAcceptDays ?? 7);

  const backerSigned = isConfirm || contractDone; // backer signs by submitting the draft
  const creatorSigned = contractDone; // creator signs by confirming

  const handleSubmitDraft = async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 500));
    submitContract(sessionId, { total, copyright, revisionLimit, autoAcceptDays });
    toast.success(t.contract.submittedToast);
    router.push(`/messages/sessions/${sessionId}`);
  };

  const handleConfirm = async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 500));
    confirmContract(sessionId);
    toast.success(t.flow.toastContractConfirmed);
    router.push(`/messages/sessions/${sessionId}`);
  };

  const handleRequestChanges = () => {
    rejectContract(sessionId);
    toast.info(t.contract.changesRequestedToast);
    router.push(`/messages/sessions/${sessionId}`);
  };

  const headerTitle = isDraft
    ? t.contract.draftTitle
    : isConfirm
      ? t.contract.confirmTitle
      : t.contract.title;
  const headerSub = isDraft
    ? t.contract.draftSubtitle
    : isConfirm
      ? t.contract.confirmSubtitle
      : beforeContract
        ? t.contract.notDrafted
        : t.contract.subtitle;
  const backHref = isDraft || isConfirm ? `/messages/sessions/${sessionId}` : `/orders/${id}`;
  const backLabel = isDraft || isConfirm ? t.contract.backToConversation : t.contract.backToOrder;

  const fieldCls =
    "px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary focus:outline-none font-body text-sm text-right w-36";

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 md:px-12 pt-8 pb-16">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider text-on-surface-variant hover:text-on-surface mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> {backLabel}
        </Link>

        <div className="animate-fade-up flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-on-primary-container" />
          </div>
          <div>
            <h1 className="font-headline text-headline-md text-on-surface">{headerTitle}</h1>
            <p className="font-body text-sm text-on-surface-variant mt-1">{headerSub}</p>
          </div>
        </div>

        {/* Parties */}
        <div className="animate-fade-up bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 mb-5" style={{ animationDelay: "120ms" }}>
          <h2 className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant mb-4">
            {t.contract.parties}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                label: t.projects.counterpartBacker,
                name: order.backer.nickname,
                avatar: order.backer.avatar,
                signed: backerSigned,
              },
              {
                label: t.projects.counterpartCreator,
                name: order.creator.nickname,
                avatar: order.creator.avatar,
                signed: creatorSigned,
              },
            ].map((p) => (
              <div
                key={p.label}
                className="flex items-center gap-3 p-4 rounded-xl bg-surface-container"
              >
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-sm font-bold">
                  {p.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                    {p.label}
                  </p>
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

        {/* Terms — editable in draft mode */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 mb-5">
          <h2 className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant mb-4">
            {isDraft ? t.contract.editTerms : t.contract.projectSummary}
          </h2>
          <div className="space-y-3 font-body text-sm">
            <div className="flex justify-between items-center">
              <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                {t.contract.projectLabel}
              </span>
              <span className="font-bold text-on-surface text-right ml-4">{order.title}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                {t.contract.totalAmount}
              </span>
              {isDraft ? (
                <input
                  type="number"
                  aria-label={t.contract.totalAmount}
                  value={total}
                  onChange={(e) => setTotal(Math.max(0, Number(e.target.value)))}
                  className={fieldCls}
                />
              ) : (
                <span className="font-bold text-on-surface">¥{dTotal.toLocaleString()}</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                {t.contract.copyrightLabel}
              </span>
              {isDraft ? (
                <select
                  aria-label={t.contract.copyrightLabel}
                  value={copyright}
                  onChange={(e) => setCopyright(e.target.value)}
                  className={`${fieldCls} cursor-pointer`}
                >
                  {COPYRIGHT_CHOICES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="font-bold text-on-surface">{dCopyright}</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                {t.contract.revisionLimit}
              </span>
              {isDraft ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    aria-label={t.contract.revisionLimit}
                    value={revisionLimit}
                    onChange={(e) => setRevisionLimit(Math.max(0, Number(e.target.value)))}
                    className={`${fieldCls} w-20`}
                  />
                  <span className="text-on-surface-variant text-xs">
                    {t.contract.revisionsPerStage}
                  </span>
                </div>
              ) : (
                <span className="font-bold text-on-surface">
                  {dRevisions} {t.contract.revisionsPerStage}
                </span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                {t.contract.autoAcceptance}
              </span>
              {isDraft ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    aria-label={t.contract.autoAcceptance}
                    value={autoAcceptDays}
                    onChange={(e) => setAutoAcceptDays(Math.max(1, Number(e.target.value)))}
                    className={`${fieldCls} w-20`}
                  />
                  <span className="text-on-surface-variant text-xs">
                    {t.contract.daysAfterSubmission}
                  </span>
                </div>
              ) : (
                <span className="font-bold text-on-surface">
                  {dDays} {t.contract.daysAfterSubmission}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Payment schedule */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 mb-5">
          <h2 className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant mb-4">
            {t.contract.paymentSchedule}
          </h2>
          <div className="space-y-2">
            {STAGE_META.map((stage, i) => (
              <div
                key={stage.name}
                className="flex items-center justify-between py-3 border-b border-outline-variant/30 last:border-0"
              >
                <div>
                  <p className="font-body font-bold text-on-surface text-sm">
                    {t.flow.stageNames[i]}
                  </p>
                  <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mt-0.5">
                    {Math.round(stage.ratio * 100)}
                    {t.contract.ofTotal}
                  </p>
                </div>
                <p className="font-headline text-[18px] text-on-surface">
                  ¥{stageAmount(dTotal, i).toLocaleString()}
                </p>
              </div>
            ))}
            <div className="flex justify-between pt-3">
              <span className="font-label text-label-md uppercase tracking-wider text-on-surface">
                {t.contract.total}
              </span>
              <span className="font-headline text-[20px] text-primary">
                ¥{dTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Escrow notice */}
        <div className="bg-primary-container/40 border-l-4 border-primary p-5 rounded-r-xl flex gap-3 mb-8">
          <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="font-body text-sm text-on-primary-container leading-relaxed">
            {t.contract.escrowNotice}
          </p>
        </div>

        {(isDraft || isConfirm) && (
          <button
            type="button"
            onClick={() => setAgreed((v) => !v)}
            className="w-full flex items-start gap-3 mb-4 text-left"
          >
            <span
              className={cn(
                "mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors",
                agreed ? "bg-primary border-primary text-on-primary" : "border-outline-variant"
              )}
            >
              {agreed && <Check className="w-3.5 h-3.5" />}
            </span>
            <span className="font-body text-sm text-on-surface-variant leading-relaxed">
              {t.contract.agreeLabel}
            </span>
          </button>
        )}
        {isDraft && (
          <button
            disabled={busy || !agreed}
            onClick={handleSubmitDraft}
            className="w-full bg-primary text-on-primary font-label text-label-md uppercase tracking-wider py-4 rounded-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-base"
          >
            {busy ? t.contract.confirming : t.contract.submitContractBtn}
          </button>
        )}
        {isConfirm && (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              disabled={busy}
              onClick={handleRequestChanges}
              className="sm:flex-1 font-label text-label-md uppercase tracking-wider py-4 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50 text-base"
            >
              {t.contract.requestChangesBtn}
            </button>
            <button
              disabled={busy || !agreed}
              onClick={handleConfirm}
              className="sm:flex-1 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider py-4 rounded-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-base"
            >
              {busy ? t.contract.confirming : t.contract.confirmContractBtn}
            </button>
          </div>
        )}
        {contractDone && (
          <div className="w-full flex items-center justify-center gap-2 bg-tertiary-container text-on-tertiary-container font-label text-label-md uppercase tracking-wider py-4 rounded-lg text-base">
            <Check className="w-4 h-4" /> {t.contract.confirmed}
          </div>
        )}
        {beforeContract && (
          <div className="w-full flex items-center justify-center gap-2 bg-surface-container text-on-surface-variant font-label text-label-md uppercase tracking-wider py-4 rounded-lg text-base">
            {t.contract.notDrafted}
          </div>
        )}
      </div>
    </AppShell>
  );
}
