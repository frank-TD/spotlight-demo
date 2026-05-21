"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import AppShell from "@/components/layout/AppShell";
import { WALLET_TRANSACTIONS, BACKER_WALLET_TRANSACTIONS } from "@/lib/mock-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ArrowUpRight, ArrowDownLeft, Plus, Minus, CreditCard, Star, Trash2, AlertTriangle, ChevronDown, Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useT } from "@/hooks/useT";
import type { BankCard } from "@/lib/store";

const AMOUNTS = [1000, 3000, 5000, 10000];

export default function WalletPage() {
  const { activeRole, backerDiamond, creatorShell, recharge, withdraw, bankCards, removeBankCard, setDefaultBankCard } = useStore();
  const t = useT();
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState(3000);
  const [processing, setProcessing] = useState(false);
  const [unbindTarget, setUnbindTarget] = useState<BankCard | null>(null);
  const [withdrawCardId, setWithdrawCardId] = useState<string | null>(null);
  const [cardPickerOpen, setCardPickerOpen] = useState(false);

  const txs = activeRole === "backer" ? BACKER_WALLET_TRANSACTIONS : WALLET_TRANSACTIONS;
  const bankName = (code: string) => t.wallet.bankNames[code] ?? t.wallet.bankNames.generic;

  // Withdraw target card: explicit selection, else the default card.
  const defaultCard = bankCards.find((c) => c.isDefault) ?? bankCards[0];
  const selectedCard = bankCards.find((c) => c.id === withdrawCardId) ?? defaultCard;

  const handleRecharge = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1000));
    recharge(amount);
    setRechargeOpen(false);
    setProcessing(false);
    toast.success(t.wallet.rechargedToast(amount));
  };

  const handleWithdraw = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1000));
    withdraw(amount);
    setWithdrawOpen(false);
    setProcessing(false);
    toast.success(t.wallet.withdrawnToast(amount));
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 md:px-12 pt-10 pb-16">
        <h1 className="font-headline text-headline-lg text-on-surface mb-10">{t.wallet.title}</h1>

        {/* Balance cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {activeRole === "backer" ? (
            <>
              <div className="bg-primary text-on-primary rounded-2xl p-8">
                <p className="font-label text-label-md uppercase tracking-widest opacity-70 mb-2">
                  {t.wallet.diamondBalance}
                </p>
                <p className="font-headline text-[44px] leading-none">◆ {backerDiamond.toLocaleString()}</p>
                <p className="font-body text-sm opacity-60 mt-2">≈ ¥{backerDiamond.toLocaleString()}</p>
                <p className="font-label text-label-md uppercase tracking-wider opacity-50 mt-4">
                  {t.wallet.diamondNote}
                </p>
                <button
                  onClick={() => {
                    setAmount(3000);
                    setRechargeOpen(true);
                  }}
                  className="mt-6 inline-flex items-center gap-1.5 bg-primary-container text-on-primary-container font-label text-label-md uppercase tracking-wider px-4 py-2 rounded-lg hover:brightness-110 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> {t.wallet.recharge}
                </button>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8">
                <p className="font-label text-label-md uppercase tracking-widest text-on-surface-variant mb-2">
                  {t.wallet.shellBalance}
                </p>
                <p className="font-headline text-[44px] leading-none text-on-surface-variant/40">◉ 0</p>
                <p className="font-body text-sm text-on-surface-variant/60 mt-2">{t.wallet.emptyDash}</p>
                <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mt-4">
                  {t.wallet.backersNoShell}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8">
                <p className="font-label text-label-md uppercase tracking-widest text-on-surface-variant mb-2">
                  {t.wallet.diamondBalance}
                </p>
                <p className="font-headline text-[44px] leading-none text-on-surface-variant/40">◆ 0</p>
                <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mt-4">
                  {t.wallet.creatorsEarnShell}
                </p>
              </div>
              <div className="bg-primary text-on-primary rounded-2xl p-8">
                <p className="font-label text-label-md uppercase tracking-widest opacity-70 mb-2">
                  {t.wallet.shellBalance}
                </p>
                <p className="font-headline text-[44px] leading-none">◉ {creatorShell.toLocaleString()}</p>
                <p className="font-body text-sm opacity-60 mt-2">≈ ¥{creatorShell.toLocaleString()}</p>
                <p className="font-label text-label-md uppercase tracking-wider opacity-50 mt-4">
                  {t.wallet.shellNote}
                </p>
                <button
                  onClick={() => {
                    setAmount(3000);
                    setWithdrawCardId(null);
                    setCardPickerOpen(false);
                    setWithdrawOpen(true);
                  }}
                  className="mt-6 inline-flex items-center gap-1.5 bg-primary-container text-on-primary-container font-label text-label-md uppercase tracking-wider px-4 py-2 rounded-lg hover:brightness-110 transition-all"
                >
                  <Minus className="w-3.5 h-3.5" /> {t.wallet.withdraw}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Bank card management */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden mb-10">
          <div className="px-6 py-5 border-b border-outline-variant/30 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> {t.wallet.bankCardsTitle}
              </h2>
              <p className="font-body text-xs text-on-surface-variant/70 mt-1">{t.wallet.bankCardsManage}</p>
            </div>
            <Link
              href="/wallet/bank-cards/new"
              className="flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> {t.wallet.addCard}
            </Link>
          </div>
          {bankCards.length === 0 ? (
            <p className="font-body text-sm text-on-surface-variant text-center py-10">{t.wallet.noCards}</p>
          ) : (
            <div className="divide-y divide-outline-variant/30">
              {bankCards.map((card) => (
                <div key={card.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-11 h-11 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-body font-bold text-on-surface text-sm">{bankName(card.bankCode)}</p>
                      <span className="font-label text-[10px] uppercase tracking-widest bg-surface-container text-on-surface-variant px-2 py-0.5 rounded">
                        {card.network}
                      </span>
                      {card.isDefault && (
                        <span className="flex items-center gap-1 font-label text-[10px] uppercase tracking-widest bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded">
                          <Star className="w-2.5 h-2.5 fill-current" /> {t.wallet.defaultBadge}
                        </span>
                      )}
                    </div>
                    <p className="font-body text-xs text-on-surface-variant mt-0.5 tracking-wider">
                      •••• •••• •••• {card.last4} · {card.holder}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!card.isDefault && (
                      <button
                        onClick={() => {
                          setDefaultBankCard(card.id);
                          toast.success(t.wallet.cardDefaultSetToast);
                        }}
                        className="font-label text-label-md uppercase tracking-wider px-3 py-1.5 border border-outline-variant rounded-lg text-on-surface-variant hover:border-primary/40 hover:text-on-surface transition-colors"
                      >
                        {t.wallet.setDefault}
                      </button>
                    )}
                    <button
                      onClick={() => setUnbindTarget(card)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:border-error/40 hover:text-error transition-colors"
                      aria-label={t.wallet.unbind}
                      title={t.wallet.unbind}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transactions */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-outline-variant/30">
            <h2 className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant">
              {t.wallet.transactionHistory}
            </h2>
          </div>
          <div className="divide-y divide-outline-variant/30">
            {txs.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                      tx.amount > 0 ? "bg-tertiary-container text-on-tertiary-container" : "bg-surface-container text-on-surface-variant"
                    )}
                  >
                    {tx.amount > 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-body font-bold text-on-surface text-sm">{tx.note}</p>
                    <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mt-0.5">
                      {tx.date} · {tx.type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("font-body font-bold", tx.amount > 0 ? "text-tertiary" : "text-on-surface")}>
                    {tx.amount > 0 ? "+" : ""}¥{Math.abs(tx.amount).toLocaleString()}
                  </p>
                  <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mt-0.5">
                    {t.wallet.balLabel} {tx.balance.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recharge dialog */}
      <Dialog open={rechargeOpen} onOpenChange={setRechargeOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-headline text-[20px]">{t.wallet.rechargeDialog}</DialogTitle>
          </DialogHeader>
          <div className="py-3 space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {AMOUNTS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(a)}
                  className={cn(
                    "py-2 rounded-lg font-label text-label-md uppercase tracking-wider border transition-colors",
                    amount === a
                      ? "bg-primary text-on-primary border-primary"
                      : "border-outline-variant text-on-surface hover:border-primary/40"
                  )}
                >
                  ¥{(a / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:outline-none font-body text-sm"
            />
            <div className="bg-surface-container rounded-lg p-3 font-label text-label-md uppercase tracking-wider text-on-surface-variant">
              {t.wallet.paymentNote}
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setRechargeOpen(false)}
              className="font-label text-label-md uppercase tracking-wider px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors"
            >
              {t.common.cancel}
            </button>
            <button
              onClick={handleRecharge}
              disabled={processing}
              className="font-label text-label-md uppercase tracking-wider px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {processing ? t.wallet.processing : t.wallet.pay(amount)}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-headline text-[20px]">{t.wallet.withdrawDialog}</DialogTitle>
          </DialogHeader>
          <div className="py-3 space-y-4">
            <div className="bg-surface-container rounded-lg p-3 flex justify-between text-sm">
              <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                {t.wallet.available}
              </span>
              <span className="font-body font-bold">◉ {creatorShell.toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {AMOUNTS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(Math.min(a, creatorShell))}
                  className={cn(
                    "py-2 rounded-lg font-label text-label-md uppercase tracking-wider border transition-colors",
                    amount === a
                      ? "bg-primary text-on-primary border-primary"
                      : "border-outline-variant text-on-surface hover:border-primary/40"
                  )}
                >
                  ¥{(a / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.min(Number(e.target.value), creatorShell))}
              className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:outline-none font-body text-sm"
            />
            <div className="space-y-2 text-sm">
              {/* Bank card selector — defaults to the default payout card */}
              <div>
                <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant block mb-1.5">
                  {t.wallet.bank}
                </span>
                {bankCards.length === 0 ? (
                  <Link
                    href="/wallet/bank-cards/new"
                    className="flex items-center justify-center gap-1.5 w-full px-3 py-2.5 border border-dashed border-outline-variant rounded-xl font-label text-label-md uppercase tracking-wider text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> {t.wallet.addCard}
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setCardPickerOpen((v) => !v)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl hover:border-primary/40 transition-colors"
                    >
                      <CreditCard className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-body text-on-surface truncate">
                        {bankName(selectedCard.bankCode)} ····{selectedCard.last4}
                      </span>
                      {selectedCard.isDefault && (
                        <span className="font-label text-[9px] uppercase tracking-widest bg-tertiary-container text-on-tertiary-container px-1.5 py-0.5 rounded shrink-0">
                          {t.wallet.defaultBadge}
                        </span>
                      )}
                      <ChevronDown className={cn("w-4 h-4 text-on-surface-variant ml-auto shrink-0 transition-transform", cardPickerOpen && "rotate-180")} />
                    </button>
                    {cardPickerOpen && (
                      <div className="mt-1.5 border border-outline-variant/60 rounded-xl overflow-hidden divide-y divide-outline-variant/30">
                        {bankCards.map((card) => {
                          const active = card.id === selectedCard.id;
                          return (
                            <button
                              key={card.id}
                              type="button"
                              onClick={() => {
                                setWithdrawCardId(card.id);
                                setCardPickerOpen(false);
                              }}
                              className={cn(
                                "w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors",
                                active ? "bg-primary-container/40" : "hover:bg-surface-container"
                              )}
                            >
                              <CreditCard className="w-4 h-4 text-on-surface-variant shrink-0" />
                              <span className="font-body text-on-surface truncate">
                                {bankName(card.bankCode)} ····{card.last4}
                              </span>
                              {card.isDefault && (
                                <span className="font-label text-[9px] uppercase tracking-widest bg-tertiary-container text-on-tertiary-container px-1.5 py-0.5 rounded shrink-0">
                                  {t.wallet.defaultBadge}
                                </span>
                              )}
                              {active && <Check className="w-4 h-4 text-primary ml-auto shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="flex justify-between">
                <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                  {t.wallet.eta}
                </span>
                <span className="font-body text-on-surface-variant">{t.wallet.businessDays}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setWithdrawOpen(false)}
              className="font-label text-label-md uppercase tracking-wider px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors"
            >
              {t.common.cancel}
            </button>
            <button
              onClick={handleWithdraw}
              disabled={processing || amount > creatorShell || !selectedCard}
              className="font-label text-label-md uppercase tracking-wider px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {processing ? t.wallet.processing : t.wallet.withdrawBtn(amount)}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unbind bank card dialog */}
      <Dialog open={!!unbindTarget} onOpenChange={(o) => !o && setUnbindTarget(null)}>
        <DialogContent className="sm:max-w-md">
          {unbindTarget?.isDefault ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-headline text-[20px] flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-error" /> {t.wallet.unbindDefaultTitle}
                </DialogTitle>
                <DialogDescription className="font-body text-sm text-on-surface-variant">
                  {t.wallet.unbindDefaultMsg}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <button
                  onClick={() => setUnbindTarget(null)}
                  className="font-label text-label-md uppercase tracking-wider px-5 py-2.5 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity"
                >
                  {t.common.cancel}
                </button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-headline text-[20px]">{t.wallet.unbindTitle}</DialogTitle>
                <DialogDescription className="font-body text-sm text-on-surface-variant">
                  {unbindTarget && t.wallet.unbindMsg(bankName(unbindTarget.bankCode), unbindTarget.last4)}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <button
                  onClick={() => setUnbindTarget(null)}
                  className="font-label text-label-md uppercase tracking-wider px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  onClick={() => {
                    if (unbindTarget) removeBankCard(unbindTarget.id);
                    setUnbindTarget(null);
                    toast.success(t.wallet.cardRemovedToast);
                  }}
                  className="font-label text-label-md uppercase tracking-wider px-4 py-2 bg-error text-on-error rounded-lg hover:opacity-90 transition-opacity"
                >
                  {t.wallet.unbindBtn}
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
