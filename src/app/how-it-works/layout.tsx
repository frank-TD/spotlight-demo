import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works — Spotlight",
  description: "See how backers, creators, and AI distribution come together on Spotlight.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
