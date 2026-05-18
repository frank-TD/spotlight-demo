"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Sparkles, X, Send, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const CANNED = [
  {
    q: ["order", "progress", "status"],
    a: "Your active order **ord_001** is in Stage 3 (Draft Cut). Aria has submitted the draft — you have 7 days to review before auto-acceptance on May 24.",
    link: { label: "View order", href: "/orders/ord_001" },
  },
  {
    q: ["wallet", "balance", "diamond", "shell"],
    a: "Your wallet: **◆ 12,400 Diamond** available · **◆ 420** currently escrowed in ord_001.",
    link: { label: "Go to wallet", href: "/wallet" },
  },
  {
    q: ["withdraw", "payout", "cash"],
    a: "You can withdraw your Shell balance anytime. Current withdrawable balance: **◉ 8,650**. Processing time is 1–3 business days via Airwallex.",
    link: { label: "Withdraw now", href: "/wallet" },
  },
  {
    q: ["recommend", "creator", "find"],
    a: "Based on your project history, I recommend **Aria Song** (98% completion) and **Marco Reyes** (brand film specialist) for your next commercial project.",
    link: { label: "Browse creators", href: "/market/creators" },
  },
  {
    q: ["kyc", "verify", "identity"],
    a: "Your identity verification is **complete** (KYC passed). You have full access to all platform features including withdrawal.",
    link: null,
  },
];

const FALLBACK = "I can help with order status, wallet balance, creator recommendations, and platform features. Try asking something like 'What's the status of my order?' or 'How do I withdraw?'";

function getResponse(input: string) {
  const lower = input.toLowerCase();
  const match = CANNED.find((c) => c.q.some((kw) => lower.includes(kw)));
  return match ?? { a: FALLBACK, link: null };
}

type Msg = { role: "user" | "agent"; text: string; link?: { label: string; href: string } | null };

export default function AgentFloat() {
  const { agentOpen, toggleAgent, isLoggedIn } = useStore();
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "agent", text: "Hi! I'm your Spotlight AI assistant. Ask me about order status, wallet, or creator recommendations." },
  ]);

  if (!isLoggedIn) return null;

  const send = () => {
    const q = input.trim();
    if (!q) return;
    const resp = getResponse(q);
    setMsgs((prev) => [
      ...prev,
      { role: "user", text: q },
      { role: "agent", text: resp.a, link: resp.link },
    ]);
    setInput("");
  };

  return (
    <>
      {/* Float button */}
      {!agentOpen && (
        <button
          onClick={toggleAgent}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all hover:scale-105"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      )}

      {/* Panel */}
      {agentOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 h-[440px] bg-white border border-border rounded-xl shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-accent/50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">AI Assistant</p>
                <p className="text-[10px] text-muted-foreground">Powered by Spotlight Agent</p>
              </div>
            </div>
            <button onClick={toggleAgent} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                    m.role === "user"
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  )}
                >
                  <span dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
                  {m.link && (
                    <a
                      href={m.link.href}
                      className="mt-1.5 flex items-center gap-1 text-primary font-medium hover:underline"
                    >
                      {m.link.label} <ArrowUpRight className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border flex gap-2">
            <input
              className="flex-1 text-xs rounded-lg border border-input px-3 py-2 bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button
              onClick={send}
              className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary/90"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
