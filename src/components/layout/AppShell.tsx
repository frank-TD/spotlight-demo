"use client";
import TopNav from "./TopNav";
import AgentFloat from "./AgentFloat";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <main className="flex-1">{children}</main>
      <AgentFloat />
    </div>
  );
}
