import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AIGC Studio — Spotlight",
  description: "Generate AI films in the Spotlight AIGC studio workspace.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
