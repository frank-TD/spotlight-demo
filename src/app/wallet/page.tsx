"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import AppShell from "@/components/layout/AppShell";
import { WALLET_TRANSACTIONS, BACKER_WALLET_TRANSACTIONS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowUpRight, ArrowDownLeft, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const AMOUNTS = [1000, 3000, 5000, 10000];

export default function WalletPage() {
  const { activeRole, backerDiamond, creatorShell, recharge, withdraw } = useStore();
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState(3000);
  const [processing, setProcessing] = useState(false);

  const txs = activeRole === "backer" ? BACKER_WALLET_TRANSACTIONS : WALLET_TRANSACTIONS;

  const handleRecharge = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1000));
    recharge(amount);
    setRechargeOpen(false);
    setProcessing(false);
    toast.success(`¥${amount.toLocaleString()} Diamond recharged successfully`);
  };

  const handleWithdraw = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1000));
    withdraw(amount);
    setWithdrawOpen(false);
    setProcessing(false);
    toast.success(`Withdrawal of ¥${amount.toLocaleString()} submitted · 1–3 business days`);
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-xl font-bold text-foreground mb-6">Wallet</h1>

        {/* Balance cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {activeRole === "backer" ? (
            <>
              <div className="bg-primary rounded-xl p-6 text-white">
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">Diamond Balance</p>
                <p className="text-3xl font-bold">◆ {backerDiamond.toLocaleString()}</p>
                <p className="text-white/60 text-xs mt-1">≈ ¥{backerDiamond.toLocaleString()}</p>
                <p className="text-white/50 text-xs mt-3">Used for project payments · Non-withdrawable</p>
                <Button className="mt-4 bg-white text-primary hover:bg-white/90 h-8 text-xs" onClick={() => { setAmount(3000); setRechargeOpen(true); }}>
                  <Plus className="w-3 h-3 mr-1" /> Recharge
                </Button>
              </div>
              <div className="bg-white border border-border rounded-xl p-6">
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">Shell Balance</p>
                <p className="text-3xl font-bold text-muted-foreground">◉ 0</p>
                <p className="text-muted-foreground text-xs mt-1">—</p>
                <p className="text-muted-foreground text-xs mt-3">Backers do not earn Shell</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white border border-border rounded-xl p-6">
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-1">Diamond Balance</p>
                <p className="text-3xl font-bold text-muted-foreground">◆ 0</p>
                <p className="text-muted-foreground text-xs mt-3">Creators earn in Shell, not Diamond</p>
              </div>
              <div className="bg-primary rounded-xl p-6 text-white">
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">Shell Balance</p>
                <p className="text-3xl font-bold">◉ {creatorShell.toLocaleString()}</p>
                <p className="text-white/60 text-xs mt-1">≈ ¥{creatorShell.toLocaleString()}</p>
                <p className="text-white/50 text-xs mt-3">Earned from completed stages · Withdrawable</p>
                <Button className="mt-4 bg-white text-primary hover:bg-white/90 h-8 text-xs" onClick={() => { setAmount(3000); setWithdrawOpen(true); }}>
                  <Minus className="w-3 h-3 mr-1" /> Withdraw
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Transactions */}
        <div className="bg-white border border-border rounded-xl">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Transaction History</h2>
          </div>
          <div className="divide-y divide-border">
            {txs.map(tx => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    tx.amount > 0 ? "bg-emerald-50" : "bg-muted"
                  )}>
                    {tx.amount > 0 ? <ArrowDownLeft className="w-4 h-4 text-emerald-600" /> : <ArrowUpRight className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{tx.note}</p>
                    <p className="text-xs text-muted-foreground">{tx.date} · {tx.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("text-sm font-semibold", tx.amount > 0 ? "text-emerald-600" : "text-foreground")}>
                    {tx.amount > 0 ? "+" : ""}¥{Math.abs(tx.amount).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Bal: {tx.balance.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recharge dialog */}
      <Dialog open={rechargeOpen} onOpenChange={setRechargeOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-base">Recharge Diamond</DialogTitle></DialogHeader>
          <div className="py-2 space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {AMOUNTS.map(a => (
                <button key={a} onClick={() => setAmount(a)}
                  className={cn("py-2 rounded-lg text-sm font-medium border transition-colors", amount === a ? "bg-primary text-white border-primary" : "border-border text-foreground hover:border-primary/40")}>
                  ¥{(a / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
            <Input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="text-sm" />
            <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground">
              Payment via Stripe · Secure PCI-DSS compliant
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRechargeOpen(false)}>Cancel</Button>
            <Button onClick={handleRecharge} disabled={processing}>{processing ? "Processing..." : `Pay ¥${amount.toLocaleString()}`}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-base">Withdraw Shell</DialogTitle></DialogHeader>
          <div className="py-2 space-y-4">
            <div className="bg-muted rounded-lg p-3 flex justify-between text-sm">
              <span className="text-muted-foreground">Available</span>
              <span className="font-semibold">◉ {creatorShell.toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {AMOUNTS.map(a => (
                <button key={a} onClick={() => setAmount(Math.min(a, creatorShell))}
                  className={cn("py-2 rounded-lg text-sm font-medium border transition-colors", amount === a ? "bg-primary text-white border-primary" : "border-border text-foreground hover:border-primary/40")}>
                  ¥{(a / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
            <Input type="number" value={amount} onChange={e => setAmount(Math.min(Number(e.target.value), creatorShell))} className="text-sm" />
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between"><span>Bank</span><span className="font-medium text-foreground">ICBC *8821</span></div>
              <div className="flex justify-between"><span>ETA</span><span>1–3 business days</span></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawOpen(false)}>Cancel</Button>
            <Button onClick={handleWithdraw} disabled={processing || amount > creatorShell}>{processing ? "Processing..." : `Withdraw ¥${amount.toLocaleString()}`}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
