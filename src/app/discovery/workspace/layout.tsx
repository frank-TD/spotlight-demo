import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NexGC — Spotlight",
  description: "Generate AI films in the Spotlight NexGC workspace.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
