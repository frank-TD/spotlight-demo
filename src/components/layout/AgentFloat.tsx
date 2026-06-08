"use client";
import { useState } from "react";
import { Sparkles, X, Send, ArrowUpRight, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";
import { getAgentReply } from "@/lib/agent-response";

export default function AgentFloat() {
  const {
    agentOpen,
    toggleAgent,
    isLoggedIn,
    agentMessages,
    appendAgentMessages,
    clearAgentMessages,
    locale,
    agentThinking,
    setAgentThinking,
  } = useStore();
  const t = useT();
  const [input, setInput] = useState("");

  // Greeting is always rendered in the current language; persisted history follows.
  const display = [
    { role: "agent" as const, text: t.agent.greeting, link: null },
    ...agentMessages,
  ];

  if (!isLoggedIn) return null;

  const send = () => {
    const q = input.trim();
    if (!q) return;
    // Show the user message immediately, then a typing indicator, then the canned reply.
    appendAgentMessages([{ role: "user", text: q }]);
    setInput("");
    setAgentThinking(true);
    const resp = getAgentReply(q, locale);
    setTimeout(() => {
      appendAgentMessages([{ role: "agent", text: resp.a, link: resp.link }]);
      setAgentThinking(false);
    }, 800);
  };

  return (
    <>
      {!agentOpen && (
        <button
          type="button"
          onClick={toggleAgent}
          aria-label="open assistant"
          className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-primary text-on-primary shadow-[0_8px_30px_rgba(110,91,71,0.35)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      )}

      {agentOpen && (
        <div className="fixed bottom-8 right-8 z-50 w-96 h-[480px] bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/30 bg-primary-container/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-on-primary" />
              </div>
              <div>
                <p className="font-headline text-[16px] text-on-surface leading-none">
                  {t.agent.headerTitle}
                </p>
                <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mt-1">
                  {t.agent.headerSubtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {agentMessages.length > 0 && (
                <button
                  type="button"
                  onClick={clearAgentMessages}
                  className="text-on-surface-variant hover:text-error p-1"
                  aria-label="clear conversation"
                  title="Clear"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={toggleAgent}
                aria-label="close assistant"
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {display.map((m, i) => (
              <div
                key={i}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 font-body text-xs leading-relaxed",
                    m.role === "user"
                      ? "bg-primary text-on-primary rounded-br-sm"
                      : "bg-surface-container text-on-surface rounded-bl-sm"
                  )}
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: m.text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"),
                    }}
                  />
                  {m.link && (
                    <a
                      href={m.link.href}
                      className="mt-2 flex items-center gap-1 text-primary font-bold hover:underline"
                    >
                      {m.link.label} <ArrowUpRight className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
            {agentThinking && (
              <div className="flex justify-start">
                <div className="bg-surface-container text-on-surface-variant rounded-2xl rounded-bl-sm px-4 py-3">
                  <span className="typing-dot" />
                  <span className="typing-dot" style={{ animationDelay: "0.15s" }} />
                  <span className="typing-dot" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-outline-variant/30 flex gap-2">
            <input
              aria-label={t.agent.placeholder}
              className="flex-1 font-body text-xs rounded-xl border border-outline-variant px-3 py-2 bg-surface-container-low focus:border-primary focus:outline-none placeholder:text-on-surface-variant/60"
              placeholder={t.agent.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button
              type="button"
              onClick={send}
              aria-label="send message"
              className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center hover:opacity-90"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
