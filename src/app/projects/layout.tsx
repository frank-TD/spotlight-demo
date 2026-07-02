import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Projects — Spotlight",
  description: "Track your active and completed Spotlight projects.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
