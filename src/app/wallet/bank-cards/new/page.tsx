"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import AppShell from "@/components/layout/AppShell";
import { CURRENT_USER_BACKER, CURRENT_USER_CREATOR } from "@/lib/mock-data";
import { ArrowLeft, CreditCard, CheckCircle2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useT } from "@/hooks/useT";

// Demo BIN table → maps the first digits of a card number to a bank + network.
const BIN_TABLE: { prefix: string; bankCode: string }[] = [
  { prefix: "6225", bankCode: "cmb" },
  { prefix: "6217", bankCode: "boc" },
  { prefix: "6222", bankCode: "icbc" },
  { prefix: "6228", bankCode: "abc" },
  { prefix: "6227", bankCode: "ccb" },
];

function detectNetwork(digits: string): string {
  if (digits.startsWith("62")) return "UnionPay";
  if (digits.startsWith("4")) return "Visa";
  if (digits.startsWith("5")) return "Mastercard";
  return "";
}

function detectBank(digits: string): string {
  return BIN_TABLE.find((b) => digits.startsWith(b.prefix))?.bankCode ?? "generic";
}

export default function AddBankCardPage() {
  const router = useRouter();
  const t = useT();
  const { activeRole, addBankCard } = useStore();
  const holder = (activeRole === "backer" ? CURRENT_USER_BACKER : CURRENT_USER_CREATOR).nickname;

  const [number, setNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [resendIn, setResendIn] = useState(0);

  const digits = number.replace(/\D/g, "");
  const detected = digits.length >= 6;
  const bankCode = detected ? detectBank(digits) : "";
  const network = detected ? detectNetwork(digits) : "";
  const bankLabel = detected ? t.wallet.bankNames[bankCode] ?? t.wallet.bankNames.generic : "";

  const cardValid = digits.length >= 12 && digits.length <= 19 && !!network;
  const phoneValid = phone.replace(/\D/g, "").length >= 11;
  const codeValid = code.replace(/\D/g, "").length === 6;
  const canSubmit = cardValid && phoneValid && codeValid;

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setInterval(() => setResendIn((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(id);
  }, [resendIn]);

  const formatCard = (v: string) =>
    v.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();

  const sendCode = () => {
    if (!phoneValid || resendIn > 0) return;
    setResendIn(60);
    toast.success(t.wallet.codeSentToast);
  };

  const confirm = () => {
    if (!canSubmit) return;
    addBankCard({ bankCode, network, last4: digits.slice(-4), holder });
    toast.success(t.wallet.boundToast);
    router.push("/wallet");
  };

  const fieldCls =
    "w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:outline-none font-body text-sm disabled:opacity-50 disabled:cursor-not-allowed";
  const labelCls = "font-label text-label-md uppercase tracking-wider text-on-surface-variant block mb-2";

  return (
    <AppShell>
      <div className="max-w-xl mx-auto px-6 md:px-12 pt-8 pb-16">
        <Link
          href="/wallet"
          className="inline-flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider text-on-surface-variant hover:text-on-surface mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> {t.wallet.addCardBack}
        </Link>

        <h1 className="font-headline text-headline-md text-on-surface mb-2 flex items-center gap-2">
          <CreditCard className="w-6 h-6" /> {t.wallet.addCardTitle}
        </h1>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 mt-6 space-y-6">
          {/* Card number */}
          <div>
            <label className={labelCls}>{t.wallet.cardNumberLabel}</label>
            <input
              inputMode="numeric"
              value={formatCard(number)}
              onChange={(e) => setNumber(e.target.value)}
              placeholder={t.wallet.cardNumberPlaceholder}
              className={cn(fieldCls, "tracking-widest font-mono")}
            />
          </div>

          {/* Auto-detected bank + network */}
          {detected && (
            <div className="grid grid-cols-2 gap-4 animate-fade-up">
              <div>
                <label className={labelCls}>{t.wallet.detectedBank}</label>
                <div className="px-4 py-3 bg-surface-container rounded-xl font-body text-sm text-on-surface flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" /> {bankLabel}
                </div>
              </div>
              <div>
                <label className={labelCls}>{t.wallet.detectedNetwork}</label>
                <div className="px-4 py-3 bg-surface-container rounded-xl font-body text-sm text-on-surface">
                  {network || t.wallet.emptyDash}
                </div>
              </div>
              <p className="col-span-2 -mt-2 font-label text-[10px] uppercase tracking-wider text-on-surface-variant/70">
                {t.wallet.detectHint}
              </p>
            </div>
          )}

          {/* Cardholder (read from KYC) */}
          <div>
            <label className={labelCls}>{t.wallet.holderLabel}</label>
            <div className="px-4 py-3 bg-surface-container rounded-xl font-body text-sm text-on-surface flex items-center justify-between">
              <span>{holder}</span>
              <span className="flex items-center gap-1 font-label text-[10px] uppercase tracking-widest text-tertiary">
                <ShieldCheck className="w-3.5 h-3.5" /> {t.common.kycVerified}
              </span>
            </div>
            <p className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant/70 mt-1.5">
              {t.wallet.holderHint}
            </p>
          </div>

          {/* Reserved phone */}
          <div>
            <label className={labelCls}>{t.wallet.phoneLabel}</label>
            <input
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t.wallet.phonePlaceholder}
              disabled={!cardValid}
              className={fieldCls}
            />
          </div>

          {/* SMS verification */}
          <div>
            <label className={labelCls}>{t.wallet.codeLabel}</label>
            <div className="flex gap-2">
              <input
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder={t.wallet.codePlaceholder}
                disabled={!phoneValid}
                className={cn(fieldCls, "flex-1 tracking-[0.4em] font-mono")}
              />
              <button
                onClick={sendCode}
                disabled={!phoneValid || resendIn > 0}
                className="shrink-0 font-label text-label-md uppercase tracking-wider px-4 py-2 border border-outline-variant rounded-xl text-on-surface-variant hover:border-primary/40 hover:text-on-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {resendIn > 0 ? t.wallet.resendIn(resendIn) : t.wallet.sendCode}
              </button>
            </div>
          </div>

          {/* Confirm */}
          <button
            onClick={confirm}
            disabled={!canSubmit}
            className="w-full flex items-center justify-center gap-2 font-label text-label-md uppercase tracking-wider px-5 py-3 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" /> {t.wallet.confirmBind}
          </button>
          {!cardValid && number.length > 0 && (
            <p className="font-body text-xs text-error text-center">{t.wallet.invalidCard}</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
