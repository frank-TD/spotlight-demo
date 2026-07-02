import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Distribution — Spotlight",
  description: "Let AI distribute your film to audiences and platforms worldwide.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
