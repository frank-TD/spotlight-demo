import { Check, ShieldCheck, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// The human-approval gate. The Agent prepares everything, but the user is always
// the one who releases the action — never the Agent on its own.
export default function ApprovalGate({
  open,
  onOpenChange,
  title,
  summary,
  checklist = [],
  approveLabel,
  onApprove,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  summary: string;
  checklist?: { label: string; ok: boolean }[];
  approveLabel: string;
  onApprove: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] bg-surface-container-low border-outline-variant/50">
        <DialogHeader>
          <span className="inline-flex items-center gap-2 font-label text-[11px] uppercase tracking-[0.16em] text-agent">
            <ShieldCheck className="w-4 h-4" />
            Approval Gate
          </span>
          <DialogTitle className="font-headline text-2xl text-on-surface mt-2">{title}</DialogTitle>
        </DialogHeader>

        <p className="font-body text-sm text-on-surface-variant leading-relaxed">{summary}</p>

        {checklist.length > 0 ? (
          <div className="mt-1 rounded-xl border border-outline-variant/40 bg-surface-container-lowest/60 p-3.5 space-y-2.5">
            {checklist.map((c) => (
              <div key={c.label} className="flex items-center gap-2.5">
                <span
                  className="inline-flex w-5 h-5 items-center justify-center rounded-full"
                  style={{
                    color: c.ok ? "#46d18b" : "#d4af37",
                    background: c.ok ? "#46d18b1f" : "#d4af371f",
                  }}
                >
                  {c.ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                </span>
                <span className="font-body text-[13px] text-on-surface-variant">{c.label}</span>
              </div>
            ))}
          </div>
        ) : null}

        <p className="font-label text-[11px] uppercase tracking-[0.12em] text-on-surface-variant/70 mt-1">
          You are the final approver — the Agent never publishes on its own.
        </p>

        <div className="flex items-center justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="font-label text-[12px] uppercase tracking-[0.12em] text-on-surface-variant hover:text-on-surface px-4 py-2.5 transition-colors"
          >
            Review again
          </button>
          <button
            type="button"
            onClick={onApprove}
            className="inline-flex items-center gap-2 rounded-full bg-primary text-on-primary font-label text-[12px] uppercase tracking-[0.12em] px-6 py-2.5 hover:opacity-90 active:scale-95 transition-all"
          >
            {approveLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
