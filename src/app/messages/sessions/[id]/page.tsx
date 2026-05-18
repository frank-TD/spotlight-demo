"use client";
import { use, useState } from "react";
import { useStore } from "@/lib/store";
import AppShell from "@/components/layout/AppShell";
import { ORDER_ACTIVE } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Paperclip } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  use(params);
  const { activeRole } = useStore();
  const t = useT();
  const [input, setInput] = useState("");
  const [extraMsgs, setExtraMsgs] = useState<Array<{ id: string; senderId: string; senderName: string; senderRole: string; text: string; ts: string }>>([]);

  const sendMsg = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setExtraMsgs(prev => [...prev, {
      id: `em_${Date.now()}`,
      senderId: activeRole === "backer" ? "u_backer_01" : "u_creator_01",
      senderName: activeRole === "backer" ? "Lucas Chen" : "Aria Song",
      senderRole: activeRole === "backer" ? t.chat.roleBacker : t.chat.roleCreator,
      text: trimmed,
      ts: new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
    }]);
    setInput("");
  };

  const allMsgs = [...ORDER_ACTIVE.messages, ...extraMsgs];

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 py-8 h-[calc(100vh-3.5rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <Link href="/market" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-semibold text-primary">
              {activeRole === "backer" ? "AS" : "LC"}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {activeRole === "backer" ? "Aria Song" : "Lucas Chen"}
              </p>
              <p className="text-xs text-muted-foreground">{t.chat.sessionSubject}</p>
            </div>
          </div>
          <div className="ml-auto">
            <Link href="/orders/ord_001">
              <Button variant="outline" size="sm" className="text-xs">{t.chat.viewOrder}</Button>
            </Link>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-white border border-border rounded-xl p-4 space-y-3 mb-3">
          {allMsgs.map(msg => {
            if ((msg as { isCard?: boolean }).isCard) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="bg-accent border border-primary/20 rounded-lg px-4 py-2.5 text-xs text-foreground/80 text-center max-w-sm">
                    <span className="font-medium text-primary">{t.chat.spotlightBrand} · </span>
                    {msg.text}
                  </div>
                </div>
              );
            }
            const isMe = (activeRole === "backer" && msg.senderId === "u_backer_01") ||
                         (activeRole === "creator" && msg.senderId === "u_creator_01");
            return (
              <div key={msg.id} className={cn("flex gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
                {!isMe && (
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                    {msg.senderName.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                )}
                <div className={cn("flex flex-col gap-0.5 max-w-[70%]", isMe ? "items-end" : "items-start")}>
                  {!isMe && (
                    <span className="text-[10px] text-muted-foreground px-1">
                      {msg.senderName} · {msg.senderRole}
                    </span>
                  )}
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

        {/* Input */}
        <div className="flex items-center gap-2 shrink-0">
          <button className="text-muted-foreground hover:text-foreground p-2">
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            className="flex-1 text-sm rounded-xl border border-input px-4 py-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder={t.chat.messagePlaceholder}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMsg()}
          />
          <Button onClick={sendMsg} className="rounded-xl px-4">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
