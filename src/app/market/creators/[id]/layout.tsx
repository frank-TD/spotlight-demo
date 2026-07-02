import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creator — Spotlight",
  description: "View a creator profile and showcase on Spotlight.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
