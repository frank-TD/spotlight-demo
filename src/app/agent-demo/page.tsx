import type { Metadata } from "next";
import { AgentProvider } from "./agent-context";
import AgentDemo from "./AgentDemo";

export const metadata: Metadata = {
  title: "Spotlight Agent — Prototype",
  description:
    "An interactive prototype of the Spotlight Agent: a transaction-intelligence layer embedded across briefing, matching, contracts and project delivery.",
};

export default function AgentDemoPage() {
  return (
    <AgentProvider>
      <AgentDemo />
    </AgentProvider>
  );
}
